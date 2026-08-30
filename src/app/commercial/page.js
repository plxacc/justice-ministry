'use client';

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useMemo } from "react";
import { toBlob } from 'html-to-image';
import { SIGNATURE_PRESETS as IMPORTED_SIGNATURES } from '@/app/reports/editorConfig';

// قائمة احتياطية في حال تأخر الاستيراد
const FALLBACK_SIGNATURES = [
  { id: 'hajjaj', name: 'الحجاج أبو يوسف', title: 'قاضي المحكمة', img: '/sig-hajjaj.png', department: 'الدائرة القضائية الأولى' },
  { id: 'tariq', name: 'طارق المنصوري', title: 'المدعي العام', img: '/sig-tariq.png', department: 'النيابة العامة' },
  { id: 'hazzem', name: 'هزيم العلي', title: 'المدعي العام', img: '/sig-hazzem.png', department: 'فرع النيابة العامة' },
];

const Countdown = ({ expiryDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiryDate) {
      setTimeLeft('غير محدد');
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const distance = expiry - now;

      if (isNaN(distance) || distance < 0) {
        setIsExpired(true);
        setTimeLeft('منتهي الصلاحية');
      } else {
        setIsExpired(false);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days} يوم و ${hours} ساعة و ${minutes} دقيقة`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition ${
        isExpired
          ? 'bg-[#732924]/20 text-[#541d19] border-[#732924]/40'
          : 'bg-[#3b2a1e]/15 text-[#2b1b11] border-[#5a4231]/30'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-[#732924]' : 'bg-[#4a3525]'}`}></span>
      {timeLeft}
    </span>
  );
};

export default function CommercialRegisterPage() {
  const { data: session, status } = useSession();
  const cardRef = useRef(null);

  const availableSignatures = useMemo(() => {
    return Array.isArray(IMPORTED_SIGNATURES) && IMPORTED_SIGNATURES.length > 0 
      ? IMPORTED_SIGNATURES 
      : FALLBACK_SIGNATURES;
  }, []);

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [activityType, setActivityType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedSigId, setSelectedSigId] = useState(availableSignatures[0]?.id || 'hajjaj');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);

  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const res = await fetch('/api/commercial-records');
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const currentSignature = availableSignatures.find((s) => s.id === selectedSigId) || availableSignatures[0];

  const handleIssueRegister = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!businessName || !ownerName || !nationalId || !activityType || !expiryDate) {
      setFeedback({ type: 'error', message: 'يرجى استيفاء جميع الحقول المطلوبة لإتمام التسجيل.' });
      return;
    }

    if (nationalId.length !== 4) {
      setFeedback({ type: 'error', message: 'رقم الهوية الوطنية يتطلب 4 أرقام فقط.' });
      return;
    }

    if (!cardRef.current) {
      setFeedback({ type: 'error', message: 'تعذر تحديد عنصر المعاينة لتوليد الوثيقة.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const blob = await toBlob(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) throw new Error('فشل تصوير وثيقة السجل التجاري');

      const formData = new FormData();
      formData.append('file', blob, 'commercial.png');
      formData.append('businessName', businessName);
      formData.append('ownerName', ownerName);
      formData.append('nationalId', nationalId);
      formData.append('activityType', activityType);
      formData.append('expiryDate', expiryDate);
      formData.append('signatureTitle', currentSignature.title);

      const res = await fetch('/api/send-commercial', { 
        method: 'POST', 
        body: formData 
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'تم قيد وتسجيل المنشأة التجارية وتوثيق السجل رسمياً.' });
        setBusinessName('');
        setOwnerName('');
        setNationalId('');
        setActivityType('');
        setExpiryDate('');
        fetchRecords();
      } else {
        setFeedback({ type: 'error', message: data.error || 'حدث خطأ أثناء حفظ السجل في النظام.' });
      }
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'حدث خطأ غير متوقع أثناء اعتماد السجل التجاري.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" dir="rtl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3b2a1e] border-t-transparent"></div>
        <p className="font-bold text-[#3b2a1e] text-base">جاري تحميل منصة السجلات التجارية...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 p-6 lg:p-10 min-h-screen font-sans" dir="rtl">
      
      {/* القسم العلوي: النموذج والمعاينة */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* نموذج الإدخال الجانبي */}
        <aside className="w-full lg:w-[420px] shrink-0 bg-[#c2ac8e]/90 border border-[#a89073] rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5">
          
          <div className="flex items-center gap-3 border-b border-[#a89073] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#3b2a1e] flex items-center justify-center border border-[#5a4231] shadow-inner">
              <svg className="w-5 h-5 text-[#f4ece1]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2b1b11]">إصدار سجل تجاري</h2>
              <p className="text-xs text-[#594230] font-semibold">قيد وتوثيق المنشآت التجارية المعتمدة</p>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-[#3b2a1e] border-[#5a4231] text-[#f4ece1]'
                  : 'bg-[#732924]/20 border-[#732924]/40 text-[#541d19]'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {feedback.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleIssueRegister} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#2b1b11]">اسم المنشأة التجاري</label>
              <input
                type="text"
                placeholder="مثال: شركة الوفاق للتجارة العامة"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#2b1b11]">اسم مالك المنشأة</label>
                <input
                  type="text"
                  placeholder="الاسم الثنائي للمالك"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
                  required
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#2b1b11]">رقم الهوية</label>
                <input
                  type="text"
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder="0000"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-black font-mono text-center text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#2b1b11]">نوع النشاط</label>
                <input
                  type="text"
                  placeholder="مثال: مقاولات عامة"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#2b1b11]">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#2b1b11]">المصادق المعتمد للتوثيق</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                {availableSignatures.map((sig) => {
                  const isSelected = sig.id === selectedSigId;
                  return (
                    <button
                      key={sig.id}
                      type="button"
                      onClick={() => setSelectedSigId(sig.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition-all ${
                        isSelected
                          ? 'bg-[#3b2a1e] border-[#5a4231] text-[#f4ece1] shadow-xs'
                          : 'bg-[#ede3d4] border-[#a89073] text-[#2b1b11] hover:bg-[#d8ccb8]'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black leading-tight">{sig.name}</span>
                        <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#c2ac8e]' : 'text-[#594230]'}`}>
                          {sig.title} — {sig.department}
                        </span>
                      </div>
                      {isSelected && (
                        <svg className="w-4 h-4 text-[#c2ac8e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 bg-[#3b2a1e] hover:bg-[#281c13] text-[#f4ece1] font-black py-3.5 px-4 rounded-xl border border-[#5a4231] transition shadow-md disabled:opacity-60 cursor-pointer text-sm mt-1"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f4ece1] border-t-transparent"></div>
                  <span>جاري توثيق وإشهار السجل...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>اعتماد وقيد السجل التجاري</span>
                </>
              )}
            </button>
          </form>
        </aside>

        {/* المعاينة الحية للسجل */}
        <main className="flex-1 w-full flex justify-center items-start overflow-x-auto pb-4">
          <div className="transform scale-[0.80] sm:scale-[0.90] md:scale-[0.98] xl:scale-[1.0] origin-top drop-shadow-2xl rounded-sm">
            <div
              ref={cardRef}
              className="relative shrink-0 w-[800px] h-[533px] bg-white border border-[#a89073]/50"
              style={{
                backgroundImage: "url('/register-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* تفاصيل المنشأة الموزعة */}
              <div className="absolute top-[90px] left-[170px] w-[410px] space-y-[40px] text-right font-black text-[#2b1b11]">
                <div className="h-[40px] flex items-center pr-3 text-2xl font-black text-[#3b2a1e]">
                  {businessName || '...........................................'}
                </div>

                <div className="h-[40px] flex items-center pr-3 text-2xl font-black text-[#3b2a1e]">
                  {ownerName || '...........................................'}
                </div>

                <div className="h-[40px] flex items-center pr-3 text-2xl font-mono font-black tracking-widest text-[#3b2a1e]">
                  {nationalId || '....'}
                </div>

                <div className="h-[40px] flex items-center pr-3 text-xl font-bold text-[#3b2a1e]">
                  {activityType || '............'}
                </div>

                <div className="h-[40px] flex items-center pr-3 text-xl font-black text-[#3b2a1e]">
                  {expiryDate || '.......................'}
                </div>
              </div>

              {/* التوقيع والمصادقة المسحوبة من إعدادات التقارير */}
              <div className="absolute bottom-[10px] left-[65px] w-48 text-center flex flex-col items-center">
                <span className="text-xs font-black text-[#2b1b11] mb-1">
                  {currentSignature.title}
                </span>
                <img
                  src={currentSignature.img}
                  alt="التوقيع المعتمد"
                  className="w-full mix-blend-multiply opacity-95 filter contrast-125 max-h-20 object-contain"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* القسم السفلي: جدول السجلات والاستعلامات */}
      <section className="bg-[#c2ac8e]/90 border border-[#a89073] p-6 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-[#a89073] pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b2a1e] flex items-center justify-center border border-[#5a4231] text-[#f4ece1] shadow-inner">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-[#2b1b11]">استعلامات السجلات التجارية</h3>
              <p className="text-xs text-[#594230] font-semibold">متابعة المنشآت المقيدة وحالة الصلاحية</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="البحث بالاسم، الهوية، أو التفاصيل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#ede3d4] border border-[#a89073] rounded-xl pr-10 pl-4 py-2 text-xs font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
            />
            <svg className="w-4 h-4 text-[#594230] absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {isLoadingRecords ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#3b2a1e] border-t-transparent"></div>
            <span className="text-xs font-bold text-[#4a3525]">جاري المزامنة مع قاعدة البيانات...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-xs font-bold text-[#594230]">
            لا توجد سجلات تجارية مطابقة لخيارات البحث.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#a89073]/60 bg-[#ede3d4]/50">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#b39c7e]/60 text-[#2b1b11] font-black border-b border-[#a89073]">
                  <th className="p-3.5">الرقم</th>
                  <th className="p-3.5">اسم المنشأة</th>
                  <th className="p-3.5">بيانات المالك والنشاط</th>
                  <th className="p-3.5">تاريخ الإصدار</th>
                  <th className="p-3.5">حالة الصلاحية (مؤشر حي)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => (
                  <tr key={idx} className="hover:bg-[#b39c7e]/30 transition border-b border-[#a89073]/40">
                    <td className="p-3.5 font-mono font-bold text-[#594230]">{records.length - idx}</td>
                    <td className="p-3.5 font-black text-[#2b1b11]">{record.businessName}</td>
                    <td className="p-3.5 font-bold text-[#4a3525]">{record.details}</td>
                    <td className="p-3.5 font-mono text-[#594230]">{record.issueDate}</td>
                    <td className="p-3.5">
                      <Countdown expiryDate={record.expiryDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
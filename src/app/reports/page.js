'use client';

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { toCanvas } from 'html-to-image';
import {
  SIGNATURE_PRESETS,
  REPORT_TEMPLATES,
  FONT_SIZES,
  EDITOR_STYLES,
} from './editorConfig';

// مكتبة الخطوط العربية المعتمدة للوثائق الرسمية
const ARABIC_FONTS = [
  { id: 'kufi', name: 'الخط الكوفي المودرن', family: "'Noto Kufi Arabic', system-ui, sans-serif" },
  { id: 'naskh', name: 'الخط النسخي الرسمي', family: "'Noto Naskh Arabic', 'Segoe UI', Tahoma, serif" },
  { id: 'amiri', name: 'الخط الأميري الملكي', family: "'Amiri', 'Times New Roman', serif" },
  { id: 'system', name: 'خط النظام الموحد', family: "'Segoe UI', Tahoma, Geneva, sans-serif" },
];

export default function ReportsPage() {
  const { data: session, status } = useSession();

  const editorRef = useRef(null);
  const printContainerRef = useRef(null);

  const [title, setTitle] = useState(REPORT_TEMPLATES[0].defaultTitle);
  const [titleColor, setTitleColor] = useState('#2d1e14');
  
  // الخط المختار
  const [selectedFont, setSelectedFont] = useState(ARABIC_FONTS[0]);

  // إدارة الصفحات المتعددة
  const [pages, setPages] = useState([REPORT_TEMPLATES[0].defaultContent]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // موضع التوقيع (يسار / وسط / يمين)
  const [signaturePosition, setSignaturePosition] = useState('left');
  const [selectedSigId, setSelectedSigId] = useState(SIGNATURE_PRESETS[0].id);

  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setPages((prev) => {
        const updated = [...prev];
        updated[currentPageIndex] = newHtml;
        return updated;
      });
    }
  };

  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = pages[currentPageIndex] || '';
    }
  }, [currentPageIndex]);

  const addNewPage = () => {
    setPages((prev) => [...prev, 'تابع منطوق الحكم والوقائع القضائية...']);
    setCurrentPageIndex(pages.length);
  };

  const removePage = (indexToRemove) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (currentPageIndex >= indexToRemove && currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const applyTemplate = (template) => {
    setTitle(template.defaultTitle);
    setPages([template.defaultContent]);
    setCurrentPageIndex(0);
    if (editorRef.current) {
      editorRef.current.innerHTML = template.defaultContent;
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" dir="rtl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3b2a1e] border-t-transparent"></div>
        <p className="font-bold text-[#3b2a1e] text-base">جاري تحميل المنظومة والوثائق القضائية...</p>
      </div>
    );
  }

  const handlePrintAndSend = async () => {
    if (!printContainerRef.current) return;
    setIsSending(true);
    setFeedback(null);

    try {
      const pageElements = printContainerRef.current.querySelectorAll('.single-page-print');
      
      for (let i = 0; i < pageElements.length; i++) {
        const canvas = await toCanvas(pageElements[i], {
          pixelRatio: 1,
          backgroundColor: '#ffffff',
        });

        const blob = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
        });

        if (!blob) throw new Error(`تعذر استخراج الصفحة رقم ${i + 1}`);

        const formData = new FormData();
        formData.append('file', blob, `verdict-page-${i + 1}.jpg`);
        formData.append('title', `${title} (صفحة ${i + 1} من ${pageElements.length})`);

        await fetch('/api/send-report', { method: 'POST', body: formData });
      }

      setFeedback({ type: 'success', message: `تم توثيق واعتماد ${pageElements.length} صفحة بنجاح وإرسالها للمحكمة.` });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'حدث خطأ أثناء تصوير وتوثيق الصفحات.' });
    } finally {
      setIsSending(false);
    }
  };

  const currentSignature = SIGNATURE_PRESETS.find((s) => s.id === selectedSigId) || SIGNATURE_PRESETS[0];

  // كلاسات محاذاة التوقيع
  const getSigAlignClass = (isHighRes = false) => {
    if (signaturePosition === 'left') {
      return isHighRes ? 'left-64 text-center items-center' : 'left-32 text-center items-center';
    }
    if (signaturePosition === 'right') {
      return isHighRes ? 'right-64 text-center items-center' : 'right-32 text-center items-center';
    }
    return 'left-1/2 transform -translate-x-1/2 text-center items-center';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-10 min-h-screen font-sans" dir="rtl">
      
      {/* استيراد الخطوط وستايل التمدد */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Kufi+Arabic:wght@400;700;900&family=Noto+Naskh+Arabic:wght@400;700&display=swap');
        ${EDITOR_STYLES}
      `}} />

      {/* لوحة التحكم والتحرير الجانبية */}
      <aside className="w-full lg:w-[420px] shrink-0 bg-[#c2ac8e]/90 border border-[#a89073] rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5 h-fit lg:sticky lg:top-28">
        
        {/* رأس اللوحة */}
        <div className="flex items-center justify-between border-b border-[#a89073] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b2a1e] flex items-center justify-center border border-[#5a4231] shadow-inner">
              <svg className="w-5 h-5 text-[#f4ece1]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2b1b11]">صياغة الوثيقة القضائية</h2>
              <p className="text-xs text-[#594230] font-semibold">تخصيص الخطوط وموضع الاعتماد</p>
            </div>
          </div>
        </div>

        {/* تنبيهات الحالة */}
        {feedback && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
            feedback.type === 'success' 
              ? 'bg-[#3b2a1e] border-[#5a4231] text-[#f4ece1]' 
              : 'bg-[#8c3832]/20 border-[#8c3832]/40 text-[#732924]'
          }`}>
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

        {/* 1. إدارة وترقيم الصفحات */}
        <div className="flex flex-col gap-2 bg-[#b39c7e]/40 p-3.5 rounded-xl border border-[#a89073]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#2b1b11] flex items-center gap-1.5">
              <svg className="w-4 h-4 text-[#594230]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>إدارة الصفحات ({pages.length})</span>
            </label>
            <button
              type="button"
              onClick={addNewPage}
              className="flex items-center gap-1 bg-[#3b2a1e] hover:bg-[#281c13] text-[#f4ece1] px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>صفحة جديدة</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {pages.map((_, idx) => (
              <div key={idx} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition border ${
                    currentPageIndex === idx
                      ? 'bg-[#3b2a1e] text-[#f4ece1] border-[#5a4231] shadow-xs'
                      : 'bg-[#ede3d4] text-[#2b1b11] border-[#a89073] hover:bg-[#d8ccb8]'
                  }`}
                >
                  صفحة {idx + 1}
                </button>
                {pages.length > 1 && currentPageIndex === idx && (
                  <button
                    type="button"
                    onClick={() => removePage(idx)}
                    title="حذف هذه الصفحة"
                    className="mr-1 p-1 text-[#8c3832] hover:bg-[#8c3832]/20 rounded-md transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. نوع الخط العربي */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#2b1b11] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#594230]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            <span>نمط الخط العربي المعتمد</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ARABIC_FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => setSelectedFont(font)}
                className={`p-2 rounded-xl text-xs font-bold border transition ${
                  selectedFont.id === font.id
                    ? 'bg-[#3b2a1e] text-[#f4ece1] border-[#5a4231] shadow-xs'
                    : 'bg-[#ede3d4] text-[#2b1b11] border-[#a89073] hover:bg-[#d8ccb8]'
                }`}
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. عنوان الوثيقة ولونها */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#2b1b11] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#594230]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h6" />
            </svg>
            <span>مسمى الصك / نوع القرار</span>
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="flex-1 bg-[#ede3d4] border border-[#a89073] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#2b1b11] outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
              placeholder="مثال: صك حكم قضائي قطعي"
            />
            <div className="flex items-center gap-1.5 bg-[#ede3d4] border border-[#a89073] px-2.5 py-1.5 rounded-xl">
              <input 
                type="color" 
                value={titleColor} 
                onChange={(e) => setTitleColor(e.target.value)} 
                title="تخصيص لون العنوان" 
                className="w-6 h-6 rounded cursor-pointer border-none bg-transparent" 
              />
            </div>
          </div>
        </div>

        {/* 4. محرر النصوص والأدوات */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#2b1b11] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#594230]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span>محتوى الصفحة ({currentPageIndex + 1})</span>
            </label>
            <span className="text-[10px] text-[#594230] font-bold">(تنسيق فوري)</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#b39c7e]/40 border border-[#a89073] rounded-xl">
            <button 
              type="button" 
              onClick={() => execCmd('bold')} 
              className="px-2.5 py-1 rounded-lg bg-[#ede3d4] hover:bg-[#3b2a1e] hover:text-[#f4ece1] text-xs font-black text-[#2b1b11] transition border border-[#a89073]"
              title="غامق"
            >
              B
            </button>
            <button 
              type="button" 
              onClick={() => execCmd('underline')} 
              className="px-2.5 py-1 rounded-lg bg-[#ede3d4] hover:bg-[#3b2a1e] hover:text-[#f4ece1] text-xs font-bold underline text-[#2b1b11] transition border border-[#a89073]"
              title="تسطير"
            >
              U
            </button>

            <div className="h-4 w-px bg-[#a89073]/80 mx-0.5"></div>

            <button 
              type="button" 
              onClick={() => execCmd('justifyRight')} 
              className="p-1 rounded-lg bg-[#ede3d4] hover:bg-[#3b2a1e] hover:text-[#f4ece1] text-[#2b1b11] transition border border-[#a89073]"
              title="محاذاة لليمين"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M10 12h10M6 18h14" />
              </svg>
            </button>
            <button 
              type="button" 
              onClick={() => execCmd('justifyCenter')} 
              className="p-1 rounded-lg bg-[#ede3d4] hover:bg-[#3b2a1e] hover:text-[#f4ece1] text-[#2b1b11] transition border border-[#a89073]"
              title="توسيط"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M5 18h14" />
              </svg>
            </button>

            <div className="h-4 w-px bg-[#a89073]/80 mx-0.5"></div>

            <select 
              onChange={(e) => execCmd('fontSize', e.target.value)} 
              defaultValue="3"
              className="bg-[#ede3d4] text-[11px] font-bold text-[#2b1b11] px-2 py-1 rounded-lg border border-[#a89073] outline-none"
            >
              {FONT_SIZES.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          <div 
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            style={{ fontFamily: selectedFont.family }}
            className="report-content w-full min-h-[160px] max-h-[220px] overflow-y-auto p-4 bg-[#ede3d4] border border-[#a89073] rounded-xl text-[#2b1b11] font-bold text-sm leading-relaxed outline-none focus:border-[#3b2a1e] focus:bg-[#f8f6f2] transition"
          />
        </div>

        {/* 5. موضع التوقيع والصفة الرسمية */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#2b1b11] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#594230]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>موضع التوقيع في الصفحة</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'right', label: 'أسفل اليمين' },
              { id: 'center', label: 'أسفل الوسط' },
              { id: 'left', label: 'أسفل اليسار' },
            ].map((pos) => (
              <button
                key={pos.id}
                type="button"
                onClick={() => setSignaturePosition(pos.id)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  signaturePosition === pos.id
                    ? 'bg-[#3b2a1e] text-[#f4ece1] border-[#5a4231] shadow-xs'
                    : 'bg-[#ede3d4] text-[#2b1b11] border-[#a89073] hover:bg-[#d8ccb8]'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. اختيار صفة التوقيع */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#2b1b11]">صفة المصادق المعتمد</label>
          <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto pr-0.5">
            {SIGNATURE_PRESETS.map((sig) => {
              const isSelected = sig.id === selectedSigId;
              return (
                <button
                  key={sig.id}
                  type="button"
                  onClick={() => setSelectedSigId(sig.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border text-right transition-all ${
                    isSelected
                      ? 'bg-[#3b2a1e] border-[#5a4231] text-[#f4ece1] shadow-xs'
                      : 'bg-[#ede3d4] border-[#a89073] text-[#2b1b11] hover:bg-[#d8ccb8]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black leading-tight">{sig.title}</span>
                    <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#c2ac8e]' : 'text-[#594230]'}`}>
                      {sig.department}
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

        {/* زر الإرسال والاعتماد */}
        <button 
          onClick={handlePrintAndSend} 
          disabled={isSending}
          className="w-full flex items-center justify-center gap-2.5 bg-[#3b2a1e] hover:bg-[#281c13] text-[#f4ece1] font-black py-3.5 px-4 rounded-xl border border-[#5a4231] transition shadow-md disabled:opacity-60 cursor-pointer text-sm"
        >
          {isSending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#f4ece1] border-t-transparent"></div>
              <span>جاري توثيق {pages.length} صفحات...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>اعتماد وتوثيق الوثيقة ({pages.length} صفحات)</span>
            </>
          )}
        </button>

      </aside>

      {/* القسم الرئيسي: المعاينة الحية */}
      <main className="flex-1 flex flex-col items-center gap-12 overflow-x-auto pb-14">
        {pages.map((pageHtml, pIndex) => (
          <div key={pIndex} className="flex flex-col items-center">
            
            {/* مؤشر رقم الصفحة */}
            <div className="mb-2 bg-[#3b2a1e] text-[#f4ece1] text-xs font-bold px-4 py-1 rounded-full shadow-sm">
              الصفحة ({pIndex + 1} من {pages.length})
            </div>

            <div className="transform scale-[0.45] md:scale-[0.55] xl:scale-[0.62] origin-top shadow-2xl rounded-sm border border-[#a89073]/50">
              <div 
                className="relative shrink-0 w-[1240px] h-[1754px] bg-white text-right"
                style={{
                  backgroundImage: "url('/image_cfa79e.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  fontFamily: selectedFont.family,
                }}
              >
                {/* المحتوى */}
                <div className="pt-[440px] px-32">
                  <h1 className="font-black mb-14 text-5xl text-center tracking-wide" style={{ color: titleColor }}>
                    {title}
                  </h1>
                  
                  <div 
                    className="report-content font-bold leading-[2.4] break-words text-justify"
                    style={{ fontSize: '30px', color: '#2d1e14' }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />
                </div>

                {/* رقم الصفحة داخل الورقة */}
                <div className="absolute bottom-16 right-32 text-sm font-bold text-[#594230]">
                  صفحة {pIndex + 1} من {pages.length}
                </div>

                {/* التوقيع الملكي (بدون الاسم، فقط المسمى الرسمي والتوقيع النقي) */}
                {pIndex === pages.length - 1 && (
                  <div className={`absolute bottom-20 w-72 flex flex-col ${getSigAlignClass(false)}`}>
                    <span className="text-xl font-black text-[#2b1b11] tracking-wider mb-2">
                      {currentSignature.title}
                    </span>
                    <div className="w-16 h-0.5 bg-[#8c735a] mb-3 opacity-60"></div>
                    <img 
                      src={currentSignature.img} 
                      alt="التوقيع الرسمي" 
                      className="w-full mix-blend-multiply opacity-95 filter contrast-125 max-h-28 object-contain" 
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}
      </main>

      {/* حاوية الطباعة والتصدير المخفية بدقة 300DPI لكافة الصفحات */}
      <div ref={printContainerRef} className="fixed top-[-9999px] left-[-9999px] overflow-hidden opacity-0 pointer-events-none">
        {pages.map((pageHtml, pIndex) => (
          <div 
            key={pIndex}
            className="single-page-print relative w-[2480px] h-[3508px] bg-white text-right mb-20"
            style={{
              backgroundImage: "url('/image_cfa79e.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              fontFamily: selectedFont.family,
            }}
          >
            <div className="pt-[880px] px-64">
              <h1 className="font-black mb-28 text-8xl text-center" style={{ color: titleColor }}>
                {title}
              </h1>
              
              <div 
                className="report-content font-bold leading-[2.4] break-words text-justify"
                style={{ fontSize: '60px', color: '#2d1e14' }}
                dangerouslySetInnerHTML={{ __html: pageHtml }}
              />
            </div>

            {/* ترقيم الصفحة المطبوعة */}
            <div className="absolute bottom-32 right-64 text-3xl font-black text-[#594230]">
              صفحة {pIndex + 1} من {pages.length}
            </div>

            {/* توقيع الصفحة الأخيرة الفائق الدقة */}
            {pIndex === pages.length - 1 && (
              <div className={`absolute bottom-40 w-[580px] flex flex-col ${getSigAlignClass(true)}`}>
                <span className="text-4xl font-black text-[#2b1b11] tracking-wider mb-4">
                  {currentSignature.title}
                </span>
                <div className="w-32 h-1 bg-[#8c735a] mb-6 opacity-60"></div>
                <img 
                  src={currentSignature.img} 
                  alt="التوقيع الرسمي" 
                  className="w-full mix-blend-multiply opacity-95 filter contrast-125 max-h-56 object-contain" 
                />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
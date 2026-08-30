'use client';

import Link from 'next/link';

export default function LawyersPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-16 font-sans text-center" dir="rtl">
      
      {/* البطاقة المركزية */}
      <div className="w-full max-w-2xl bg-[#c2ac8e]/95 border border-[#a89073] rounded-3xl p-8 sm:p-12 shadow-sm backdrop-blur-md flex flex-col items-center gap-6">
        
        {/* أيقونة المحاماة والتطوير */}
        <div className="w-20 h-20 rounded-2xl bg-[#3b2a1e] border border-[#5a4231] flex items-center justify-center text-[#f4ece1] shadow-inner">
          <svg className="w-10 h-10 text-[#f4ece1]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>

        {/* النصوص الرسمية وتفاصيل النظام */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-[#594230] tracking-wider uppercase">
            وزارة العدل — نقابة وهيئة المحامين
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b11]">
            بوابة المحامين والمرافعات المعتمدة
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#4a3525] leading-relaxed max-w-lg mx-auto">
            منصة مخصصة للمحامين لرفع وإرسال اللوائح القانونية، مذكرات الدفاع، وتقارير القضايا وطلب المصادقة والاعتماد الرسمي المباشر من قبل قضاة ومسؤولي المحكمة.
          </p>
        </div>

        {/* مميزات البوابة القادمة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-right my-1">
          <div className="bg-[#ede3d4] border border-[#a89073]/60 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#3b2a1e] flex items-center justify-center text-[#f4ece1] shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#2b1b11]">إرسال اللوائح والتقارير</span>
              <span className="text-[10px] font-bold text-[#594230]">رفع المذكرات القضائية إلكترونياً</span>
            </div>
          </div>

          <div className="bg-[#ede3d4] border border-[#a89073]/60 p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#3b2a1e] flex items-center justify-center text-[#f4ece1] shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#2b1b11]">المصادقة والاعتماد</span>
              <span className="text-[10px] font-bold text-[#594230]">توثيق الطلبات من مسؤولي المحكمة</span>
            </div>
          </div>
        </div>

        {/* مؤشر الحالة */}
        <div className="inline-flex items-center gap-2.5 bg-[#ede3d4] border border-[#a89073] text-[#2b1b11] px-5 py-2.5 rounded-2xl shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3b2a1e] animate-pulse"></span>
          <span className="text-xs font-black">قريباً — قيد التطوير والبرمجة</span>
        </div>

        {/* زر العودة للرئيسية */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 bg-[#3b2a1e] hover:bg-[#291c13] text-[#f4ece1] font-bold text-xs px-6 py-3 rounded-xl border border-[#5a4231] shadow-sm transition-all duration-200 mt-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>العودة للوحة المؤشرات</span>
        </Link>

      </div>

    </div>
  );
}
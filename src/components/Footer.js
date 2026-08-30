import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#c2ac8e]/95 border-t border-[#a89073] mt-auto backdrop-blur-md font-sans text-[#2b1b11]" dir="rtl">
      
      {/* القسم العلوي: الأعمدة والروابط الشاملة */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* العمود 1: عن المنظومة والتعريف */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b2a1e] flex items-center justify-center border border-[#5a4231] shadow-inner">
                <svg className="w-5 h-5 text-[#f4ece1]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-8 5m8-5l8 5M4 8l4 8H0l4-8zm16 0l4 8h-8l4-8z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-[#2b1b11]">وزارة العدل</span>
                <span className="text-xs font-bold text-[#594230]">محكمة مدينة العدالة القضائية</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-[#4a3525] leading-relaxed mt-2">
              المنظومة الرقمية الموحدة لتوثيق الأحكام القضائية، قيد السجلات التجارية، وتنسيق أعمال الدوائر العدلية وأمانة السر.
            </p>
          </div>

          {/* العمود 2: البوابات والخدمات العدلية */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-[#3b2a1e] uppercase tracking-wider border-b border-[#a89073]/60 pb-1.5 w-fit">
              الخدمات الإلكترونية
            </span>
            <ul className="flex flex-col gap-2 text-xs font-bold text-[#4a3525]">
              <li>
                <Link href="/dashboard" className="hover:text-[#2b1b11] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                  <span>لوحة المؤشرات والقيادة</span>
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-[#2b1b11] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                  <span>إصدار الصكوك والقرارات</span>
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="hover:text-[#2b1b11] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                  <span>قيد واستعلام السجلات التجارية</span>
                </Link>
              </li>
              <li>
                <Link href="/lawyers" className="hover:text-[#2b1b11] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                  <span>بوابة نقابة المحامين</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* العمود 3: الأنظمة واللوائح العدلية */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-[#3b2a1e] uppercase tracking-wider border-b border-[#a89073]/60 pb-1.5 w-fit">
              اللوائح والاختصاص
            </span>
            <ul className="flex flex-col gap-2 text-xs font-semibold text-[#4a3525]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                <span>نظام المرافعات الشرعية والإجراءات</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                <span>دليل التوثيق والسجلات التجارية</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                <span>لائحة المحامين والاستشارات المعتمدة</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#594230]"></span>
                <span>ضوابط الصكوك والشهادات الرقمية</span>
              </li>
            </ul>
          </div>

          {/* العمود 4: الأمان والمعايير الرقمية */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-[#3b2a1e] uppercase tracking-wider border-b border-[#a89073]/60 pb-1.5 w-fit">
              الأمان والاعتماد
            </span>
            <div className="bg-[#ede3d4] border border-[#a89073] p-3.5 rounded-2xl flex flex-col gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black text-[#2b1b11]">
                <svg className="w-4 h-4 text-[#3b2a1e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>نظام مشفر وموثق</span>
              </div>
              <p className="text-[11px] font-bold text-[#594230] leading-relaxed">
                كافة الصكوك والسجلات والمصادقات ترمز وتوثق تلقائياً بقاعدة البيانات المركزية.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* الشريط السفلي: الحقوق وتوقيع المطور */}
      <div className="border-t border-[#a89073]/60 bg-[#b39c7e]/40 py-5">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <p className="text-[#2b1b11] text-xs font-bold tracking-wide text-center sm:text-right">
            جميع الحقوق محفوظة © 2026 — وزارة العدل | محكمة مدينة العدالة
          </p>

          <div className="flex items-center gap-2 bg-[#ede3d4] px-4 py-2 rounded-xl border border-[#a89073] shadow-xs">
            <svg className="w-4 h-4 text-[#3b2a1e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-[#2b1b11] text-xs font-bold">
              تطوير وهندسة المنظومة — عبدالعزيز الحربي
            </span>
          </div>

        </div>
      </div>

    </footer>
  );
}
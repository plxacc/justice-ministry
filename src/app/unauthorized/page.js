'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12 font-sans text-center" dir="rtl">
      
      <div className="w-full max-w-lg bg-[#c2ac8e]/95 border-2 border-[#732924]/60 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col items-center gap-6">
        
        {/* أيقونة المنع والتحذير */}
        <div className="w-20 h-20 rounded-2xl bg-[#732924]/20 border border-[#732924]/40 flex items-center justify-center text-[#732924] shadow-inner">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        {/* نصوص التنبيه الصريحة */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black text-[#732924] tracking-wider uppercase">
            وصول محظور — نظام محكمة مدينة العدالة
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b11]">
            غير مصرح لك بالدخول
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#541d19] leading-relaxed mt-2 max-w-sm">
            حسابك لا يمتلك أي رتبة عدلية أو صلاحية معتمدة تمكنك من تصفح المنظومة وإجراء المعاملات القضائية.
          </p>
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3 px-5 rounded-xl bg-[#732924] hover:bg-[#541d19] text-[#f4ece1] font-bold text-xs border border-[#541d19] transition-all shadow-md cursor-pointer"
          >
            تسجيل الخروج
          </button>
          
          <Link
            href="/"
            className="w-full py-3 px-5 rounded-xl bg-[#ede3d4] hover:bg-[#dfd4c4] text-[#2b1b11] font-bold text-xs border border-[#a89073] transition-all text-center"
          >
            العودة للرئيسية
          </Link>
        </div>

      </div>

    </div>
  );
}
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  const roles = session.user?.roles || [];

  const CHIEF_JUDGE = process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE;
  const DEPUTY_JUDGE = process.env.NEXT_PUBLIC_ROLE_DEPUTY_JUDGE;
  const ADMIN = process.env.NEXT_PUBLIC_ROLE_ADMIN;
  const JUSTICE_ADMIN = process.env.NEXT_PUBLIC_ROLE_JUSTICE_ADMIN;
  const PROSECUTOR_GENERAL = process.env.NEXT_PUBLIC_ROLE_PROSECUTOR_GENERAL;
  const DEPUTY_PROSECUTOR = process.env.NEXT_PUBLIC_ROLE_DEPUTY_PROSECUTOR;
  const COURT_CLERK = process.env.NEXT_PUBLIC_ROLE_COURT_CLERK;
  const NOTARY_PUBLIC = process.env.NEXT_PUBLIC_ROLE_NOTARY_PUBLIC;

  const authorizedRoles = [
    CHIEF_JUDGE,
    DEPUTY_JUDGE,
    ADMIN,
    JUSTICE_ADMIN,
    PROSECUTOR_GENERAL,
    DEPUTY_PROSECUTOR,
    COURT_CLERK,
    NOTARY_PUBLIC,
  ].filter(Boolean);

  const hasFullAccess = roles.some((role) => authorizedRoles.includes(role));

  let userTitle = 'منسوب العدل';
  if (CHIEF_JUDGE && roles.includes(CHIEF_JUDGE)) userTitle = 'قاضي المحكمة';
  else if (DEPUTY_JUDGE && roles.includes(DEPUTY_JUDGE)) userTitle = 'مساعد القاضي';
  else if ((ADMIN && roles.includes(ADMIN)) || (JUSTICE_ADMIN && roles.includes(JUSTICE_ADMIN))) userTitle = 'إدارة العدل';
  else if (PROSECUTOR_GENERAL && roles.includes(PROSECUTOR_GENERAL)) userTitle = 'المدعي العام';
  else if (DEPUTY_PROSECUTOR && roles.includes(DEPUTY_PROSECUTOR)) userTitle = 'وكيل النيابة';
  else if (NOTARY_PUBLIC && roles.includes(NOTARY_PUBLIC)) userTitle = 'كاتب العدل';
  else if (COURT_CLERK && roles.includes(COURT_CLERK)) userTitle = 'أمين السر';

  const navLinkClass = (path) => {
    const isActive = pathname === path;
    return `relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-base font-bold transition-all duration-200 ${
      isActive
        ? 'bg-[#3b2a1e] text-[#f4ece1] shadow-md shadow-[#3b2a1e]/20'
        : 'text-[#4a3525] hover:text-[#24170e] hover:bg-[#b8a082]/40'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#c2ac8e]/95 border-b border-[#a89073] shadow-sm backdrop-blur-md font-sans" dir="rtl">
      <div className="w-full px-10 h-24 flex items-center justify-between gap-6">
        
        {/* أقصى اليمين: شعار واسم وزارة العدل */}
        <div className="flex items-center gap-4 select-none">
          <div className="w-14 h-14 rounded-2xl bg-[#3b2a1e] flex items-center justify-center border border-[#5a4231] shadow-md">
            <svg className="w-8 h-8 text-[#f4ece1]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-8 5m8-5l8 5M4 8l4 8H0l4-8zm16 0l4 8h-8l4-8z" />
            </svg>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[#2b1b11] font-black text-2xl tracking-wide leading-none">وزارة العدل</span>
            <span className="text-[#594230] text-sm font-bold tracking-tight mt-1.5">مدينة العدالة القضائية</span>
          </div>
        </div>

        {/* المنتصف تماماً: روابط التنقل */}
        <nav className="flex items-center gap-3 bg-[#b39c7e]/40 p-2 rounded-2xl border border-[#a68e70]/50 shadow-inner">
          <Link href="/dashboard" className={navLinkClass('/dashboard')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>الرئيسية</span>
          </Link>

          <Link href="/lawyers" className={navLinkClass('/lawyers')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>بوابة المحامين</span>
          </Link>

          {hasFullAccess && (
            <>
              <Link href="/commercial" className={navLinkClass('/commercial')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>السجلات التجارية</span>
              </Link>

              <Link href="/reports" className={navLinkClass('/reports')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>القرارات والتواقيع</span>
              </Link>
            </>
          )}
        </nav>

        {/* أقصى اليسار: بطاقة المستخدم وزر تسجيل الخروج */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3.5 bg-[#b39c7e]/50 border border-[#9e866a] px-4 py-2 rounded-2xl shadow-inner">
            <img
              src={session.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt="صورة الحساب"
              className="w-12 h-12 rounded-xl border-2 border-[#7a6249] object-cover shadow-sm"
            />
            <div className="flex flex-col text-right">
              <span className="text-[#2b1b11] font-black text-base leading-tight mb-1">
                {session.user?.name}
              </span>
              <span className="bg-[#3b2a1e] text-[#f4ece1] px-2.5 py-0.5 rounded-lg text-xs font-bold w-fit shadow-xs">
                {userTitle}
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            title="تسجيل الخروج"
            className="flex items-center justify-center p-3 rounded-2xl bg-[#8c3832]/15 border border-[#8c3832]/30 text-[#732924] hover:bg-[#732924] hover:text-[#f4ece1] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
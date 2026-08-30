import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main
      className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-12"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#a89073] bg-[#c2ac8e]/95 p-8 text-center shadow-2xl backdrop-blur-md">
        
        {/* الشعار الموثق بنمط SVG رسمي */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#5a4231] bg-[#3b2a1e] shadow-inner">
          <svg
            className="h-10 w-10 text-[#f4ece1]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v18m0-18l-8 5m8-5l8 5M4 8l4 8H0l4-8zm16 0l4 8h-8l4-8z"
            />
          </svg>
        </div>

        {/* النصوص والعناوين */}
        <h1 className="mb-1 text-2xl font-black tracking-wide text-[#2b1b11]">
          وزارة العدل
        </h1>
        <h2 className="mb-4 text-sm font-bold text-[#594230]">
          محكمة مدينة العدالة القضائية
        </h2>
        <p className="mb-8 text-xs font-semibold leading-relaxed text-[#4a3525]">
          المنظومة الإلكترونية الموحدة لإدارة القضايا، السجلات التجارية، وشؤون
          المحامين والتوثيق العدلي.
        </p>

        {/* زر تسجيل الدخول المباشر */}
        <a
          href="/api/auth/signin/discord"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#5a4231] bg-[#3b2a1e] px-5 py-3.5 text-sm font-bold text-[#f4ece1] shadow-md transition-all duration-200 hover:bg-[#281c13] hover:shadow-lg active:translate-y-0.5"
        >
          <svg
            className="h-5 w-5 text-[#f4ece1]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          <span>تسجيل الدخول عبر المنظومة</span>
        </a>

        {/* تنويه الأمان */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#594230]">
          <svg
            className="h-3.5 w-3.5 text-[#4a3525]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>نظام مشفر ومخصص للكوادر القضائية والإدارية</span>
        </div>

      </div>
    </main>
  );
}
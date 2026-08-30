import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const roles = session.user?.roles || [];
    const isSystemDev = session.user?.id === "735023566596210748";
    
    const allowedRoles = [
      process.env.NEXT_PUBLIC_ROLE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_JUSTICE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_PROSECUTOR_GENERAL,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_PROSECUTOR,
      process.env.NEXT_PUBLIC_ROLE_COURT_CLERK,
      process.env.NEXT_PUBLIC_ROLE_NOTARY_PUBLIC,
      process.env.NEXT_PUBLIC_ROLE_BAR_PRESIDENT,
      process.env.NEXT_PUBLIC_ROLE_BAR_VICE_PRESIDENT,
      process.env.NEXT_PUBLIC_ROLE_LAW_FIRM_HEAD,
      process.env.NEXT_PUBLIC_ROLE_LAW_FIRM_DEPUTY,
      process.env.NEXT_PUBLIC_ROLE_EXPERT_LAWYER,
      process.env.NEXT_PUBLIC_ROLE_CERTIFIED_LAWYER,
      process.env.NEXT_PUBLIC_ROLE_BAR_ASSOCIATION,
      process.env.NEXT_PUBLIC_ROLE_ASSISTANT_LAWYER,
      process.env.NEXT_PUBLIC_ROLE_LAW_FIRM_MEMBER,
    ].filter(Boolean);

    const isAuthorized = isSystemDev || roles.some((role) => allowedRoles.includes(role));

    if (isAuthorized) {
      redirect('/dashboard');
    } else {
      redirect('/unauthorized');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]" dir="rtl">
      <div className="bg-white p-10 rounded-2xl border-t-4 border-[#8b5a2b] shadow-xl text-center max-w-md w-full border-x border-b border-[#e6d5c3]">
        <img src="/favicon.png" alt="شعار العدل" className="w-32 h-32 mx-auto mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-[#5c4033] mb-2">وزارة العدل</h1>
        <h2 className="text-lg font-bold text-[#8c7362] mb-4">محكمة مدينة العدالة</h2>
        <p className="text-[#7a6352] mb-8 text-sm leading-relaxed">
          النظام الموحد والموثق للقضاة والمحامين وكتاب العدل.
        </p>

        <a
          href="/api/auth/signin/discord"
          className="flex items-center justify-center gap-3 w-full bg-[#8b5a2b] hover:bg-[#6b4c3a] text-white font-bold py-3.5 px-4 rounded-xl transition duration-300 shadow-md"
        >
          <span>تسجيل الدخول عبر البوابة</span>
        </a>
      </div>
    </div>
  );
}
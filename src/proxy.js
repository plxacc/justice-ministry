import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
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
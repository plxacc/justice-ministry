import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGoogleSheets } from "@/lib/google";

export const dynamic = 'force-dynamic';

// 1. الإحصائيات العامة
async function getJusticeStats() {
  try {
    const sheets = await getGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const [verdictsRes, commercialRes, approvalsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'القرارات_القضائية!A:Z' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'السجلات_التجارية!A:Z' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'طلبات_المصادقة!A:Z' }).catch(() => ({ data: { values: [] } })),
    ]);

    return {
      verdictsCount: Math.max(0, (verdictsRes.data.values || []).length - 1),
      commercialCount: Math.max(0, (commercialRes.data.values || []).length - 1),
      approvalsCount: Math.max(0, (approvalsRes.data.values || []).length - 1),
    };
  } catch {
    return { verdictsCount: 0, commercialCount: 0, approvalsCount: 0 };
  }
}

// 2. سحب وتصفية الأعضاء بأعلى رتبة فقط
async function getJusticeStaff() {
  const guildId = process.env.GUILD_ID || process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_TOKEN;

  if (!guildId || !botToken) return { chief: null, developer: null, staffList: [] };

  try {
    const resDiscord = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: 'no-store',
    });

    if (!resDiscord.ok) return { chief: null, developer: null, staffList: [] };

    const discordMembers = await resDiscord.json();

    // سلم الرتب (الأقل رقماً هو الأعلى إدارياً)
    const ROLE_PRIORITIES = [
      { id: process.env.ROLE_JUSTICE_ADMIN, title: "إدارة العدل", priority: 1 },
      { id: process.env.ROLE_CHIEF_JUDGE, title: "قاضي المحكمة", priority: 2 },
      { id: process.env.ROLE_DEPUTY_JUDGE, title: "مساعد القاضي", priority: 3 },
      { id: process.env.ROLE_PROSECUTOR_GENERAL, title: "المدعي العام", priority: 4 },
      { id: process.env.ROLE_DEPUTY_PROSECUTOR, title: "وكيل النيابة", priority: 5 },
      { id: process.env.ROLE_BAR_PRESIDENT, title: "نقيب المحامين", priority: 6 },
      { id: process.env.ROLE_BAR_VICE_PRESIDENT, title: "نائب نقيب المحامين", priority: 7 },
      { id: process.env.ROLE_NOTARY_PUBLIC, title: "كاتب العدل", priority: 8 },
      { id: process.env.ROLE_COURT_CLERK, title: "أمين السر", priority: 9 },
      { id: process.env.ROLE_LAW_FIRM_HEAD, title: "رئيس مكتب محاماة", priority: 10 },
      { id: process.env.ROLE_LAW_FIRM_DEPUTY, title: "نائب رئيس مكتب محاماة", priority: 11 },
      { id: process.env.ROLE_EXPERT_LAWYER, title: "محامي خبير", priority: 12 },
      { id: process.env.ROLE_CERTIFIED_LAWYER, title: "محامي معتمد", priority: 13 },
      { id: process.env.ROLE_BAR_ASSOCIATION, title: "عضو نقابة المحامين", priority: 14 },
      { id: process.env.ROLE_ASSISTANT_LAWYER, title: "محامي متدرب", priority: 15 },
      { id: process.env.ROLE_LAW_FIRM_MEMBER, title: "عضو مكتب محاماة", priority: 16 },
    ].filter(r => Boolean(r.id));

    const roleMap = new Map(ROLE_PRIORITIES.map(r => [r.id, r]));

    const getAvatar = (member) => {
      if (!member.user) return '/placeholder.png';
      if (member.avatar) {
        return `https://cdn.discordapp.com/guilds/${guildId}/users/${member.user.id}/avatars/${member.avatar}.png`;
      }
      if (member.user.avatar) {
        return `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`;
      }
      const defaultIndex = Number(BigInt(member.user.id) >> 22n) % 6;
      return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    };

    // استخراج أعلى رتبة فقط
    const getHighestRole = (memberRoles) => {
      let highest = null;
      for (const roleId of memberRoles || []) {
        const config = roleMap.get(roleId);
        if (config) {
          if (!highest || config.priority < highest.priority) {
            highest = config;
          }
        }
      }
      return highest;
    };

    // 1. القاضي
    const chiefMember = discordMembers.find(m => 
      m.roles?.includes(process.env.ROLE_CHIEF_JUDGE) || 
      m.roles?.includes(process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE)
    );

    // 2. المبرمج
    const devMember = discordMembers.find(m => 
      m.user?.id === '735023566596210748' || 
      m.roles?.includes(process.env.NEXT_PUBLIC_ROLE_ADMIN)
    );

    const topIds = new Set([chiefMember?.user?.id, devMember?.user?.id].filter(Boolean));

    const chief = chiefMember ? {
      id: chiefMember.user.id,
      name: chiefMember.nick || chiefMember.user.global_name || chiefMember.user.username,
      avatar: getAvatar(chiefMember),
      roleTitle: "قاضي المحكمة",
    } : null;

    const developer = devMember ? {
      id: devMember.user.id,
      name: devMember.nick || devMember.user.global_name || devMember.user.username,
      avatar: getAvatar(devMember),
      roleTitle: "System Programmer",
    } : null;

    // 3. باقي المنسوبين بأعلى رتبة فقط
    const staffList = discordMembers
      .filter(m => !m.user?.bot && !topIds.has(m.user?.id))
      .map(m => {
        const highest = getHighestRole(m.roles);
        if (!highest) return null;
        return {
          id: m.user.id,
          name: m.nick || m.user.global_name || m.user.username,
          avatar: getAvatar(m),
          roleTitle: highest.title,
          priority: highest.priority,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.priority - b.priority);

    return { chief, developer, staffList };
  } catch {
    return { chief: null, developer: null, staffList: [] };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/');

  const [stats, { chief, developer, staffList }] = await Promise.all([
    getJusticeStats(),
    getJusticeStaff(),
  ]);

  return (
    <div className="min-h-screen pb-20 font-sans px-6 lg:px-12 pt-8 flex flex-col gap-8" dir="rtl">
      
      {/* 🏛️ البنر الترحيبي بنفس نمط ولون النافبار */}
      <section className="relative w-full rounded-2xl bg-[#c2ac8e]/95 border border-[#a89073] p-8 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#594230]">وزارة العدل — محكمة مدينة العدالة القضائية</span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2b1b11]">
              مرحباً بك، {session.user?.name}
            </h1>
            <p className="text-[#4a3525] text-xs sm:text-sm font-semibold leading-relaxed max-w-2xl">
              المنظومة الإلكترونية الموحدة لإصدار وتوثيق الأحكام، تدقيق السجلات التجارية، وإدارة أعمال الكادر القضائي.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#b39c7e]/50 border border-[#9e866a] px-4 py-2.5 rounded-2xl shadow-inner shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#3b2a1e]"></div>
            <span className="text-xs font-bold text-[#2b1b11]">المنظومة متصلة ونشطة</span>
          </div>
        </div>
      </section>

      {/* 👑 مربعات القاضي والمبرمج العلوية (متطابقة مع هوية النافبار) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        
        {/* مربع القاضي */}
        {chief && (
          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#c2ac8e]/95 border border-[#a89073] shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              <img 
                src={chief.avatar} 
                alt="" 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#7a6249] shadow-sm shrink-0" 
              />
              <div className="flex flex-col text-right overflow-hidden">
                <span className="text-base font-black text-[#2b1b11] leading-tight truncate">
                  {chief.name}
                </span>
                <span className="bg-[#3b2a1e] text-[#f4ece1] px-3 py-0.5 rounded-lg text-xs font-bold w-fit mt-1.5 shadow-xs">
                  {chief.roleTitle}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#b39c7e]/40 border border-[#a68e70]/50 flex items-center justify-center text-[#2b1b11] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18l-8 5m8-5l8 5M4 8l4 8H0l4-8zm16 0l4 8h-8l4-8z" />
              </svg>
            </div>
          </div>
        )}

        {/* مربع المبرمج */}
        {developer && (
          <div className="flex items-center justify-between p-5 rounded-2xl bg-[#c2ac8e]/95 border border-[#a89073] shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4 min-w-0">
              <img 
                src={developer.avatar} 
                alt="" 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#7a6249] shadow-sm shrink-0" 
              />
              <div className="flex flex-col text-right overflow-hidden">
                <span className="text-base font-black text-[#2b1b11] leading-tight truncate">
                  {developer.name}
                </span>
                <span className="bg-[#3b2a1e] text-[#f4ece1] px-3 py-0.5 rounded-lg text-xs font-bold w-fit mt-1.5 shadow-xs">
                  {developer.roleTitle}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#b39c7e]/40 border border-[#a68e70]/50 flex items-center justify-center text-[#2b1b11] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
        )}

      </section>

      {/* 📊 بطاقات الإحصائيات (متناسقة بنمط البيج الفاتح والناعم) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-[#c2ac8e]/80 border border-[#a89073] p-6 rounded-2xl shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4a3525]">القرارات القضائية</span>
            <div className="w-9 h-9 rounded-xl bg-[#3b2a1e] text-[#f4ece1] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[#2b1b11] my-2">{stats.verdictsCount}</div>
          <span className="text-[11px] font-bold text-[#594230]">أحكام وقرارات صادرة</span>
        </div>

        <div className="bg-[#c2ac8e]/80 border border-[#a89073] p-6 rounded-2xl shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4a3525]">السجلات التجارية</span>
            <div className="w-9 h-9 rounded-xl bg-[#3b2a1e] text-[#f4ece1] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[#2b1b11] my-2">{stats.commercialCount}</div>
          <span className="text-[11px] font-bold text-[#594230]">منشآت تجارية مقيدة</span>
        </div>

        <div className="bg-[#c2ac8e]/80 border border-[#a89073] p-6 rounded-2xl shadow-sm backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4a3525]">المصادقات العدلية</span>
            <div className="w-9 h-9 rounded-xl bg-[#3b2a1e] text-[#f4ece1] flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-black text-[#2b1b11] my-2">{stats.approvalsCount}</div>
          <span className="text-[11px] font-bold text-[#594230]">معاملات معتمدة</span>
        </div>

      </section>

      {/* ⚖️ كادر ومنسوبي وزارة العدل بأعلى رتبة فقط */}
      <section className="bg-[#c2ac8e]/95 border border-[#a89073] p-6 sm:p-8 rounded-2xl shadow-sm backdrop-blur-md flex flex-col gap-6">
        
        <div className="flex items-center justify-between border-b border-[#a89073]/50 pb-4">
          <div className="flex flex-col">
            <h2 className="text-base font-black text-[#2b1b11]">منسوبي السلك القضائي والعدلي</h2>
            <span className="text-xs font-semibold text-[#594230]">الكادر المعتمد والمصرح له بالعمل العدلي</span>
          </div>
          <span className="text-xs font-bold text-[#2b1b11] bg-[#b39c7e]/40 border border-[#a89073] px-3.5 py-1.5 rounded-xl">
            {staffList.length} عضو
          </span>
        </div>

        {staffList.length === 0 ? (
          <div className="text-center py-10 text-xs font-bold text-[#594230]">
            لا توجد حسابات أخرى تحمل رتب العدل المعتمدة حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {staffList.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#ede3d4] border border-[#a89073] hover:border-[#3b2a1e] transition-all duration-150"
              >
                <img 
                  src={member.avatar} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover border border-[#9e866a] shadow-xs shrink-0" 
                />
                <div className="flex flex-col overflow-hidden min-w-0">
                  <span className="text-xs font-black text-[#2b1b11] truncate">{member.name}</span>
                  <span className="text-[11px] font-bold text-[#594230] truncate mt-0.5">
                    {member.roleTitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const roles = req.nextauth.token?.roles || [];
    const pathname = req.nextUrl.pathname;

    // تجميع كافة معرفات الرتب المسموح لها بالدخول
    const allowedRoles = [
      process.env.ROLE_JUSTICE_ADMIN,
      process.env.ROLE_CHIEF_JUDGE,
      process.env.ROLE_DEPUTY_JUDGE,
      process.env.ROLE_PROSECUTOR_GENERAL,
      process.env.ROLE_DEPUTY_PROSECUTOR,
      process.env.ROLE_COURT_CLERK,
      process.env.ROLE_NOTARY_PUBLIC,
      process.env.ROLE_BAR_PRESIDENT,
      process.env.ROLE_BAR_VICE_PRESIDENT,
      process.env.ROLE_LAW_FIRM_HEAD,
      process.env.ROLE_LAW_FIRM_DEPUTY,
      process.env.ROLE_EXPERT_LAWYER,
      process.env.ROLE_CERTIFIED_LAWYER,
      process.env.ROLE_BAR_ASSOCIATION,
      process.env.ROLE_ASSISTANT_LAWYER,
      process.env.ROLE_LAW_FIRM_MEMBER,
      process.env.NEXT_PUBLIC_ROLE_JUSTICE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_ADMIN,
    ].filter(Boolean);

    // رتب الإدارة والقضاء المسموح لها بالدخول للسجلات والقرارات
    const courtStaffRoles = [
      process.env.ROLE_JUSTICE_ADMIN,
      process.env.ROLE_CHIEF_JUDGE,
      process.env.ROLE_DEPUTY_JUDGE,
      process.env.ROLE_PROSECUTOR_GENERAL,
      process.env.ROLE_DEPUTY_PROSECUTOR,
      process.env.ROLE_COURT_CLERK,
      process.env.ROLE_NOTARY_PUBLIC,
      process.env.NEXT_PUBLIC_ROLE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_JUSTICE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_JUDGE,
    ].filter(Boolean);

    const isAuthorized = roles.some((role) => allowedRoles.includes(role));
    const hasCourtAccess = roles.some((role) => courtStaffRoles.includes(role));

    // 1. إذا كان المستخدم لا يملك أي رتبة معتمدة، يتم تحويله للرئيسية
    if (!isAuthorized) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. حماية صفحات السجلات والقرارات من غير القضاة والإدارة
    if (
      (pathname.startsWith("/commercial") || pathname.startsWith("/reports")) &&
      !hasCourtAccess
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// تطبيق الحماية على كافة المسارات الإدارية والقضائية
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/commercial/:path*",
    "/reports/:path*",
    "/lawyers/:path*",
  ],
};
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const roles = req.nextauth.token?.roles || [];
    const pathname = req.nextUrl.pathname;
    const isSystemDev = req.nextauth.token?.id === "735023566596210748";

    // كافة الرتب المعتمدة
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

    // رتب الإدارة والقضاء للسجلات والقرارات
    const courtStaffRoles = [
      process.env.NEXT_PUBLIC_ROLE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_JUSTICE_ADMIN,
      process.env.NEXT_PUBLIC_ROLE_CHIEF_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_JUDGE,
      process.env.NEXT_PUBLIC_ROLE_PROSECUTOR_GENERAL,
      process.env.NEXT_PUBLIC_ROLE_DEPUTY_PROSECUTOR,
      process.env.NEXT_PUBLIC_ROLE_COURT_CLERK,
      process.env.NEXT_PUBLIC_ROLE_NOTARY_PUBLIC,
    ].filter(Boolean);

    const isAuthorized = isSystemDev || roles.some((role) => allowedRoles.includes(role));
    const hasCourtAccess = isSystemDev || roles.some((role) => courtStaffRoles.includes(role));

    // 1. إذا لم يكن مصرحاً له، يمنع ويحول فوراً لصفحة غير مصرح
    if (!isAuthorized && pathname !== "/unauthorized") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // 2. إذا كان مصرحاً له لكنه ليس قاضياً/إدارياً وحاول دخول السجلات أو القرارات
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
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/commercial/:path*",
    "/reports/:path*",
    "/lawyers/:path*",
    "/unauthorized",
  ],
};
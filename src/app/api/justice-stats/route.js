import { NextResponse } from 'next/server';
import { getGoogleSheets } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    const [verdictsRes, commercialRes, approvalsRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'القرارات_القضائية!A:Z' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'السجلات_التجارية!A:Z' }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({ spreadsheetId, range: 'طلبات_المصادقة!A:Z' }).catch(() => ({ data: { values: [] } })),
    ]);

    const verdictsRows = verdictsRes.data.values || [];
    const commercialRows = commercialRes.data.values || [];
    const approvalsRows = approvalsRes.data.values || [];

    return NextResponse.json({
      verdictsCount: Math.max(0, verdictsRows.length - 1),
      commercialCount: Math.max(0, commercialRows.length - 1),
      approvalsCount: Math.max(0, approvalsRows.length - 1),
      verdictsList: verdictsRows.slice(1),
      approvalsList: approvalsRows.slice(1),
    });
  } catch (error) {
    console.error("Sheets Fetch Error:", error);
    return NextResponse.json({ verdictsCount: 0, commercialCount: 0, approvalsCount: 0 }, { status: 500 });
  }
}
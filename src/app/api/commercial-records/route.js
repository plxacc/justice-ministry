import { NextResponse } from 'next/server';
import { getGoogleSheets } from '@/lib/google';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheets = await getGoogleSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'السجلات_التجارية!A:E',
    });

    const rows = res.data.values || [];

    const records = rows.slice(1).map((row) => {
      const details = row[2] || '';
      const expiryMatch = details.match(/انتهاء:\s*([\d-]+)/);

      return {
        id: row[0] || '',
        businessName: row[1] || 'غير محدد',
        details: details,
        submitter: row[3] || 'غير محدد',
        issueDate: row[4] || '',
        expiryDate: expiryMatch ? expiryMatch[1] : null,
      };
    });

    return NextResponse.json(records.reverse());
  } catch (error) {
    console.error('Fetch Records Error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
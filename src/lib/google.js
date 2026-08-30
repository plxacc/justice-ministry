import { google } from 'googleapis';

export async function getGoogleSheets() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('بيانات Google Service Account مفقودة في ملف البيئة .env');
  }

  // تنظيف المفتاح السري وإصلاح الفواصل والأسطر الجديدة
  privateKey = privateKey
    .replace(/^["']|["']$/g, '') // إزالة أي علامات تنصيص زائدة في البداية والنهاية
    .replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // نمرر كائن auth مباشرة للخدمة دون الحاجة لـ getClient()
  return google.sheets({ version: 'v4', auth });
}
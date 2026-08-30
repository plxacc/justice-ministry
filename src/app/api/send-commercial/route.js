import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getGoogleSheets } from '@/lib/google';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const businessName = formData.get('businessName') || 'غير محدد';
    const ownerName = formData.get('ownerName') || 'غير محدد';
    const nationalId = formData.get('nationalId') || '----';
    const activityType = formData.get('activityType') || 'غير محدد';
    const expiryDate = formData.get('expiryDate') || 'غير محدد';
    const signatureTitle = formData.get('signatureTitle') || 'المصادق المعتمد';

    if (!file) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفق' }, { status: 400 });
    }

    // 1. التوثيق داخل Google Sheets
    const sheets = await getGoogleSheets();
    const dateNow = new Date().toLocaleDateString('ar-SA');
    const details = `المالك: ${ownerName} | الهوية: ${nationalId} | النشاط: ${activityType} | انتهاء: ${expiryDate}`;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'السجلات_التجارية!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[Date.now().toString(), businessName, details, session.user?.name || ownerName, dateNow]],
      },
    });

    // 2. النشر والإشهار عبر Discord
    const channelId = process.env.CHANNEL_COMMERCIAL_LOG;
    const botToken = process.env.DISCORD_TOKEN;

    if (channelId && botToken) {
      const userId = session.user?.id || '';
      const userMention = userId ? `<@${userId}>` : session.user?.name || 'منسوب العدل';
      const userIdFormatted = userId ? `\`${userId}\`` : '`غير متوفر`';

      const discordFormData = new FormData();
      discordFormData.append('file', file, 'commercial_register.png');
      discordFormData.append(
        'payload_json',
        JSON.stringify({
          embeds: [
            {
              title: 'قيد وتوثيق سجل تجاري',
              description: `تم قيد المنشأة التجارية وتوثيق بياناتها رسمياً لدى قطاع السجلات التجارية.\n\n**المعتمد:** ${userMention}\n**معرف المعتمد (ID):** ${userIdFormatted}\n**صفة الاعتماد:** ${signatureTitle}`,
              color: 0x3b2a1e,
              fields: [
                { name: 'اسم المنشأة التجاري', value: businessName, inline: true },
                { name: 'اسم المالك', value: ownerName, inline: true },
                { name: 'رقم الهوية / ID', value: nationalId, inline: true },
                { name: 'نوع النشاط', value: activityType, inline: true },
                { name: 'تاريخ الإنشاء والإصدار', value: dateNow, inline: true },
                { name: 'تاريخ انتهاء الصلاحية', value: expiryDate, inline: true },
              ],
              image: { url: 'attachment://commercial_register.png' },
              timestamp: new Date().toISOString(),
              footer: { text: 'محكمة مدينة العدالة — إدارة السجلات التجارية' },
            },
          ],
        })
      );

      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bot ${botToken}` },
        body: discordFormData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Discord API Error:', errorText);
        throw new Error('تعذر إرسال السجل إلى ديسكورد');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Commercial Process Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة وحفظ السجل' }, { status: 500 });
  }
}
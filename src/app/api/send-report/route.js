import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title') || 'وثيقة قضائية معتمدة';

    if (!file) {
      return NextResponse.json({ error: 'لا يوجد ملف مرفق' }, { status: 400 });
    }

    const channelId = process.env.CHANNEL_VERDICTS_LOG;
    const botToken = process.env.DISCORD_TOKEN;

    if (!channelId || !botToken) {
      return NextResponse.json({ error: 'بيانات ديسكورد غير مكتملة في الخادم' }, { status: 500 });
    }

    const userId = session.user?.id || '';
    const userMention = userId ? `<@${userId}>` : session.user?.name || 'منسوب العدل';
    const userIdFormatted = userId ? `\`${userId}\`` : '`غير متوفر`';

    const discordFormData = new FormData();
    const fileName = file.name || 'verdict.jpg';

    discordFormData.append('file', file, fileName);
    discordFormData.append(
      'payload_json',
      JSON.stringify({
        embeds: [
          {
            title: 'صك حكم وقرار قضائي معتمد',
            description: `**مسمى الوثيقة:** ${title}\n\n**الموثق:** ${userMention}\n**معرف الحساب (ID):** ${userIdFormatted}`,
            color: 0x3b2a1e,
            image: {
              url: `attachment://${fileName}`,
            },
            timestamp: new Date().toISOString(),
            footer: {
              text: 'محكمة مدينة العدالة — الأمانة العامة',
            },
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
      throw new Error('تعذر إرسال الوثيقة إلى منصة الإشعارات');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة وإرسال الوثيقة' }, { status: 500 });
  }
}
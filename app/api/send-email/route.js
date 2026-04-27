import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { to, subject, message } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "مُناب <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <div dir="rtl" style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #1D9E75;"></div>
            <span style="font-size: 18px; font-weight: 500;">مُناب</span>
          </div>
          <div style="background: #f9f9f7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="font-size: 15px; color: #333; line-height: 1.7;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #aaa; text-align: center;">منصة النيابة للأئمة والمؤذنين ومعلمي الحلقات</p>
          <p style="font-size: 12px; color: #aaa; text-align: center;"><a href="https://munab.app" style="color: #1D9E75;">munab.app</a></p>
        </div>
      `,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
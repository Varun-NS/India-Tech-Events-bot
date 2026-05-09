import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { TechEvent } from "@/types";

export async function POST(req: Request) {
  try {
    const { email, events } = await req.json();

    if (!email || !events || events.length === 0) {
      return NextResponse.json({ error: "Email and events are required" }, { status: 400 });
    }

    // Get credentials from environment variables (assuming same format as the Node bot)
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      console.error("Email credentials not configured");
      return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = generateHtmlEmail(events);

    const mailOptions = {
      from: `"Tech Events Bot" <${user}>`,
      to: email,
      subject: `Your Selected Tech Events in India - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

function generateHtmlEmail(events: TechEvent[]) {
  let rows = events.map(event => `
    <tr>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;"><strong>${event.eventName || 'N/A'}</strong></td>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;">${event.date || 'N/A'}</td>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;">${event.city || 'N/A'}<br><small style="color: #64748b;">${event.venue || ''}</small></td>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;">
        <span style="background: #f1f5f9; color: #334155; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${event.category || 'Tech'}
        </span>
      </td>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;">${event.shortDescription || 'N/A'}</td>
      <td style="padding: 12px; border: 1px solid #e2e8f0; border-bottom: none;">
        ${event.websiteLink && event.websiteLink !== 'N/A' ? `<a href="${event.websiteLink}" style="color: #2563eb; text-decoration: none; font-weight: bold;">View Event</a>` : 'No Link'}
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; max-width: 900px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 8px;">
          India Tech Events Hub
        </h2>
        <p style="color: #64748b; margin-top: 0;">Here are your customized technology events, conferences, and meetups happening across India.</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Event</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Date</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Location</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Category</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Description</th>
            <th style="padding: 12px; border: 1px solid #e2e8f0; text-align: left; color: #475569;">Link</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8;">
          Sent securely via India Tech Events Platform
        </p>
      </div>
    </div>
  `;
}

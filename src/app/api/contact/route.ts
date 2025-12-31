// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      );
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'techclubdpsrpk@gmail.com',
      subject: `New Contact Form Submission from ${email}`,
      text: `
From: ${email}

Message:
${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000;">
          <h2 style="color: #C9A227;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${email}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #d3b51d50; border-left: 4px solid #C9A227;">
            <p style="color:white"><strong>Message:</strong></p>
            <p style="color:white">${message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
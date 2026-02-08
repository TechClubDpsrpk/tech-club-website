import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailStyles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', 'Monaco', monospace;
      background-color: #0a0a0a;
      color: #e0e0e0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0f0f0f;
      border: 2px solid #C9A227;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(201, 162, 39, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
      padding: 40px 30px;
      border-bottom: 2px solid #C9A227;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #C9A227;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      margin-bottom: 10px;
    }
    .logo-accent {
      font-size: 12px;
      color: #888;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 22px;
      color: #C9A227;
      margin-bottom: 20px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
    .text {
      line-height: 1.8;
      margin-bottom: 20px;
      color: #d0d0d0;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #C9A227;
      color: #000;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
      margin: 25px 0;
      transition: all 0.3s ease;
      border: 2px solid #C9A227;
      font-size: 13px;
    }
    .cta-button:hover {
      background-color: transparent;
      color: #C9A227;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #C9A227, transparent);
      margin: 30px 0;
    }
    .footer {
      background-color: #0a0a0a;
      padding: 20px 30px;
      border-top: 1px solid #C9A227;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
    .accent-text {
      color: #C9A227;
      font-weight: bold;
    }
    .code-block {
      background-color: #1a1a1a;
      border-left: 3px solid #C9A227;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-size: 12px;
      color: #C9A227;
    }
  </style>
`;

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Welcome to Tech Club',
      html: `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://techclubdpsrpk.vercel.app/tc-logo.png" 
                   alt="Tech Club Logo" 
                   style="max-width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <div class="logo-accent">DPS Ruby Park</div>
            </div>
            
            <div class="content">
              <div class="greeting">Greetings! ${name}</div>
              
              <p class="text">
                Welcome aboard! Your account is now ready to join the hub of innovation, science and technology.
              </p>
              
              <div class="divider"></div>
              
              <p class="text">
                You've just joined the <span class="accent-text">Tech Club of DPS Ruby Park</span> — 
                where creativity meets code and ideas transform into reality.
              </p>
              
              <p class="text">
                Here's what you can do next:
              </p>
              
              <div class="code-block">
                $ check announcements<br>
                $ explore projects<br>
                $ build something amazing
              </div>
              
              <p class="text">
                Ready to dive in? Head over to your dashboard and start exploring.
              </p>
            </div>
            
            <div class="footer">
              <p>Tech Club | DPS Ruby Park</p>
              <p style="margin-top: 8px; color: #555;">
                Questions? Reach out to us anytime.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email | Tech Club DPSRPK',
      html: `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://techclubdpsrpk.vercel.app/tc-logo.png" 
                   alt="Tech Club Logo" 
                   style="max-width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <div class="logo-accent">Security Verification</div>
            </div>
            
            <div class="content">
              <div class="greeting">Verify Your Email</div>
              
              <p class="text">
                Hi <span class="accent-text">${name}</span>,
              </p>
              
              <p class="text">
                We need to verify that this email address belongs to you. 
                Click the button below to activate your account:
              </p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="cta-button">
                  Verify Email Address
                </a>
              </div>
              
              <div class="divider"></div>
              
              <p class="text" style="font-size: 12px; color: #999;">
                <span class="accent-text">Expires in:</span> 24 hours<br>
                <span class="accent-text">Direct link:</span><br>
                <span style="word-break: break-all; font-size: 11px; color: #999;">${verificationUrl}</span>
              </p>
              
              <p class="text" style="font-size: 12px; color: #666; margin-top: 20px;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>Tech Club | DPS Ruby Park</p>
              <p style="margin-top: 8px; color: #555;">
                This is an automated message, please don't reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    throw error;
  }
}
export async function sendBanEmail(
  email: string,
  username: string,
  reason: string,
  isTemporary: boolean,
  expiryDate?: Date
) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Account Suspended | Tech Club DPSRPK',
      html: `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://techclubdpsrpk.vercel.app/tc-logo.png" 
                   alt="Tech Club Logo" 
                   style="max-width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <div class="logo-accent">Account Status Update</div>
            </div>
            
            <div class="content">
              <div class="greeting" style="color: #dc2626;">Account Suspended</div>
              
              <p class="text">
                Hello <span class="accent-text">${username}</span>,
              </p>
              
              <p class="text">
                Your Tech Club account has been <span style="color: #dc2626; font-weight: bold;">${isTemporary ? 'temporarily' : 'permanently'} suspended</span>.
              </p>
              
              <div class="code-block" style="border-left-color: #dc2626; background-color: #1a0a0a;">
                <span style="color: #dc2626;">REASON:</span> ${reason}
              </div>
              
              ${isTemporary && expiryDate ? `
                <div class="divider"></div>
                
                <p class="text">
                  <span class="accent-text">Ban Duration:</span> Until ${expiryDate.toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'short'
      })}
                </p>
                
                <p class="text">
                  You will be able to access your account after this date.
                </p>
              ` : `
                <div class="divider"></div>
                
                <p class="text" style="color: #dc2626;">
                  <strong>This is a permanent ban.</strong>
                </p>
                
                <p class="text">
                  If you believe this was done in error, please contact our support team.
                </p>
              `}
              
              <p class="text" style="margin-top: 30px; font-size: 12px; color: #999;">
                If you have any questions or concerns, feel free to reach out to us.
              </p>
            </div>
            
            <div class="footer">
              <p>Tech Club | DPS Ruby Park</p>
              <p style="margin-top: 8px; color: #555;">
                This is an automated message regarding your account status.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Ban email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send ban email:', error);
    throw error;
  }
}

export async function sendUnbanEmail(email: string, username: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Account Reinstated | Tech Club DPSRPK',
      html: `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://techclubdpsrpk.vercel.app/tc-logo.png" 
                   alt="Tech Club Logo" 
                   style="max-width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <div class="logo-accent">Account Status Update</div>
            </div>
            
            <div class="content">
              <div class="greeting" style="color: #10b981;">Account Reinstated</div>
              
              <p class="text">
                Hello <span class="accent-text">${username}</span>,
              </p>
              
              <p class="text">
                Good news! Your Tech Club account has been <span style="color: #10b981; font-weight: bold;">reinstated</span>.
              </p>
              
              <div class="divider"></div>
              
              <p class="text">
                You can now access all features and continue using our platform.
              </p>
              
              <div class="code-block" style="border-left-color: #10b981;">
                <span style="color: #10b981;">$ status: ACTIVE</span><br>
                <span style="color: #C9A227;">$ access: FULL</span>
              </div>
              
              <p class="text" style="margin-top: 25px;">
                <strong class="accent-text">Welcome back!</strong> We're glad to have you back in the Tech Club community.
              </p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="cta-button">
                  Return to Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>Tech Club | DPS Ruby Park</p>
              <p style="margin-top: 8px; color: #555;">
                Questions? Reach out to us anytime.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Unban email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send unban email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, name: string, otp: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password | Tech Club DPSRPK',
      html: `
        <!DOCTYPE html>
        <html>
        <head>${emailStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://techclubdpsrpk.vercel.app/tc-logo.png" 
                   alt="Tech Club Logo" 
                   style="max-width: 140px; height: auto; margin-bottom: 15px; display: block; margin-left: auto; margin-right: auto;">
              <div class="logo-accent">Security Request</div>
            </div>
            
            <div class="content">
              <div class="greeting">Reset Password</div>
              
              <p class="text">
                Hi <span class="accent-text">${name}</span>,
              </p>
              
              <p class="text">
                We received a request to reset your password. Use the Code below to proceed:
              </p>
              
              <div class="code-block" style="text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #C9A227;">
                ${otp}
              </div>
              
              <p class="text" style="font-size: 12px; color: #999; text-align: center;">
                This code will expire in 15 minutes.
              </p>
              
              <div class="divider"></div>
              
              <p class="text" style="font-size: 12px; color: #666; margin-top: 20px;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </div>
            
            <div class="footer">
              <p>Tech Club | DPS Ruby Park</p>
              <p style="margin-top: 8px; color: #555;">
                This is an automated message, please don't reply.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}
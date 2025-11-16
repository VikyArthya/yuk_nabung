import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create transporter using environment variables
const createTransporter = () => {
  // Use Gmail if available, otherwise fallback to Ethereal for testing
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
    console.log('Using Gmail SMTP');
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000
    });
  } else {
    console.log('Using Ethereal Email for testing');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal_pass'
      }
    });
  }
};

const transporter = createTransporter();

// Generate verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"YukNabung" <${process.env.GMAIL_EMAIL || 'noreply@yuknabung.com'}>`,
      to: email,
      subject: 'Verifikasi Email Anda - YukNabung',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Email - YukNabung</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              border: 3px solid #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #000;
            }
            .logo {
              font-size: 32px;
              font-weight: 900;
              color: #000;
              margin-bottom: 10px;
            }
            .title {
              font-size: 24px;
              font-weight: 700;
              color: #000;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #000;
              color: #fff;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: 700;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              border: 3px solid #000;
              transition: all 0.2s ease;
            }
            .button:hover {
              background-color: #333;
              transform: translateY(-2px);
              box-shadow: 4px 4px 0px #000;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              text-align: center;
              font-size: 14px;
              color: #666;
            }
            .warning {
              background-color: #fff3cd;
              border: 2px solid #000;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .code {
              font-family: 'Courier New', monospace;
              background-color: #f8f9fa;
              border: 2px solid #000;
              padding: 10px;
              border-radius: 5px;
              font-weight: bold;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💰 YukNabung</div>
              <h1 class="title">Verifikasi Email Anda</h1>
            </div>

            <div class="content">
              <p>Halo <strong>${name}</strong>,</p>
              <p>Terima kasih telah mendaftar di YukNabung! Untuk mengaktifkan akun Anda dan mulai mengelola keuangan dengan lebih baik, silakan verifikasi email Anda.</p>

              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                  Verifikasi Email Sekarang
                </a>
              </div>

              <p>Atau salin dan tempel link berikut ke browser Anda:</p>
              <div class="code">${verificationUrl}</div>

              <div class="warning">
                <p><strong>⚠️ Penting:</strong></p>
                <ul>
                  <li>Link verifikasi ini akan kadaluarsa dalam 24 jam</li>
                  <li>Jika Anda tidak mendaftar di YukNabung, abaikan email ini</li>
                  <li>Jangan bagikan link verifikasi ini dengan orang lain</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p>Terima kasih telah memilih YukNabung untuk mengelola keuangan Anda! 🚀</p>
              <p>Jika Anda mengalami masalah, silakan hubungi kami.</p>
              <p><small>Email ini dikirim otomatis, jangan balas email ini.</small></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error sending verification email:', errorMessage);

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔗 DEVELOPMENT MODE - Email verification link:');
      console.log(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`);
      console.log('💡 Copy this link and paste in your browser to test email verification\n');
    }

    return false;
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, html) => {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 MOCK EMAIL SENT:');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', html);
        console.log('⚠️  Email configuration not set up. This is a mock email for development.');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or your email provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // For Gmail, use an App Password
            },
        });

        const mailOptions = {
            from: `Docu-Signer <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully to ${to}`);
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw error;
    }
};

export default sendEmail; 
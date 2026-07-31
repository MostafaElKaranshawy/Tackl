import nodemailer from 'nodemailer';

export default class EmailService {
    static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    static sendEmail = async (to: string, subject: string, text: string) => {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject,
            text,
        };

        try {
            await EmailService.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Error sending email to ${to}:`, error);
            throw error;
        }
    }

}
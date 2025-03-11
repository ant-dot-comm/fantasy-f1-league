import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,  // Your email
            pass: process.env.EMAIL_PASS,  // Your email password or app password
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email error:", error);
    }
};
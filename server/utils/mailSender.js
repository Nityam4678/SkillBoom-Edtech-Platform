const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
         if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error(
                "Email is not configured: set MAIL_HOST, MAIL_USER, and MAIL_PASS in server .env"
            );
         }
         let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
                port: 465,
                secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
            });


            let info = await transporter.sendMail({
                from: 'StudyNotion || CodeHelp - by Babbar',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            return info;
    }
    catch(error) {
        console.error("mailSender error:", error.message);
        throw error;
    }
}


module.exports = mailSender;
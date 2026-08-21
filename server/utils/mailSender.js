const { Resend } = require("resend")

const getResend = () => {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("Email is not configured: set RESEND_API_KEY in server .env")
    }
    return new Resend(process.env.RESEND_API_KEY)
}

const mailSender = async (email, title, body) => {
    try {
        console.log("Email request started", { subject: title })
        if (!process.env.EMAIL_FROM) {
            throw new Error("Email is not configured: set EMAIL_FROM in server .env")
        }

        console.log("Resend request attempted", { from: process.env.EMAIL_FROM, subject: title })
        const { data, error } = await getResend().emails.send({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: title,
            html: body,
        })

        if (error) {
            const resendError = new Error(error.message || "Resend rejected the email")
            resendError.statusCode = error.statusCode
            throw resendError
        }

        console.log("Resend request succeeded", { subject: title })
        return data
    } catch (error) {
        console.error("Resend request failed", {
            subject: title,
            statusCode: error.statusCode,
            message: error.message,
        })
        throw error
    }
}


module.exports = mailSender;
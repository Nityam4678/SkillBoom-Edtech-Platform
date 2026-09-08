const https = require("https")

function sendEmail({ to, subject, text }) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
    })

    const request = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = ""
        response.setEncoding("utf8")
        response.on("data", (chunk) => {
          body += chunk
        })
        response.on("end", () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve()
            return
          }
          reject(new Error(`Email provider returned status ${response.statusCode}`))
        })
      }
    )

    request.on("error", reject)
    request.write(payload)
    request.end()
  })
}

module.exports = { sendEmail }

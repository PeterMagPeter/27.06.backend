"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const nodemailer_1 = require("nodemailer");
function sendVerificationEmail(userId, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const mailSender = process.env.MAIL_USER;
        const passSender = process.env.MAIL_PASS;
        const backendIp = process.env.BACKEND_API_SERVER_URL;
        const verificationPath = process.env.VERIFICATION_PATH;
        let activationServiceLink = "";
        if (mailSender && passSender && backendIp && verificationPath) {
            activationServiceLink = backendIp + verificationPath;
        }
        else {
            throw new Error("Couldn't read .env (sendVerificationMail)");
        }
        const transporter = (0, nodemailer_1.createTransport)({
            service: 'gmail',
            auth: {
                user: mailSender,
                pass: passSender
            }
        });
        const mailOptions = {
            from: mailSender,
            to: email,
            subject: "Verify your e-mail",
            html: `<!DOCTYPE html>
         <html lang="en">
         <head>
          <meta charset="UTF-8">
          <title>Email Example</title>
         </head>
         <body>
          <h1>Email Subject</h1>
          <p>Verify your email address to html complete the signup and login into your account.</p>
          <p>This link <b>expires within 24h</b> Click <a href=${activationServiceLink + userId.toString()}>here</a> to proceed</p>
         </body>
        </html>`
        };
        yield transporter.sendMail(mailOptions)
            .then(() => console.log("We sent your mail"))
            .catch(e => {
            console.error(e);
        });
    });
}
// Send verification mail
// export async function sendVerificationEmail(userId: ObjectId, userEmail: string) {
//   const mailSender = process.env.MAIL_USER;
//   const passSender = process.env.MAIL_PASS;
//   const backendIp = process.env.BACKEND_API_SERVER_URL;
//   const verificationPath = process.env.VERIFICATION_PATH;
//   let activationServiceLink: string = "";
//   if (mailSender && passSender && backendIp && verificationPath) {
//     activationServiceLink = backendIp + verificationPath;
//   } else {
//     throw new Error("Couldn't read .env")
//   }
//   // Config of nodemailer [This code part has been generated by AI]
//   const transporter = createTransport({
//     host: 'smtp.ionos.com',
//     port: 587,
//     secure: false,
//     requireTLS: true,
//     auth: {
//       user: mailSender,
//       pass: passSender,
//     },
//     logger: true,
//   } as unknown as TransportOptions);
//   try {
//       // toHexString() seems to be needed to create usable characters for our link
//   let info = await transporter.sendMail({
//     from: mailSender,
//     to: "f.flaherty@gmx.de",
//     subject: "Verify your e-mail",
//     html:
//       `<!DOCTYPE html>
//          <html lang="en">
//          <head>
//           <meta charset="UTF-8">
//           <title>Email Example</title>
//          </head>
//          <body>
//           <h1>Email Subject</h1>
//           <p>Verify your email address to html complete the signup and login into your account.</p>
//           <p>This link <b>expires within 24h</b> Click <a href=${activationServiceLink + userId.toHexString()}>here</a> to proceed</p>
//          </body>
//         </html>` ,
//     headers: { 'x-cloudmta-class': 'standard' }
//   })
//   console.log("Message sent: ");
//   } catch (error) {
//     console.error(error);
//   }
// }
//# sourceMappingURL=MailService.js.map
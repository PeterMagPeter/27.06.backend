import { configDotenv } from 'dotenv';
configDotenv()
import { ObjectId } from 'mongodb';
import { createTransport } from 'nodemailer';

const passSender = process.env.MAIL_PASS;
const mailSender = process.env.MAIL_USER;
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: mailSender,
    pass: passSender
  }
});
export async function sendVerificationEmail(userId: ObjectId, email: string) {
  const backendIp = process.env.BACKEND_API_SERVER_URL;
  const verificationPath = process.env.VERIFICATION_PATH;
  let activationServiceLink: string = "";

  if (mailSender && passSender && backendIp && verificationPath) {
    activationServiceLink = backendIp + verificationPath;
  } else {
    throw new Error("Couldn't read .env (sendVerificationMail)")
  }

  const mailOptions = {
    from: mailSender,
    to: email,
    subject: "Verify your e-mail",
    html:
      `<!DOCTYPE html>
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
  await transporter.sendMail(mailOptions)
    .then(() => console.log("We sent your mail"))
    .catch(e => {
      console.error(e);
    })
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
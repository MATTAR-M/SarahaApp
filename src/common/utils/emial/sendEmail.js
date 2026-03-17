import nodemailer from "nodemailer"
import { EMAIL, PASS } from "../../../../config/config.service.js";


export const sendEmail = async(
    {to,subject,from,attachments}
)=>{

const transporter = nodemailer.createTransport({
    service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
    auth: {
        user:EMAIL,
        pass:PASS
    },
  });

const info =await transporter.sendEmail( {
    to: "receiver@example.com",
    subject: "Hello World",
    from: `matar ${EMAIL}`,
    html: html||"<p>This is the <strong>HTML version</strong> of the email.</p>",
    attachments:attachments||[]
  });
  return info.accepted.length>0? true:false;
}

export const generateOtp = async()=>{
    return Math.floor(Math.random()*900000+100000)
}
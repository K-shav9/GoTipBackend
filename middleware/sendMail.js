import fs from "fs"
var nodemailer = require("nodemailer");
const config = require("../config/config");
const configvalue = config.get(process.env.Node_env);
const email = configvalue["EMAIL"]


export const SendEmail = (from, to, subject, html) => {
  var transporter = nodemailer.createTransport( {
    host: 'email-smtp.eu-north-1.amazonaws.com',
    port: 465,
    secure: true,
    auth: {
      user: 'AKIA6GBMAZXXQV4WHJUK',
      pass: 'BEirUVFTp4Vktzhuquv31bbYuN34IulGBfFUsFJe5qyL'
    }
  }
);
  



 

  //  SES: {
  //     accessKeyId: 'AKIA6GBMAZXXQV4WHJUK',
  //     secretAccessKey: 'BEirUVFTp4Vktzhuquv31bbYuN34IulGBfFUsFJe5qyL',
  //     region: 'eu-north-1'
  //   }

  let finalTemp =  fs.readFileSync('middleware/template.html', 'utf-8').replace("Template-Body" , html)
 
  var mailOptions = {
    from: 'notification@gotipme.com',
    to: to,
    subject: subject,
    html: finalTemp ,
    attachments:[{
      path: "https://gotipme.com/api/public/posts/logo.png",
      cid: 'logo'
    }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
      return 
      
    } else {
      console.log("Email sent: " + info.response);

      return false;
    }
  });
};
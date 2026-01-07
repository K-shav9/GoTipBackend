import jwt from "jsonwebtoken";
const config = require("../config/config");
const configvalue = config.get(process.env.Node_env);
import axios from "axios";
const otpGenerator = require('otp-generator')
var CryptoJS = require("crypto-js");
// Middleware to check the data from token or decode the token
export const verifyToken = async (req, res, next) => {
    const token = req.header("authorization");
    var jwtSecretKey = "tipping-project";
    if (!token) return res.status(401).json({ message: "Auth Error" });
    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      req.user = decoded;
      next();
    } catch (e) {
      console.log(e);
      if (e.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token Expired" });
      }
      return res.status(500).send({ message: "Invalid Token" });
    }
  };
  export const generatePaypalToken = async (callback) => {
    try{
      const data = new URLSearchParams();
      data.append('grant_type', 'client_credentials');
      const basicAuth = configvalue.PayPalBuffer;
      const headers = {
        'Authorization': `Basic ${basicAuth}`,
        "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
        'Content-Type': 'application/x-www-form-urlencoded',
        'scope': 'https://uri.paypal.com/services/customer/partner'
      };
        await axios.post(`${configvalue.PaypalUrl}/v1/oauth2/token`, data, { headers: headers }).then(val=>{
          callback(val.data)
          // console.log("asasd" ,val.data)
        }).catch(err =>{
          console.log("Paypal Err" )
          return false
          
        })
  
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
  }
  };


  export async function generateOtp() {
    try {
        return new Promise(resolve => {
            const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
            resolve(otp);
        });
    } catch (error) {
        console.log("Catch in generateOtp==", error);
    }
    
};
export async function encryptPassword(password) {
  try {
      var iv = CryptoJS.enc.Hex.parse("");
      const key = CryptoJS.enc.Hex.parse("SadLife2024");
      var encryptedPassword = CryptoJS.AES.encrypt(password, key, { iv: iv }).toString();
      return encryptedPassword;
  } catch (error) {
      console.log("Catch in encryptPassword==", error);
  }
};
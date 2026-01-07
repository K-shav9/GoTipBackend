import User from "../model/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const { OAuth2Client } = require("google-auth-library");
import { SendEmail } from "../middleware/sendMail";
import {
  responseCodes,
  messageID,
  messages,
  emailText,
  htmlEmailVerify,
  roleInInteger,
  forgetPasswordSub,
  htmlForgetPassword,
} from "../constant";
import { createCustomer } from "./Payment";
import axios from "axios";
import Tip from "../model/Tip";
import StaffRequest from "../model/StaffRequest";
import {
  encryptPassword,
  generateOtp,
  generatePaypalToken,
} from "../middleware/Authorization.js";
import Posts from "../model/Post.js";
import { parseJwt } from "../middleware/verifyToken.js";
import qs from "qs";
const config = require("../config/config.js").get(process.env.Node_env);
//twillio
const client = require("twilio")(
  config["twilioAccountSid"],
  config["twilioAuthToken"]
);
const stripe = require("stripe")(
  config["stripeSecretKey"]
);
// const trustap_key = config["trustap_key"];
const trustap_app = config["trust_app"];
const { gbp, eur } = trustap_app;
// const clientId = config["Client_id"];
// const trustapRedirectUri = config["trustap_redirect_URI"];
const trustapScope = config["trustap_scope"];
const code = config["trustap_response_type"];
const realm = config["realm"];
const SSOURl = config["trustap_SSO_URL"];
// const clientSecret = config["client_secret"];
const profile_setting_uri = config["profile_setting_redirect_URI"];
const dev_path = config["dev_path"];

const { secret } = config;
const trustap = axios.create({
  baseURL: `${dev_path}/api/v1`,
  headers: {
    Authorization: `Basic `, // Add API key in header
    "Content-Type": "application/json",
  },
});

export const get_secret_keys = (country) => {
  let authorized_key;
  let clientId;
  let clientSecret;
  if (country === "Ireland") {
    authorized_key = eur.trustap_key;
    clientId = eur.Client_id;
    clientSecret = eur.client_secret;
  } else if (country === "United Kingdom") {
    authorized_key = gbp.trustap_key;
    clientId = gbp.Client_id;
    clientSecret = gbp.client_secret;
  }
  return {
    authorized_key,
    clientId,
    clientSecret,
  };
};

export const userSignup = async (req, res) => {
  try {
    // req.body.countryCode = "uk";

    const newDate = new Date();
    const {
      full_name,
      restaurant_name,
      email,
      password,
      contact_number,
      restaurantContact_number,
      social_media,
      role,
      countryCode,
      status,
      user_name,
      requestCode,
      country,
    } = req.body;

    // let authorized_key;
    // let clientId;
    // let clientSecret;

    const salt = await bcrypt.genSalt(10);
    const isexist = await User.findOne({ email: email });
    if (isexist) {
      return res.status(messageID.emailExist).json({
        status: responseCodes.successStatus,
        messageID: messageID.emailExist,
        message: messages.emailExist,
      });
    } else {
      let newPassword = "";
      if (password) {
        newPassword = await bcrypt.hash(password, salt);
      }
      let emailOTPForTemp;
      await generateOtp()
        .then((data) => {
          emailOTPForTemp = data;
        })
        .catch((error) => {
          console.log("generateOtp error:", error);
          return;
        });

      const splitName = (fullName) => {
        const nameParts = fullName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        return { firstName, lastName };
      };

      const { firstName, lastName } = splitName(full_name);

      const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
      const timestamp = getUnixTimestamp();

      let newObj = {
        email: email,
        first_name: firstName,
        last_name: lastName || firstName,
        country_code: countryCode,
        tos_acceptance: { unix_timestamp: timestamp, ip: "127.0.0.1" },
      };

      let gatewayPlatFormUserId = null;
      const setPlatformId = (id) => {
        gatewayPlatFormUserId = id;
      };

      if (role !== 2 && role !== 3) {
        const { authorized_key } = get_secret_keys(country);

        // console.log("Authorized Key:", authorized_key);
        // console.log("Client ID:", clientId);
        // console.log("Client Secret:", clientSecret);
        const response = await axios.post(
          `${dev_path}/api/v1/guest_users`,
          newObj,
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Basic ` + trustap_key,
              Authorization: `Basic ` + authorized_key,
            },
          }
        );
        setPlatformId(response?.data?.id);
      }

      let user = new User({
        full_name: full_name,
        restaurant_name: restaurant_name,
        contact_number: contact_number,
        countryCode: countryCode,
        restaurantContact_number: restaurantContact_number,
        email: email,
        role: role,
        password: newPassword,
        social_media: social_media,
        created_date: newDate,
        status: status,
        user_name: user_name,
        verifyStatus: 0,
        requestCode: requestCode,
        emailOTP: await bcrypt.hash(emailOTPForTemp, salt),
        trustap_user_id: gatewayPlatFormUserId,
        country: country,
      });

      let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Verify your Account</h2>
  <p>Hi, ${user.full_name}</p>
  <p>Please find below the One Time Password (OTP) to activate your account.</p>
  <p>OTP ${emailOTPForTemp}</p>
  <p>Best regards,</p>
  <p>GoTipMe</p>
</div>`;

      SendEmail("info@gotipme.com", user.email, "Verify your Account", text);
      let register = await user.save();
      //  0 = admin, 1 = customer , 2 = bar/Resturant ,3=staff

      if (register.role == 1) {
        createCustomer(register.email);
      }
      if (register) {
      }
      let payload = {
        _id: register._id,
        role: register.role,
        full_name: register.full_name,
      };
      let token = jwt.sign(payload, secret.jwt, { expiresIn: "24h" });
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.createAccount,
        Token: token,
        role: role,
        result: user,
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    await User.updateOne({ email: email }, { $set: { verifyStatus: 1 } });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.NotFound,
      });
    }

    const isValid = bcrypt.compareSync(otp, user.emailOTP);
    if (isValid) {
      let payload = {};
      payload._id = user._id;

      let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Thank you for your Registration</h2>  
  <p>Hi, ${user.full_name}</p>
  <p>Thank you for registering with our service. We are excited to have you on board!</p>
  <p>Best regards,</p>
  <p>GoTipMe</p>
</div> `;
      SendEmail(
        "info@gotipme.com",
        user.email,
        "Thank you for your Registration",
        text
      );
      jwt.sign(payload, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: user.role,
          result: user,
        });
      });
    } else {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.WrongCredet,
      });
    }
  } catch (err) {
    console.log("sfdsdfsd", err);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.WrongCredet,
    });
  }
};
export const resendOtp = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const { email } = req.body;

    let emailOTPForTemp;
    await generateOtp()
      .then((data) => {
        emailOTPForTemp = data;
      })
      .catch((error) => {
        console.log("generateOtp error:", error);
        return;
      });
    await User.updateOne(
      { email: email },
      { $set: { emailOTP: await bcrypt.hash(emailOTPForTemp, salt) } }
    );
    let user = await User.findOne({ email: email });
    let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Verify your Account</h2>  
  <p>Hi, ${user.full_name}</p>
  <p>Please find below the One Time Password (OTP) to activate your account.</p>
  <p>OTP ${emailOTPForTemp}</p>
  <p>Best regards,</p>
  <p>GoTipMe</p>
</div>`;
    SendEmail("info@gotipme.com", user.email, "Verify your Account", text);
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: messages.createAccount,
    });
  } catch (error) {
    console.log("error", error);
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

// Signin
export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    // Check if user is exist or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.NotFound,
      });
    }

    if (user.verifyStatus == 0) {
      let emailOTPForTemp;
      await generateOtp()
        .then((data) => {
          emailOTPForTemp = data;
        })
        .catch((error) => {
          console.log("generateOtp error:", error);
          return;
        });
      await User.updateOne(
        { email: email },
        { $set: { emailOTP: await bcrypt.hash(emailOTPForTemp, salt) } }
      );
      let user = await User.findOne({ email: email });
      let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Verify your Account</h2>  
  <p>Hi, ${user.full_name}</p>
  <p>Please find below the One Time Password (OTP) to activate your account.</p>
  <p>OTP ${emailOTPForTemp}</p>
  <p>Best regards,</p>
  <p>GoTipMe</p>
</div>`;
      SendEmail("info@gotipme.com", user.email, "Verify your Account", text);

      SendEmail(
        "info@gotipme.com",
        user.email,
        "Thank you for your Registration",
        text
      );
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (isValid) {
      let payload = {};
      payload._id = user._id;

      jwt.sign(payload, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: user.role,
          result: user,
        });
      });
    } else {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.WrongCredet,
      });
    }
  } catch (err) {
    console.log("asdasf", err);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.WrongCredet,
    });
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const post = req.body;
    const email = post.userData.email;
    const name = post.userData.name; // Check if user is exist or not
    const newDate = new Date();
    const userData = await User.findOne({ email });
    if (!post.userType && !userData) {
      return res.send({
        status: "failure",
        message: messages.emailNotExist,
      });
    }
    if (!userData) {
      // User is logging in for the first time using Google social login
      // Save the user's profile data in the database

      let user = new User({
        full_name: name,
        email: email,
        role: post.userType === "pubgoer" ? 1 : 3,
        created_date: newDate,
        socialStatus: 1,
        socialType: "google",
      });

      let register = await user.save();
      await createCustomer(register.email);

      let payload1 = {};
      payload1._id = register._id;
      jwt.sign(payload1, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: user.role,
          result: user,
        });
      });
    }
    if (
      userData &&
      userData.socialStatus == true &&
      userData.socialType == "google"
    ) {
      if (userData.role == "3" && post.userType === "pubgoer") {
        return res.send({
          status: "failure",
          message: "This Email is Already Exists as Bartender",
        });
      } else if (userData.role == "1" && post.userType === "bartender") {
        return res.send({
          status: "failure",
          message: "This Email is Already Exists as Pubgoer",
        });
      }

      let payload2 = {};
      payload2._id = userData._id;
      jwt.sign(payload2, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: userData.role,
          result: userData,
        });
      });
    } else if (userData) {
      //Send can not login with this email as email already exists
      res.send({
        status: "failure",
        message: messages.emailExist,
      });
    }
  } catch (err) {
    console.log("err---------------", err);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.WrongCredet,
    });
  }
};

//facebook login
export const facebookLogin = async (req, res, next) => {
  try {
    const newDate = new Date();
    const post = req.body;
    const name = post?.userData?.name;
    const email = post.userData.email;
    const userData = await User.findOne({ email });

    if (!post.userType && !userData) {
      return res.send({
        status: "failure",
        message: messages.emailNotExist,
      });
    }

    if (!userData) {
      // User is logging in for the first time using Facebook social login
      // Save the user's profile data in the database
      let user = new User({
        full_name: name,
        email: email,
        role: post.userType === "pubgoer" ? 1 : 3,
        created_date: newDate,
        socialStatus: 1,
        socialType: "facebook",
      });

      let register = await user.save();
      await createCustomer(register.email);

      let payload1 = {};
      payload1._id = register._id;
      jwt.sign(payload1, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: user.role,
          result: user,
        });
      });
    } else if (
      userData &&
      userData.socialStatus &&
      userData.socialType === "facebook"
    ) {
      if (userData.role == "3" && post.userType === "pubgoer") {
        return res.send({
          status: "failure",
          message: "This Email is Already Exists as Bartender",
        });
      } else if (userData.role == "1" && post.userType === "bartender") {
        return res.send({
          status: "failure",
          message: "This Email is Already Exists as PubGoer",
        });
      }
      // User already exists and logged in with Facebook
      let payload2 = {};
      payload2._id = userData._id;
      jwt.sign(payload2, secret.jwt, { expiresIn: "24h" }, (err, token) => {
        res.send({
          status: true,
          message: "Successfully Login",
          Token: token,
          role: userData.role,
          result: userData,
        });
      });
    } else {
      // User with the same email exists, but not logged in with Facebook
      res.send({
        status: "failure",
        message: messages.emailExist,
      });
    }
  } catch (err) {
    console.log("err---------------", err);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.WrongCredet,
    });
  }
};

export const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(messageID.failureCode).json({
        status: responseCodes.failedStatus,
        responseCode: messageID.failureCode,
        message: messages.userNotFound,
      });
    }
    // let saveOtp = await User.findByIdAndUpdate(user._id, { $set: { otp: otp } }, { new: true });

    let token = await jwt.sign({ _id: user._id }, process.env.TOKEN_KEY, {
      expiresIn: "90d",
    });
    let html = htmlForgetPassword(token, roleInInteger(user.role));
    let subject = forgetPasswordSub.subjectEmail;

    SendEmail("amitrai8489@gmail.com", email, subject, html);
    if (token) {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.EmailSend,
        token: token,
      });
    }
  } catch (error) {
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      responseCode: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

// reset-Password
export const resetpassword = async (req, res) => {
  const { password, confirm_password } = req.body;
  // const decode = jwt.verify(token, "SMARTDATA");

  // let _id = decode._id;
  try {
    if (password === confirm_password) {
      const newPassword = bcrypt.hashSync(password, 8);
      const result = await User.updateOne(
        { _id: req.user._id },
        { $set: { password: newPassword } }
      );
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.passwordChangeSuccess,
      });
    } else {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.PasswordNotMatched,
      });
    }
  } catch (e) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const getDetailsById = async (req, res) => {
  // console.log("data----------------", trustap_app);
  // console.log("gbp-------------", gbp);
  // console.log("eur----------------", eur);

  try {
    let data = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.query._id) } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "user_id",
          as: "posts",
        },
      },

      {
        $lookup: {
          from: "comments",
          localField: "posts._id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.user_id",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.replies.user_id",
          foreignField: "_id",
          as: "replyUsers",
        },
      },
      {
        $addFields: {
          posts: {
            $map: {
              input: "$posts",
              as: "post",
              in: {
                $mergeObjects: [
                  "$$post",
                  {
                    comments: {
                      $map: {
                        input: {
                          $filter: {
                            input: "$comments",
                            as: "comment",
                            cond: { $eq: ["$$comment.post_id", "$$post._id"] },
                          },
                        },
                        as: "comment",
                        in: {
                          $mergeObjects: [
                            "$$comment",
                            {
                              user: {
                                $filter: {
                                  input: "$users",
                                  as: "user",
                                  cond: {
                                    $eq: ["$$user._id", "$$comment.user_id"],
                                  },
                                },
                              },
                              replies: {
                                $map: {
                                  input: "$$comment.replies",
                                  as: "reply",
                                  in: {
                                    $mergeObjects: [
                                      "$$reply",
                                      {
                                        user: {
                                          $filter: {
                                            input: "$replyUsers",
                                            as: "replyUser",
                                            cond: {
                                              $eq: [
                                                "$$replyUser._id",
                                                "$$reply.user_id",
                                              ],
                                            },
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $project: { comments: 0 } },
    ]);
    res.send({ status: true, message: "User data found", result: data });
  } catch (e) {
    console.log("asdasd", e.message);

    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    let payload = {};
    if (req.body.full_name || req.body.full_name === "") {
      payload.full_name = req.body.full_name;
    }
    if (req.body.restaurant_name || req.body.restaurant_name === "") {
      payload.restaurant_name = req.body.restaurant_name;
    }
    if (req.body.contact_number || req.body.contact_number !== "") {
      payload.contact_number = Number(req.body.contact_number);
    }
    if (
      req.body.restaurantContact_number ||
      req.body.restaurantContact_number === ""
    ) {
      payload.restaurantContact_number = req.body.restaurantContact_number;
    }
    if (req.body.countryCode || req.body.countryCode === "") {
      payload.countryCode = req.body.countryCode;
    }

    if (req.body.addressLine1 || req.body.addressLine1 === "") {
      payload.addressLine1 = req.body.addressLine1;
    }
    if (req.body.lat != "undefined" && (req.body.lat || req.body.lat === "")) {
      payload.lat = req.body.lat;
    }
    if (req.body.lng != "undefined" && (req.body.lng || req.body.lng === "")) {
      payload.lng = req.body.lng;
    }
    if (req.body.addressLine2 || req.body.addressLine2 === "") {
      payload.addressLine2 = req.body.addressLine2;
    }
    if (req.body.restaurant_email || req.body.restaurant_email === "") {
      payload.restaurant_email = req.body.restaurant_email;
    }
    if (req.body.postcode || req.body.postcode === "") {
      payload.postcode = req.body.postcode;
    }
    if (req.body.requestCode || req.body.requestCode === "") {
      payload.requestCode = req.body.requestCode;
    }
    if (req.body.is_updated || req.body.is_updated === "") {
      payload.is_updated = req.body.is_updated;
    }
    if (req.body.city || req.body.city === "") {
      payload.city = req.body.city;
    }
    if (req.body.multipleImages || req.body.file === "") {
      payload.multipleImages = req.body.multipleImages;
    }
    if (req.file || req.file === "") {
      payload.image = req.file.filename;
    }

    // if (req.file || req.file === "") {
    //   payload.image = req.file.filename;
    // }
    // console.log("getImagesforMultiple",payload)
    let _id = "";
    if (req.body._id) {
      _id = req.body._id;
    } else {
      _id = req._id;
    }

    const fetchUser = await User.find({
      _id: { $nin: mongoose.Types.ObjectId(_id) },
      requestCode: req.body.requestCode,
    });

    if (fetchUser.length > 0) {
      return res.status(messageID.successCode).json({
        status: responseCodes.failedStatus,
        messageID: messageID.successCode,
        message: messages.requestCodeUnique,
      });
    }
    // console.log("......payload", payload);
    try {
      const result = await User.findByIdAndUpdate(
        _id,
        { $set: payload },
        { new: true }
      );
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: "find&Update",
        data: result,
      });
    } catch (error) {
      console.log("fdsbfdsbfbsdhfjsdfgsjdhgfhsdgf Error:");
    }
  } catch (error) {
    console.log("Error2:", error.message);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const StaffRestoList = async (req, res) => {
  try {
    const userlist = await User.paginate(
      {
        $and: [
          {
            restaurant_name: {
              $regex: req.query.restaurant_name
                ? req.query.restaurant_name
                : "",
              $options: "i",
            },
          },
          { role: 2 },
          { is_updated: 1 },
        ],
      },
      {
        page: req.query.page,
        limit: req.query.limit,
      }
    );
    res.send({ status: 200, message: "Fetched all data ", result: userlist });
  } catch (e) {
    throw e;
  }
};

// search User
export const searchuser = async (req, res, next) => {
  try {
    const userdata = await User.find({
      role: req.body.role,
      name: { $regex: req.body.name, $options: "i" },
    });
    res.send({
      status: true,
      message: "Result getting Successfully",
      result: userdata,
    });
  } catch (err) {
    next(err);
  }
};

/*--------------Delete Users --------------*/
export const DeleteUser = async (req, res) => {
  try {
    let _id = req.params.id;

    const result = await User.deleteOne({
      _id: mongoose.Types.ObjectId(_id),
    });

    if (result) {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.UserDelete,
        data: result,
      });
    }
  } catch (err) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

/*---------------Block Unblock --------------*/
export const blockAndUnblock = async (req, res) => {
  try {
    const id = req.body._id;
    let updateStatus = await User.findOneAndUpdate(
      { _id: id },
      { $set: { isBlocked: req.body.status } },
      { new: true }
    );
    if (updateStatus) {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.statusUpdate,
        data: updateStatus,
      });
    }
  } catch (err) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    let jsondata = {};
    if (req.body.password) {
      jsondata.password = bcrypt.hashSync(req.body.password, 8);
    }

    User.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true },
      (err, result) => {
        if (err) {
          return res.status(messageID.internalServerError).json({
            status: responseCodes.failedStatus,
            messageID: messageID.internalServerError,
            message: messages.internalServerError,
          });
        } else {
          res.status(messageID.successCode).json({
            status: responseCodes.successStatus,
            messageID: messageID.successCode,
            message: messages.ChangePassword,
            result: result,
          });
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

export const Count = async (req, res) => {
  try {
    // const count_data = [];
    const user_count = await User.find({ role: req.body.role }).count();

    res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: messages.count,
      result: user_count,
    });
  } catch (err) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

// send otp on phone Number
export const Sendotp = async (req, res) => {
  let _id = req.user._id;
  let payload = {};
  const otp = Math.floor(Math.random() * (999999 - 1) + 1);
  payload.otp = otp;
  let userData = await User.findOne({ _id: _id });
  // let text = `hi ${userData.email} <br> your OTP is: ${otp}.<br>Use it to update your profile`;
  let text = `

      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Update Your Profile</h2>  
  <p>Hi, ${userData.email}</p>
  <p>your OTP is: ${otp}.</p>
  <p>Use it to update your profile</p>
  <p>GoTipMe</p>
</div>
      
    `;
  let mailData = SendEmail(
    "info@gotipme.com",
    userData.email,
    "update otp for profile",
    text
  );

  const result = await User.findByIdAndUpdate(
    _id,
    { $set: payload },
    { new: true }
  );

  return res.status(messageID.successCode).json({
    status: responseCodes.successStatus,
    messageID: messageID.successCode,
    message: messages.Otpsend,
  });
};

// Verify otp

export const VerifyOtp = async (req, res) => {
  try {
    let verified = false;
    let getOtp = await User.findOne({ phone: req.body.phone });

    // const otpnull=await User.findOneAndUpdate({otp:req.body.otp}), {$set:{otp:null}},
    if (getOtp.otp === req.body.otp) {
      verified = true;

      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: messages.OtpVerify,
      });
    } else {
      return res.status(messageID.badRequest).json({
        status: responseCodes.failedStatus,
        messageID: messageID.badRequest,
        message: messages.OtpNotmatch,
      });
    }
  } catch (err) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const Follow = async (req, res) => {
  try {
    // Get the user to follow from the request body
    const userToFollow = await User.findById(req.body.user_id);

    // Check if the user to follow exists
    if (!userToFollow) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }
    // Check if the user is already following the user to follow
    const isFollowing = req.user.following.includes(userToFollow._id);
    if (isFollowing) {
      return res.status(400).json({
        status: "failed",
        message: "You are already following this user",
      });
    }

    // Follow the user
    req.user.following.push(userToFollow._id);
    await req.user.save();

    // Return success response
    return res.status(200).json({
      status: "success",
      message: "Successfully followed user",
    });
  } catch (err) {
    // Return error response
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    let jsondata = {
      full_name: req.body.full_name,
      contact_number: req.body.contact_number,
      user_name: req.body.user_name,
      email: req.body.email,
      countryCode: req.body.countryCode,
      // card_details: {
      //   card_holder_name: req.body.card_holder_name,
      //   card_number: req.body.card_number,
      //   card_expiring_date: req.body.card_expiring_date,
      //   card_cvv: req.body.card_cvv,
      // },
      status: req.body.status,
      bio: req.body.bio,
    };
    // if (req.file.filename) {
    //   jsondata.profile = req.file.filename;
    // } else {
    // }
    if (req.file || req.file === "") {
      jsondata.profile = req.file.filename;
    }
    let _id = "";
    if (req.body._id) _id = req.body._id;
    else _id = req._id;
    let userData = await User.findOne({ _id: _id });
    //changes====>
    // if (req.body.otp == userData.otp) {
    User.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true },
      (err, result) => {
        if (err) {
          return res.status(messageID.successCode).json({
            status: responseCodes.successStatus,
            messageID: messageID.successCode,
            message: messages.OtpVerify,
          });
        } else {
          return res.status(messageID.successCode).json({
            status: responseCodes.successStatus,
            messageID: messageID.successCode,
            message: messages.caregiverUpdate,
            data: result,
          });
        }
      }
    );
    // } else {
    //   return res.status(messageID.badRequest).json({
    //     status: responseCodes.failedStatus,
    //     messageID: messageID.badRequest,
    //     message: messages.OtpNotmatch,
    //   });
    // }
  } catch (error) {
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const filterDashboardData = async (req, res) => {
  try {
    const { staff_id, resto_id, sort, days } = req.query;
    var query = {
      $or: [
        { "group_staff.group_staff_id": mongoose.Types.ObjectId(staff_id) },
        { "staff.staff_id": mongoose.Types.ObjectId(staff_id) },
      ],
      payment_status: true,
    };
    var currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    var filterDate = new Date(new Date().setHours(0, 0, 0, 0));
    filterDate.setDate(filterDate.getDate() - days);
    if (days != 0) {
      query.createdAt = {
        $gte: new Date(filterDate),
        $lt: new Date(currentDate.setDate(currentDate.getDate() + 1)),
      };
    }
    let sorting = {};
    if (resto_id != "") query.resto_id = mongoose.Types.ObjectId(resto_id);
    if (sort != "") sorting.tip_amount = -1;
    else sorting.createdAt = -1;
    const data = await Tip.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "pub",
        },
      },
      {
        $unwind: {
          path: "$pub",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          createdAt: 1,
          createdDate: {
            $concat: [
              { $dateToString: { format: "%d", date: "$createdAt" } },
              " ",
              {
                $let: {
                  vars: {
                    monthsInString: [
                      ,
                      "Jan ",
                      "Feb ",
                      "Mar ",
                      "Apr ",
                      "May ",
                      "Jun ",
                      "Jul ",
                      "Aug ",
                      "Sep ",
                      "Oct ",
                      "Nov ",
                      "Dec ",
                    ],
                  },
                  in: {
                    $arrayElemAt: [
                      "$$monthsInString",
                      { $month: "$createdAt" },
                    ],
                  },
                },
              },
            ],
          },
          customerDetails: "$customer",
          pubDetails: "$pub",
          guest: "$guest",
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
          tip_amount: {
            $cond: {
              if: { $eq: ["$is_group_tip", false] },
              then: "$staff.tip_amount",
              else: {
                $map: {
                  input: {
                    $filter: {
                      input: "$group_staff",
                      as: "groupStaff",
                      cond: {
                        $eq: [
                          "$$groupStaff.group_staff_id",
                          mongoose.Types.ObjectId(staff_id),
                        ],
                      },
                    },
                  },
                  as: "filteredGroupStaff",
                  in: "$$filteredGroupStaff.group_staff_amount",
                },
              },
            },
          },
        },
      },
    ]).sort(sorting);
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: messages.caregiverUpdate,
      data: data,
    });
  } catch (err) {
    console.log("sasaf", err.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
export const fetchDashboardData = async (req, res) => {
  try {
    const { staff_id } = req.query;
    var query = {
      $or: [
        { "group_staff.group_staff_id": mongoose.Types.ObjectId(staff_id) },
        { "staff.staff_id": mongoose.Types.ObjectId(staff_id) },
      ],
      payment_status: true,
    };
    const data = await Tip.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          createdAt: 1,
          customerDetails: "$customer",
          customer_id: 1,
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
          tip_amount: {
            $cond: {
              if: { $eq: ["$is_group_tip", false] },
              then: "$staff.tip_amount",
              else: {
                $map: {
                  input: {
                    $filter: {
                      input: "$group_staff",
                      as: "groupStaff",
                      cond: {
                        $eq: [
                          "$$groupStaff.group_staff_id",
                          mongoose.Types.ObjectId(staff_id),
                        ],
                      },
                    },
                  },
                  as: "filteredGroupStaff",
                  in: "$$filteredGroupStaff.group_staff_amount",
                },
              },
            },
          },
        },
      },
    ]);
    // const fetchPubs = await User.find({role:"2"})
    const fetchDDPubs = await Tip.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "pub",
        },
      },
      {
        $unwind: {
          path: "$pub",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$pub._id",
          addressLine1: { $first: "$pub.addressLine1" },
          image: { $first: "$pub.image" },
          restaurant_name: { $first: "$pub.restaurant_name" },
          full_name: { $first: "$pub.full_name" },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          addressLine1: { $ne: null },
          image: { $ne: null },
          restaurant_name: { $ne: null },
          full_name: { $ne: null },
        },
      },
    ]);

    const fetchPubstar = await StaffRequest.aggregate([
      { $match: { staff_id: mongoose.Types.ObjectId(staff_id), status: "1" } },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "pubDetails",
        },
      },
      {
        $unwind: {
          path: "$pubDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          restaurant_name: "$pubDetails.restaurant_name",
          restro_id: "$pubDetails._id",
          full_name: "$pubDetails.full_name",
          image: "$pubDetails.image",
        },
      },
    ]);

    var currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    const fetchLastTips = await Tip.find({
      $or: [
        { "group_staff.group_staff_id": mongoose.Types.ObjectId(staff_id) },
        { "staff.staff_id": mongoose.Types.ObjectId(staff_id) },
      ],
      createdAt: {
        $gte: new Date(currentDate.setDate(currentDate.getDate() - 3)),
      },
    });
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: messages.caregiverUpdate,
      data: {
        statData: data,
        pubs: fetchPubstar,
        ddPubs: fetchDDPubs,
        lastTips: fetchLastTips.length,
      },
    });
  } catch (err) {
    console.log("sasaf", err.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const addUserPost = async (req, res) => {
  try {
    let payload = [];

    try {
      for (let file of req.files) {
        let data = {
          image: file.filename,
          created_date: new Date(),
        };
        payload.push(data);
      }

      await User.findByIdAndUpdate(
        req.body._id,
        {
          $push: {
            photoGallery: { $each: payload },
          },
        },
        { new: true }
      );
      const result = await User.findById(req.body._id);

      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: "find&Update",
        data: result,
      });
    } catch (error) {
      console.log(" Error:", error.message);
    }
  } catch (error) {
    console.log("Error2:", error.message);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const deleteUserPost = async (req, res) => {
  try {
    const { userId, _id } = req.body;
    // console.log("adsada", req.body);

    await User.updateMany(
      { _id: mongoose.Types.ObjectId(userId) },
      { $pull: { photoGallery: { _id: mongoose.Types.ObjectId(_id) } } }
    );
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: "find&Update",
    });
  } catch (error) {
    console.log("Error2:", error.message);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const editGallery = async (req, res) => {
  try {
    const { userId, _id, image_id } = req.body;

    // console.log("sdaada", req.body);
    const result = await User.updateOne(
      {
        _id: mongoose.Types.ObjectId(_id),
        "photoGallery._id": mongoose.Types.ObjectId(image_id),
      },
      {
        $set: { "photoGallery.$.image": req.files[0].filename },
      }
    );
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: "find&Update",
    });
  } catch (error) {
    console.log("Error2:", error.message);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const connectStripe = async (req, res) => {
  try {
    const { _id, email, type } = req.body;
    const fetchUser = await User.findOne({
      _id: mongoose.Types.ObjectId(_id),
      "gatewayPlatform.type": "Stripe",
    });
    let account_id;
    if (!fetchUser) {
      let data = await new Promise(async (resolve, reject) => {
        await stripe.accounts
          .create({
            type: "express",
            country: "GB",
            email: email,
            business_type: "individual",
            capabilities: {
              card_payments: {
                requested: true,
              },
              transfers: {
                requested: true,
              },
            },
          })
          .then((val) => {
            resolve(val);
          })
          .catch((err) => {
            console.log("Err in stripe Account api==>", err);
            reject(err);
          });
      });
      let payload = [
        {
          account_id: data.id,
          type: "Stripe",
          status: "Pending",
        },
      ];
      account_id = data.id;
      await User.findByIdAndUpdate(
        _id,
        {
          $push: {
            gatewayPlatform: { $each: payload },
          },
        },
        { new: true }
      );
    } else {
      for (let platform of fetchUser.gatewayPlatform)
        if (platform.type === "Stripe") {
          account_id = platform.account_id;
        }
    }
    await stripe.accountLinks
      .create({
        account: account_id,
        refresh_url: `${config.BackEnd_url}/api/users/successPaypal?id=${_id}/api/users/successStripe?acc=${account_id}&id=${_id}&type=${type}`,
        return_url: `${config.BackEnd_url}/api/users/successStripe?acc=${account_id}&id=${_id}&type=${type}`,
        type: "account_onboarding",
      })
      .then((val) => {
        return res.status(messageID.successCode).json({
          status: responseCodes.successStatus,
          messageID: messageID.successCode,
          message: "Fetch Onboard Url",
          result: val,
        });
      })
      .catch((err) => {
        console.log("asdas", err.message);
        return res.status(messageID.internalServerError).json({
          status: responseCodes.failedStatus,
          messageID: messageID.internalServerError,
          message: messages.internalServerError,
        });
      });

    return;
  } catch (error) {
    console.log("asdasafsddss", err.message);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const successStripe = async (req, res) => {
  try {
    const { acc, id, type } = req.query;
    setTimeout(async () => {
      await stripe.accounts
        .retrieve(acc)
        .then(async (val) => {
          if (val.payouts_enabled && val.charges_enabled) {
            await User.updateOne(
              {
                _id: mongoose.Types.ObjectId(id),
                "gatewayPlatform.account_id": acc,
              },
              { $set: { "gatewayPlatform.$.status": "Active" } }
            );
            if (type === "Staff") {
              res.redirect(
                `${config.FrontEnd_url}/profilesetting?code=202&type=Stripe`
              );
            } else {
              res.redirect(
                `${config.FrontEnd_url}/resto/mainrestodashboard?code=202&type=Stripe`
              );
            }
          } else {
            await User.updateOne(
              {
                _id: mongoose.Types.ObjectId(id),
                "gatewayPlatform.account_id": acc,
              },
              { $set: { "gatewayPlatform.$.status": "Failed" } }
            );
            if (type === "Staff") {
              res.redirect(
                `${config.FrontEnd_url}/profilesetting?code=404&type=Stripe`
              );
            } else {
              res.redirect(
                `${config.FrontEnd_url}/resto/mainrestodashboard?code=404&type=Stripe`
              );
            }
          }
        })
        .catch((err) => {
          console.log("Adasdas", err.message);
        });
    }, 10000);
  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const detachStripe = async (req, res) => {
  try {
    const { acc, id, recid } = req.body;
    await stripe.accounts
      .del(acc)
      .then(async (val) => {
        if (val.deleted) {
          await User.updateMany(
            { _id: mongoose.Types.ObjectId(id) },
            {
              $pull: {
                gatewayPlatform: { _id: mongoose.Types.ObjectId(recid) },
              },
            }
          );
          return res.status(messageID.successCode).json({
            status: responseCodes.successStatus,
            messageID: messageID.successCode,
            message: "find&Delete",
          });
        } else {
          return res.status(messageID.successCode).json({
            status: responseCodes.failedStatus,
            messageID: messageID.successCode,
            message: "Error in Stripe",
          });
        }
      })
      .catch((err) => {
        console.log("vgfgyfgy", err);
      });
  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const detachPaypal = async (req, res) => {
  try {
    const { acc, id, recid } = req.body;

    await User.updateMany(
      { _id: mongoose.Types.ObjectId(id) },
      { $pull: { gatewayPlatform: { _id: mongoose.Types.ObjectId(recid) } } }
    );
    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: "find&Delete",
    });
  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const connectPaypal = async (req, res) => {
  try {
    const { _id, email, type } = req.body;

    await generatePaypalToken(async (token) => {
      if (token.access_token) {
        let data = {
          tracking_id: _id,
          partner_config_override: {
            partner_logo_url: "https://gotipme.com/assets/goTipmelogo.png",
            return_url: `${config.BackEnd_url}/api/users/successPaypal?id=${_id}&type=${type}`,
            action_renewal_url: "https://gotipme.com",
            show_add_credit_card: true,
          },
          operations: [
            {
              operation: "API_INTEGRATION",
              api_integration_preference: {
                rest_api_integration: {
                  integration_method: "PAYPAL",
                  integration_type: "THIRD_PARTY",
                  third_party_details: {
                    features: [
                      "PAYMENT",
                      "REFUND",
                      "ACCESS_MERCHANT_INFORMATION",
                    ],
                  },
                },
              },
            },
          ],
          products: ["EXPRESS_CHECKOUT"],
          legal_consents: [
            {
              type: "SHARE_DATA_CONSENT",
              granted: true,
            },
          ],
        };

        axios
          .post(`${config.PaypalUrl}/v2/customer/partner-referrals`, data, {
            headers: {
              "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.access_token}`,
            },
          })
          .then(async (response) => {
            const fetchUser = await User.findOne({
              _id: mongoose.Types.ObjectId(_id),
              "gatewayPlatform.type": "Paypal",
            });
            for (let link of response.data.links) {
              if (link.rel === "action_url") {
                return res.status(messageID.successCode).json({
                  status: responseCodes.successStatus,
                  messageID: messageID.successCode,
                  message: "Fetch Onboard Url",
                  result: link,
                });
              } else if (link.rel == "self") {
                await axios
                  .get(link.href, {
                    headers: {
                      "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token.access_token}`,
                    },
                  })
                  .then(async (response) => {
                    if (response?.data) {
                      if (!fetchUser) {
                        let payload = [
                          {
                            type: "Paypal",
                            status: "Pending",
                            partner_id: response?.data?.submitter_payer_id,
                          },
                        ];
                        await User.findByIdAndUpdate(
                          _id,
                          {
                            $push: {
                              gatewayPlatform: { $each: payload },
                            },
                          },
                          { new: true }
                        );
                      } else {
                        await User.updateOne(
                          {
                            _id: mongoose.Types.ObjectId(_id),
                            "gatewayPlatform.type": "Paypal",
                          },
                          {
                            $set: {
                              "gatewayPlatform.$.partner_id":
                                response?.data?.submitter_payer_id,
                              "gatewayPlatform.$.status": "Pending",
                            },
                          }
                        );
                      }
                    }
                  })
                  .catch((err) => {
                    console.log("Sdfsdfsd", err);
                  });
              }
            }
          })
          .catch((err) => {
            console.log("Connect Paypal Err==>", err.message);
            return res.status(messageID.internalServerError).json({
              status: responseCodes.failedStatus,
              messageID: messageID.internalServerError,
              message: messages.internalServerError,
            });
          });
      } else {
        return res.status(messageID.successCode).json({
          status: responseCodes.failedStatus,
          messageID: messageID.successCode,
          message: "Token Failed",
        });
      }
    });
  } catch (error) {
    console.log("asfsdfs", error);
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const successPaypal = async (req, res) => {
  try {
    const {
      merchantIdInPayPal,
      merchantId,
      id,
      isEmailConfirmed,
      permissionsGranted,
      type,
    } = req.query;

    if (merchantIdInPayPal && merchantId && id) {
      await generatePaypalToken(async (token) => {
        const fetch = await User.findById({ _id: mongoose.Types.ObjectId(id) });

        for (let data of fetch.gatewayPlatform) {
          if (data.type == "Paypal") {
            axios
              .get(
                `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${merchantIdInPayPal}`,
                {
                  headers: {
                    "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.access_token}`,
                  },
                }
              )
              .then(async (resp) => {
                if (
                  !resp.data.primary_email_confirmed ||
                  !resp.data.payments_receivable
                ) {
                  await User.updateOne(
                    {
                      _id: mongoose.Types.ObjectId(id),
                      "gatewayPlatform.type": "Paypal",
                    },
                    {
                      $set: {
                        "gatewayPlatform.$.status": "Pending",
                        "gatewayPlatform.$.account_id": merchantIdInPayPal,
                      },
                    }
                  );
                }

                if (!resp.data.primary_email_confirmed) {
                  if (type === "Staff") {
                    return res.redirect(
                      `${config.FrontEnd_url}/profilesetting?code=205&type=PayPal`
                    );
                  } else {
                    return res.redirect(
                      `${config.FrontEnd_url}/resto/mainrestodashboard?code=205&type=PayPal`
                    );
                  }
                } else if (!resp.data.payments_receivable) {
                  if (type === "Staff") {
                    return res.redirect(
                      `${config.FrontEnd_url}/profilesetting?code=207&type=PayPal`
                    );
                  } else {
                    return res.redirect(
                      `${config.FrontEnd_url}/resto/mainrestodashboard?code=207&type=PayPal`
                    );
                  }
                } else {
                  await User.updateOne(
                    {
                      _id: mongoose.Types.ObjectId(id),
                      "gatewayPlatform.type": "Paypal",
                    },
                    {
                      $set: {
                        "gatewayPlatform.$.status": "Active",
                        "gatewayPlatform.$.account_id": merchantIdInPayPal,
                      },
                    }
                  );
                  if (type === "Staff") {
                    return res.redirect(
                      `${config.FrontEnd_url}/profilesetting?code=202&type=PayPal`
                    );
                  } else {
                    return res.redirect(
                      `${config.FrontEnd_url}/resto/mainrestodashboard?code=202&type=PayPal`
                    );
                  }
                }
              })
              .catch((err) => {
                console.log(
                  "sadsad",
                  err.message,
                  `${config.PaypalUrl}/v1/customer/partners/${data.partner_id}/merchant-integrations/${merchantIdInPayPal}`
                );
              });
          }
        }
      });
    } else {
      await User.updateOne(
        { _id: mongoose.Types.ObjectId(id), "gatewayPlatform.type": "Paypal" },
        { $set: { "gatewayPlatform.$.status": "Failed" } }
      );
      if (type === "Staff") {
        return res.redirect(
          `${config.FrontEnd_url}/profilesetting?code=404&type=PayPal`
        );
      } else {
        return res.redirect(
          `${config.FrontEnd_url}/resto/mainrestodashboard?code=404&type=PayPal`
        );
      }

      ``;
    }
    return;
  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const checkandValidateToken = async (req, res) => {
  try {
    // const referer = req.get("Referer") || req.get("Origin");
    // console.log(`Frontend URL: ${referer}`);
    let jwtSecretKey = secret.jwt;
    const decode = jwt.verify(req.query.token, jwtSecretKey);
    req.user = decode;
    res.status(202).json(true);
  } catch (error) {
    res.status(202).json(false);
  }
};

export const connectTrustap = async (req, res) => {
  try {
    const { country } = req.params;
    const state = generateState();
    function generateState() {
      return Math.random().toString(36).substring(2, 15);
    }
    // console.log("country-----", country);
    const { clientId } = get_secret_keys(country);
    // console.log("get_secret_keys-----", get_secret_keys(country));

    // console.log("clientId-----", clientId);

    const redirectUrl =
      `${SSOURl}/${realm}/protocol/openid-connect/auth` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(profile_setting_uri)}` +
      `&response_type=${encodeURIComponent(code)}` +
      `&scope=${encodeURIComponent(trustapScope)}` +
      `&state=${encodeURIComponent(state)}`;

    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: messages.createAccount,
      result: { href: redirectUrl },
    });
  } catch (error) {
    console.error("Error in createFullUserTrustap:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

/**
 * trustapSuccess
 */

export const trustapSuccess = async (req, res) => {
  try {
    const { id, code } = req.body;
    if (!id || !code) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required fields: id or code",
      });
    }

    // console.log("req body---------", req.body);

    const get_user_details = await User.findById({ _id: id });
    console.log("get_user_details.country---------", get_user_details.country);

    const { clientId, clientSecret } = get_secret_keys(
      get_user_details?.country
    );

    console.log("clientSecret---------", clientSecret);
    console.log("clientId---------", clientId);

    const kyc_obj = qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: profile_setting_uri,
      // redirect_uri: redirect_profile,
      response_type: code,
      scope: trustapScope,
      code: code,
    });

    // console.log("kyc obj----------",kyc_obj)

    // Step 1: Make the request to get the token
    const completeKyc = await axios.post(
      `${SSOURl}/${realm}/protocol/openid-connect/token`,
      kyc_obj,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json, text/plain, */*",
        },
      }
    );

    const token = completeKyc?.data?.id_token;

    if (!token) {
      return res.status(400).json({
        status: "failed",
        message: "Failed to retrieve token",
      });
    }

    // Step 2: Parse the token
    const decodedDetails = parseJwt(token);

    if (!decodedDetails.sub) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid token or missing user ID in decoded token",
      });
    }
    // Step 3: Update Trustap status in the database
    const updateTrustapStatus = await User.findOneAndUpdate(
      { _id: id },
      {
        trustap_connected: true,
        trustap_user_id: decodedDetails.sub,
      },
      { new: true }
    );

    if (!updateTrustapStatus) {
      return res.status(404).json({
        status: "failed",
        message: "Failed to update Trustap status, user not found",
      });
    }

    // Step 4: Return a success response
    return res.status(200).json({
      status: "success",
      message: "Trustap status updated successfully",
      result: updateTrustapStatus,
    });
  } catch (error) {
    console.log("error--------------------", error);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
      // error: error.response?.data || error.message,
      // errorStack: error,
    });
  }
};

// export const add_country = async (req, res) => {
//   try {
//     // console.log("Request body:", req.body);

//     const { _id, full_name, email, trustap_user_id,countryCode, country, role } = req.body;

//     const isExist = await User.findOne({ _id });

//     if (isExist) {
//       const splitName = (fullName) => {
//         console.log("fullName", fullName);

//         const nameParts = fullName.trim().split(" ");
//         console.log("object", nameParts);
//         const firstName = nameParts[0];
//         const lastName = nameParts.slice(1).join(" ");
//         return { firstName, lastName };
//       };

//       const { firstName, lastName } = splitName(full_name);
//       const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
//       const timestamp = getUnixTimestamp();

//       let newObj = {
//         email,
//         first_name: firstName,
//         last_name: lastName || firstName,
//         country_code: countryCode,
//         tos_acceptance: { unix_timestamp: timestamp, ip: "127.0.0.1" },
//       };

//       let gatewayPlatformUserId = null;

//       // Conditionally call external API for guest users
//       if (role !== "2" && role !== "3") {
//         const { authorized_key } = get_secret_keys(country);

//         // console.log("authorized key------", authorized_key);
//         try {
//           const response = await axios.post(
//             `${dev_path}/api/v1/guest_users`,
//             newObj,
//             {
//               headers: {
//                 "Content-Type": "application/json",
//                 // Authorization: `Basic ${trustap_key}`,
//                 Authorization: `Basic ${authorized_key}`,
//               },
//             }
//           );
//           gatewayPlatformUserId = response?.data?.id;
//         } catch (apiError) {
//           console.error("Error in external API call:", apiError);
//           return res.status(500).json({
//             status: false,
//             message: "Error adding country: external API failed.",
//           });
//         }
//       }

//       // Update the existing user with new data
//       isExist.countryCode = countryCode;
//       // isExist.trustap_user_id = gatewayPlatformUserId || null;
//       // console.log("gaTEWWAY PLATFORM USER ID----------",gatewayPlatformUserId)
//       isExist.trustap_user_id = gatewayPlatformUserId ? gatewayPlatformUserId : trustap_user_id;
//       isExist.country = country;

//       const data = await isExist.save();

//       return res.status(200).json({
//         status: true,
//         message: "Country added successfully",
//         data: data,
//       });
//     } else {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//     });
//   }
// };

export const add_country = async (req, res) => {
  try {
    // console.log("Request body:", req.body);

    const {
      _id,
      full_name,
      email,
      trustap_user_id,
      countryCode,
      country,
      role,
    } = req.body;

    const isExist = await User.findOne({ _id });

    if (isExist) {
      let gatewayPlatformUserId = null;

      // Conditionally call external API for guest users
      if (role !== "2" && role !== "3") {
        const splitName = (fullName) => {

          const nameParts = fullName.trim().split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ");
          return { firstName, lastName };
        };

        const { firstName, lastName } = splitName(full_name);
        const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
        const timestamp = getUnixTimestamp();

        let newObj = {
          email,
          first_name: firstName,
          last_name: lastName || firstName,
          country_code: countryCode,
          tos_acceptance: { unix_timestamp: timestamp, ip: "127.0.0.1" },
        };
        const { authorized_key } = get_secret_keys(country);

        // console.log("authorized key------", authorized_key);
        try {
          const response = await axios.post(
            `${dev_path}/api/v1/guest_users`,
            newObj,
            {
              headers: {
                "Content-Type": "application/json",
                // Authorization: `Basic ${trustap_key}`,
                Authorization: `Basic ${authorized_key}`,
              },
            }
          );
          gatewayPlatformUserId = response?.data?.id;
        } catch (apiError) {
          console.error("Error in external API call:", apiError);
          return res.status(500).json({
            status: false,
            message: "Error adding country: external API failed.",
          });
        }
      }

      // Update the existing user with new data
      isExist.countryCode = countryCode;
      // isExist.trustap_user_id = gatewayPlatformUserId || null;
      // console.log("gaTEWWAY PLATFORM USER ID----------",gatewayPlatformUserId)
      isExist.trustap_user_id = gatewayPlatformUserId
        ? gatewayPlatformUserId
        : trustap_user_id;
      isExist.country = country;

      const data = await isExist.save();

      return res.status(200).json({
        status: true,
        message: "Country added successfully",
        data: data,
      });
    } else {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

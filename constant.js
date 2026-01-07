const config = require("./config/config").get(process.env.NODE_ENV || "local");
const { PORTNO, EMAIL,FrontEnd_url  } = config;

//responseCodes
export const responseCodes = {
  successStatus: "Success",
  failedStatus: "Failed",
};

export const messages = {

  requestCodeUnique: "Request Code Alredy Taken.",
  createAccount: "Your account create successfully.",
  failedAccount: "Your account create failed.",
  userExist: "User already exist.",
  userNameExist: "Username already exist.",
  emailExist: "email already exist.",
  emailNotExist: "email not exist.",
  userNotFound: "Please Check Your Credentials.",
  dataNotFound: "No data found",
  incorrectPassword: "Incorrect Password",
  passwordNotCreated: "Password Not Created",
  loginSuccess: "Login successfully",
  listSuccess: "Data fetch successfully",
  updateSuccess: "Data update successfully",
  profileCreateSuccess: "Profile Create successfully",
  updateApprovalSuccess: "Successfully Approved.",
  statusUpdate: "Status update successfully",
  internalServerError: "Internal Server Error",
  passwordChangeSuccess: "Password Change Successfully",
  profileUpdate: "Profile Setup Successfully",
  authError: "Auth Error",
  tokenExpire: "Token Expire",
  invalidToken: "Invalid Token",
  internalError: "Internal Server Error",
  emailSend: "Email successfully send.",
  add: "Data Add successfully",
  emailNotVerified: "Email Not Verified",
  emailVerified: "Email Verified",
  emailAlreadyVerified: "Your link is expired",
  EmailSend: "Email Send Successfully.",
  userAlredyAdd: "User already add wait for approval.",
  userAdd: "User add success wait for approval.",
  count: "count successfully!!.",
  oldPassword: "Old Password is incorrect.",
  imageType: "Only image(jpeg, jpg, png) file upload.",
  failedUpdate: "Updation failed.",
  SubscriptionPlan: "Subscription Plan created successfully!!.",
  SubscriptionPlanupdated: "Subscription Plan updated successfully!!.",
  SubscriptionPlandelete: "Subscription Plan deleted successfully!!.",
  fetch:"user fetch successfully",


  PostdCreated: "Post created successfully!!.",
  PostdnotCreated: "Post not created successfully!!.",
  Postpdated: "Post updated successfully!!.",
  Postdelete: "Post deleted successfully!!.",
  LikePosts: "Post has been liked",
  DislikePosts: "Post has been disliked",
  LikeList: "List of Likes getting Successfully",

  SubscriptionBundle: "Subscription Bundle created successfully!!.",
  SubscriptionBundleupdated: "Subscription Bundle updated successfully!!.",
  SubscriptionBundledelete: "Subscription Bundle deleted successfully!!.",
  PromotionCampaign: "Promotion Campaign created successfully!!.",
  PromotionCampaignupdated: "Promotion Campaign updated successfully!!.",
  PromotionCampaigndelete: "Promotion Campaign deleted successfully!!.",
  ChangePassword: "Password is changed successfully!!.",


  UserDelete: "User Deleted Successfully!!.",
  UserUpdate: "User Updated Successfully!!.",
  OfferCreated: "Offer Created Successfully!!.",
  OfferDelete: "Offer Deleted Successfully!!.",
  OfferUpdate: "Offer Update Successfully!!.",
  NotFound: "User Not found!!.",
  WrongCredet: "Wrong Credential",
  CheckMail: "please check your email to change your password",
  PasswordNotMatched: "Both passwords are not matched",


  comment: "You commented on post",
  CommentUpdate:"comment updated successfully",
  PostDelete:"comment deleted successfully",


  FanCreated: "Fan created successfully!!.",
  FannotCreated: "Fan not created successfully!!.",
  Fanupdated: "Fan updated successfully!!.",
  FanNotupdated: "Fan updated not successfully!!,Please provide fan id",
  Fandelete: "Fan deleted successfully!!.",

  SchedulePost: "Your Schedule is created successfully",

  Otpsend:"Otp send Successfully",
  OtpVerify:"Otp Verify Successfully",
  OtpNotmatch:"Otp Does not matched"
  




};

export const messageID = {
  //to be used when no new record is inserted but to display success message
  successCode: 200,
  //to be used when new record is inserted
  newResourceCreated: 201,
  //to be used if database query return empty record
  nocontent: 204,
  //to be used if the request is bad e.g. if we pass record id which does not exits
  badRequest: 400,
  //to be used when the user is not authorized to access the API e.g. invalid access token. "jwtTokenExpired": 401
  unAuthorizedUser: 401,
  //to be used when access token is not valid
  forbidden: 403,
  //to be used if something went wrong
  failureCode: 404,
  //to be used when error occured while accessing the API
  internalServerError: 500,
  //to be used if record already axists
  conflictCode: 409,
  empityToken:404
};

export const roleInInteger = (role) => {
  let roleText = "";
  if (role === 2) {
    return (roleText = "enduser");
  } else if (role === 1) {
    return (roleText = "contentcreator");
  } else {
    return (roleText = "admin");
  }
};

export const roleInText = (role) => {
  let roleText = "";
  if (role === "enduser") {
    return (roleText = 2);
  } else if (role === "contentcreator") {
    return (roleText = 1);
  } else {
    return (roleText = 0);
  }
};

export const emailText = {
  subjectEmail: "Email Verificaion",
  subjectEmailProfile: "Profile Setup",
};

export const htmlEmailVerify = (token, name, role) => {
  return `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Dock Nock email Template</title>
                        <style>
                            @media (max-width: 576px){
                                section{
                                    width: auto !important;
                                }
                                .box{
                                    max-width: none !important;
                                    width: 100% !important;
                                }
                                .innerBox{
                                    max-width: 255px !important;
                                }
                            }
                        </style>
                    </head>
                    <body style="background-color: #F9F9F9; width: 100% !important; margin: 0; padding: 0;">
                    <div class="box" style="max-width: 500px; margin: 0 auto; background-color: #F9F9F9; text-align:center;">
                    <div class="innerBox" style="max-width: 300px; width: 100%; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; position: absolute; left: 50%; transform: translateX(-50%);">
                        <h1 style="font-size: 32px; color: #272727; font-weight: 600; margin-top: 0; margin-bottom: 0;">Welcome ${name}</h1>
                        <p style="font-size: 15px; font-weight: 300; color: #656565; margin-top: 25px;">Your account is created please verify your email using click below.</p>
                        <a href="https://gotipme.com/email-verify/${token}?data=${role}" style="background-color: #64BD05; text-align: center; display: inline-block; padding: 8px 0px; max-width: 150px; width: 100%; font-size: 14px; font-weight: 300; margin: 15px  auto 0; color: #fff; border-radius: 35px; text-decoration: none;">Verify email</a>
                        <p style="font-size: 15px; font-weight: 300; color: #656565; text-align: center;margin-top: 25px;">GoTipMe</p>
                    </div>
            </div>
                    </body>
                    </html>
    `;
};

export const forgetPasswordSub = {
  subjectEmail: "Forgot Your Password",
};

export const htmlForgetPassword = (token, role) => {

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Dock Nock email Template</title>
          <style>
              @media (max-width: 576px){
                  section{
                      width: auto !important;
                  }
                  .box{
                      max-width: none !important;
                      width: 100% !important;
                  }
                  .innerBox{
                      max-width: 255px !important;
                  }
              }
          </style>
      </head>
    <body style="background-color: #F9F9F9; width: 100% !important; margin: 0; padding: 0;">
    <div class="box" style="max-width: 500px; margin: 0 auto; background-color: #F9F9F9; text-align: center;
    justify-content: center;">
     <div class="innerBox" style="max-width: 300px; width: 100%; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; ">
         <h1 style="font-size: 32px; color: #272727; font-weight: 600; margin-top: 0; margin-bottom: 0;">Hello</h1>
        <p style="font-size: 15px; font-weight: 300; color: #656565; margin-top: 25px;">To reset your password, click on the below link:</p>
        <a href=${config.FrontEnd_url}/reset-password/${token}?data=${role} style="background-color: #faf04b; text-align: center; display: inline-block; padding: 8px 0px; max-width: 150px; width: 100%; font-size: 14px; font-weight: 300; margin: 15px  auto 0; color: black; border-radius: 35px; text-decoration: none;">Click To Change Password</a>
        <p style="font-size: 15px; font-weight: 300; color: #656565; text-align: center;margin-top: 25px;"> GoTipMe</p>
     </div>
   </div>
   <script>
          function data(){
      
          window.open('${config.FrontEnd_url}/reset-password/${token}?data=${role}')
          }
          </script>  
     </body>
  </html > `;
};

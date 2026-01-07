
import express from "express";
import {
  userSignup,
  userLogin,
  paymentSuccess,
  forgetpassword,
  resetpassword,
  getDetailsById,
  StaffRestoList,
  updateUser,
  DeleteUser,
  searchuser,
  blockAndUnblock,
  changePassword,
  Count,
  Sendotp,
  VerifyOtp,
  updateProfile,
  googleLogin,
  facebookLogin,
  Follow,
  filterDashboardData,
  fetchDashboardData,
  addUserPost,
  deleteUserPost,
  connectStripe,
  successStripe,
  detachStripe,
  connectPaypal,
  successPaypal,
  detachPaypal,
  uploadPost,
  editGallery,
  verifyOtp,
  resendOtp,
  checkandValidateToken,
  createFullUserTrustap,
  connectTrustap,
  trustapSuccess,
  add_country,
  // claimForSeller,
  // complainWithGuestBuyer
} 
  from "../controller/user";
import { verifyToken } from "../middleware/verifyToken";
import { upload } from "../middleware/uploadPost";
import { uploadprofile } from "../middleware/UploadProfile";
import { multipleUpload } from "../middleware/multipleUploadPost";


const router = express.Router();

router.post("/signup",  userSignup);
router.post("/verifyOtp",  verifyOtp);
router.post("/resendOtp",  resendOtp);


router.post("/signin", userLogin);

router.post("/forgetpassword", forgetpassword);

router.post("/resetpass",verifyToken,resetpassword);

// get details by ID
router.get("/getbyid", getDetailsById);

// user list role=2
router.get("/userlist",verifyToken, StaffRestoList);

//update User
router.put("/updateuser",upload , updateUser);

//Add User Post
router.put("/addUserPost",multipleUpload , addUserPost);
router.put("/editGallery",multipleUpload , editGallery);


//Update profile
router.put("/updateprofile",uploadprofile, updateProfile);

//search User
router.post("/searchUser", searchuser);

//delete pub photos

router.post("/deleteUserPost",deleteUserPost)

//Delete User
router.delete("/deleteuser/:id", DeleteUser);

// block - unblock
router.put("/update-status", blockAndUnblock);

// Change Password
router.put("/changepassword", changePassword);

//count user and creater registered

router.post('/countUser', Count)


router.post('/sendotp',verifyToken, Sendotp)
router.post('/otpverify', VerifyOtp)

router.post("/follow", Follow);
router.post("/googleloginapi", googleLogin);
router.post("/facebookloginapi", facebookLogin)
router.get("/filterDashboardData",verifyToken, filterDashboardData)
router.get("/fetchDashboardData",verifyToken, fetchDashboardData)
router.post("/connectStripe", connectStripe)
router.get("/successStripe", successStripe)
router.post("/detachStripe", detachStripe)
router.post("/detachPaypal", detachPaypal)
router.post("/connectPaypal", connectPaypal)
router.get("/successPaypal", successPaypal)

router.get("/checkToken" , checkandValidateToken)
router.get("/connectTrustap/:country" , connectTrustap)
router.put("/successTrustap" , trustapSuccess)
router.put("/addCountry", add_country);

// router.post("/complaintWithGuestBuyer", complainWithGuestBuyer);
// router.post("/claimForSeller", claimForSeller);













export default router;

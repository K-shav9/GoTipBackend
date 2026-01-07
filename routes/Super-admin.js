import express from "express";
import {
  Super_Admin_Restaurant_List,
  No_of_Restaurant_list,
  Super_Admin_Staff_List,
  No_of_Staff_list,
  Super_Admin_Customer_List,
  No_of_Customer_list,
  SetupServiceFees,
  Graph_Tip_List
} from "../controller/Super-admin/Super-admin";
import { getPaymentHistory, Super_Admin_Service_Fee_List } from "../controller/Super-admin/payment-management/PaymentManagement";
import {
  No_of_Total_Tip,
  No_of_Request_Recieved,
  RecentTipList,
  getPubstarTipsList,
  getGroupTipsList,
  No_of_Pubstar_Tip,
  No_of_Group_Tip,
  getPendingRequests,
} from "../controller/Super-admin/dashboard/Dashboard";
import {
  Enquiry_List,
  Contact_Supports_List,
  No_of_Enquiry_List,
  No_of_Contact_List,
  getDetailsByid,
  Reply_By_Admin,
  getDetailsByidContactUs
} from "../controller/Super-admin/queries/Queries";
import {
  Contact_us_List,
  No_of_Contact_us_List,
} from "../controller/landingpage.js/ContactUs";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.get("/restaurantlist",verifyToken, Super_Admin_Restaurant_List);
router.get("/noofrestaurantlist",verifyToken, No_of_Restaurant_list);
router.get("/stafflist",verifyToken, Super_Admin_Staff_List);
router.get("/noofstafflist", No_of_Staff_list);
router.get("/customerlist",verifyToken, Super_Admin_Customer_List);
router.get("/noofcustomerlist",verifyToken, No_of_Customer_list);

router.get("/servicefeelist", Super_Admin_Service_Fee_List);
router.get("/nooftotaltip",verifyToken, No_of_Total_Tip);
router.get("/noofrequestrecieved",verifyToken, No_of_Request_Recieved);
router.get("/recenttiplist",verifyToken, RecentTipList);

router.get("/pubstartiplists",verifyToken, getPubstarTipsList);
router.get("/getgrouptiplists",verifyToken, getGroupTipsList);
router.get("/getnoofpubstartip",verifyToken, No_of_Pubstar_Tip);

router.get("/getnoofgrouptip",verifyToken, No_of_Group_Tip);

router.get("/getpendingrequest",verifyToken, getPendingRequests);

router.get("/getenquirylist",verifyToken, Enquiry_List);

router.get("/getsupportlist",verifyToken, Contact_Supports_List);
router.get("/getnoofenquirylist",verifyToken, No_of_Enquiry_List);
router.get("/getnoofcontactlist",verifyToken, No_of_Contact_List);

router.get("/getcontactuslist",verifyToken, Contact_us_List);
router.get("/noofcontactus",verifyToken, No_of_Contact_us_List);

router.get("/getdetailsbyid",verifyToken, getDetailsByid);

router.put("/replybyadminupdate",verifyToken, Reply_By_Admin);


router.get("/contactusview",verifyToken, getDetailsByidContactUs);




router.post("/servicefee",verifyToken, SetupServiceFees);




router.get("/graphtiplist",verifyToken,Graph_Tip_List );

router.get("/getpaymenthistory",verifyToken, getPaymentHistory);

export default router;

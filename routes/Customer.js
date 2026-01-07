import express from "express";
import {
    CustomerAllStafflist,
    getstaffDetailsById,
    getstaffProfileDetailsById,
    getrestroDetailsById,
    searchAll,
    getGroupTipbyId,
    getStaffTipbyId,
    getNoOfStaffTipbyId,
    getNoOfGroupTipbyId,
    getcustomerDetails,
    CustomerFeedback,
    getCustomerDashboardData,
    getCustomerStatData,
    PubAllList,
    getStaffOnly,
    staffAllList
  } from "../controller/Customer/Customer";
  import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.get("/getStaffOnly", getStaffOnly);
router.get("/customerallstafflist",verifyToken, CustomerAllStafflist);
router.get("/getstaffbyid", getstaffDetailsById);
router.get("/getstaffprofilebyid",verifyToken, getstaffProfileDetailsById);
router.get("/getrestrodetailbyid", getrestroDetailsById);
router.get("/searchAll", searchAll);
router.get("/getgrouptipbyid",verifyToken, getGroupTipbyId);
router.get("/getnoofgrouptipbyid",verifyToken, getNoOfGroupTipbyId);

router.get("/getstafftipbyid",verifyToken, getStaffTipbyId);
router.get("/getnoofstafftipbyid",verifyToken, getNoOfStaffTipbyId);



router.get("/getcustomerdetails", getcustomerDetails);


router.get("/getcustomerfeedback",verifyToken, CustomerFeedback);
router.get("/getCustomerDashboardData",verifyToken, getCustomerDashboardData);
router.get("/getCustomerStatData",verifyToken, getCustomerStatData);
router.get("/getAllPubList",verifyToken, PubAllList);
router.get("/getAllStaffList", verifyToken, staffAllList);









export default router;

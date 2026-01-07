import express from "express";

import {
  getAllReports,
  getTotalStaffTips,
  getTotalGroupTips,
  getGroupTipNotDistributed,
  getGroupTipDistributed,
  No_of_getAllReports,
  No_of_getTotalStaffTips,
  No_of_getTotalGroupTips,
  No_of_getGroupTipNotDistributed,
  No_of_getGroupTipDistributed,
  getCustomerReport
} from "../controller/Resturant/ReportSection";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();
router.get("/getallreport",verifyToken, getAllReports);
router.get("/getCustomerReport",verifyToken, getCustomerReport);


router.get("/gettotalstafftips",verifyToken, getTotalStaffTips);

router.get("/gettotalgrouptips",verifyToken, getTotalGroupTips);

router.get("/getgrouptipnotdistributed",verifyToken, getGroupTipNotDistributed);

router.get("/getgrouptipdistributed",verifyToken, getGroupTipDistributed);

router.get("/noofgetallreport",verifyToken, No_of_getAllReports);
router.get("/noofgettotalstafftips",verifyToken, No_of_getTotalStaffTips);
router.get("/noofgettotalgrouptips",verifyToken, No_of_getTotalGroupTips);
router.get("/noofgettotalnotdistributed",verifyToken, No_of_getGroupTipNotDistributed);
router.get("/noofgettotalgrouptipdistributed",verifyToken, No_of_getGroupTipDistributed);

export default router;

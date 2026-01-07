import express from "express";


import {
  addTip,
  getTipHistory,
  getTotalTipbyid,
  getstaffTipDetailsById,
  updateTip,
  updateGroupTip,
  getNoofTotalTipbyid,
  getNoOfTipHistory,
  // checkStripePayment,
  checkPaypalPayment,
  getStripePaypalCharge,
  updateTransaction,
} from "../controller/Tip";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/addtip", addTip);

router.get("/tiphistory",verifyToken, getTipHistory);
router.get("/nooftiphistory",verifyToken, getNoOfTipHistory);

router.get("/totaltipbyid",verifyToken, getTotalTipbyid);
router.get("/getstaffTipDetailsById",verifyToken, getstaffTipDetailsById);
router.put("/updatetip",verifyToken, updateTip);

router.get("/getnooftotaltips",verifyToken, getNoofTotalTipbyid);

router.put("/updategrouptip",verifyToken, updateGroupTip);
// router.get("/checkStripePayment", checkStripePayment);
router.post("/checkPaypalPayment" , checkPaypalPayment);
router.get("/getStripePaypalCharge" , getStripePaypalCharge);
router.put("/update-transaction", updateTransaction);




export default router;

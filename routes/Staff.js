import express from "express";
import {
    StaffGroupTippingList,
    getDetialsbyId,
    RestaurantLeaveRequest,
    StaffrestroList,
    MyPreviousJobList,
    getPreviousJobRestroProfile,
    getCustomerTipbyid,
    restroList,
    NoofStaffTippingList,
    getNoofCustomerTipbyid,
    CustomerandStaffTipList,
    deleteTipMessage
} from "../controller/Staff/staff";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.get("/staffgrouptippinglist",verifyToken, StaffGroupTippingList);
router.get("/noofstafftippinglist",verifyToken, NoofStaffTippingList);

router.get("/getdetailsbyId",verifyToken, getDetialsbyId);

router.put("/restaurantleaverequest",verifyToken, RestaurantLeaveRequest);

router.get("/staffrestrolist",verifyToken, StaffrestroList);
router.get("/mypreviousjoblist",verifyToken, MyPreviousJobList);
router.get("/getpreviousjobrestroprofile",verifyToken, getPreviousJobRestroProfile);
router.get("/getcustomertipbyid",verifyToken, getCustomerTipbyid);
router.get("/getnoofcustomertipbyid",verifyToken, getNoofCustomerTipbyid);

router.get("/restrolist", restroList);

router.get("/customerandstafftiplist",verifyToken, CustomerandStaffTipList);
router.get("/deleteTipMessage",verifyToken, deleteTipMessage);



export default router;

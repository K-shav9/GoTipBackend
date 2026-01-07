import express from "express";
import {
  Invitationrequestsent,
  InvitationRequestlist,
  AcceptInvitation,
  RejectInvitation,
  AccepteRequestlist,
  RejectRequestlist,
  RestaurantRequestlist,
  RestaurantAccepteRequestlist,
  RestaurantRejectedRequestlist,
  CancelledRestroInvitation,
  RestaurantcancelledRequestlist,
  AllStafflist,
  bulkDelete,
  getrestoDetailsById,
  getGroupStaffbyId,
  getRestroStaffTipbyId,
  AllactiveStaffList,
  AllNoOfStafflist,
  getstaffDetailsById,
  StaffStatus,
  getGroupDistributedTipList,
  TotalAmountforrestro,
  Staff_request_accepted,
  No_Of_InvitationRequestList , 
  getPubDashboardData,getStaffTip,
  rejoinPub,
  rejoinPub1
} from "../controller/Resturant/resturant";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();
//Restaurant requested list api
router.post("/addinvitationrequest",verifyToken, Invitationrequestsent);
router.get("/invitationrequestlist",verifyToken, InvitationRequestlist);
router.put("/acceptinvitation",verifyToken, AcceptInvitation);
router.put("/rejectinvitation",verifyToken, RejectInvitation);
router.get("/acceptrequestlist",verifyToken, AccepteRequestlist);
router.get("/rejectrequestlist",verifyToken, RejectRequestlist);
//Staff requested list api
router.get("/restaurantrequestlist",verifyToken, RestaurantRequestlist);
router.get("/restroacceptinvitationlist",verifyToken, RestaurantAccepteRequestlist);
router.get("/restrorejectinvitationlist",verifyToken, RestaurantRejectedRequestlist);
router.put("/cancelledrestroinvitation",verifyToken, CancelledRestroInvitation);
router.get("/cancelledrestroinvitationlist",verifyToken, RestaurantcancelledRequestlist);


router.get("/allstafflist", AllStafflist);
router.post('/bulkDelete',verifyToken,bulkDelete);



router.get('/restoDetailsById',getrestoDetailsById);
router.get('/getgroupstaffbyId',verifyToken,getGroupStaffbyId);
router.get("/getrestrostaffbyid",verifyToken, getRestroStaffTipbyId);
router.get('/allactivestafflists',verifyToken,AllactiveStaffList);
router.get('/allnoofstafflists',verifyToken,AllNoOfStafflist);

router.get('/getstaffdetailsbyid',verifyToken,getstaffDetailsById);
router.put("/staffStatus",verifyToken, StaffStatus);

router.get("/getgroupdistributedtiplist",verifyToken, getGroupDistributedTipList);
router.get("/totaltipamountforrestro",verifyToken, TotalAmountforrestro);




router.put("/staffrequestaccepted",verifyToken, Staff_request_accepted);



router.get("/No_Of_InvitationRequestList",verifyToken, No_Of_InvitationRequestList);
router.get("/getStaffTip",verifyToken, getStaffTip);
router.get("/getPubDashboardData",verifyToken, getPubDashboardData);

router.put("/rejoinpub",verifyToken, rejoinPub);
router.put("/rejoinpub1",verifyToken, rejoinPub1)

export default router;

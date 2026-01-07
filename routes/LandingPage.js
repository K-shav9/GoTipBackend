import express from "express";
import {
  addLandingPageContent,
  getLandingPageData,
  StaffSearchAll,
  updateLandingPage,
  Faqadd,
  getAboutus,
  getFaq,
  HowitworksAdd,
  getHowitWorks,
  getLandingPageFaq,
  getLandingPageHowitworks,
  DeleteFaqById,
  DeleteHowitworksById,
  updateFaq,
  updateHowitWorks,
  getFaqDetailsByid,
  getHowitworksDetailsByid,
  getPubsterAndPub,
  getTips,
 
} from "../controller/landingpage.js/Landingpage";
import { AddContactUs, AddDashboardContactUs,getContactSupportlistbyid } from "../controller/landingpage.js/ContactUs";
import { verifyToken } from "../middleware/verifyToken";


const router = express.Router();

router.post("/addlandingpagecontent", addLandingPageContent);
router.get("/getlandingpagedata", getLandingPageData);
router.get("/staffsearchall", StaffSearchAll);
router.put("/updatelandingpage",verifyToken, updateLandingPage);
router.post("/addfaq",verifyToken, Faqadd);
router.get("/getaboutus",verifyToken, getAboutus);
router.get("/getfaq",verifyToken, getFaq);
router.get("/getlandingpagefaq", getLandingPageFaq);
router.post("/howitworks",verifyToken, HowitworksAdd);
router.get("/gethowitworks",verifyToken, getHowitWorks);
router.get("/getlandingpagehowitworks", getLandingPageHowitworks);
router.delete("/deletefaq",verifyToken, DeleteFaqById);
router.delete("/deletehowitworks",verifyToken, DeleteHowitworksById);
router.post("/addcontactus",verifyToken, AddContactUs);


router.put("/updatefaq",verifyToken, updateFaq);
router.put("/updatehowitworks",verifyToken, updateHowitWorks);
router.get("/getfaqdetailsbyid",verifyToken, getFaqDetailsByid);
router.get("/gethowitworksdetailsbyid",verifyToken, getHowitworksDetailsByid)
router.post("/adddashboardcontactus", AddDashboardContactUs)
router.get("/contactsupportlistbyid",verifyToken, getContactSupportlistbyid)
router.get("/getPubsterAndPub", getPubsterAndPub)
router.get("/getTips", getTips)




export default router;

import express from "express";
import {
  getAdminNotificationList,
  getNotificationList,
  NotificationDelete,
  UpdateNotificationMarkRead,
} from "../controller/notifications/NotificationMessage";

import {
  AddNotification,
  Notification_Lists,
  getNotificationdetailsByid,
  updateNotification,
  DeleteNotification,
  AddEmailTemplate,
  Template_Lists,
  getEmailsByid,
  updateTemplate,
  DeleteTemplate,
} from "../controller/Super-admin/notification/Notification";

import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/addnotification", verifyToken, AddNotification);
router.get("/notificationlist", verifyToken, Notification_Lists);
router.get("/getnotificationbyid", verifyToken, getNotificationdetailsByid);
router.put("/updatenotification", verifyToken, updateNotification);
router.delete("/deletenotification", verifyToken, DeleteNotification);

router.get("/getnotificationlist", verifyToken, getNotificationList);
router.put("/updatemarkread", verifyToken, UpdateNotificationMarkRead);

router.post("/addemailtemplate", verifyToken, AddEmailTemplate);
router.get("/templatelists", verifyToken, Template_Lists);
router.get("/getemailsbyid", verifyToken, getEmailsByid);
router.put("/updatetemplate", verifyToken, updateTemplate);
router.delete("/deletetemplate", verifyToken, DeleteTemplate);

router.get("/getadminnotificationlist", verifyToken, getAdminNotificationList);
router.delete("/notificationdelete", verifyToken, NotificationDelete);

export default router;

import mongoose from "mongoose";
import NotificationMessage from "../../model/NotificationMessage";
import Notification from "../../model/NotificationSettings";
import User from "../../model/user";

export const NotificationList = async (data) => {
  try {
    let condition = {
      recieverId: mongoose.Types.ObjectId(data),
    };

    const result = await NotificationMessage.aggregate([
      {
        $match: condition,
      },
      {
        $sort: { createdAt: -1 }, // Sort in descending order based on createdAt
      },
      {
        $limit: 10, // Limit the result to 10 records
      },
    ]);
    return result;
  } catch (e) {}
};

// Send Tip
export const addNotifications = async (data) => {
  let resMessageData = await Notification.findOne({
    type: data.type,
  });
  let userData = await User.findOne({
    _id: mongoose.Types.ObjectId(data.senderId),
  });
  let responseMsg;
  if (data.type === "PubstarSendRequest") {
    responseMsg = resMessageData.notification_content.replace(
      "Pubstar",
      userData.full_name
    );
  } else if (data.type === "PubstarReqAccept") {
    responseMsg = resMessageData.notification_content.replace(
      "Pub",
      userData.full_name
    );
  } else if (data.type === "PubstarReqReject") {
    responseMsg = resMessageData.notification_content.replace(
      "pub",
      userData.full_name
    );
  } else if (data.type === "PaymentTip") {
    responseMsg = resMessageData.notification_content.replace(
      "customer",
      userData.full_name
    );
  } else if (data.type === "GuestPaymentTip") {
    responseMsg = resMessageData.notification_content.replace("guest", "guest");
  }
  try {
    const content = new NotificationMessage({
      recieverId: data.recieverId,
      senderId: data.senderId,
      message: responseMsg,
      type: data.type,
    });

    const notificationData = await content.save();
    return notificationData;
  } catch (e) {}
};

export const getNotificationList = async (req, res) => {
  try {
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = NotificationMessage.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          recieverId: mongoose.Types.ObjectId(req.query._id),
        },
      },
    ];

    const showResult = NotificationMessage.aggregatePaginate(
      myAggregate,
      options,
      (err, result) => {
        if (err) {
          res.send({ status: false, message: "Unable to fetch" });
        } else {
          res.send({ status: true, result: result });
        }
      }
    );
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

export const Super_Admin_NotificationList = async (data) => {
  try {
    let condition = {
      $or: [{ type: "PaymentTip" }, { type: "GroupTipDistribute" }],
    };

    const result = await NotificationMessage.aggregate([
      {
        $match: condition,
      },
      {
        $sort: { createdAt: -1 }, // Sort in descending order based on createdAt
      },
      {
        $limit: 5, // Limit the result to 10 records
      },
    ]);
    return result;
  } catch (e) {}
};

export const UpdateNotificationMarkRead = async (req, res) => {
  try {
    let jsondata = {
      read: 1,
    };
    const result = await NotificationMessage.updateOne(
      { _id: mongoose.Types.ObjectId(req.body.data) },
      { $set: jsondata },
      { new: true }
    );
    if (!result) {
      res.send({ status: false, message: "Unable to update" });
    } else {
      res.send({
        status: true,
        message: "Accept Invitation successfully",
        result: result,
      });
    }
  } catch (e) {
    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};

export const addDistributegroupTip = async (data) => {
  let resMessageData = await Notification.findOne({
    type: "GroupTipDistribute",
  });

  let restroData = await User.findOne({
    _id: mongoose.Types.ObjectId(data.senderId),
  });

  let adminData = await User.findOne({
    role: 0,
  });
  let responseMsg = resMessageData.notification_content.replace(
    "pub",
    restroData.full_name
  );
  try {
    const content = new NotificationMessage({
      recieverId: adminData._id,
      senderId: data.senderId,
      message: responseMsg,
      type: data.type,
    });

    const notificationData = await content.save();
    return notificationData;
  } catch (e) {}
};






export const getAdminNotificationList = async (req, res) => {
  try {
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = NotificationMessage.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          $or: [{ type: "PaymentTip" }, { type: "GroupTipDistribute" }],
        },
      },
    ];

    const showResult = NotificationMessage.aggregatePaginate(
      myAggregate,
      options,
      (err, result) => {
        if (err) {
          res.send({ status: false, message: "Unable to fetch" });
        } else {
          res.send({ status: true, result: result });
        }
      }
    );
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};



export const NotificationDelete = async (req, res) => {
  try {
    let _id = req.query._id;
    const user = await NotificationMessage.deleteOne({
      _id: mongoose.Types.ObjectId(_id),
    });
    if (user) {
      res.send({
        status: true,
        message: "Data removed successfully",
        result: user,
      });
    }
  } catch (e) {
    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};

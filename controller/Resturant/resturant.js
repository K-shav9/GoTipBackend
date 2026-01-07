import mongoose from "mongoose";
import { SendEmail } from "../../middleware/sendMail";
import EmailTemplate from "../../model/EmailTemplate";
import StaffRequest from "../../model/StaffRequest";
import Tip from "../../model/Tip";
import User from "../../model/user";
import { response } from "express";

/*--------@Invitation Request Sent Api----------- */

const sendRequestEmail = async (resto_id, staff_id) => {
  let restaurantData = await User.findOne({
    _id: mongoose.Types.ObjectId(resto_id),
  });
  let staffData = await User.findOne({
    _id: mongoose.Types.ObjectId(staff_id),
  });

  let emailTemplate = await EmailTemplate.findOne({
    template_name:"Pubstar_Requests"
  });
  let text = `
    <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Hello ${restaurantData?.restaurant_name}</h2>  
    <p> ${staffData?.full_name} has joined your team! </p>
    <p>You can manage your new PubStar by clicking here.</b></p>
    <p>GoTipMe</p>
  </div>`;
  emailTemplate.subject = emailTemplate.subject +' - '+restaurantData?.restaurant_name
  SendEmail(
    staffData.email,
    restaurantData.email,
    emailTemplate.subject,
    text
  );
}

export const Invitationrequestsent = async (req, res) => {
  try {
    const newDate = new Date();
    const Invitationrequest = new StaffRequest({
      resto_id: req.body.resto_id,
      staff_id: req.body.staff_id,
      staff_name: req.body.staff_name,
      request_date: newDate,
      description: req.body.description,
      createdBy: req.body.createdBy,
      updatedBy: req.body.updatedBy,
      createdAt: req.body.createdAt,
      status: req.body.status,
      is_closed: req.body.is_closed
    });

    const fetchUser  = await User.find({_id:mongoose.Types.ObjectId(req.body.resto_id) , requestCode :req.body.requestCode})
    if(fetchUser.length <1 ){
      res.send({
        status: false,
        message: "RequestCode Not Valid",
        result: [],
      });
      return
    }

    const data = await Invitationrequest.save();
    sendRequestEmail(data.resto_id, data.staff_id)

    let jsondata = {
      is_closed: req.body.is_closed,
      status: req.body.status,
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );

    res.send({
      status: true,
      message: "Invitation Request added",
      result: data,
    });
  } catch (e) {
    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};

/*--------@Get Invitation Request Sent Api----------- */

export const InvitationRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 1,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_closed: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Accept Invitation Api----------- */

export const AcceptInvitation = async (req, res) => {
  try {
    let jsondata = {
      is_closed: req.body.is_closed,
      status: req.body.status,
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
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

/*--------@Reject Invitation Api----------- */

export const RejectInvitation = async (req, res) => {
  try {
    let jsondata = {
      is_closed: req.body.is_closed,
      status: req.body.status,
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );
    if (!result) {
      res.send({ status: false, message: "Unable to update" });
    } else {
      res.send({
        status: true,
        message: "Reject Invitation successfully",
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

/*--------@Accept Request List Api----------- */

export const AccepteRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_closed: true,
          status: "1",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Reject Request List Api----------- */

export const RejectRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_closed: true,
          status: "2",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Restaurant Request List Api----------- */

export const RestaurantRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 2,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          staff_id: mongoose.Types.ObjectId(req.query.staff_id),
          is_closed: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Restaurant Accept List Api----------- */

export const RestaurantAccepteRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          staff_id: mongoose.Types.ObjectId(req.query.staff_id),
          is_closed: true,
          status: "1",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Restaurant Reject List Api----------- */

export const RestaurantRejectedRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 2,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          staff_id: mongoose.Types.ObjectId(req.query.staff_id),
          is_closed: true,
          status: "2",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@Cancelled Restro Invitation Api----------- */

export const CancelledRestroInvitation = async (req, res) => {
  try {
    let jsondata = {
      is_closed: req.body.is_closed,
      status: req.body.status,
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );
    if (!result) {
      res.send({ status: false, message: "Unable to update" });
    } else {
      res.send({
        status: true,
        message: "Cancelled restro  successfully",
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

/*--------@Cancelled Restro Request lIst Api----------- */

export const RestaurantcancelledRequestlist = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          staff_id: mongoose.Types.ObjectId(req.query.staff_id),
          is_closed: true,
          status: "3",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    const showResult = StaffRequest.aggregatePaginate(
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

/*--------@All Active Staff lIst Api----------- */

export const AllactiveStaffList = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),

      status: "1",
    };

    const result = await StaffRequest.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your cancelled requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@All  Staff lIst Api----------- */

export const AllStafflist = async (req, res) => {
  const { searchText } = req.query;
  try {
    let orderBy = {};
    var matchFilter = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;
    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    if (searchText != "") {
      matchFilter = {
        $match: {
          "userDetails.full_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "userDetails.full_name": { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          status: "1",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      { $unwind: "$userDetails" },
    ];

    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }

    const result = StaffRequest.aggregatePaginate(
      
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

/*--------@All No Staff lIst Api----------- */

export const AllNoOfStafflist = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
      status: "1",
    };

    const result = await StaffRequest.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your cancelled requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Staff Bulk Delete Api----------- */

export const bulkDelete = async (req, res) => {
  try {
    const { _id } = req.body;
    const result = await StaffRequest.deleteMany({
      resto_id: mongoose.Types.ObjectId(_id.resto_id),
      staff_id: { $in: _id._id },
    });
    res.send({ message: "deleted", result: result, status: true });
  } catch (error) {}
};

/*--------@Get restro Details Api----------- */

export const getrestoDetailsById = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
    };

    const result = await StaffRequest.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "restoDetails",
        },
      },
      {
        $unwind: {
          path: "$restoDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your stafflist",
        result: result[0],
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Get Group staff by id Api----------- */

export const getGroupStaffbyId = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    let query = {};
    var matchFilter = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    if (searchText != "") {
      matchFilter = {
        $match: {
          "customerDetails.full_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "customerDetails.full_name": { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_group_tip: true,
          group_tip_status: "1",
          payment_status : true,
          ...(start_date && end_date
            ? {
                createdAt: {
                  $gte: new Date(start_date),
                  $lt: endOfDay,
                },
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = Tip.aggregatePaginate(
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

/*--------@Get restro staff by id Api----------- */

export const getRestroStaffTipbyId = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    let query = {};
    var matchFilter = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    if (searchText != "") {
      matchFilter = {
        $match: {
          "customerDetails.full_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "customerDetails.full_name": { $regex: "", $options: "i" },
        },
      };
    }

    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_group_tip: false,
          payment_status : true,
          ...(start_date && end_date
            ? {
                createdAt: {
                  $gte: new Date(start_date),
                  $lt: endOfDay,
                },
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff.staff_id",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "restroDetails",
        },
      },
      {
        $unwind: {
          path: "$restroDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = Tip.aggregatePaginate(
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

/*--------@Get  staff by id Api----------- */

export const getstaffDetailsById = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      _id: mongoose.Types.ObjectId(req.query._id),
    };

    const result = await StaffRequest.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "users",
          localField: "staff_id",
          foreignField: "_id",
          as: "staffDetails",
        },
      },
      {
        $unwind: {
          path: "$staffDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "tips",
          localField: "staff_id",
          foreignField: "_id",
          as: "TipDetails",
        },
      },
      {
        $unwind: {
          path: "$TipDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your stafflist",
        result: result[0],
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Get  staff Status Api----------- */

export const StaffStatus = async (req, res) => {
  try {
    let jsondata = {
      status: req.body.status,
      manage_staff_edit: req.body.manage_staff_edit,
      manage_staff_delete: req.body.manage_staff_delete,
      invitation_request: req.body.invitation_request,
      tip_management: req.body.tip_management,
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
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

/*--------@Get Group Distributed Tip Api----------- */

export const getGroupDistributedTipList = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    let query = {};
    var matchFilter = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    if (searchText != "") {
      matchFilter = {
        $match: {
          "customerDetails.full_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "customerDetails.full_name": { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_group_tip: true,
          group_tip_status: "2",
          payment_status : true,
          ...(start_date && end_date
            ? {
                createdAt: {
                  $gte: new Date(start_date),
                  $lt: endOfDay,
                },
              }
            : {}),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = Tip.aggregatePaginate(
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

/*--------@Get Total Amount Api----------- */

export const TotalAmountforrestro = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
      payment_status : true,
    };

    const result = await Tip.aggregate([
      {
        $match: condition,
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your cancelled requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};






export const Staff_request_accepted = async (req, res) => {
  try {
    let jsondata = {
      staff_request_accepted: req.body.staff_request_accepted,
    };
    const result = await User.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
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









export const No_Of_InvitationRequestList = async (req, res) => {
  try {
    let condition = {};
    condition = {
      ...condition,
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          is_closed: false,
    };

    const result = await StaffRequest.aggregate([
      {
        $match: condition,
      },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "staff_id",
      //     foreignField: "_id",
      //     as: "userDetails",
      //   },
      // },

      // {
      //   $unwind: {
      //     path: "$userDetails",

      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "users",
      //     localField: "resto_id",
      //     foreignField: "_id",
      //     as: "restoDetails",
      //   },
      // },
      // {
      //   $unwind: {
      //     path: "$restoDetails",

      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your staff list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};
export const getPubDashboardData = async (req, res) => {
  const { searchText } = req.query;
  try {
    const {  resto_id} = req.query;
    var currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    var query = {
      resto_id: mongoose.Types.ObjectId(resto_id), 
      payment_status : true,
      is_group_tip :true,
      group_tip_status : "1"
    };
    const data = await Tip.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "pub",
        },
      },
      {
        $unwind: {
          path: "$pub",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          createdAt: 1,
          customer_id:1,
          createdDate: {
            $concat: [
              { $dateToString: { format: "%d", date: "$createdAt" } }," ",
                {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', { $month: "$createdAt" }]
                        }
                    }
                },
              
            ]
        },
          customerDetails: "$customer",
          pubDetails:"$pub", 
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
          tip_amount: {
            $cond: {
              if: { $eq: ["$is_group_tip", true] }, 
              then: "$total_staff_given_amount", 
              else: "$staff_tip_amount"
            },
          },
        },
      },
    ])
const fetchPubstar = await StaffRequest.aggregate([
{$match:{resto_id:mongoose.Types.ObjectId(resto_id) ,status:"1"}},
{
  $lookup: {
    from: "users",
    localField: "staff_id",
    foreignField: "_id",
    as: "staffDetails",
  },
}, {
  $unwind: {
    path: "$staffDetails",
    preserveNullAndEmptyArrays: true,
  },
},
]).limit(6).sort({request_date:-1})

const customer = await Tip.aggregate([
  {$match:{resto_id: mongoose.Types.ObjectId(resto_id), 
    payment_status : true}},
  {
    $lookup: {
      from: "users",
      localField: "customer_id",
      foreignField: "_id",
      as: "customer",
    },
  }, {
    $unwind: {
      path: "$customer",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: "$customer._id",
      full_name: { $first: "$customer.full_name" },
    },
  },
  {
    $match: {
      _id: { $ne: null }, 
      full_name: { $ne: null }, 
    },
  },

])
const fetchLastTips = await Tip.count({ resto_id:mongoose.Types.ObjectId(resto_id),  createdAt:{$gte: new Date(currentDate.setDate(currentDate.getDate() -3 ))}})
    res.send({ status: false, result: {statData :data ,pubstar:fetchPubstar  ,customer:customer  , lastTip:fetchLastTips} });


  } catch (e) {
    console.log("" ,e.message)
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

export const getStaffTip = async (req, res) => {
  try {
    const { start_date, days , sort , resto_id , customer_id ,status , tabs} = req.query;
    var query = {
      resto_id: mongoose.Types.ObjectId(resto_id),
      payment_status : true,
      
    };
    if(tabs === "false") query.is_group_tip  = false
   else if(tabs === "true"){
    query.is_group_tip  = true
    query.group_tip_status = status
   } 
    var currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    var filterDate = new Date(new Date().setHours(0, 0, 0, 0));
    filterDate.setDate(filterDate.getDate() - days);
    if(days != 0){
      query.createdAt = {
        $gte: new Date(filterDate),
        $lt: new Date(currentDate.setDate(currentDate.getDate() + 1)),
      };
    }
    if(customer_id != "") query.customer_id = mongoose.Types.ObjectId(customer_id)
    let sorting = {};
    if (sort != ""){ if(tabs === "true"){
      sorting.total_staff_given_amount = -1;
         
    }else{
      sorting.staff_tip_amount= -1
    }  
  }
    else sorting.createdAt = -1;

    const data = await Tip.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "pub",
        },
      },
      {
        $unwind: {
          path: "$pub",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          createdAt: 1,
          createdDate: {
            $concat: [
              { $dateToString: { format: "%d", date: "$createdAt" } }," ",
                {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', { $month: "$createdAt" }]
                        }
                    }
                },
              
            ]
        },
           customer: "$customer",
          pub:"$pub", 
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
          total_staff_given_amount:1,
          staff_tip_amount:1,
          group_tip_status:1,
          is_guest_tip:1,
          guest:1
        
        },
      },


  
    ]).sort(sorting);

    res.send({ status: false, result: data });
  } catch (e) {
    console.log("sadasdasd" ,e.message)
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};


export const rejoinPub = async (req, res) => {
  try {
    let jsondata = {
      status: "0",
      is_closed:"false"
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );
    if (!result) {
      res.send({ status: false, message: "Unable to update" });
    } else {
      res.send({
        status: true,
        message: "Rejoin pub successfully",
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

export const rejoinPub1 = async (req, res) => {
  try {
    
    const fetchStaffRequest = await StaffRequest.findById(req.body._id)
    const fetchCode  = await User.find({_id:mongoose.Types.ObjectId(fetchStaffRequest.resto_id) , requestCode:req.body.requestCode});
    if(fetchCode.length <1){
      res.send({ status: false, message: "RequestCode is Not Valid" });
      return
    }
    let jsondata = {
      status: "0",
      is_closed:"false"
    };
    const result = await StaffRequest.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );
    sendRequestEmail(fetchStaffRequest.resto_id,fetchStaffRequest.staff_id)
    if (!result) {
      res.send({ status: false, message: "Unable to update" });
    } else {
      
      let jsondata = {
        is_closed: req.body.is_closed,
        status: req.body.status,
      };
      const result = await StaffRequest.updateOne(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        { $set: jsondata },
        { new: true }
      );
      // if (!result) {
      //   res.send({ status: false, message: "Unable to update" });
      // } else {
      //   res.send({
      //     status: true,
      //     message: "Accept Invitation successfully",
      //     result: result,
      //   });
      // }
      res.send({
        status: true,
        message: "Rejoin pub successfully",
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
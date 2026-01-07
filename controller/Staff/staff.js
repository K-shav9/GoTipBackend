import mongoose from "mongoose";
import StaffRequest from "../../model/StaffRequest";
import Tip from "../../model/Tip";
import User from "../../model/user";

/*--------@Get No of Staff Tipping List Api----------- */

export const NoofStaffTippingList = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
      payment_status : true,
    };

    const result = await Tip.aggregate([
      {
        $match: condition,
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
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your rejected requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Get Staff Group Tipping List Api----------- */

export const StaffGroupTippingList = async (req, res) => {
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
          "restroDetails.restaurant_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "restroDetails.restaurant_name": { $regex: "", $options: "i" },
        },
      };
    }

    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          "group_staff.group_staff_id": mongoose.Types.ObjectId(
            req.query.group_staff_id
          ),
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

/*--------@Get Details by id Api----------- */

export const getDetialsbyId = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,

      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
      staff_id: mongoose.Types.ObjectId(req.query.staff_id),
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
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your GroupTip",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Restaurant Leave Request Api----------- */

export const RestaurantLeaveRequest = async (req, res) => {
  try {
    let jsondata = {
      status: "4",
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

/*--------@Staff Restro List Api----------- */

export const StaffrestroList = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      staff_id: mongoose.Types.ObjectId(req.query.staff_id),
      status: "1",
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
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your rejected requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@My Previous Job List Api----------- */

export const MyPreviousJobList = async (req, res) => {
  try {
    let query = {};
    // let filter = "";
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          staff_id: mongoose.Types.ObjectId(req.query.staff_id),
          status: "4",
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

/*--------@Get Previous Job Restro Profile Api----------- */

export const getPreviousJobRestroProfile = async (req, res) => {
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
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your GroupTip",
        result: result[0],
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Get No of Customer Tip Api----------- */

export const getNoofCustomerTipbyid = async (req, res) => {
  try {
    let condition = {};

    condition = {
      "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
      payment_status : true,
    };
    let data = await Tip.aggregate([
      {
        $match: condition,
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
    ]);

    res.send({ status: true, message: "User data found", result: data });
  } catch (e) {
    res.send({
      status: false,

      messgae: "Oops!! something went wrong",
    });
  }
};
/*--------@Get Customer Tip  Api----------- */

export const getCustomerTipbyid = async (req, res) => {
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
          "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
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

/*--------@Get Restro List Api----------- */

export const restroList = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      staff_id: mongoose.Types.ObjectId(req.query.staff_id),
      //  status:"1"
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
          as: "restroDetails",
        },
      },
      {
        $unwind: {
          path: "$restroDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your rejected requested list",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Get Customer Staff Tip list Api----------- */

export const CustomerandStaffTipList = async (req, res) => {
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
          $or: [
            {
              "group_staff.group_staff_id": mongoose.Types.ObjectId(
                req.query.group_staff_id
              ),
              payment_status : true,
            },
            { "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
            payment_status : true, },
          ],
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

export const deleteTipMessage = async (req, res) => {
  try {
    const { tipID } = req.query;
    Tip.updateOne(
      { _id: mongoose.Types.ObjectId(tipID) },
      { $set: {customer_comment:""} },
      (err, result) => {
        if (err) {
          return  res.send({ status: false, message: "Unable to fetch" });
        } else {
          return  res.send({ status: true, message: "Deleted Successfullu!" , });
          
         
        }
      }
    );
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};
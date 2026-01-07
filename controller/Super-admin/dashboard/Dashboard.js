import mongoose from "mongoose";
import Tip from "../../../model/Tip";
import StaffRequest from "../../../model/StaffRequest";

/*--------@Get No of total tip Api----------- */

export const No_of_Total_Tip = async (req, res) => {
  const result = await Tip.find({ payment_status : true});
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

/*--------@Get No of Request Recieved Api----------- */

export const No_of_Request_Recieved = async (req, res) => {
  const result = await StaffRequest.find({ status: "0" });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

/*--------@Get Recent Tip list Api----------- */

export const RecentTipList = async (req, res) => {
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

/*--------@Get Pub Star Tip list Api----------- */

export const getPubstarTipsList = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    var matchFilter = {};
    let query = {};
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
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
          payment_status : true,
          is_group_tip: false,
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

/*--------@Get Tip list Api----------- */

export const getGroupTipsList = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    var matchFilter = {};
    let query = {};
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
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
          payment_status : true,
          is_group_tip: true,
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

/*--------@Get No of Pubstar Api----------- */

export const No_of_Pubstar_Tip = async (req, res) => {
  const result = await Tip.find({ is_group_tip: false, payment_status : true, });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

/*--------@Get No of Group Tip Api----------- */

export const No_of_Group_Tip = async (req, res) => {
  const result = await Tip.find({ is_group_tip: true, payment_status : true, });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

/*--------@Get Pending Request Api----------- */

export const getPendingRequests = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    var matchFilter = {};
    let query = {};
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    if (searchText != "") {
      matchFilter = {
        $match: {
          "restoDetails.restaurant_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "restoDetails.restaurant_name": { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = StaffRequest.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          status: "0",
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
          as: "restoDetails",
        },
      },
      {
        $unwind: {
          path: "$restoDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
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

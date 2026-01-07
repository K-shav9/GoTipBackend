import mongoose from "mongoose";
import Tip from "../../../model/Tip";

/*--------@Super Admin Service Fees List Api----------- */

export const Super_Admin_Service_Fee_List = async (req, res) => {
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
          payment_status: true,
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

      { $unwind: "$customerDetails" },
      {
        $lookup: {
          from: "users",
          localField: "resto_id",
          foreignField: "_id",
          as: "restroDetails",
        },
      },

      { $unwind: "$restroDetails" },
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

// Payment History in superadmin

export const getPaymentHistory = async (req, res) => {
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
          payment_status: true,
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

import mongoose from "mongoose";
import User from "../../model/user";
import ServiceFees from "../../model/ServiceFees";
import Tip from "../../model/Tip";
export const Super_Admin_Restaurant_List = async (req, res) => {
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
          restaurant_name: {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          restaurant_name: { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = User.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          role: "2",
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = User.aggregatePaginate(
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

export const No_of_Restaurant_list = async (req, res) => {
  const result = await User.find({ role: "2" });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

export const Super_Admin_Staff_List = async (req, res) => {
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
          full_name: {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          full_name: { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = User.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          role: "3",
        },
      },
      {
        $lookup: {
          from: "staffrequests",
          localField: "_id",
          foreignField: "staff_id",
          as: "userDetails",
        },
      },

      { $unwind: "$userDetails" },
      {
        $lookup: {
          from: "users",
          localField: "userDetails.resto_id",
          foreignField: "_id",
          as: "restroDetails",
        },
      },

      { $unwind: "$restroDetails" },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = User.aggregatePaginate(
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
export const No_of_Staff_list = async (req, res) => {
  const result = await User.find({ role: "3" });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

export const Super_Admin_Customer_List = async (req, res) => {
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
          full_name: {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          full_name: { $regex: "", $options: "i" },
        },
      };
    }
    let myAggregate = User.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          role: "1",
        },
      },
    ];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = User.aggregatePaginate(
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
export const No_of_Customer_list = async (req, res) => {
  const result = await User.find({ role: "1" });
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

export const SetupServiceFees = async (req, res) => {
  const { min, max, servicefees } = req.body;
  try {
    let result = new ServiceFees({
      min,
      max,
      servicefees,
    });
    const resObject = await result.save();
    // Send Email To user
    res.send({
      status: true,
      message: "Service Fees added",
      result: resObject,
    });
  } catch (error) {}
};

// export const Graph_Tip_List = async (req, res) => {

//     try {
//       const { start_date, end_date } = req.query;
//     const endOfDay = new Date(end_date);
//     endOfDay.setDate(endOfDay.getDate() + 1);

//       // let filter = "";
//       let orderBy = {};

//       // if (req.query.filter) filter = req.query.filter;
//       orderBy.createdAt = -1;

//       let options = {  sort: orderBy };

//       let myAggregate = Tip.aggregate();
//       myAggregate._pipeline = [
//         {
//           $match: {
//             ...(start_date && end_date
//               ? {
//                   createdAt: {
//                     $gte: new Date(start_date),
//                     $lt: endOfDay,
//                   },
//                 }
//               : {}),
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             localField: "customer_id",
//             foreignField: "_id",
//             as: "customerDetails",
//           },
//         },
//         {
//           $unwind: {
//             path: "$customerDetails",

//             preserveNullAndEmptyArrays: true,
//           },

//         },
//         {
//             $lookup: {
//               from: "users",
//               localField: "resto_id",
//               foreignField: "_id",
//               as: "restroDetails",
//             },
//           },
//           {
//             $unwind: {
//               path: "$restroDetails",

//               preserveNullAndEmptyArrays: true,
//             },

//           },
//       ];

//       const showResult = Tip.aggregatePaginate(
//         myAggregate,
//         options,
//         (err, result) => {
//           if (err) {
//             res.send({ status: false, message: "Unable to fetch" });
//           } else {
//             res.send({ status: true, result: result });
//           }
//         }
//       );
//     } catch (e) {
//       res.send({ status: false, messgae: "Oops!! no results found" });
//     }
//   };

// export const Graph_Tip_List = async (req, res) => {
//   try {
//     let condition = {};
//     const { start_date, end_date } = req.query;
//     const endOfDay = new Date(end_date);
//     endOfDay.setDate(endOfDay.getDate() + 1);

//     const result = await Tip.aggregate([
//       {
//         $match: {
//           ...(start_date && end_date
//             ? {
//                 createdAt: {
//                   $gte: new Date(start_date),
//                   $lt: endOfDay,
//                 },
//               }
//             : {}),
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "customer_id",
//           foreignField: "_id",
//           as: "customerDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$customerDetails",

//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "resto_id",
//           foreignField: "_id",
//           as: "restroDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$restroDetails",

//           preserveNullAndEmptyArrays: true,
//         },
//       },
//     ]);

//     if (result) {
//       res.send({
//         status: true,
//         message: "This is your staff list",
//         result: result,
//       });
//     }
//   } catch (e) {
//     res.send({ status: false, messgae: "Oops!! no results found" });
//   }
// };

export const Graph_Tip_List = async (req, res) => {
  try {
    let condition = {};

    const { start_date, end_date } = req.query; // Create an endOfDay variable by adding one day to the end_date and use it to filter the tips

    const endOfDay = new Date(end_date);

    endOfDay.setDate(endOfDay.getDate() + 1); // Use the aggregation pipeline to filter and group the tips based on the start and end dates

    const result = await Tip.aggregate([
      {
        $match: {
          payment_status : true,
          ...(start_date && end_date
            ? { createdAt: { $gte: new Date(start_date), $lt: endOfDay } }
            : {}),
        },
      },

      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },

          donation_amount: { $sum: "$donation_amount" },

          service_charge: { $sum: "$service_charge" },

          groupTipAmount: {
            $sum: {
              $cond: {
                if: "$is_group_tip",
                then: "$total_tip_amount",
                else: 0,
              },
            },
          },

          staffTipAmount: {
            $sum: {
              $cond: {
                if: "$is_group_tip",
                then: 0,
                else: "$total_tip_amount",
              },
            },
          },
        },
      },

      {
        $project: {
          _id: 1,

          donation_amount: 1,

          service_charge: 1,

          groupTipAmount: 1,

          staffTipAmount: 1,
        },
      },
    ]); // If there are results, send them as a response

    if (result) {
      res.send({
        status: true,

        message: "This is your staff list",

        result: result,
      });
    }
  } catch (e) {
    // If there's an error, send an error response

    res.send({
      status: false,

      message: "Oops!! no results found",
    });
  }
};

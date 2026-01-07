import mongoose from "mongoose";
import StaffRequest from "../../model/StaffRequest";
import Tip from "../../model/Tip";
import User from "../../model/user";
import { messageID, messages, responseCodes } from "../../constant";
import { log } from "handlebars";

/*--------@ All satff List in customer interface----------- */

export const CustomerAllStafflist = async (req, res) => {
  try {
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
export const PubAllList = async (req, res) => {
  try {
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // if (req.query.filter) filter = req.query.filter;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = User.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          role: "2",
        },
      },
    ];

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

// export const staffAllList = async (req, res) => {
//   try {
//     let orderBy = {};
//     let limit = 10,
//       page = 1;
//     if (req.query.page) page = req.query.page;
//     if (req.query.limit) limit = req.query.limit;
//     // if (req.query.filter) filter = req.query.filter;
//     orderBy.createdAt = -1;

//     let options = { page, limit: limit, skip: limit * page, sort: orderBy };

//     let myAggregate = User.aggregate();
//     myAggregate._pipeline = [
//       {
//         $match: {
//           role: "3",
//         },
//       },
//     ];

//     const showResult = User.aggregatePaginate(
//       myAggregate,
//       options,
//       (err, result) => {
//         if (err) {
//           res.send({ status: false, message: "Unable to fetch" });
//         } else {
//           res.send({ status: true, result: result });
//         }
//       }
//     );
//   } catch (e) {
//     res.send({ status: false, messgae: "Oops!! no results found" });
//   }
// };

export const staffAllList = async (req, res) => {
  try {
    let orderBy = {};
    let limit = 10,
      page = 1;

    // Handle pagination and sorting
    if (req.query.page) page = parseInt(req.query.page);
    if (req.query.limit) limit = parseInt(req.query.limit);
    orderBy.createdAt = -1;

    let options = {
      page,
      limit: limit,
      skip: limit * (page - 1),
      sort: orderBy,
    };

    // Create a combined aggregation pipeline
    let myAggregate = StaffRequest.aggregate([
      {
        // First check for staff in StaffRequest
        $match: {
          status: "1", // Ensure it's an active staff request
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
        $match: {
          // Optional: you can match users with certain conditions if needed
          "userDetails.role": "3", // Staff role
        },
      },
      {
        $unionWith: {
          coll: "users", // Check users not in StaffRequest table
          pipeline: [
            {
              $match: {
                role: "3", // Fetch users with staff role
                _id: { $nin: await StaffRequest.distinct("staff_id") }, // Exclude users in StaffRequest
              },
            },
          ],
        },
      },
    ]);

    // Execute pagination and aggregation
    StaffRequest.aggregatePaginate(myAggregate, options, (err, result) => {
      if (err) {
        res.send({ status: false, message: "Unable to fetch data" });
      } else {
        res.send({ status: true, result: result });
      }
    });
  } catch (e) {
    res.send({ status: false, message: "Oops!! no results found" });
  }
};

// export const staffAllList = async (req, res) => {
//   try {
//     let orderBy = {};
//     let limit = 10,
//       page = 1;

//     // Handle pagination and sorting
//     if (req.query.page) page = parseInt(req.query.page);
//     if (req.query.limit) limit = parseInt(req.query.limit);
//     orderBy.createdAt = -1;

//     let options = {
//       page,
//       limit: limit,
//       skip: limit * (page - 1),
//       sort: orderBy,
//     };

//     // Step 1: Create an aggregation pipeline for StaffRequest
//     let myAggregate = StaffRequest.aggregate([
//       {
//         $match: {
//           status: "1", // Ensure it's an active staff request
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "staff_id",
//           foreignField: "_id",
//           as: "userDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$userDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "resto_id",
//           foreignField: "_id",
//           as: "restoDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$restoDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $sort: { createdAt: 1 }, // Sort by earliest joining date (ascending)
//       },
//       {
//         $group: {
//           _id: "$staff_id", // Group by staff_id (ensuring unique staff records)
//           firstJoinRecord: { $first: "$$ROOT" }, // Take the first (earliest) record for each staff
//         },
//       },
//       {
//         $replaceRoot: { newRoot: "$firstJoinRecord" }, // Replace the document with the first record
//       },
//     ]);

//     // Step 2: Execute the aggregation query for StaffRequest and paginate
//     const staffRequestResults = await StaffRequest.aggregatePaginate(
//       myAggregate,
//       options
//     );

//     // Step 3: Get all staff from the User collection who are not in StaffRequest
//     let staffIdsInRequest = staffRequestResults.docs.map(
//       (staff) => staff.staff_id
//     );

//     let userAggregate = User.aggregate([
//       {
//         $match: {
//           _id: { $nin: staffIdsInRequest }, // Fetch users not in the staff request table
//           role: "3", // Ensure the role is 'staff'
//         },
//       },
//     ]);

//     const userResults = await User.aggregatePaginate(userAggregate, options);

//     // Combine the results from StaffRequest and Users collection
//     const combinedResults = [...staffRequestResults.docs, ...userResults.docs];

//     // Return the combined results
//     res.send({
//       status: true,
//       result: {
//         // staffResults: staffRequestResults,
//         // userResults: userResults,
//         combinedResults: combinedResults,
//       },
//     });
//   } catch (e) {
//     res.send({ status: false, message: "Oops!! no results found" });
//   }
// };

/*--------@ Get Staff Details by id----------- */

export const getstaffDetailsById = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      staff_id: mongoose.Types.ObjectId(req.query._id),
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

// export const getstaffDetailsById = async (req, res) => {
//   try {
//     const { _id, resto_id } = req.query;

//     if (!_id || !resto_id) {
//       return res.send({
//         status: false,
//         message: "Missing required parameters: _id or resto_id",
//       });
//     }

//     const condition = {
//       staff_id: mongoose.Types.ObjectId(_id),
//       resto_id: mongoose.Types.ObjectId(resto_id),
//     };

//     const result = await StaffRequest.aggregate([
//       {
//         $match: condition,
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "resto_id",
//           foreignField: "_id",
//           as: "restoDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$restoDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "staff_id",
//           foreignField: "_id",
//           as: "staffDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$staffDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//     ]);

//     if (result && result.length > 0) {
//       res.send({
//         status: true,
//         message: "This is your staff list",
//         result: result[0],
//       });
//     } else {
//       res.send({
//         status: false,
//         message: "No matching staff details found for the given restaurant",
//       });
//     }
//   } catch (e) {
//     console.error("Error fetching staff details:", e);
//     res.send({ status: false, message: "Oops!! Something went wrong" });
//   }
// };

export const getStaffOnly = async (req, res) => {
  try {
    let condition = {
      _id: mongoose.Types.ObjectId(req.query._id),
    };
    const result = await User.aggregate([
      {
        $match: condition,
      },
    ]);
    // console.log('........result', result);
    if (result) {
      res.send({
        status: true,
        message: "This is your Staff",
        result: result[0],
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@ Get Staff Profile by id----------- */

export const getstaffProfileDetailsById = async (req, res) => {
  try {
    let data = await StaffRequest.findOne({
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),

      staff_id: mongoose.Types.ObjectId(req.query.staff_id),
    });

    res.send({ status: true, message: "staff Profile data", result: data });
  } catch (e) {
    res.send({
      status: false,

      messgae: "Oops!! something went wrong",
    });
  }
};

/*--------@ Get Restro Details by id----------- */

export const getrestroDetailsById = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      _id: mongoose.Types.ObjectId(req.query._id),
    };

    const result = await User.aggregate([
      {
        $match: condition,
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your RestroList",
        result: result[0],
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@ Group Tip by id----------- */

export const getNoOfGroupTipbyId = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      customer_id: mongoose.Types.ObjectId(req.query.customer_id),
      is_group_tip: true,
      payment_status: true,
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

/*--------@ Group Tip by id----------- */

export const getGroupTipbyId = async (req, res) => {
  const { searchText } = req.query;
  try {
    const { start_date, end_date } = req.query;
    const endOfDay = new Date(end_date);
    endOfDay.setDate(endOfDay.getDate() + 1);
    var matchFilter = {};
    let query = {};
    // let filter = "";
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
          customer_id: mongoose.Types.ObjectId(req.query.customer_id),
          is_group_tip: true,
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

/*--------@ No of staff Tip by id----------- */

export const getNoOfStaffTipbyId = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      customer_id: mongoose.Types.ObjectId(req.query.customer_id),
      is_group_tip: false,
      payment_status: true,
    };

    const result = await Tip.aggregate([
      {
        $match: condition,
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
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your Staff Tip",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@Staff Tip by id----------- */

export const getStaffTipbyId = async (req, res) => {
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
          "staffDetails.full_name": {
            $regex: searchText || "",
            $options: "i",
          },
        },
      };
    } else {
      matchFilter = {
        $match: {
          "staffDetails.full_name": { $regex: "", $options: "i" },
        },
      };
    }

    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          customer_id: mongoose.Types.ObjectId(req.query.customer_id),
          is_group_tip: false,
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

/*--------@Get Customer Details----------- */

export const getcustomerDetails = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      _id: mongoose.Types.ObjectId(req.query._id),
    };

    const result = await User.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "tips",
          localField: "_id",
          foreignField: "staff.staff_id",
          as: "tipDetails",
        },
      },
      {
        $unwind: {
          path: "$tipDetails",

          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (result) {
      res.send({
        status: true,
        message: "This is your Customer Details",
        result: result,
      });
    }
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

// export const searchAll = async (req, res) => {
//   try {
//     const pipeline = [{ $match: {} }];
//     if (req.query.pub && req.query.staff) {
//       pipeline[0].$match = {
//         $or: [
//           {
//             role: "2",
//             restaurant_name: {
//               $regex: req.query.Key ? req.query.Key : "",
//               $options: "i",
//             },
//             // is_updated: true,
//           },
//           {
//             role: "3",
//             full_name: {
//               $regex: req.query.Key ? req.query.Key : "",
//               $options: "i",
//             },
//             // staff_request_accepted: "1",
//           },
//         ],
//       };
//     } else if (req.query.pub) {
//       pipeline[0].$match = {
//         role: "2",
//         restaurant_name: {
//           $regex: req.query.Key ? req.query.Key : "",
//           $options: "i",
//         },
//         // is_updated: true,
//       };
//     } else if (req.query.staff) {
//       pipeline[0].$match = {
//         role: "3",
//         full_name: {
//           $regex: req.query.Key ? req.query.Key : "",
//           $options: "i",
//         },
//         // staff_request_accepted: "1",
//       };
//     } else {
//       pipeline[0].$match = {
//         $or: [
//           {
//             role: "2",
//             restaurant_name: {
//               $regex: req.query.Key ? req.query.Key : "",
//               $options: "i",
//             },
//             // is_updated: true,
//           },
//           {
//             role: "3",
//             full_name: {
//               $regex: req.query.Key ? req.query.Key : "",
//               $options: "i",
//             },
//             // staff_request_accepted: "1",
//           },
//         ],
//       };
//     }
//     // console.log('...........pipeline', JSON.stringify(pipeline));
//     const userlist = await User.aggregate(pipeline);
//     res.send({ status: 200, message: "Fetched all data", result: userlist });
//   } catch (e) {
//     throw e;
//   }
// };

export const searchAll = async (req, res) => {
  try {
    const pipeline = [{ $match: {} }];

    // Add conditional matching based on `pub` and `staff` query params
    if (req.query.pub && req.query.staff) {
      pipeline[0].$match = {
        $or: [
          {
            role: "2",
            restaurant_name: {
              $regex: req.query.Key ? req.query.Key : "",
              $options: "i",
            },
          },
          {
            role: "3",
            full_name: {
              $regex: req.query.Key ? req.query.Key : "",
              $options: "i",
            },
          },
        ],
      };
    } else if (req.query.pub) {
      pipeline[0].$match = {
        role: "2",
        restaurant_name: {
          $regex: req.query.Key ? req.query.Key : "",
          $options: "i",
        },
      };
    } else if (req.query.staff) {
      pipeline[0].$match = {
        role: "3",
        full_name: {
          $regex: req.query.Key ? req.query.Key : "",
          $options: "i",
        },
      };
    } else {
      pipeline[0].$match = {
        $or: [
          {
            role: "2",
            restaurant_name: {
              $regex: req.query.Key ? req.query.Key : "",
              $options: "i",
            },
          },
          {
            role: "3",
            full_name: {
              $regex: req.query.Key ? req.query.Key : "",
              $options: "i",
            },
          },
        ],
      };
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page if not specified
    const skip = (page - 1) * limit;

    // Add skip and limit stages for pagination
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute pipeline to get paginated user list
    const userlist = await User.aggregate(pipeline);

    // Total count of documents matching the filter for calculating total pages
    const totalDocuments = await User.countDocuments(pipeline[0].$match);
    const totalPages = Math.ceil(totalDocuments / limit);

    res.send({
      status: 200,
      message: "Fetched paginated data",
      result: userlist,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (e) {
    console.error("Error fetching paginated data:", e);
    res.status(500).send({ status: 500, message: "Server Error" });
  }
};

export const CustomerFeedback = async (req, res) => {
  try {
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = {
      page,
      limit: limit,
      skip: limit * (page - 1),
      sort: orderBy,
    };

    let myAggregate = Tip.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          customer_id: mongoose.Types.ObjectId(req.query.customer_id),
          "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
        },
      },
    ];

    // Perform count operation
    const countResult = await Tip.aggregate(myAggregate._pipeline)
      .count("count")
      .exec();

    // Use aggregatePaginate to fetch paginated results
    const showResult = Tip.aggregatePaginate(
      myAggregate,
      options,
      (err, result) => {
        if (err) {
          res.send({ status: false, message: "Unable to fetch" });
        } else {
          res.send({
            status: true,
            result: result,
            count: countResult[0].count,
          }); // Include count in the response
        }
      }
    );
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

export const getCustomerDashboardData = async (req, res) => {
  try {
    const { customer_id, resto_id, sort, days, tabs } = req.query;

    var query = {
      customer_id: mongoose.Types.ObjectId(customer_id),
      payment_status: true,
    };
    var currentDate = new Date(new Date().setHours(0, 0, 0, 0));
    var filterDate = new Date(new Date().setHours(0, 0, 0, 0));
    filterDate.setDate(filterDate.getDate() - days);
    if (days != 0) {
      query.createdAt = {
        $gte: new Date(filterDate),
        $lt: new Date(currentDate.setDate(currentDate.getDate() + 1)),
      };
    }

    let sorting = {};
    if (tabs === "false") query.is_group_tip = false;
    else if (tabs === "true") query.is_group_tip = true;
    if (resto_id != "") query.resto_id = mongoose.Types.ObjectId(resto_id);
    if (sort != "") sorting.total_tip_amount = -1;
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
        $project: {
          createdAt: 1,
          createdDate: {
            $concat: [
              { $dateToString: { format: "%d", date: "$createdAt" } },
              " ",
              {
                $let: {
                  vars: {
                    monthsInString: [
                      ,
                      "Jan ",
                      "Feb ",
                      "Mar ",
                      "Apr ",
                      "May ",
                      "Jun ",
                      "Jul ",
                      "Aug ",
                      "Sep ",
                      "Oct ",
                      "Nov ",
                      "Dec ",
                    ],
                  },
                  in: {
                    $arrayElemAt: [
                      "$$monthsInString",
                      { $month: "$createdAt" },
                    ],
                  },
                },
              },
            ],
          },
          customerDetails: "$customer",
          staffDetails: "$staffDetails",
          pubDetails: "$pub",
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
        },
      },
    ]).sort(sorting);
    res.send({
      status: true,
      message: "This is your Customer Details",
      result: data,
    });
  } catch (err) {
    console.log("sasaf", err.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};
export const getCustomerStatData = async (req, res) => {
  try {
    const { customer_id } = req.query;
    var query = {
      customer_id: mongoose.Types.ObjectId(customer_id),
      payment_status: true,
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
        $project: {
          createdAt: 1,
          customerDetails: "$customer",
          staffDetails: "$staffDetails",
          pubDetails: "$pub",
          is_group_tip: 1,
          customer_comment: 1,
          total_tip_amount: 1,
        },
      },
    ]);
    const fetchPubs = await Tip.aggregate([
      { $match: query },
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
        $group: {
          _id: "$pub._id",
          addressLine1: { $first: "$pub.addressLine1" },
          image: { $first: "$pub.image" },
          restaurant_name: { $first: "$pub.restaurant_name" },
          full_name: { $first: "$pub.full_name" },
        },
      },
      {
        $match: {
          _id: { $ne: null },
          addressLine1: { $ne: null },
          image: { $ne: null },
          restaurant_name: { $ne: null },
          full_name: { $ne: null },
        },
      },
    ]);
    res.send({
      status: true,
      message: "This is your Customer Details",
      result: { statData: data, pubs: fetchPubs },
    });
  } catch (err) {
    console.log("sasaf", err.message);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

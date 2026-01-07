import mongoose from "mongoose";
import ContactUs from "../../../model/ContactUs";
import DashboardContactUs from "../../../model/DashboardContactUs";



export const Enquiry_List = async (req, res) => {
    const { searchText } = req.query;
    try {
   
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
            "sentDetails.full_name": {
              $regex: searchText || "",
              $options: "i",
            },
          },
        };
      } else {
        matchFilter = {
          $match: {
            "sentDetails.full_name": { $regex: "", $options: "i" },
          },
        };
      }
      let myAggregate = ContactUs.aggregate();
      myAggregate._pipeline = [
        {
          $match: {
            is_contact_support:false,
           
          },
        },
        {
            $lookup: {
              from: "users",
              localField: "complaint_restro_id",
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
              localField: "sent_by_id",
              foreignField: "_id",
              as: "sentDetails",
            },
          },
          {
            $unwind: {
              path: "$sentDetails",
    
              preserveNullAndEmptyArrays: true,
            },
          },
      ];
      if (searchText) {
        myAggregate._pipeline.push(matchFilter);
      }
      const showResult = ContactUs.aggregatePaginate(
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




  export const Contact_Supports_List = async (req, res) => {
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
            "sentDetails.full_name": {
              $regex: searchText || "",
              $options: "i",
            },
          },
        };
      } else {
        matchFilter = {
          $match: {
            "sentDetails.full_name": { $regex: "", $options: "i" },
          },
        };
      }
      let myAggregate = ContactUs.aggregate();
      myAggregate._pipeline = [
        {
          $match: {
            is_contact_support:true,
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
              localField: "sent_by_id",
              foreignField: "_id",
              as: "sentDetails",
            },
          },
          {
            $unwind: {
              path: "$sentDetails",
    
              preserveNullAndEmptyArrays: true,
            },
          },
      ];
      if (searchText) {
        myAggregate._pipeline.push(matchFilter);
      }
      const showResult = ContactUs.aggregatePaginate(
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



  export const No_of_Enquiry_List = async (req, res) => {
    const result = await ContactUs.find({is_contact_support:false});
    if (result) {
      res.send({
        status: true,
        message: "All fetch",
        result: result,
      });
    }
  };


  export const No_of_Contact_List = async (req, res) => {
    const result = await ContactUs.find({ is_contact_support:true});
    if (result) {
      res.send({
        status: true,
        message: "All fetch",
        result: result,
      });
    }
  };



  export const getDetailsByid = async (req, res) => {
    try {
      let data = await ContactUs.findOne({
        _id: mongoose.Types.ObjectId(req.query._id),
      });
  
      res.send({ status: true, message: "User data found", result: data });
    } catch (e) {
      res.send({
        status: false,
        messgae: "Oops!! something went wrong",
      });
    }
  };



  export const Reply_By_Admin = async (req, res) => {
    try {
      let jsondata = {
        reply_by_admin: req.body.reply_by_admin,
        status: req.body.status,
      };
      const result = await ContactUs.updateOne(
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




  export const getDetailsByidContactUs = async (req, res) => {
    try {
      let data = await DashboardContactUs.findOne({
        _id: mongoose.Types.ObjectId(req.query._id),
      });
  
      res.send({ status: true, message: "User data found", result: data });
    } catch (e) {
      res.send({
        status: false,
        messgae: "Oops!! something went wrong",
      });
    }
  };
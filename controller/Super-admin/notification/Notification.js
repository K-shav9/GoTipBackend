import mongoose from "mongoose";
import EmailTemplate from "../../../model/EmailTemplate";
import Notification from "../../../model/NotificationSettings";




export const AddNotification = async (req, res) => {
    const {
        type,
        title,
        notification_content,
        status
    } = req.body;
  
    try {
      let result = new Notification({
        type,
        title,
        notification_content,
        status
      });
  
      const resObject = await result.save();
      res.send({
        status: true,
        message: "Notification add successfully",
        result: resObject,
      });
    } catch (error) {}
  };



  export const Notification_Lists = async (req, res) => {
    try {
     
      let orderBy = {};
      let limit = 10,
        page = 1;
      if (req.query.page) page = req.query.page;
      if (req.query.limit) limit = req.query.limit;
      orderBy.createdAt = -1;
  
      let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    
      let myAggregate = Notification.aggregate();
      myAggregate._pipeline = [];
      
      const showResult = Notification.aggregatePaginate(
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




  export const getNotificationdetailsByid = async (req, res) => {
    try {
      let data = await Notification.findOne({
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



  export const updateNotification = async (req, res) => {
    try {
      let jsondata = {
        type:req.body.type,
        title:req.body.title,
        notification_content:req.body.notification_content,
        status:req.body.status,
      };
      const result = await Notification.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        { $set: jsondata },
        { new: true }
      );
      if (!result) {
        res.send({ status: false, message: "Unable to update" });
      } else {
        res.send({
          status: true,
          message: "Updated successfully",
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




  export const DeleteNotification = async (req, res) => {
    try {
      let _id = req.query._id;
      const user = await Notification.deleteOne({
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





  export const AddEmailTemplate = async (req, res) => {
    const {
      template_name,
        title,
        subject,
        body
    } = req.body;
  
    try {
      let result = new EmailTemplate({
        template_name,
        title,
        subject,
        body
      });
  
      const resObject = await result.save();
      res.send({
        status: true,
        message: "Email Template add successfully",
        result: resObject,
      });
    } catch (error) {}
  };





  export const Template_Lists = async (req, res) => {
    try {
     
      let orderBy = {};
      let limit = 10,
        page = 1;
      if (req.query.page) page = req.query.page;
      if (req.query.limit) limit = req.query.limit;
      orderBy.createdAt = -1;
  
      let options = { page, limit: limit, skip: limit * page, sort: orderBy };
    
      let myAggregate = EmailTemplate.aggregate();
      myAggregate._pipeline = [];
      
      const showResult = EmailTemplate.aggregatePaginate(
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


  export const getEmailsByid = async (req, res) => {
    try {
      let data = await EmailTemplate.findOne({
        _id: mongoose.Types.ObjectId(req.query._id),
      });
  
      res.send({ status: true, message: "Template data found", result: data });
    } catch (e) {
      res.send({
        status: false,
        messgae: "Oops!! something went wrong",
      });
    }
  };

 
  export const updateTemplate = async (req, res) => {
    try {
      let jsondata = {
        subject:req.body.subject,
        title:req.body.title,
        body:req.body.body,
 
      };
      const result = await EmailTemplate.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body._id) },
        { $set: jsondata },
        { new: true }
      );
      if (!result) {
        res.send({ status: false, message: "Unable to update" });
      } else {
        res.send({
          status: true,
          message: "Updated successfully",
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



  export const DeleteTemplate = async (req, res) => {
    try {
      let _id = req.query._id;
      const user = await EmailTemplate.deleteOne({
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
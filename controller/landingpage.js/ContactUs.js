import mongoose from "mongoose";
import DashboardContactUs from "../../model/DashboardContactUs";
import ContactUs from "../../model/ContactUs";

/*--------@ Add Contact us Api----------- */

export const AddContactUs = async (req, res) => {
  const {
    sent_by_id,
    role,
    full_name,
    email,
    message,
    reply_by_admin,
    status,
    is_contact_support,
    complaint_restro_id,
    is_guest_contact_us,
    is_restro_contact_us,
    is_customer_contact_us,
    is_staff_contact_us,
  } = req.body;

  try {
    let result = new ContactUs({
      sent_by_id,
      role,
      full_name,
      email,
      message,
      reply_by_admin,
      status,
      is_contact_support,
      complaint_restro_id,
      is_guest_contact_us,
      is_restro_contact_us,
      is_customer_contact_us,
      is_staff_contact_us,
    });

    const resObject = await result.save();
    res.send({
      status: true,
      message: "Contact details add successfully",
      result: resObject,
    });
  } catch (error) {}
};

/*--------@ Add Dashboard Contact us Api----------- */

export const AddDashboardContactUs = async (req, res) => {
  const {
    full_name,
    email,
    message,
    reply_by_admin,
    status,
    is_guest_contact_us,
  } = req.body;

  try {
    let result = new DashboardContactUs({
      full_name,
      email,
      message,
      reply_by_admin,
      status,
      is_guest_contact_us,
    });
    const resObject = await result.save();
    res.send({
      status: true,
      message: "Contact details add successfully",
      result: resObject,
    });
  } catch (error) {}
};

/*--------@ Contact us list Api----------- */

export const Contact_us_List = async (req, res) => {
  const { searchText } = req.query;
  try {
    let query = {};
    var matchFilter = {};
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
    let myAggregate = DashboardContactUs.aggregate();
    myAggregate._pipeline = [];
    if (searchText) {
      myAggregate._pipeline.push(matchFilter);
    }
    const showResult = DashboardContactUs.aggregatePaginate(
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

/*--------@ Contact us list Api----------- */

export const No_of_Contact_us_List = async (req, res) => {
  const result = await DashboardContactUs.find();
  if (result) {
    res.send({
      status: true,
      message: "All fetch",
      result: result,
    });
  }
};

export const getContactSupportlistbyid = async (req, res) => {
  try {
    let query = {};
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = ContactUs.aggregate();
    myAggregate._pipeline = [
      {
        $match: {
          sent_by_id: mongoose.Types.ObjectId(req.query.sent_by_id),
          is_contact_support: true,
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

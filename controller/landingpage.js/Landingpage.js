import mongoose from "mongoose";
import Landingpage from "../../model/Landingpage";
import Tip from "../../model/Tip";
import User from "../../model/user";
import StaffRequest from "../../model/StaffRequest";
import Faq from "../../model/Faq";
import HowItWorks from "../../model/How_it_works";
const config = require("../../config/config.js").get(process.env.Node_env);
const stripe = require("stripe")(
  config["stripeSecretKey"]
);
/*--------@ Add Landing Page Content Api----------- */

export const addLandingPageContent = async (req, res) => {
  const { about_us_heading, about_us_content } = req.body;

  try {
    const about_us = {
      about_us_heading,
      about_us_content,
    };

    let result = new Landingpage({
      about_us,
    });
    const resObject = await result.save();
    res.send({
      status: true,
      message: "Invitation Request added",
      result: resObject,
    });
  } catch (error) { }
};

export const getLandingPageData = async (req, res) => {
  const result = await Landingpage.find();

  if (result) {
    res.send({
      status: true,
      message: "All data fetched",
      result: result,
    });
  }
};

/*--------@ Staff search list Api----------- */

export const StaffSearchAll = async (req, res) => {
  try {
    let Key = "";
    if (req.query.Key) Key = req.query.Key;

    const userlist = await StaffRequest.aggregate([
      {
        $match: {
          $or: [{ staff_name: { $regex: Key ? Key : "", $options: "i" } }],
          status: "1",
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
    res.send({ status: 200, message: "Fetched all data ", result: userlist });
  } catch (e) {
    throw e;
  }
};

/*--------@ Update Landing Page Api----------- */

export const updateLandingPage = async (req, res) => {
  try {
    let jsondata = {
      about_us: {
        about_us_heading: req.body.about_us_heading,
        about_us_content: req.body.about_us_content,
      },
      footer_content: req.body.footer_content,
    };

    const result = await Landingpage.findOneAndUpdate(
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

/*--------@Faq Add Api----------- */

export const Faqadd = async (req, res) => {
  const { faq_question, faq_answer, status } = req.body;
  try {
    let result = new Faq({
      faq_question,
      faq_answer,
      status,
    });
    const resObject = await result.save();
    res.send({
      status: true,
      message: "Faq added",
      result: resObject,
    });
  } catch (error) { }
};

/*--------@Get About us Api----------- */

export const getAboutus = async (req, res, next) => {
  try {
    const userdata = await Landingpage.find();
    res.send({
      status: true,
      message: "Result getting Successfully",
      result: userdata,
    });
  } catch (err) {
    next(err);
  }
};

/*--------@Get Landing Page Api----------- */

export const getLandingPageFaq = async (req, res, next) => {
  try {
    const userdata = await Faq.find({ status: "true" });
    res.send({
      status: true,
      message: "Result getting Successfully",
      result: userdata,
    });
  } catch (err) {
    next(err);
  }
};

/*--------@Get Landing Page How it Works Api----------- */

export const getLandingPageHowitworks = async (req, res, next) => {
  try {
    const userdata = await HowItWorks.find();
    res.send({
      status: true,
      message: "Result getting Successfully",
      result: userdata,
    });
  } catch (err) {
    next(err);
  }
};

/*--------@Get Faq Api----------- */

export const getFaq = async (req, res) => {
  try {
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = Faq.find();

    const showResult = Faq.paginate(myAggregate, options, (err, result) => {
      if (err) {
        res.send({ status: false, message: "Unable to fetch" });
      } else {
        res.send({ status: true, result: result });
      }
    });
  } catch (e) {
    res.send({ status: false, messgae: "Oops!! no results found" });
  }
};

/*--------@how it works add Api----------- */

export const HowitworksAdd = async (req, res) => {
  const { serial_no, how_it_works_content } = req.body;
  try {
    let result = new HowItWorks({
      serial_no,
      how_it_works_content,
    });
    const resObject = await result.save();
    // Send Email To user
    res.send({
      status: true,
      message: "HowItWorks added",
      result: resObject,
    });
  } catch (error) { }
};

/*--------@Get it works add Api----------- */

export const getHowitWorks = async (req, res) => {
  try {
    let orderBy = {};
    let limit = 10,
      page = 1;
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    // orderBy.createdAt = -1;

    let options = { page, limit: limit, skip: limit * page, sort: orderBy };

    let myAggregate = HowItWorks.find();

    const showResult = HowItWorks.paginate(
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

/*--------@Delete Faq Api----------- */

export const DeleteFaqById = async (req, res) => {
  try {
    let _id = req.query._id;
    const user = await Faq.deleteOne({
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

/*--------@Delete How it works Api----------- */

export const DeleteHowitworksById = async (req, res) => {
  try {
    let _id = req.query._id;
    const user = await HowItWorks.deleteOne({
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

/*--------@Update Faq Api----------- */

export const updateFaq = async (req, res) => {
  try {
    let jsondata = {
      faq_question: req.body.faq_question,
      faq_answer: req.body.faq_answer,
    };
    const result = await Faq.findOneAndUpdate(
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

/*--------@Update How it works Api----------- */

export const updateHowitWorks = async (req, res) => {
  try {
    let jsondata = {
      serial_no: req.body.serial_no,
      how_it_works_content: req.body.how_it_works_content,
    };
    const result = await HowItWorks.findOneAndUpdate(
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

/*--------@Get Faq details by Id Api----------- */

export const getFaqDetailsByid = async (req, res) => {
  try {
    let data = await Faq.findOne({
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

/*--------@Get How it works by Id Api----------- */

export const getHowitworksDetailsByid = async (req, res) => {
  try {
    let data = await HowItWorks.findOne({
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

export const getPubsterAndPub = async (req, res) => {
  try {
    // console.log("Sdfsfsd" ,req )

    // await stripe.accounts.create({
    //   country: 'US',
    //   type: 'custom',
    //   capabilities: {
    //     card_payments: {
    //       requested: true,
    //     },
    //     transfers: {
    //       requested: true,
    //     },
    //   },
    // }).then(val=>{
    //   console.log("val" ,val.id  )
    // }).catch(err=>{
    //   console.log("err" ,err.message  )
    // });

    //  await stripe.accountLinks.create({
    //   account: 'acct_1OjbtADI8BAKtwcW',
    //   refresh_url: 'http://localhost:3000/',
    //   return_url: 'http://localhost:3000/',
    //   type: 'account_onboarding',
    // }).then(val=>{
    //     console.log("val" ,val  )
    //   }).catch(err=>{
    //     console.log("err" ,err.message  )
    //   });

    // const deleted = await stripe.accounts.del('acct_1OivXfRiXqg4ZDmS')
    // await stripe.oauth.token({
    //   grant_type: 'authorization_code',
    //   code: 'ac_PYiCAnbbh7CFGlR1mFyODvbD7p20OG5S',
    // }).then(val =>{
    //     console.log("Adasdas" , val)
    //   }).catch(err =>{
    //     console.log("Adasdas" , err.message)
    //   });;


    // const connectedAccount = await stripe.accounts.create({
    //   type: 'standard', // or 'express' or 'custom' based on your needs
    //   country: 'US', // Replace with the appropriate country code
    //   email: 'max@yopmail.com', // Replace with the email associated with the Stripe account
    //   // Add other parameters as needed
    //   stripe_account: 'acct_1OjaleSB3nIzCP9W'
    // }).then(val =>{
    //   console.log("Adasdas" , val)
    // }).catch(err =>{
    //   console.log("Adasdas" , err.message)
    // });;;

    //   const response = await stripe.oauth.deauthorize({
    //     client_id: 'ca_PWtmtSXejQMAgPdNIxXgFaCAtrpR4WZf',
    //     stripe_user_id: 'acct_0k3E00THkliK5W',
    //   });

    // const paymentIntent = await stripe.paymentIntents.create(
    //   {
    //     amount: 1000,
    //     currency: 'usd',
    //     automatic_payment_methods: {
    //       enabled: true,
    //     },
    //   },
    //   {
    //     stripeAccount: 'acct_1OjaleSB3nIzCP9W',
    //   }
    // ).then(val =>{
    //   console.log("Adasdas" , val)
    // }).catch(err =>{
    //   console.log("Adasdas" , err.message)
    // });

    // const account = await stripe.accounts.retrieve('acct_1OjaleSB3nIzCP9W').then(val =>{
    //     console.log("Adasdas" , val)
    //   }).catch(err =>{
    //     console.log("Adasdas" , err.message)
    //   });;
    // stripe.charges.retrieve('ch_3LmjSR2eZvKYlo2C1cPZxlbL', {
    //   stripeAccount: 'acct_1032D82eZvKYlo2C'
    // });
    //  const dd = await stripe.accountSessions.create({
    //   account: 'acct_1OjaleSB3nIzCP9W',
    //   components: {
    //     payments: {
    //       enabled: true,
    //       features: {
    //         refund_management: true,
    //         dispute_management: true,
    //         capture_payments: true,
    //       }
    //     },
    //   }

    // })

    // stripe.charges.retrieve('ch_3LmjSR2eZvKYlo2C1cPZxlbL', {
    //   stripeAccount: 'acct_1032D82eZvKYlo2C'
    // });
    // ;


    // await stripe.checkout.sessions.create({
    //   mode: 'payment',
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: "usd",
    //         product_data: {
    //           name: "Product Name",
    //         },
    //         unit_amount: 10000, // Amount in cents
    //       },
    //       quantity: 1,
    //     },
    //   ],
    //   payment_intent_data: {
    //     application_fee_amount: 5000,
    //     transfer_data: {
    //       destination: 'acct_1OjiE8DIPZBa28i4',
    //     },
    //   },
    //   success_url: 'http://localhost:3000',
    //   cancel_url: 'https://gotipme.com/',
    // }).then(val =>{
    //     console.log("Adasdas" , val)
    //   }).catch(err =>{
    //     console.log("Adasdas" , err.message)
    //   });
    ;
    // await stripe.accounts.retrieve('acct_1OixqNSB5liyPBfv').then(val =>{
    //   console.log("Adasdas" , val)
    // }).catch(err =>{
    //   console.log("Adasdas" , err.message)
    // });


    // await stripe.tokens.retrieve('ZDVlMDE1OGItZmMwOS00ZmQ0LTk1YmUtOTRhNzA0MGVlOTc2RmRiQUdUSGtOZmFXT1RVeTYveTRXaUxhS20vNDBZd2tieXNOdnY0Q1BSND12Mg==').then(val =>{
    // console.log("sadadasd" ,val)
    // }).catch(err =>{

    //   console.log("sdfsdfsdf" ,err.message)
    // });





    const pubstar = await User.aggregate([
      { $match: { role: "3" } },
      // { $sample: { size: 7 } },
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
      //   },
      // },


    ]).limit(7);
    const pubs = await User.aggregate([
      { $match: { role: "2" } },
      { $sample: { size: 5 } },
    ]);

    res.send({
      status: true,
      message: "data found",
      result: { pub: pubs, pubstar: pubstar },
    });
  } catch (e) {
    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};
export const getTips = async (req, res) => {
  try {
    let fetchTips = await Tip.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: {
            full_name: "$userDetails.full_name",
            total_tip_amount: "$total_tip_amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id.full_name",
          tip: "$_id.total_tip_amount",
        },
      },
    ])
      .sort({ _id: -1 })
      .limit(20);
    res.send({ status: true, message: "Tip data found", result: fetchTips });
  } catch (e) {
    res.send({
      status: false,
      messgae: "Oops!! something went wrong",
    });
  }
};

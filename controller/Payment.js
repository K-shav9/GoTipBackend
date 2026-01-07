import User from "../model/user";
import mongoose from "mongoose";
import Tip from "../model/Tip";
import GuestDetails from "../model/GuestDetails";
import EmailTemplate from "../model/EmailTemplate";
import { SendEmail } from "../middleware/sendMail";
import axios from "axios";
import { get_secret_keys } from "./user.js";
const config = require("../config/config.js").get(process.env.Node_env);
// const trustap_key = config["trustap_key"];
const dev_path = config["dev_path"];
const stripe = require("stripe")(
  config["stripeSecretKey"]
);

const sendTipEmail = async (Tipdata) => {
  let restaurantData = await User.findOne({
    _id: mongoose.Types.ObjectId(Tipdata.resto_id),
  });
  let staffData = await User.findOne({
    _id: mongoose.Types.ObjectId(Tipdata.staff.staff_id),
  });
  let customerData = await User.findOne({
    _id: mongoose.Types.ObjectId(Tipdata.customer_id),
  });

  let emailTemplate = await EmailTemplate.findOne({
    template_name: "Pubstar_Requests",
  });

  if (Tipdata.is_group_tip) {
    let emailTemplate = await EmailTemplate.findOne({
      template_name: "Tip_to_Pub",
    });
    let text = `

      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Tip Details</h2>  
      <p>Hi, ${restaurantData.full_name}</p>
      <p>${emailTemplate.body}</p>
      <h3>Amount : £ ${Tipdata.total_tip_amount}</h3>
      <p>Tip from ${customerData.full_name}</p>
      <p>GoTipMe</p>
      </div>
      
    `;

    SendEmail(
      customerData.email,
      restaurantData.email,
      emailTemplate.subject,
      text
    );
  } else {
    let emailTemplate = await EmailTemplate.findOne({
      template_name: "Tip_to_Pubstar",
    });
    let text = `

      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Tip Details</h2>  
      <p>Hi, ${staffData.full_name}</p>
      <p>${emailTemplate.body}</p>
      <h3>Amount : £ ${Tipdata.total_tip_amount}</h3>
      <p>Tip from ${customerData.full_name}</p>
      <p>GoTipMe</p>
      </div>
      
    `;

    SendEmail(customerData.email, staffData.email, emailTemplate.subject, text);
  }
};

// Create the Customer
export const createCustomer = async (email) => {
  try {
    const customer = await stripe.customers.create({
      email: email,
    });
    const userDetail = await User.findOne({
      email: email,
    });
    let jsondata = {
      customer_payment_id: customer.id,
      customer_payment_email: customer.email,
    };

    const updateUserDetails = await User.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(userDetail._id) },
      { $set: jsondata },
      { new: true }
    );
  } catch (error) {
    console.log("error->", error);
  }
};

// Add the card

export const addNewcard = async (req, res) => {
  let data = await User.findOne({
    _id: mongoose.Types.ObjectId(req.body._id),
  });
  const {
    // customer_Id,
    card_Name,
    card_ExpYear,
    card_ExpMonth,
    card_Number,
    card_CVC,
  } = req.body;
  const customer_Id = data?.customer_payment_id;
  try {
    const card_Token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
    });
    const card = await stripe.customers.createSource(customer_Id, {
      source: `${card_Token.id}`,
    });

    let jsondata = {
      customer_payment_card: card.id,
    };

    const updateUserDetails = await User.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(data._id) },
      { $set: jsondata },
      { new: true }
    );

    // return res.status(200).send({ card: card.id });
    res.send({
      status: true,
      message: "Card added",
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// Create The Payment charge
export const createCharges = async (req, res) => {
  let Tipdata = await Tip.findOne({
    _id: mongoose.Types.ObjectId(req.body.tip_id),
  });
  let userdata = await User.findOne({
    _id: mongoose.Types.ObjectId(req.body._id),
  });
  try {
    const createCharge = await stripe.charges.create({
      amount: Tipdata.total_tip_amount * 100,
      currency: "GBP",
      card: userdata.customer_payment_card,
      customer: userdata.customer_payment_id,
    });

    if (createCharge.status === "succeeded") {
      let jsondata = {
        payment_status: 1,
        transaction_id: createCharge.id,
      };
      const updatePaymentStatus = await Tip.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body.tip_id) },
        { $set: jsondata },
        { new: true }
      );
      sendTipEmail(Tipdata);
      res.send({
        status: true,
        message: "Payment Successfull",
        result: createCharge.receipt_url,
        TipData: Tipdata,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

// Create guest cutomer for stripe payment
// export const createGuestCustomer = async (email, res) => {
//   try {
//     const customer = await stripe.customers.create({
//       email: email,
//     });

//     let user = new GuestDetails({
//       guest_payment_id: customer.id,
//       guest_payment_email: customer.email,
//     });

//     let guestadd = await user.save();
//     return {
//       status: true,
//       message: "Guest add success",
//       result: guestadd,
//     };
//   } catch (error) {
//     console.log("error->", error);
//   }
// };

// export const createGuestCustomer = async (guestData) => {
//   try {
//     // console.log("guest-------", guestData);

//     const { guest } = guestData;
//     const { guest_name, guest_email, guest_country, guest_country_code } =
//       guest;

//     // console.log("guest-------",guest)
//     const splitName = (fullName) => {
//       const nameParts = fullName.trim().split(" ");
//       const firstName = nameParts[0];
//       const lastName = nameParts.slice(1).join(" ");
//       return { firstName, lastName };
//     };

//     const { firstName, lastName } = splitName(guest_name);

//     const getUnixTimestamp = () => Math.floor(Date.now() / 1000);
//     const timestamp = getUnixTimestamp();

//     let newObj = {
//       email: guest_email,
//       first_name: firstName,
//       last_name: lastName || firstName,
//       // country_code: "uk",
//       country_code: guest_country_code,
//       tos_acceptance: { unix_timestamp: timestamp, ip: "127.0.0.1" },
//     };

//     const createGuest = await GuestDetails.create({
//       guest_payment_email: guest_email,
//       guest_name: guest_name,
//       countryCode: guest_country_code,
//       country: guest_country,
//     });

//     // const createGuestUser = async () => {
//     // try {
//     // console.log("----------",dev_path)

//     const { authorized_key } = get_secret_keys(guest_country);
//     const response = await axios.post(
//       // `https://dev.stage.trustap.com/api/v1/guest_users`,
//       `${dev_path}/api/v1/guest_users`,

//       newObj,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: `Basic ${process.env.TRUSTAP_KEY}`,
//           // Authorization: `Basic ` + trustap_key,
//           Authorization: `Basic ` + authorized_key,
//         },
//       }
//     );

//     const addTrustAppDetails = await GuestDetails.updateOne(
//       { _id: createGuest.id }, // Replace guestId with the actual guest's ID
//       {
//         $set: {
//           trustap_user_id: response?.data?.id,
//         },
//       }
//     );

//     const getGuest = await GuestDetails.findOne({ _id: createGuest._id });

//     return {
//       status: true,
//       message: "Guest add success",
//       result: getGuest,
//     };
//   } catch (error) {
//     console.log("error->", error);
//   }
// };

export const createGuestCustomer = async (guestData) => {
  try {
    const { guest } = guestData;
    const { guest_name, guest_email, guest_country, guest_country_code } =
      guest;

    // console.log("guestdata-----------", guestData);

    const checkGuest = await GuestDetails.findOne({
      guest_payment_email: guest_email,
    });

    const splitName = (fullName) => {
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      return { firstName, lastName };
    };

    const { firstName, lastName } = splitName(guest_name);
    const timestamp = Math.floor(Date.now() / 1000);

    const newObj = {
      email: guest_email,
      first_name: firstName,
      last_name: lastName || firstName,
      country_code: guest_country_code,
      tos_acceptance: { unix_timestamp: timestamp, ip: "127.0.0.1" },
    };

    const { authorized_key } = get_secret_keys(guest_country);

    const response = await axios.post(
      `${dev_path}/api/v1/guest_users`,
      newObj,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authorized_key}`,
        },
      }
    );

    // console.log("response----------", response.data);

    let guest_id;
    const trustap_user_id = response?.data?.id;

    if (trustap_user_id) {
      if (checkGuest) {
        const updateCountry = await GuestDetails.updateOne(
          { _id: checkGuest._id },
          {
            $set: {
              trustap_user_id,
              country: guest_country,
              countryCode: guest_country_code,
            },
          }
        );
        guest_id = checkGuest._id;
      } else {
        const createGuest = await GuestDetails.create({
          guest_payment_email: guest_email,
          guest_name,
          countryCode: guest_country_code,
          country: guest_country,
          trustap_user_id,
        });
        guest_id = createGuest._id;
      }

      const getGuest = await GuestDetails.findOne({ _id: guest_id });

      return {
        status: true,
        message: "Guest add success",
        result: getGuest,
      };
    } else {
      console.error("Error: Missing Trustap User ID in response.");
      return {
        status: false,
        message: "Guest creation failed: External API did not return an ID.",
      };
    }
  } catch (error) {
    console.log("error->", error);
    return {
      status: false,
      message: "An error occurred while adding the guest",
      error: error.message,
    };
  }
};


//Guest payment details api
export const addGuestNewcard = async (req, res) => {
  let data = await GuestDetails.findOne({
    _id: mongoose.Types.ObjectId(req.body._id),
  });
  const {
    // customer_Id,
    card_Name,
    card_ExpYear,
    card_ExpMonth,
    card_Number,
    card_CVC,
  } = req.body;
  const customer_Id = data.guest_payment_id;
  try {
    const card_Token = await stripe.tokens.create({
      card: {
        name: card_Name,
        number: card_Number,
        exp_month: card_ExpMonth,
        exp_year: card_ExpYear,
        cvc: card_CVC,
      },
    });
    const card = await stripe.customers.createSource(customer_Id, {
      source: `${card_Token.id}`,
    });

    let jsondata = {
      guest_payment_card: card.id,
    };

    const updateUserDetails = await GuestDetails.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(data._id) },
      { $set: jsondata },
      { new: true }
    );

    // return res.status(200).send({ card: card.id });
    res.send({
      status: true,
      message: "Card added",
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const sendGuestTipEmail = async (Tipdata) => {
  let restaurantData = await User.findOne({
    _id: mongoose.Types.ObjectId(Tipdata.resto_id),
  });
  let staffData = await User.findOne({
    _id: mongoose.Types.ObjectId(Tipdata.staff.staff_id),
  });

  if (Tipdata.is_group_tip) {
    let emailTemplate = await EmailTemplate.findOne({
      template_name: "Tip_to_Pub_From_Guest",
    });
    let text = `

      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Tip Details</h2>  
      <p>Hi, ${restaurantData.full_name}</p>
      <p>${emailTemplate.body}</p>
      <h3>Amount : £ ${Tipdata.total_tip_amount}</h3>
      <p>Tip from ${Tipdata.guest.guest_name}</p>
      <p>GoTipMe</p>
      </div>
      
    `;

    SendEmail(
      Tipdata.guest.guest_email,
      restaurantData.email,
      emailTemplate.subject,
      text
    );
  } else {
    let emailTemplate = await EmailTemplate.findOne({
      template_name: "Tip_to_Pubstar_From_Guest",
    });
    let text = `

      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Tip Details</h2>  
      <p>Hi, ${staffData.full_name}</p>
      <p>${emailTemplate.body}</p>
      <h3>Amount : £ ${Tipdata.total_tip_amount}</h3>
      <p>Tip from ${Tipdata.guest.guest_name}</p>
      <p>GoTipMe</p>
      </div>
      
    `;

    SendEmail(
      Tipdata.guest.guest_email,
      staffData.email,
      emailTemplate.subject,
      text
    );
  }
};

// Create The Payment charge
export const createGuestCharges = async (req, res) => {
  let Tipdata = await Tip.findOne({
    _id: mongoose.Types.ObjectId(req.body.tip_id),
  });
  let userdata = await GuestDetails.findOne({
    _id: mongoose.Types.ObjectId(req.body._id),
  });

  try {
    const createCharge = await stripe.charges.create({
      amount: Tipdata.total_tip_amount * 100,
      currency: "GBP",
      card: userdata.guest_payment_card,
      customer: userdata.guest_payment_id,
    });

    if (createCharge.status === "succeeded") {
      let jsondata = {
        payment_status: 1,
        transaction_id: createCharge.id,
      };

      const updatePaymentStatus = await Tip.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body.tip_id) },
        { $set: jsondata },
        { new: true }
      );
      sendGuestTipEmail(Tipdata);
      res.send({
        status: true,
        message: "Payment Successfull",
        result: createCharge.receipt_url,
        TipData: Tipdata,
        staffData: userdata,
      });
    }
  } catch (err) {
    throw new Error(err);
  }
};

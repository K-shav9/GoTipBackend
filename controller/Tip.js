import mongoose from "mongoose";
import { SendEmail } from "../middleware/sendMail";
import ServiceFees from "../model/ServiceFees";
import Tip from "../model/Tip";
import User from "../model/user";
import { createGuestCustomer, CreatePayment } from "./Payment";
import { generatePaypalToken } from "../middleware/Authorization";
import { get_secret_keys } from "./user";
const config = require("../config/config");

const stripe = require("stripe")(
  config["stripeSecretKey"]
);

const handlebars = require("handlebars");
// const config = require("../config/config");
const configvalue = config.get(process.env.Node_env);
// const trustap_key = configvalue["trustap_key"];
const trustap_transaction_key = configvalue["trustap_transaction_key"];
const pay_url = configvalue["pay_url"];
const dev_path = configvalue["dev_path"];

import axios from "axios";
import GuestDetails from "../model/GuestDetails";
import Transaction from "../model/Transaction";

/**
 *
 * @param {*} req
 * @param {*} res
 */

// export const addTip = async (req, res) => {
//   console.log(
//     "-------------------------------------------------------------------------------------------------------------------------------------"
//   );

//   const {
//     tip_amount,
//     donation_amount,
//     resto_id,
//     customer_id,
//     staff_id,
//     customer_tip_amount,
//     total_tip_amount,
//     // service_charge,
//     customer_comment,
//     is_customer_commented,
//     is_group_tip,
//     status,
//     tip_type,
//     customer_rating_to_staff,
//     total_staff_given_amount,
//     staff_tip_amount,
//     guest_email,
//     guest_name,
//     // guest_mobile,
//     guest_country,
//     guest_country_code,
//     is_guest_registerd_user,
//     is_guest_tip,
//     // gateway,
//     // paymentType,
//     // feesStatus,
//     // paymentAmount,
//     // totalAmount,
//     // email,
//     // full_name,
//     // customerEmailAdd,
//     // customerFullname,
//     group_tip_status,
//     country,
//   } = req.body;

//   // console.log("----add tip body---------", req.body);

//   //  const referer = req.get("Referer") || req.get("Origin");
//   //  console.log(`Frontend URL for add tip: ${referer}`);
//   try {
//     const staff = {
//       tip_amount,
//       staff_id,
//     };

//     const guest = {
//       guest_email,
//       guest_name,
//       // guest_mobile,
//       guest_country,
//       guest_country_code,
//       is_guest_registerd_user,
//     };

//     let result = new Tip({
//       staff,
//       donation_amount,
//       total_tip_amount,
//       resto_id,
//       customer_id,
//       service_charge: 0,
//       customer_comment,
//       is_customer_commented,
//       is_group_tip,
//       customer_tip_amount,
//       total_staff_given_amount,
//       status,
//       tip_type,
//       group_tip_status,
//       customer_rating_to_staff,
//       staff_tip_amount,
//       guest,
//       is_guest_tip,
//     });

//     let resultGuest;

//     if (is_group_tip) {
//       result.customer_tip_amount = total_tip_amount;
//       result.total_staff_given_amount = total_tip_amount;
//     }

//     const resObject = await result.save();
//     let responseData;
//     let checkGuest;
//     let currentUser;
//     let buyer_id;
//     let guestBuyerId;
//     let seller;
//     let getCountry;

//     if (resObject.is_guest_tip === true) {
//       checkGuest = await GuestDetails.findOne({
//         guest_payment_email: guest_email,
//       });

//       // console.log("checkguest---------", checkGuest);

//       if (checkGuest) {
//         await GuestDetails.updateOne(
//           { _id: checkGuest._id },
//           { country: guest_country, countryCode: guest_country_code }
//         );
//       }

//       guestBuyerId = checkGuest?.trustap_user_id;

//       if (!checkGuest?.trustap_user_id) {
//         // console.log("resobj0000000-------",resObject)
//         resultGuest = await createGuestCustomer(resObject);
//       }
//     }
//     const amount = total_tip_amount * 100;

//     // getCountry = guest_country && guest_country != "" ? guest_country : country;
//     getCountry = country;

//     // console.log("country--------------", country);

//     const { authorized_key } = get_secret_keys(getCountry);
//     const chargeResponse = await axios.get(
//       `${dev_path}/api/v1/p2p/charge?price=${amount}&currency=gbp`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: `Basic ` + trustap_key,
//           Authorization: `Basic ` + authorized_key,
//         },
//       }
//     );
//     // console.log("..........chargeResponse", chargeResponse, resultGuest);
//     if (chargeResponse && chargeResponse?.data?.price) {
//       seller = await User.findOne({ _id: staff_id }).select({
//         trustap_user_id: 1,
//         _id: 0,
//       });

//       const createWithGuestUser = async () => {
//         try {
//           if (resultGuest?.status === true) {
//             buyer_id = resultGuest?.result?.trustap_user_id;
//           } else if (guestBuyerId) {
//             buyer_id = guestBuyerId;
//           } else {
//             currentUser = await User.findOne({ _id: customer_id });

//             buyer_id = currentUser?.trustap_user_id;
//           }

//           console.log("seller trustap id ----", seller?.trustap_user_id);
//           const newObj = {
//             seller_id: seller?.trustap_user_id,
//             buyer_id: buyer_id,
//             creator_role: "seller",
//             currency: chargeResponse?.data?.currency,
//             description: "Tip to " + seller?.trustap_user_id,
//             deposit_price: chargeResponse?.data?.price,
//             deposit_charge: chargeResponse?.data?.charge,
//             charge_calculator_version:
//               chargeResponse?.data?.charge_calculator_version,
//             skip_remainder: true,
//           };

//           // console.log(" newObj---------------", newObj);

//           console.log("authorized key----------", authorized_key);

//           const response = await axios.post(
//             `${dev_path}/api/v1/p2p/me/transactions/create_with_guest_user`,
//             newObj,
//             {
//               headers: {
//                 "Content-Type": "application/json",
//                 // Authorization: `Basic ` + trustap_key,
//                 Authorization: `Basic ` + authorized_key,
//               },
//             }
//           );

//           responseData = response?.data;
//         } catch (error) {
//           console.error("Error:", error);
//         }
//       };
//       await createWithGuestUser();
//     }

//     // console.log("responseData---------------", responseData);

//     console.log("getc country---------------", getCountry);

//     console.log("seller---------------", seller);

//     if (responseData?.id) {
//       const transaction = await Transaction.create({
//         payment_amount: responseData?.deposit_pricing?.price,
//         guest_id: checkGuest?._id || resultGuest?.result?._id || null,
//         buyer_id:
//           currentUser?._id ||
//           checkGuest?._id ||
//           resultGuest?.result?._id ||
//           null,
//         seller_id: staff_id,
//         transaction_id: responseData?.id,
//         buyer_trustap_id: buyer_id,
//         seller_trustap_id: seller?.trustap_user_id,
//         tip_id: resObject?._id,
//         country: getCountry,
//       });

//       // console.log("transaction---------------", transaction);

//       responseData.user_transaction = transaction?._id;
//       responseData.url = trustap_transaction_key + responseData?.id + pay_url;
//       res.send({
//         status: true,
//         message: "Payment Success",
//         result: resObject,
//         guestId: resultGuest?.result?._id,
//         data: responseData,
//       });
//     } else {
//       res.send({
//         status: true,
//         message: "Payment Error",
//         guestId: resultGuest?.result?._id,
//         data: responseData,
//       });
//     }
//   } catch (error) {
//     console.log("Err Payment==>", error);
//     res.send({
//       status: false,
//       message: "Something Went Wrong",
//     });
//   }
// };

export const addTip = async (req, res) => {
  const {
    tip_amount,
    donation_amount,
    resto_id,
    customer_id,
    staff_id,
    customer_tip_amount,
    total_tip_amount,
    // service_charge,
    customer_comment,
    is_customer_commented,
    is_group_tip,
    status,
    tip_type,
    customer_rating_to_staff,
    total_staff_given_amount,
    staff_tip_amount,
    guest_email,
    guest_name,
    // guest_mobile,
    guest_country,
    guest_country_code,
    is_guest_registerd_user,
    is_guest_tip,
    // gateway,
    // paymentType,
    // feesStatus,
    // paymentAmount,
    // totalAmount,
    // email,
    // full_name,
    // customerEmailAdd,
    // customerFullname,
    group_tip_status,
    country,
  } = req.body;

  // console.log("----add tip body---------", req.body);

  //  const referer = req.get("Referer") || req.get("Origin");
  //  console.log(`Frontend URL for add tip: ${referer}`);
  try {
    const staff = {
      tip_amount,
      staff_id,
    };

    const guest = {
      guest_email,
      guest_name,
      // guest_mobile,
      guest_country,
      guest_country_code,
      is_guest_registerd_user,
    };

    let result = new Tip({
      staff,
      donation_amount,
      total_tip_amount,
      resto_id,
      customer_id,
      service_charge: 0,
      customer_comment,
      is_customer_commented,
      is_group_tip,
      customer_tip_amount,
      total_staff_given_amount,
      status,
      tip_type,
      group_tip_status,
      customer_rating_to_staff,
      staff_tip_amount,
      guest,
      is_guest_tip,
    });

    let resultGuest;

    if (is_group_tip) {
      result.customer_tip_amount = total_tip_amount;
      result.total_staff_given_amount = total_tip_amount;
    }

    const resObject = await result.save();
    let responseData;
    let checkGuest;
    let currentUser;
    let buyer_id;
    let guestBuyerId;
    let seller;
    let getCountry;

    if (resObject.is_guest_tip === true) {
      checkGuest = await GuestDetails.findOne({
        guest_payment_email: guest_email,
      });

      if (
        checkGuest?.country !== guest_country ||
        !checkGuest?.trustap_user_id
      ) {
        resultGuest = await createGuestCustomer(resObject);
      } else {
        guestBuyerId = checkGuest?.trustap_user_id;
      }
    }
    const amount = total_tip_amount * 100;

    getCountry = country;

    const { authorized_key } = get_secret_keys(getCountry);
    const chargeResponse = await axios.get(
      `${dev_path}/api/v1/p2p/charge?price=${amount}&currency=gbp`,
      {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Basic ` + trustap_key,
          Authorization: `Basic ` + authorized_key,
        },
      }
    );
    if (chargeResponse && chargeResponse?.data?.price) {
      seller = await User.findOne({ _id: staff_id }).select({
        trustap_user_id: 1,
        _id: 0,
      });

      const createWithGuestUser = async () => {
        try {
          if (resultGuest?.status === true) {
            buyer_id = resultGuest?.result?.trustap_user_id;
          } else if (guestBuyerId) {
            buyer_id = guestBuyerId;
          } else {
            currentUser = await User.findOne({ _id: customer_id });

            buyer_id = currentUser?.trustap_user_id;
          }

          const newObj = {
            seller_id: seller?.trustap_user_id,
            buyer_id: buyer_id,
            creator_role: "seller",
            currency: chargeResponse?.data?.currency,
            description: "Tip to " + seller?.trustap_user_id,
            deposit_price: chargeResponse?.data?.price,
            deposit_charge: chargeResponse?.data?.charge,
            charge_calculator_version:
              chargeResponse?.data?.charge_calculator_version,
            skip_remainder: true,
          };

          console.log("authorized key----------", authorized_key);

          const response = await axios.post(
            `${dev_path}/api/v1/p2p/me/transactions/create_with_guest_user`,
            newObj,
            {
              headers: {
                "Content-Type": "application/json",
                // Authorization: `Basic ` + trustap_key,
                Authorization: `Basic ` + authorized_key,
              },
            }
          );

          responseData = response?.data;
        } catch (error) {
          console.error("Error:", error);
        }
      };
      await createWithGuestUser();
    }

    if (responseData?.id) {
      const transaction = await Transaction.create({
        payment_amount: responseData?.deposit_pricing?.price,
        guest_id: checkGuest?._id || resultGuest?.result?._id || null,
        buyer_id:
          currentUser?._id ||
          checkGuest?._id ||
          resultGuest?.result?._id ||
          null,
        seller_id: staff_id,
        transaction_id: responseData?.id,
        buyer_trustap_id: buyer_id,
        seller_trustap_id: seller?.trustap_user_id,
        tip_id: resObject?._id,
        country: getCountry,
      });

      responseData.user_transaction = transaction?._id;
      responseData.url = trustap_transaction_key + responseData?.id + pay_url;
      res.send({
        status: true,
        message: "Payment Success",
        result: resObject,
        guestId: resultGuest?.result?._id,
        data: responseData,
      });
    } else {
      res.send({
        status: true,
        message: "Payment Error",
        guestId: resultGuest?.result?._id,
        data: responseData,
      });
    }
  } catch (error) {
    console.log("Err Payment==>", error);
    res.send({
      status: false,
      message: "Something Went Wrong",
    });
  }
};

export const updateTransaction = async (req, res) => {
  const { trustap_code, transaction_id } = req.body;

  if (!transaction_id) {
    return res.status(400).json({
      status: false,
      message: "Missing required fields: transaction_id",
    });
  }

  const trustap_status = trustap_code === "paid";

  try {
    const transactionDetails = await Transaction.findOne({ transaction_id });
    if (!transactionDetails) {
      return res.status(404).json({
        status: false,
        message: "Transaction not found",
      });
    }

    const { authorized_key: sellerAuthorizedKey } = get_secret_keys(
      transactionDetails.country
    );
    // console.log("Authorized key for seller:", sellerAuthorizedKey);

    if (trustap_status) {
      // Step 1: Accept deposit
      const acceptDepositResponse = await axios.post(
        `${dev_path}/api/v1/p2p/transactions/${transaction_id}/accept_deposit`,
        {},
        {
          headers: {
            "Trustap-User": transactionDetails.seller_trustap_id,
            "Content-Type": "application/json",
            Authorization: `Basic ${sellerAuthorizedKey}`,
          },
        }
      );

      if (acceptDepositResponse.status !== 200) {
        return res.status(403).json({
          status: false,
          message: "Unauthorized to accept deposit",
        });
      }

      let buyerAuthorizedKey;

      if (transactionDetails?.guest_id) {
        // Fetch from GuestDetails if guest_id exists
        const guestDetails = await GuestDetails.findById(
          transactionDetails.guest_id
        );
        if (guestDetails) {
          // buyer = guestDetails;
          console.log(
            "guestdetails.country---------------",
            guestDetails.country
          );
          const { authorized_key } = get_secret_keys(guestDetails.country);
          buyerAuthorizedKey = authorized_key;
        } else {
          return res.status(404).json({
            status: false,
            message: "Guest details not found",
          });
        }
      } else {
        // Fetch from User table if guest_id does not exist
        const user = await User.findById(transactionDetails.buyer_id);
        if (user) {
          // buyer = user;
          const { authorized_key } = get_secret_keys(user.country);
          buyerAuthorizedKey = authorized_key;
        } else {
          return res.status(404).json({
            status: false,
            message: "User details not found",
          });
        }
      }

      // console.log("Buyer authorization key:", buyerAuthorizedKey);
      // console.log("Buyer trustap id:", transactionDetails.buyer_trustap_id);

      const handoverResponse = await axios.post(
        `${dev_path}/api/v1/p2p/transactions/${transaction_id}/confirm_handover_with_guest_user`,
        {},
        {
          headers: {
            "Trustap-User": transactionDetails.buyer_trustap_id,
            "Content-Type": "application/json",
            Authorization: `Basic ${buyerAuthorizedKey}`,
            // Authorization: `Basic ${sellerAuthorizedKey}`,
          },
        }
      );


      if (handoverResponse.status !== 200) {
        return res.status(403).json({
          status: false,
          message: "Unauthorized to confirm handover",
        });
      }

      // Step 3: Claim for seller
      const claimResponse = await axios.post(
        `${dev_path}/api/v1/p2p/transactions/${transaction_id}/claim_for_seller`,
        {},
        {
          headers: {
            "Trustap-User": transactionDetails.seller_trustap_id,
            "Content-Type": "application/json",
            Authorization: `Basic ${sellerAuthorizedKey}`,
          },
        }
      );

      if (claimResponse.status !== 200) {
        return res.status(403).json({
          status: false,
          message: "Unauthorized to claim for seller",
        });
      }

      // Send success email
      trustAppTipSuccessEmail(transactionDetails);

      // Step 4: Update Tip and Transaction
      const updatedTip = await Tip.findByIdAndUpdate(
        transactionDetails.tip_id,
        { payment_status: trustap_status, is_claimed: true },
        { new: true }
      );

      if (!updatedTip) {
        return res.status(404).json({ message: "Tip not found" });
      }

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionDetails._id,
        { payment_status: trustap_status, is_claimed: true },
        { new: true }
      );

      if (!updatedTransaction) {
        return res.status(500).json({
          status: false,
          message: "Transaction could not be updated, please try again later",
        });
      }

      return res.json({
        status: true,
        message: "Transaction updated successfully",
        data: updatedTransaction,
      });
    }

    // If trustap_status is false, no update occurs
    return res.status(200).json({
      status: false,
      message: "Transaction not updated, trustap code is not 'paid'",
    });
  } catch (error) {
    console.error("Error-----------------------:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const checkPaypalPayment = async (req, res) => {
  try {
    const { orderID, payerID, paymentID } = req.body;
    await generatePaypalToken(async (data) => {
      if (data.access_token) {
        const url = `${configvalue.PaypalUrl}/v2/checkout/orders/${orderID}/capture`;
        const headers = {
          "paypal-partner-attribution-id": "GOTIPME_SP_PPCP",
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.access_token}`,
        };
        await axios
          .post(url, {}, { headers: headers })
          .then(async (order) => {
            if (order?.data?.status == "COMPLETED") {
              await Tip.updateOne(
                { session_id: orderID },
                { $set: { transaction_id: paymentID, payment_status: true } }
              );
              sendSuccessMail(req.body);
              return res.send({
                status: true,
                message: "Payment Success",
              });
            } else {
              return res.send({
                status: false,
                message: "payment Failed",
              });
            }
          })
          .catch((err) => {
            console.log("checkPaypalPayment orders==>", err.message);
            return res.send({
              status: false,
              message: "Something Went Wrong",
            });
          });
      } else {
        return res.send({
          status: false,
          message: "Something Went Wrong",
        });
      }
    });
  } catch (err) {
    console.log("checkPaypalPayment==>", err.message);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const getNoOfTipHistory = async (req, res) => {
  try {
    let condition = {};

    condition = {
      customer_id: mongoose.Types.ObjectId(req.query.customer_id),
      payment_status: true,
    };
    const data = await Tip.aggregate([
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
          as: "restoDetails",
        },
      },
      {
        $unwind: {
          path: "$restoDetails",
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

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const getTipHistory = async (req, res) => {
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

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const getNoofTotalTipbyid = async (req, res) => {
  try {
    let condition = {};

    condition = {
      resto_id: mongoose.Types.ObjectId(req.query.resto_id),
      "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
      payment_status: true,
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
    ]);
    res.send({ status: true, message: "User data found", result: data });
  } catch (e) {
    res.send({
      status: false,

      messgae: "Oops!! something went wrong",
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const getTotalTipbyid = async (req, res) => {
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
          resto_id: mongoose.Types.ObjectId(req.query.resto_id),
          "staff.staff_id": mongoose.Types.ObjectId(req.query.staff_id),
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
          path: "$staffDetails",
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

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const getstaffTipDetailsById = async (req, res) => {
  try {
    let condition = {};

    condition = {
      ...condition,
      _id: mongoose.Types.ObjectId(req.query._id),
      payment_status: true,
    };

    const result = await Tip.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "CustomerDetails",
        },
      },
      {
        $unwind: {
          path: "$CustomerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "staff.staff_id",
          foreignField: "_id",
          as: "StaffDetails",
        },
      },
      {
        $unwind: {
          path: "$StaffDetails",
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
        $lookup: {
          from: "users",
          localField: "group_staff.group_staff_id",
          foreignField: "_id",
          as: "GroupStaffDetails",
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

/**
 *
 * @param {*} req
 * @param {*} res
 */

export const updateTip = async (req, res) => {
  let date = new Date();
  try {
    let jsondata = {
      staff_comment: req.body.staff_comment,
      staff_comment_date: date,
      is_staff_commented: req.body.is_staff_commented,
    };
    const result = await Tip.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      { $set: jsondata },
      { new: true }
    );
    if (!result) {
      res.send({ status: false, message: "Error received" });
    } else {
      res.send({
        status: true,
        result: result,
      });
    }
  } catch (error) {
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

/**
 *
 * Constatn funciton used within this controller only
 */

const sendTipEmail = async (groupStaffData) => {
  let restaurantData = await User.findOne({
    _id: mongoose.Types.ObjectId(groupStaffData.user_id),
  });
  // Email template
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        table {
          border-collapse: collapse;
          width: 100%;
        }

        th, td {
          text-align: left;
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }
      </style>
    </head>
    <body>
      <h2>Group Pubstar Details</h2>
      <h3>Pub Name : ${restaurantData.full_name}</h3>
      <p>You have received request to distribute tip to following Pubstars.</p>
      <table>
        <tr>
          <th>Pubstar Name</th>
          <th>Tip Amount</th>
      
        </tr>
        {{#each group_staff}}
        <tr>
          <td>{{staff_name}}</td>
          <td>{{group_staff_amount}}</td>

        </tr>
        {{/each}}
      </table>
      <p>GoTipMe</p>
    </body>
    </html>
  `;

  // Compile the email template
  const template = handlebars.compile(emailTemplate);
  // Generate HTML content using the template and group staff data
  const htmlContent = template({ group_staff: groupStaffData.group_staff });
  SendEmail(
    "info@gotipme.com",
    "samit.sdei@gmail.com",
    "Group Staff Details",
    htmlContent
  );
};

/**
 * updateGroupTip
 */

export const updateGroupTip = async (req, res) => {
  try {
    const fetchRestro = await User.findById({
      _id: mongoose.Types.ObjectId(req.body.user_id),
    });
    for (let data of req.body.group_staff) {
      const fetchUser = await User.findById({
        _id: mongoose.Types.ObjectId(data.group_staff_id),
      });

      let text1 = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
        </p>
        <p></p>
        <p>This tip is provide to you as a group tip from the ${fetchRestro.restaurant_name} and will be shared to you by Pub as salary or incentives</p>
        <p> </p>
        <p>GoTipMe Team</p>
      </div>`;

      SendEmail("info@gotipme.com", fetchUser?.email, "Thank you", text1);
    }
    const result = await Tip.updateOne(
      { _id: mongoose.Types.ObjectId(req.body._id) },
      {
        $push: {
          group_staff: { $each: req.body.group_staff },
          // staff_comment: req.body.staff_comment,
        },
        $set: {
          // group_staff: { $each: req.body.group_staff },
          staff_comment: req.body.staff_comment,
          group_tip_status: req.body.group_tip_status,
        },
      },
      { new: true }
    );

    if (!result) {
      res.send({ status: false, message: "Error received" });
    } else {
      sendTipEmail(req.body);
      res.send({
        status: true,
        result: result,
      });
    }
  } catch (error) {
    // console.log("error----------", error);
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

/**
 * getStripePaypalCharge
 */

export const getStripePaypalCharge = async (req, res) => {
  try {
    const result = await ServiceFees.find({
      type: { $in: ["Stripe", "Paypal"] },
    });
    if (!result) {
      res.send({ status: false, message: "Error received" });
    } else {
      res.send({
        status: true,
        result: result,
      });
    }
  } catch (error) {
    res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

/**
 *
 * @param {*} data
 */

const sendSuccessMail = async (data) => {
  let fullDate = new Date();
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Payment Success</h2>  
      <p>Hello, ${data.customerFullname.split(" ")[0]}</p>
      <p>Thank you so much for your generous tip!</p>
      <p>${data.full_name.split(" ")[0]} will receive £ ${data.paymentAmount
    }</p>
      <p> </p>
      <p>GoTipMe pays 100% of all tips to bartenders. If you would like to support the platform, click here!</p>
      <p>---------------------------------</p>
      <p>${months[fullDate.getMonth()]
    },${fullDate.getDate()} ${fullDate.getFullYear()}</p>
      <p>${fullDate.toLocaleTimeString()}</p>
      <p>Total amount charged :£ ${data.totalAmount}</p>
      

    </div>`;

  let text1 = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Payment Success</h2>  
      <p>Hi, ${data.full_name.split(" ")[0]}</p>
      <p></p>
      <p>You have just received a tip from ${data.customerFullname} of £ ${data.paymentAmount
    } </p>
      <p> </p>
      <p>The tip will arrive in your account in 2-7 seven days 🗓️</p>
      <p>You’re doing a great job! </p>
      <p>GoTipMe Team</p>
      
    </div>`;

  SendEmail("info@gotipme.com", data.customerEmailAdd, "Thank you", text);

  SendEmail("info@gotipme.com", data.email, "Thank you", text1);
};

/**
 * trustAppTipSuccessEmail
 *
 */

const trustAppTipSuccessEmail = async (transaction) => {
  let buyerDetail = await GuestDetails.findOne({
    _id: mongoose.Types.ObjectId(transaction.buyer_id),
  });
  if (!buyerDetail) {
    buyerDetail = await User.findOne({
      _id: mongoose.Types.ObjectId(transaction.buyer_id),
    });
  }

  let sellerDetail = await User.findOne({
    _id: mongoose.Types.ObjectId(transaction.seller_id),
  });

  let tipDetail = await Tip.findOne({
    _id: mongoose.Types.ObjectId(transaction.tip_id),
  });

  let fullDate = new Date();
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let buyer_full_name = buyerDetail?.full_name
    ? buyerDetail?.full_name
    : buyerDetail?.guest_name;
  let buyer_email = buyerDetail?.email
    ? buyerDetail?.email
    : buyerDetail?.guest_payment_email;
  let text = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Payment Success</h2>  
      <p>Hello, ${buyer_full_name}</p>
      <p>Thank you so much for your generous tip!</p>
      <p>${sellerDetail?.full_name} will receive £ ${tipDetail.total_tip_amount
    }</p>
      <p> </p>
      <p>GoTipMe pays 100% of all tips to bartenders. If you would like to support the platform, click here!</p>
      <p>---------------------------------</p>
      <p>${months[fullDate.getMonth()]
    },${fullDate.getDate()} ${fullDate.getFullYear()}</p>
      <p>${fullDate.toLocaleTimeString()}</p>
      <p>Total amount charged :£ ${tipDetail?.total_tip_amount}</p>
    </div>`;

  let text1 = `
      <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <h2 style="font-size: 20px; color: #444444; margin-bottom: 20px;">Payment Success</h2>  
      <p>Hi, ${sellerDetail?.full_name}</p>
      <p></p>
      <p>You have just received a tip from ${buyer_full_name} of £ ${tipDetail?.total_tip_amount} </p>
      <p> </p>
      <p>The tip will arrive in your account in 2-7 seven days 🗓️</p>
      <p>You’re doing a great job! </p>
      <p>GoTipMe Team</p>
      
    </div>`;

  SendEmail("info@gotipme.com", buyer_email, "Thank you", text);

  SendEmail("info@gotipme.com", sellerDetail?.email, "Thank you", text1);
};

/**
 * updateTransaction
 */

// export const updateTransaction = async (req, res) => {
//   const { trustap_code, transaction_id } = req.body;

//   let trustap_status = trustap_code === "paid" ? true : false;
//   // let getCountry;

//   if (!transaction_id) {
//     return res.status(400).json({
//       status: false,
//       message: "Missing required fields: transaction_id",
//     });
//   }

//   try {
//     const getTransactionDetails = await Transaction.findOne({
//       transaction_id: transaction_id,
//     });

//     if (!getTransactionDetails) {
//       return res.status(404).json({
//         status: false,
//         message: "Transaction not found",
//       });
//     }

//     // console.log("trustapstatysu----.data====", trustap_status);
//     // getCountry = getTransactionDetails?.buyer_id
//     let { authorized_key } = get_secret_keys(getTransactionDetails?.country);

//     console.log("accept deposity ====", authorized_key);

//     if (trustap_status) {
//       // Step 1: Accept deposit
//       const acceptDepositResponse = await axios.post(
//         `${dev_path}/api/v1/p2p/transactions/${transaction_id}/accept_deposit`,
//         {},
//         {
//           headers: {
//             "Trustap-User": getTransactionDetails?.seller_trustap_id,
//             "Content-Type": "application/json",
//             // Authorization: `Basic ${trustap_key}`,
//             // Authorization: `Basic ${authorized_key}`,
//             Authorization: `Basic ` + authorized_key,
//           },
//         }
//       );

//       // console.log("acceptDepositResponse.data====", acceptDepositResponse.data);

//       if (acceptDepositResponse.status !== 200) {
//         return res.status(403).json({
//           status: false,
//           message: "Unauthorized to accept deposit",
//         });
//       }

//       const user = await User.findOne({_id:getTransactionDetails?._id})
//       console.log("user",user)

//     let userkey = get_secret_keys(user?.country);
//     console.log("user key",userkey)

//       console.log("handOverUser keyuy====", userkey?.authorized_key);

//       // Step 2: Confirm handover
//       const handOverUserResponse = await axios.post(
//         `${dev_path}/api/v1/p2p/transactions/${transaction_id}/confirm_handover_with_guest_user`,
//         {},
//         {
//           headers: {
//             "Trustap-User": getTransactionDetails?.buyer_trustap_id,
//             "Content-Type": "application/json",
//             // Authorization: `Basic ${trustap_key}`,
//             // Authorization: `Basic ${authorized_key}`,
//             // Authorization: `Basic ` + authorized_key,
//             Authorization: `Basic ` + userkey?.authorized_key,
//           },
//         }
//       );

//       if (handOverUserResponse.status !== 200) {
//         return res.status(403).json({
//           status: false,
//           message: "Unauthorized to confirm handover",
//         });
//       }

//       // console.log("handOverUser keyuy====", authorized_key);
//       // console.log("claimForSellerResponse. key ====", authorized_key);
//       console.log("claim keyuy====", authorized_key);

//       // Step 3: Claim for seller
//       const claimForSellerResponse = await axios.post(
//         `${dev_path}/api/v1/p2p/transactions/${transaction_id}/claim_for_seller`,
//         {},
//         {
//           headers: {
//             "Trustap-User": getTransactionDetails?.seller_trustap_id,
//             "Content-Type": "application/json",
//             // Authorization: `Basic ${trustap_key}`,
//             // Authorization: `Basic ${authorized_key}`,
//             Authorization: `Basic ` + authorized_key,
//           },
//         }
//       );

//       // console.log(
//       //   "claimForSellerResponse----.data====",
//       //   claimForSellerResponse.data
//       // );

//       if (claimForSellerResponse.status === 200) {
//         // send email to bartender
//         trustAppTipSuccessEmail(getTransactionDetails);
//         // return res.status(403).json({
//         //   status: false,
//         //   message: "Unauthorized to claim for seller",
//         // });
//       } else {
//         return res.status(403).json({
//           status: false,
//           message: "Unauthorized to claim for seller",
//         });
//       }

//       // Update Tip and Transaction (only if trustap_status is true)
//       const updateTip = await Tip.findOneAndUpdate(
//         { _id: getTransactionDetails?.tip_id },
//         { payment_status: trustap_status, is_claimed: true },
//         { new: true }
//       );

//       if (!updateTip) {
//         return res.status(404).json({ message: "Tip not found" });
//       }

//       const updatedTransaction = await Transaction.findOneAndUpdate(
//         { _id: getTransactionDetails?._id, transaction_id: transaction_id },
//         { payment_status: trustap_status, is_claimed: true },
//         { new: true }
//       );

//       if (!updatedTransaction) {
//         return res.status(500).json({
//           status: false,
//           message: "Transaction could not be updated, please try again later",
//         });
//       }

//       // Return success response
//       return res.send({
//         status: true,
//         message: "Transaction updated successfully",
//         data: updatedTransaction,
//       });
//     }

//     // If trustap_status is false, no update occurs
//     return res.status(200).json({
//       status: false,
//       message: "Transaction not updated, trustap code is not 'paid'",
//     });
//   } catch (error) {
//     console.error("Error response:---------------------", error);
//     res.status(500).send({
//       status: false,
//       message: "Something went wrong",
//     });
//   }
// };

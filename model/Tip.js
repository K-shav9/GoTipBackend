import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const tipSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Types.ObjectId, ref: "User" },
  resto_id: { type: mongoose.Types.ObjectId, ref: "User" },

  tip_unique_number: { type: String },

  total_tip_amount: { type: Number }, // tip amount + donation amount
  payment_amount: { type: Number }, //null
  service_charge: { type: Number }, //null
  donation_amount: { type: Number }, //by customer
  customer_tip_amount: { type: Number },
  total_staff_given_amount: { type: Number }, //customer tip_amount - service charge

  tip_type: { type: Boolean, default: 0 },
  grand_total: { type: Number },
  staff_tip_amount: { type: Number },

  customer_rating_to_staff: { type: String },
  customer_comment: { type: String },
  customer_comment_date: { type: Date },
  is_customer_commented: { type: Boolean, default: 0 },
  staff_rating_to_customer: { type: String },
  staff_comment: { type: String },
  staff_comment_date: { type: Date },
  is_staff_commented: { type: Boolean, default: 0 },
  actual_tipamount: { type: Number },
  is_group_tip: { type: Boolean, default: 0, required: true },
  staff: {
    staff_id: { type: mongoose.Types.ObjectId, ref: "User" },
    // staff_name: { type: String },
    tip_amount: { type: Number },
    // tip_status : { type: Boolean },
  },
  group_staff: [
    {
      group_staff_id: { type: mongoose.Types.ObjectId, ref: "User" },
      group_staff_amount: { type: Number },
      staff_name: { type: String },
      profile: { type: String },
    },
  ],

  is_guest_tip: { type: Boolean, default: 0 },
  guest: {
    guest_email: { type: String },
    guest_name: { type: String },
    guest_mobile: { type: String },
    guest_country: { type: String },
    guest_country_code: { type: String },
    is_guest_registerd_user: { type: Boolean, default: 0 },
    guest_id: { type: mongoose.Types.ObjectId, ref: "User" },
  },

  description: { type: String },
  status: {
    enum: ["0", "1", "2", "3"],
    type: String,

    // enum: [0, 1, 2,3, 4], /*   0 = pending, 1 = Indvidual Tip  , 2 = Group Tipping ,3=Canceled ,4=staff customer   required: true,
  },
  group_tip_status: {
    enum: ["1", "2", "3"],
    type: String,
    default: "1",
    // enum: [0, 1, 2,3, 4], /*   1 = Not Distrubuted  , 2 = Distributed    required: true,
  },

  transaction_id: { type: String },
  session_id: { type: String },
  payment_status: { type: Boolean, default: false },
  is_claimed: { type: Boolean, default: false },

  // 0 : pending , 1 :success

  is_closed: { type: Boolean, default: 0 },
  createdBy: { type: mongoose.Types.ObjectId },
  updatedBy: { type: mongoose.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },
});

tipSchema.plugin(paginate);
tipSchema.plugin(aggregatePaginate);

const Tip = mongoose.model("Tip", tipSchema);

export default Tip;

import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const guestdetails = new mongoose.Schema({
  guest_payment_id: {
    type: String,
    // required: true,
  },
  guest_name: {
    // Added
    type: String,
    required: true,
  },
  guest_payment_email: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
  },
  country: {
    type: String,
  },
  trustap_user_id: { type: String },
  guest_payment_card: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});
guestdetails.plugin(paginate);
guestdetails.plugin(aggregatePaginate);
const GuestDetails = mongoose.model("GuestDetails", guestdetails);

export default GuestDetails;

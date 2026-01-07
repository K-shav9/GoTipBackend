import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
  },
  user_name: {
    type: String,
  },
  restaurant_name: {
    type: String,
  },
  is_updated: {
    type: Boolean,
    default: 0,
  },
  is_otpMatch: {
    type: Boolean,
    default: 0,
  },
  otp: {
    type: String,
  },
  restaurant_email: {
    type: String,
  },
  email: {
    type: String,
  },

  contact_number: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  country: {
    type: String,
  },
  restaurantContact_number: {
    type: String,
  },
  // gatewayPlatform:[
  //   {
  //     account_id: { type: String },
  //     partner_id:{type: String},
  //     type: { type: String },
  //     status:{type: String}
  //   }
  // ],
  trustap_user_id: { type: String },
  trustap_connected: { type: Boolean, default: false },
  social_media: {
    type: String,
  },
  socialStatus: { type: Boolean, default: false },
  socialType: {
    type: String,
  },
  password: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  lat: {
    type: Number,
  },
  lng: {
    type: Number,
  },
  addressLine2: {
    type: String,
  },

  city: {
    type: String,
  },
  image: {
    type: String,
  },

  profile: {
    type: String,
  },
  postcode: {
    type: String,
  },
  // card_details: {
  //   card_holder_name: { type: String },
  //   card_number: { type: String },
  //   card_expiring_date: { type: String },
  //   card_cvv: { type: String },
  // },
  status: { type: Boolean, default: true },
  staff_request_accepted: {
    enum: ["0", "1"],
    type: String,
    default: 0,
    // enum: [0, 1, 2,3, 4], /*   0 = pending, 1 = Accept
  },
  verifyStatus: {
    type: Number,
  },
  bio: {
    type: String,
  },
  emailOTP: {
    type: String,
  },
  requestCode: {
    type: String,
  },
  customer_payment_id: {
    type: String,
  },
  customer_payment_email: {
    type: String,
  },
  customer_payment_card: {
    type: String,
  },
  photoGallery: [
    {
      image: { type: String },
      created_date: { type: Date },
    },
  ],

  role: {
    enum: ["0", "1", "2", "3", "4", "5"],
    type: String,
    // enum: [0, 1, 2,3, 4], /*   0 = admin, 1 = customer , 2 = bar/Resturant ,3=staff ,4=staff customer
    // guest="5" required: true,
  },

  created_date: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
userSchema.plugin(paginate);
userSchema.plugin(aggregatePaginate);
const User = mongoose.model("User", userSchema);

export default User;

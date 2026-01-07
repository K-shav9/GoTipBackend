import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const dashboardcontactusschema = new mongoose.Schema({

  full_name: {
    type: String,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
  },
  reply_by_admin: { type: String },
  status: { enum: ["0", "1", "2"], type: String, default: 0 },
  //  0:open , 1:hold, 2:reolved
  is_guest_contact_us: { type: Boolean, default: 0 },
  is_restro_contact_us: { type: Boolean, default: 0 },
  is_customer_contact_us: { type: Boolean, default: 0 },
  is_staff_contact_us: { type: Boolean, default: 0 },
  createdAt: { type: Date, default: Date.now },
  resolved_date: { type: Date },

});
dashboardcontactusschema.plugin(paginate);
dashboardcontactusschema.plugin(aggregatePaginate);
const DashboardContactUs = mongoose.model("DashboardContactUs", dashboardcontactusschema);

export default DashboardContactUs;

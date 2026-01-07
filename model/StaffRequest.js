import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const staffRequestSchema = new mongoose.Schema({
  resto_id: { type: mongoose.Types.ObjectId, ref: "User" },
  staff_id: { type: mongoose.Types.ObjectId, ref: "User" },
  staff_name: { type: String },
  description: { type: String },
  status: {
    enum: ["0", "1", "2", "3","4"],
    type: String,
    default:0
    // enum: [0, 1, 2,3, 4], /*   0 = pending, 1 = Accept  , 2 = Reject ,3=Canceled ,4=leave  required: true,
  },

  
  request_date: { type: Date },
  is_closed: { type: Boolean, default: 0 },
  createdBy: { type: mongoose.Types.ObjectId },
  updatedBy: { type: mongoose.Types.ObjectId },
  createdAt: { type: Date, default: Date.now },

  manage_staff_edit: { type: Boolean, default: 0 },
  manage_staff_delete: { type: Boolean, default: 0 },
  invitation_request: { type: Boolean, default: 0 },
  tip_management: { type: Boolean, default: 0 },
  
});


staffRequestSchema.plugin(paginate);
staffRequestSchema.plugin(aggregatePaginate);
const StaffRequest = mongoose.model("StaffRequest", staffRequestSchema);

export default StaffRequest;

import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const restoStaffSchema = new mongoose.Schema({

    resto_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    staff_id: { type: mongoose.Types.ObjectId, ref: "User" },
    description: { type: String },
    status: {
        enum: ["0", "1", "2", "3","4"], type: String,
        // enum: [0, 1, 2,3, 4], /*   0 = pending, 1 = Accept  , 2 = Reject ,3=Canceled ,4=leave  required: true,
    },
    is_closed: { type: Boolean, default: 0 },
    createdBy: { type: mongoose.Types.ObjectId },
    updatedBy: { type: mongoose.Types.ObjectId },
    createdAt: { type: Date, default: Date.now }
});


restoStaffSchema.plugin(paginate);
restoStaffSchema.plugin(aggregatePaginate);
const RestoStaff = mongoose.model("RestoStaff", restoStaffSchema);

export default RestoStaff;

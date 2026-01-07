import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const notificationmessageschema = new mongoose.Schema(
  {
    recieverId: { type: mongoose.Types.ObjectId, ref: "User" },
    senderId:{ type: mongoose.Types.ObjectId, ref: "User" },
    message: { type: String},
   type: { type: String},
   read: { type: Boolean, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
notificationmessageschema.plugin(paginate);
notificationmessageschema.plugin(aggregatePaginate);
const NotificationMessage = mongoose.model("NotificationMessage", notificationmessageschema);

export default NotificationMessage;

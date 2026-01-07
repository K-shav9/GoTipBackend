import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const notificationschema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    notification_content: { type: String, required: true },
    status: {type: Boolean, default: true},
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
notificationschema.plugin(paginate);
notificationschema.plugin(aggregatePaginate);
const Notification = mongoose.model("Notification", notificationschema);

export default Notification;

import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const paymentschema = new mongoose.Schema({
  customer_payment_id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  createdAt: { type: Date, default: Date.now },
});
paymentschema.plugin(paginate);
paymentschema.plugin(aggregatePaginate);
const Payment = mongoose.model("Payment", paymentschema);

export default Payment;

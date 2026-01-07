import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const transactionSchema = new mongoose.Schema({
  payment_amount: { type: Number }, //null
  guest_id: { type: mongoose.Types.ObjectId, required: false },
  buyer_id: { type: mongoose.Types.ObjectId, required: false },
  seller_id: { type: mongoose.Types.ObjectId, required: false },
  transaction_id: { type: String },
  payment_status: { type: Boolean, default: false },
  is_claimed: { type: Boolean, default: false },
  buyer_trustap_id: { type: String, required: false },
  seller_trustap_id: { type: String, required: false },
  // seller_full_trustap_id : {type: String , required:false},
  tip_id: { type: mongoose.Types.ObjectId, required: false },
  country: { type: String, required: false },
  is_deleted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

transactionSchema.plugin(paginate);
transactionSchema.plugin(aggregatePaginate);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

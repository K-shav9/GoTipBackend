import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const emailtemplateschema = new mongoose.Schema(
  {
    template_name: { type: String},
    subject:{ type: String},
    body:{ type: String},
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
emailtemplateschema.plugin(paginate);
emailtemplateschema.plugin(aggregatePaginate);
const EmailTemplate = mongoose.model("EmailTemplate", emailtemplateschema);

export default EmailTemplate;

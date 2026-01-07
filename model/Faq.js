import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const faqschema = new mongoose.Schema({
    
        faq_question: {
          type: String,
          required: true,
        },
        faq_answer: {
          type: String,
          required: true,
        },
        status: {type: Boolean, default: true},
        createdAt: { type: Date, default: Date.now },
      },
      {
        versionKey: false,
        timestamps: true,
      
}, 

);
faqschema.plugin(paginate);
faqschema.plugin(aggregatePaginate);
const Faq = mongoose.model("Faq", faqschema);

export default Faq;

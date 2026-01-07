import mongoose from "mongoose";

const landingpageschema = new mongoose.Schema({
  about_us: {
    about_us_heading: { type: String },
    about_us_content: { type: String },
  },
  footer_content:{
     type: String 
  }
  // how_it_works: [
  //   {
  //     serial_no: { type: Number },
  //     how_it_works_content: { type: String },
  //   },
  // ],
  // faq: [
  //   {
  //     faq_question: { type: String },
  //     faq_answer: { type: String },
  //     status: {
  //       enum: ["0", "1"],
  //       type: String,
  //       default: 0,
  //       // enum: [0, 1], /*   0 = active, 1 = inactive  ,
  //     },
  //   },
  // ],
});

const Landingpage = mongoose.model("Landingpage", landingpageschema);

export default Landingpage;

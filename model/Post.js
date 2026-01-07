import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  user_id:{
    type:mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
  },
  bloglink:{
    type:String
  },
  postType:{
    type:String
  },
  postFiles:[{
    fileName: { type: String },
    created_date: { type: Date },
  }],

  likes:[{
    user_id:{
      type:mongoose.Schema.Types.ObjectId
    },
    created_date: { type: Date },
  }],
  created_date: { type: Date },
  createdAt: { type: Date, default: Date.now },
});
postSchema.plugin(paginate);
postSchema.plugin(aggregatePaginate);
const Posts = mongoose.model("Posts", postSchema);

export default Posts;

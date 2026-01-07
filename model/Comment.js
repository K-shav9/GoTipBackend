import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId
    },
    replies: [{
        comment: { type: String },
        user_id: {
            type: mongoose.Schema.Types.ObjectId
        },
        created_date: { type: Date },
    }],

   
    created_date: { type: Date },
    createdAt: { type: Date, default: Date.now },
});
commentSchema.plugin(paginate);
commentSchema.plugin(aggregatePaginate);
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;

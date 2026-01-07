
import { Mongoose } from "mongoose";
import {
  responseCodes,
  messageID,
  messages,

} from "../constant";
import mongoose from "mongoose";
import Posts from "../model/Post.js";
import Comment from "../model/Comment.js";
import _ from "mongoose-paginate-v2";
import User from "../model/user.js";

export const uploadPost = async (req, res) => {
  try {

    let payload = [];
    const post = req.body;
    // console.log("adsada", post)
    for (let file of req.files) {
      let data = {
        fileName: file.filename,
        created_date: new Date()
      }
      payload.push(data)
    }

    if (post.description === undefined) {
      post.description = ""
    }

    post.postFiles = payload
    let savePost = await new Posts(post).save()
    if (savePost._id) {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
      })
    } else {

      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.internalServerError,
      });

    }

  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const fetchPosts = async (req, res) => {
  try {
    const fetchData = await Posts.find({ user_id: mongoose.Types.ObjectId(req.body._id) })
    if (fetchData) {

      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
        result: fetchData
      })

    } else {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.nocontent,
        message: 'No Record Found',
        result: []
      })

    }


  } catch (error) {
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    let data = {
      user_id: req.body.user_id,
      created_date: new Date()
    }

    const findLike = await Posts.find({ _id: mongoose.Types.ObjectId(req.body._id), "likes.user_id": mongoose.Types.ObjectId(req.body.user_id) })
    if (findLike.length > 0) {
      await Posts.updateMany({ _id: mongoose.Types.ObjectId(req.body._id) },
        { $pull: { likes: { user_id: mongoose.Types.ObjectId(req.body.user_id) } } },
      );
    } else {
      await Posts.findByIdAndUpdate(req.body._id, {
        $push: {
          likes: data,
        }
      }, { new: true });
    }
    const fetchData = await Posts.findById(req.body._id)
    if (fetchData) {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
        result: fetchData
      })

    } else {
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.nocontent,
        message: 'No Record Found',
        result: []
      })

    }


  } catch (error) {
    console.log("errr", error.message)
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const commentPost = async (req, res) => {
  try {
    req.body.created_date = new Date()
    if (req.body.comment_id) {
      await Comment.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(req.body.comment_id) }, {
        $push: {
          replies: req.body,
        }
      }, { new: true });
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
      })

    } else {

      const save = await new Comment(req.body).save()
      if (save) {
        return res.status(messageID.successCode).json({
          status: responseCodes.successStatus,
          messageID: messageID.successCode,
          message: 'Success',
        })

      } else {
        return res.status(messageID.successCode).json({
          status: responseCodes.successStatus,
          messageID: messageID.nocontent,
          message: 'No Record Uploaded',
        })

      }

    }

  } catch (error) {
    console.log("errr", error.message)
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};
export const editPost = async (req, res) => {
  try {

    const { _id } = req.body
    if (!_id) {
      const update = await Posts.findByIdAndUpdate(_id, { $set: req.body })
      return res.status(messageID.successCode).json({
        status: responseCodes.failedStatus,
        messageID: messageID.successCode,
        message: 'Failed',
      })
    } else {
      const update = await Posts.findByIdAndUpdate(_id, { $set: req.body })
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
      })
    }


  } catch (error) {
    console.log("errr", error.message)
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const deletePost = async (req, res) => {
  try {


    const { _id } = req.body
    if (!_id) {
      const update = await Posts.findByIdAndUpdate(_id, { $set: req.body })
      return res.status(messageID.successCode).json({
        status: responseCodes.failedStatus,
        messageID: messageID.successCode,
        message: 'Failed',
      })
    } else {
      await Posts.findByIdAndDelete(_id)
      return res.status(messageID.successCode).json({
        status: responseCodes.successStatus,
        messageID: messageID.successCode,
        message: 'Success',
      })
    }




  } catch (error) {
    console.log("errr", error.message)
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { type, _id , comment_id } = req.body

    if (type === "parent") {
      await Comment.findByIdAndDelete(_id)
    } else if (type === "child") {
      await Comment.updateMany({ _id: mongoose.Types.ObjectId(comment_id) },
      { $pull: { replies: { _id: mongoose.Types.ObjectId(_id) } } }
    );
    } else {
      return res.status(messageID.successCode).json({
        status: responseCodes.failedStatus,
        messageID: messageID.successCode,
        message: 'Failed',
      })
    }

    return res.status(messageID.successCode).json({
      status: responseCodes.successStatus,
      messageID: messageID.successCode,
      message: 'Success',
    })

  } catch (error) {
    console.log("errr", error.message)
    return res.status(messageID.internalServerError).json({
      status: responseCodes.failedStatus,
      messageID: messageID.internalServerError,
      message: messages.internalServerError,
    });
  }
};


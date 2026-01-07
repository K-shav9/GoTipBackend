import express from "express";
import { uploadVideo } from "../middleware/uploadvideo";
import { commentPost, deleteComment, deletePost, editPost, fetchPosts, likePost, uploadPost } from "../controller/post";
import { verifyToken } from "../middleware/verifyToken";


const router = express.Router();
router.post("/uploadPost",   uploadVideo, uploadPost)
router.post("/fetchPosts",  verifyToken , fetchPosts)
router.post("/likePost",  verifyToken , likePost)
router.post("/commentPost",  verifyToken , commentPost)
router.post("/deletePost",  verifyToken , deletePost)
router.post("/editPost",  verifyToken , editPost)
router.post("/deleteComment",  verifyToken , deleteComment)


export default router;

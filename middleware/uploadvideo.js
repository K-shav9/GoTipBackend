import multer from "multer";
import { messageID, messages, responseCodes } from "../constant";


export const uploadVideo = (req, res, next) => {
  let storagePath
  if (req.query.type == "image") {
    storagePath = "./public/posts"
  } else if (req.query.type == "video") {
    storagePath = "./public/video"
  } else if (req.query.type == "audio") {
    storagePath = "./public/audio"
  }
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, storagePath);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      // console.log("asdasd" , file , )
      //   if (
      //     ( req.query.type == "audio" &&file.mimetype !== "audio/mpeg") || ( req.query.type == "video"&&file.mimetype !== "video/mp4") || (req.query.type == "image"&&file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') 
      //   ) {
      //     console.log("asdasd" )
      //     return res.status(messageID.failureCode).json({
      //       status: responseCodes.failedStatus,
      //       messageID: messageID.failureCode,
      //       message: messages.imageType,
      //     });
      //   }
      cb(null, true);
    },
  }).array(req.query.type, 9)(req, res, function (err) {
    if (err) {
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.internalError,
      });
    }
    next();
  });
};

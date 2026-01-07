import multer from "multer";
import { messageID, messages, responseCodes } from "../constant";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profile");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const uploadprofile = (req, res, next) => {
  multer({
    storage: storage,
    fileFilter: (req, file, cb) => {

      // console.log("sdfdsfsdf" ,file.mimetype  )
      if (
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpeg" &&
        file.mimetype !== "image/jpg" &&
        file.mimetype !== "image/webp"
      ) {
        return res.status(messageID.failureCode).json({
          status: responseCodes.failedStatus,
          messageID: messageID.failureCode,
          message: messages.imageType,
        });
      }
      cb(null, true);
    },
  }).single("profile")(req, res, function (err) {
    if (err) {
      console.log("err", err);
      return res.status(messageID.internalServerError).json({
        status: responseCodes.failedStatus,
        messageID: messageID.internalServerError,
        message: messages.internalError,
      });
    }
    next();
  });
};

import multer from 'multer';
import { messageID, messages, responseCodes } from '../constant';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/posts');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const multipleUpload = (req, res, next) => {
    multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg'&& file.mimetype !== "image/webp") {
                return res.status(messageID.failureCode).json({
                    status: responseCodes.failedStatus,
                    messageID: messageID.failureCode,
                    message: messages.imageType
                })
            }
            cb(null, true);
        },
    }).array("image" , 5)(req, res, function (err) {
        if (err) {
            return res.status(messageID.internalServerError).json({
                status: responseCodes.failedStatus,
                messageID: messageID.internalServerError,
                message: messages.internalError
            })
        }
        next();
    })
}

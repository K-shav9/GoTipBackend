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

export const upload = (req, res, next) => {
    multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
                return res.status(messageID.failureCode).json({
                    status: responseCodes.failedStatus,
                    messageID: messageID.failureCode,
                    message: messages.imageType
                })
            }
            cb(null, true);
        },
    }).single('image')(req, res, function (err) {
        if (err) {
            console.log("err",err.message)
            return res.status(messageID.internalServerError).json({
                status: responseCodes.failedStatus,
                messageID: messageID.internalServerError,
                message: messages.internalError
            })
        }
        next()
    })

  
}

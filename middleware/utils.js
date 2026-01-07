import jwt from "jsonwebtoken";
import User from "../model/user";
// export const tokenGenerator = async (user) => {
//     try {
//         let payload = {};
//         payload._id = user._id;
//         payload.email = user.email;
//         payload.role = user.role;
//         // payload.first_login = user.first_login;
//         let data = await jwt.sign(payload, secret.jwt, { expiresIn: '24h' });
//         // payload.token = data;
//         payload.token = data;
//         payload.token_created_time = moment(new Date).format("YYYY-MM-DD, HH:mm:ss");
//         payload.token_expire_time = moment(new Date).add(24, 'hours').format("YYYY-MM-DD, HH:mm:ss");
//         return { status: true, token: payload };
//     } catch (err) {
//         return { status: false };
//     }
// }
export const token = async (user) => {
    try {
        let payload = {};
        payload._id = user._id;
        payload.email = user.email;
        payload.role = user.role;
        // payload.first_login = user.first_login;
        let data = await jwt.sign(payload, secret.jwt, { expiresIn: '24h' });
        payload.token = data;
        return { status: true, token: payload };
    } catch (err) {
        return { status: false };
    }
}
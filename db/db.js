import mongoose from "mongoose";

const config = require("../config/config")
import 'dotenv/config'
console.log(process.env.Node_env)
const configvalue = config.get(process.env.Node_env);
const DB = configvalue["DB"];

var options = {
    user: DB.UserName,
    pass: DB.Password,
}
const MONGOURI = `${DB.URI}`
// const MONGOURI = `mongodb://${DB.HOST}:${DB.PORT}/${DB.DATABASE}`
console.log(MONGOURI);
export const mongoconnection = async () => {
    try {
        await mongoose.connect(MONGOURI);
        console.log("Connected to DB");
    } catch (e) {
        console.log(e);
        throw e
    }
}
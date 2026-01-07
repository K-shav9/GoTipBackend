"use strict";

require("@babel/register");
require("@babel/polyfill");
// const https = require("https");
const https = require("http");
const fs = require("fs");

const app = require("../app").default;
// const serverOptions = {
//   key: fs.readFileSync("/home/jenkins/SSL/ss.key"),
//   cert: fs.readFileSync("/home/jenkins/SSL/ss.crt"),
//   ca: fs.readFileSync("/home/jenkins/SSL/ssb.crt"),
// };
const server = https.createServer(app);
// -------
// "use strict";
// require("@babel/register");
// require("@babel/polyfill");
// const http = require("http");
// const fs = require("fs");
// const app = require("../app").default;
// const server = http.createServer(app);
// const socketIO = require("socket.io");
// -------------------------------------------
const config = require("../config/config");
const {
  AddMessage,
  NotificationList,
  SendTip,
  addNotifications,
  Super_Admin_NotificationList,
  addDistributegroupTip,
} = require("../controller/notifications/NotificationMessage");
const { default: User } = require("../model/user");

const configvalue = config.get(process.env.Node_env);

const port = configvalue.PORTNO;
server.listen(port);
var io = require("socket.io")(server, {
  transports: ["websocket"],
  // maxHttpBufferSize: 1e12,
  // pingTimeout: 6000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("join", (data) => {
    socket.join(data);
  });

  //  Staff request event
  socket.on("staff-request-event", async (data) => {
    let add_message = await addNotifications(data);
    let notificationList = await NotificationList(data.recieverId);
    await socket.join(data.recieverId);
    await io.in(data.recieverId).emit("receive-request", notificationList);
  });

  socket.on("loginevent", async (data) => {
    let allNotifications = await NotificationList(data);
    await socket.emit("notifications-list", allNotifications);
  }); // Handle disconnection

  // Customer Tip event

  socket.on("customer-tip", async (data) => {
    let add_message = await addNotifications(data);
    let notificationList = await NotificationList(data.recieverId);
    await socket.join(data.recieverId);
    await io.in(data.recieverId).emit("receive-tip", notificationList);
  });

  //  Guest Tip event

  socket.on("guest-tip", async (data) => {
    let add_message = await addNotifications(data);
    let notificationList = await NotificationList(data.recieverId);
    await socket.join(data.recieverId);
    await io.in(data.recieverId).emit("guest-receive-tip", notificationList);
  });

  // Request Accepted from restaurant
  socket.on("request-accept", async (data) => {
    let add_message = await addNotifications(data);
    let notificationList = await NotificationList(data.recieverId);
    await socket.join(data.recieverId);
    await io.in(data.recieverId).emit("accepted-request", notificationList);
  });
  // Request Rejected from restaurant
  socket.on("request-reject", async (data) => {
    let add_message = await addNotifications(data);
    let notificationList = await NotificationList(data.recieverId);
    await socket.join(data.recieverId);
    await io.in(data.recieverId).emit("rejected-request", notificationList);
  });
  // Super-Admin
  socket.on("super-admin-login", async (data) => {
    let allNotifications = await Super_Admin_NotificationList();
    await socket.emit("super-admin-notifications-list", allNotifications);
  });
  // Distribute the group tip
  socket.on("distribute-group-tip", async (data) => {
    let add_message = await addDistributegroupTip(data);
    let adminData = await User.findOne({
      role: 0,
    });
    let notificationList = await Super_Admin_NotificationList(adminData._id);
    await socket.join(adminData._id);
    await io.in(adminData._id).emit("receive-tipdistribute", notificationList);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.on("listening", () => {
  console.log(`Listening on ${port}`);
});

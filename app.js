import express from "express";
import cors from "cors";
import { mongoconnection } from "./db/db";
import bodyParser from "body-parser";
import UserRoutes from "./routes/user";
import RestaurantRoutes from "./routes/Restaurant"
import CustomerRoutes from "./routes/Customer"
import TipRoutes from './routes/Tip'
import StaffRoutes from './routes/Staff'
import LandingPageRoutes from './routes/LandingPage'
import SuperAdminRoutes from './routes/Super-admin'
import ReportRoutes from './routes/Reports'
import PaymentRoutes from './routes/Payment'
import NotificationRoutes from './routes/Notification'
import PostRoutes from './routes/Post'
import { wehook } from "./controller/webhook";

const app = express();
mongoconnection();

app.use(cors({ origin: "*" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/" , ()=>{
  console.log("Adsadas")
})

app.use("/public/posts",express.static("public/posts"));
app.use("/public/profile",express.static("public/profile"));
app.use("/public/video",express.static("public/video"));
app.use("/public/audio",express.static("public/audio"));

app.use(bodyParser.json());

app.use(bodyParser.json({ limit: "50mb" }));

app.use("/api/users", UserRoutes);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/customer", CustomerRoutes);
app.use("/api/staff", StaffRoutes);
app.use("/api/landingpage", LandingPageRoutes);
app.use("/api/tip" ,TipRoutes);
app.use("/api/superadmin" ,SuperAdminRoutes);
app.use("/api/report" ,ReportRoutes);
app.use("/api/payment" ,PaymentRoutes);
app.use("/api/notification" ,NotificationRoutes);
app.use("/api/post" ,PostRoutes);
app.post("/webhook" , wehook)

// To handle error
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something Went Wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

export default app;

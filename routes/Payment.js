import express from "express";
import { createCustomer, addNewcard, createCharges, addGuestNewcard, createGuestCharges } from "../controller/Payment";

const router = express.Router();

router.post("/createcustomer", createCustomer);
router.post("/addnewcard", addNewcard);

router.post("/createcharge", createCharges);

// router.post("/createpayment", CreatePayment);

router.post("/addguestnewcard", addGuestNewcard);
router.post("/createguestcharges", createGuestCharges);

export default router;

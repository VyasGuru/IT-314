import express from "express";
import {addPropertyToComparison, removePropertyFromComparison, getComparedProperties, clearComparison} from "../controllers/propertyComparison.controller.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.use(verifyFirebaseToken); //first check user login or not applying any comparision

router.post("/", addPropertyToComparison); // link : POST /api/comparison

router.get("/",getComparedProperties); //link : GET /api/comparison

router.delete("/:propertyId", removePropertyFromComparison); // link : DELETE /api/comparison/:propertyId

router.delete("/", clearComparison);

export default router;

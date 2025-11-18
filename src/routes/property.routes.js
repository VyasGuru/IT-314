import { Router } from "express";
import { getFilteredProperties } from "../controllers/property.controller.js";

const router = Router()

router.route("/").get(getFilteredProperties)

export default router
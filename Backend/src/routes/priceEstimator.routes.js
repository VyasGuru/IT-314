// routes/priceEstimator.routes.js

import express from 'express';
import { estimatePrice } from '../controllers/priceEstimator.controller.js';

const router = express.Router();

router.get('/estimate-price/:listingId', estimatePrice);

export default router;
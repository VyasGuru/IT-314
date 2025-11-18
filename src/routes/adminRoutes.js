// routes/adminRoutes.js

import express from 'express';
import { cleanupAbusiveReviews } from '../controllers/adminController.js';
import { checkAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// When an admin sends a POST request to '/api/admin/cleanup':
// 1. `checkAdmin` middleware runs.
// 2. `cleanupAbusiveReviews` controller runs.
router.post('/cleanup', checkAdmin, cleanupAbusiveReviews);

export default router;
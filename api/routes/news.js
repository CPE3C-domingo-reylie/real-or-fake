/* ROUTES/NEWS.JS - NEWS API ROUTES */

import express from 'express';
import {
    searchGuardian,
    getLatestBySection,
    getArticleWithSentiment,
    getSections,
    searchWithSentiment
} from '../controllers/newsController.js';

const router = express.Router();

// Guardian routes
router.get('/guardian/search', searchGuardian);
router.get('/guardian/search-with-sentiment', searchWithSentiment);
router.get('/guardian/latest/:section', getLatestBySection);
router.get('/guardian/article/:id', getArticleWithSentiment);
router.get('/guardian/sections', getSections);

export default router;

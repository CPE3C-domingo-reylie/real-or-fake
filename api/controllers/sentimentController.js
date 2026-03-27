/* CONTROLLERS/SENTIMENTCONTROLLER.JS - SENTIMENT ANALYSIS HTTP HANDLERS */

import {
    analyzeSentiment,
    analyzeBatch,
    aggregateSentiment
} from '../services/sentimentService.js';

// POST /api/sentiment/analyze - Analyze single text
export function analyze(req, res) {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'text field is required' });
        }

        const result = analyzeSentiment(text);

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error('Sentiment analysis error:', err.message);
        res.status(500).json({ error: 'sentiment analysis failed' });
    }
}

// POST /api/sentiment/analyze-batch - Analyze multiple texts
export function analyzeBatchHandler(req, res) {
    try {
        const { texts } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ error: 'texts array is required and must not be empty' });
        }

        const results = analyzeBatch(texts);

        res.json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (err) {
        console.error('Batch sentiment analysis error:', err.message);
        res.status(500).json({ error: 'batch sentiment analysis failed' });
    }
}

// POST /api/sentiment/aggregate - Get aggregate sentiment for multiple texts
export function aggregate(req, res) {
    try {
        const { texts } = req.body;

        if (!Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ error: 'texts array is required and must not be empty' });
        }

        const result = aggregateSentiment(texts);

        res.json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error('Aggregate sentiment error:', err.message);
        res.status(500).json({ error: 'aggregate sentiment analysis failed' });
    }
}

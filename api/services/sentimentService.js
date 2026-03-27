/* SERVICES/SENTIMENTSERVICE.JS - SENTIMENT ANALYSIS LOGIC */

import Sentiment from 'sentiment';

const sentiment = new Sentiment();

/**
 * Analyze sentiment of a text
 * @param {string} text - Text to analyze
 * @returns {object} Sentiment analysis result
 */
export function analyzeSentiment(text) {
    if (!text || typeof text !== 'string') {
        return {
            score: 0,
            comparative: 0,
            label: 'neutral',
            tokens: [],
            positive: [],
            negative: [],
            confidence: 0
        };
    }

    const result = sentiment.analyze(text);

    // Determine label based on score
    let label;
    let confidence;

    if (result.score > 0) {
        label = 'positive';
        confidence = Math.min(result.score / 5, 1); // Normalize to 0-1
    } else if (result.score < 0) {
        label = 'negative';
        confidence = Math.min(Math.abs(result.score) / 5, 1); // Normalize to 0-1
    } else {
        label = 'neutral';
        confidence = 1;
    }

    return {
        score: result.score,
        comparative: result.comparative,
        label,
        confidence,
        tokens: result.tokens,
        positive: result.positive,
        negative: result.negative
    };
}

/**
 * Analyze multiple texts (batch processing)
 * @param {string[]} texts - Array of texts to analyze
 * @returns {object[]} Array of sentiment results
 */
export function analyzeBatch(texts) {
    return texts.map(text => analyzeSentiment(text));
}

/**
 * Calculate aggregate sentiment for multiple texts
 * @param {string[]} texts - Array of texts to analyze
 * @returns {object} Aggregated sentiment statistics
 */
export function aggregateSentiment(texts) {
    const results = analyzeBatch(texts);

    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const positiveCount = results.filter(r => r.label === 'positive').length;
    const negativeCount = results.filter(r => r.label === 'negative').length;
    const neutralCount = results.filter(r => r.label === 'neutral').length;

    let overallLabel;
    if (totalScore > 0) {
        overallLabel = 'positive';
    } else if (totalScore < 0) {
        overallLabel = 'negative';
    } else {
        overallLabel = 'neutral';
    }

    return {
        totalArticles: texts.length,
        overallScore: totalScore,
        overallLabel,
        averageScore: totalScore / texts.length,
        distribution: {
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount
        },
        percentages: {
            positive: (positiveCount / texts.length) * 100,
            negative: (negativeCount / texts.length) * 100,
            neutral: (neutralCount / texts.length) * 100
        }
    };
}

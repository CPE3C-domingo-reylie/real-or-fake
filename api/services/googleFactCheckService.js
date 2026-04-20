/* SERVICES/GOOGLEFACTCHECKSERVICE.JS - GOOGLE FACT CHECK TOOLS API */

import config from '../config.js';

const API_KEY = config.GOOGLE_FACT_CHECK_API_KEY;
const API_BASE = 'https://factchecktools.googleapis.com/v1alpha1';

/**
 * Search Google Fact Check API for claims
 * @param {string} query - Search query (claim or keywords)
 * @returns {Promise<Array>} Array of fact check results
 */
export async function searchFactChecks(query) {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.warn('Google Fact Check API key not configured');
        return { error: 'API_KEY_NOT_CONFIGURED', claims: [] };
    }

    if (!query || query.trim().length < 3) {
        return { error: 'INVALID_QUERY', claims: [] };
    }

    try {
        const url = `${API_BASE}/claims:search?key=${API_KEY}&query=${encodeURIComponent(query)}&languageCode=en`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Google Fact Check API error:', errorData);
            return { error: 'API_ERROR', claims: [] };
        }

        const data = await response.json();

        if (!data.claims || data.claims.length === 0) {
            return { error: 'NO_MATCHES', claims: [] };
        }

        const parsedClaims = data.claims.map(claim => parseFactCheck(claim));

        return { error: null, claims: parsedClaims };
    } catch (err) {
        console.error('Fact check search error:', err.message);
        return { error: 'NETWORK_ERROR', claims: [] };
    }
}

/**
 * Parse a fact check claim from Google API response
 */
function parseFactCheck(claim) {
    const claimReview = claim.claimReview || [];
    const ratings = claimReview.map(review => ({
        publisher: review.publisher?.name || 'Unknown',
        rating: review.textualRating || 'Unknown',
        url: review.url || null,
        title: review.title || null,
        date: review.date || null
    }));

    return {
        claimText: claim.text || 'No claim text',
        claimant: claim.claimant || 'Unknown',
        ratings,
        originalUrl: claim.originalUrl || null
    };
}

/**
 * Extract key phrases from text for fact-checking queries
 * @param {string} text - Text to extract claims from
 * @returns {Array<string>} Array of extracted phrases
 */
export function extractClaimPhrases(text) {
    if (!text) return [];

    // Split into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const phrases = [];

    for (const sentence of sentences) {
        const trimmed = sentence.trim();

        // Skip questions
        if (trimmed.endsWith('?')) continue;

        // Skip sentences without verbs (likely not factual claims)
        if (!hasVerb(trimmed)) continue;

        // Extract noun phrases with entities
        const extracted = extractNounPhrases(trimmed);
        phrases.push(...extracted);
    }

    // Also use first 60 chars of title as a query
    if (text.length > 60) {
        phrases.push(text.substring(0, 60));
    }

    // Deduplicate and limit
    const unique = [...new Set(phrases.map(p => p.toLowerCase()))];
    return unique.slice(0, 5).map(p => {
        // Find original case
        return phrases.find(orig => orig.toLowerCase() === p) || p;
    });
}

/**
 * Simple verb detection
 */
function hasVerb(text) {
    const commonVerbs = [
        'is', 'are', 'was', 'were', 'has', 'have', 'had', 'will', 'would',
        'says', 'said', 'reported', 'announced', 'confirmed', 'died', 'killed',
        'elected', 'appointed', 'resigned', 'fired', 'charged', 'arrested',
        'found', 'discovered', 'proven', 'showed', 'revealed'
    ];

    const lower = text.toLowerCase();
    return commonVerbs.some(verb => lower.includes(verb));
}

/**
 * Extract noun phrases (simplified)
 */
function extractNounPhrases(sentence) {
    const phrases = [];

    // Pattern: "Person/Entity + verb + ..."
    const entityVerbPattern = /^([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*(?:\s+(?:is|was|has|have|had|says|said|announced)))/i;
    const match = sentence.match(entityVerbPattern);

    if (match && match[1]) {
        phrases.push(match[1]);
    }

    // Return full sentence if it looks like a claim
    if (sentence.length > 15 && sentence.length < 150) {
        phrases.push(sentence);
    }

    return phrases.slice(0, 2);
}

/**
 * Main function to fact-check a claim
 * @param {string} claimText - The claim to verify
 * @returns {Promise<object>} Fact check results with penalty score
 */
export async function factCheckClaim(claimText) {
    const result = await searchFactChecks(claimText);

    if (result.error) {
        return {
            error: result.error,
            penalty: 0,
            factChecks: []
        };
    }

    // Calculate penalty based on ratings
    let penalty = 0;
    const factChecks = [];

    for (const claim of result.claims) {
        for (const rating of claim.ratings) {
            const ratingLower = (rating.rating || '').toLowerCase();

            // Check if rating indicates false/misleading
            let claimPenalty = 0;
            let verdict = 'UNKNOWN';

            if (ratingLower.includes('false') || ratingLower.includes('fake') || ratingLower.includes('debunked')) {
                claimPenalty = 100;
                verdict = 'FALSE';
            } else if (ratingLower.includes('mostly false') || ratingLower.includes('mixture')) {
                claimPenalty = 70;
                verdict = 'MOSTLY_FALSE';
            } else if (ratingLower.includes('partly false') || ratingLower.includes('half-true')) {
                claimPenalty = 40;
                verdict = 'PARTLY_FALSE';
            } else if (ratingLower.includes('true') || ratingLower.includes('correct')) {
                claimPenalty = -20; // Bonus for verified true claims
                verdict = 'TRUE';
            } else if (ratingLower.includes('unproven') || ratingLower.includes('unverified')) {
                claimPenalty = 30;
                verdict = 'UNVERIFIED';
            }

            if (claimPenalty > 0) {
                penalty = Math.max(penalty, claimPenalty);
            } else if (claimPenalty < 0 && penalty > 0) {
                // True rating can reduce penalty
                penalty = Math.max(0, penalty + claimPenalty);
            }

            factChecks.push({
                claimText: claim.claimText,
                claimant: claim.claimant,
                publisher: rating.publisher,
                rating: rating.rating,
                verdict,
                url: rating.url,
                title: rating.title
            });
        }
    }

    return {
        error: null,
        penalty: Math.min(penalty, 100),
        factChecks,
        matchCount: result.claims.length
    };
}

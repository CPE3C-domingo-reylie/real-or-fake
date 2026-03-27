/* SERVICES/GUARDIANSERVICE.JS - THE GUARDIAN API INTEGRATION */

import axios from 'axios';
import config from '../config.js';

const BASE_URL = 'https://content.guardianapis.com';

/**
 * Search Guardian articles by keyword
 * @param {string} query - Search keyword
 * @param {object} options - Additional options (page, pageSize, fromDate, toDate, section)
 * @returns {Promise<Array>} Array of articles
 */
export async function searchArticles(query, options = {}) {
    try {
        const params = {
            'api-key': config.GUARDIAN_API_KEY,
            q: query,
            page: options.page || 1,
            'page-size': options.pageSize || 10,
            'show-fields': 'headline,trailText,bodyText,byline,publication',
            'show-tags': 'keyword',
            order: 'newest'
        };

        // Add optional filters
        if (options.fromDate) params['from-date'] = options.fromDate;
        if (options.toDate) params['to-date'] = options.toDate;
        if (options.section) params.section = options.section;

        const response = await axios.get(`${BASE_URL}/search`, { params });

        return response.data.response.results.map(article => ({
            id: article.id,
            webTitle: article.webTitle,
            webUrl: article.webUrl,
            publicationDate: article.webPublicationDate,
            sectionName: article.sectionName,
            trailText: article.fields?.trailText,
            bodyText: article.fields?.bodyText,
            byline: article.fields?.byline,
            thumbnail: article.fields?.thumbnail
        }));

    } catch (err) {
        console.error('Guardian API error:', err.message);
        throw new Error('Failed to fetch articles from Guardian API');
    }
}

/**
 * Get latest articles from a specific section
 * @param {string} section - Section name (e.g., 'politics', 'technology', 'business')
 * @param {number} pageSize - Number of articles (max 50)
 * @returns {Promise<Array>} Array of articles
 */
export async function getLatestBySection(section, pageSize = 10) {
    try {
        const params = {
            'api-key': config.GUARDIAN_API_KEY,
            section,
            'page-size': pageSize,
            'show-fields': 'headline,trailText,bodyText,byline,thumbnail',
            order: 'newest'
        };

        const response = await axios.get(`${BASE_URL}/search`, { params });

        return response.data.response.results.map(article => ({
            id: article.id,
            webTitle: article.webTitle,
            webUrl: article.webUrl,
            publicationDate: article.webPublicationDate,
            sectionName: article.sectionName,
            trailText: article.fields?.trailText,
            bodyText: article.fields?.bodyText,
            byline: article.fields?.byline,
            thumbnail: article.fields?.thumbnail
        }));

    } catch (err) {
        console.error('Guardian API error:', err.message);
        throw new Error('Failed to fetch latest articles');
    }
}

/**
 * Get a single article by ID
 * @param {string} articleId - Guardian article ID
 * @returns {Promise<object>} Article object
 */
export async function getArticleById(articleId) {
    try {
        const params = {
            'api-key': config.GUARDIAN_API_KEY,
            'show-fields': 'headline,trailText,bodyText,byline,publication,thumbnail',
            'show-tags': 'keyword'
        };

        const response = await axios.get(`${BASE_URL}/${articleId}`, { params });

        const article = response.data.response.content;

        return {
            id: article.id,
            webTitle: article.webTitle,
            webUrl: article.webUrl,
            publicationDate: article.webPublicationDate,
            sectionName: article.sectionName,
            trailText: article.fields?.trailText,
            bodyText: article.fields?.bodyText,
            byline: article.fields?.byline,
            thumbnail: article.fields?.thumbnail,
            keywords: article.tags?.map(tag => tag.webTitle) || []
        };

    } catch (err) {
        console.error('Guardian API error:', err.message);
        throw new Error('Failed to fetch article');
    }
}

/**
 * Get available sections from Guardian
 * @returns {Promise<Array>} Array of section names
 */
export async function getSections() {
    try {
        const params = {
            'api-key': config.GUARDIAN_API_KEY
        };

        const response = await axios.get(`${BASE_URL}/sections`, { params });

        return response.data.response.results.map(section => ({
            id: section.id,
            webTitle: section.webTitle,
            webUrl: section.webUrl
        }));

    } catch (err) {
        console.error('Guardian API error:', err.message);
        throw new Error('Failed to fetch sections');
    }
}

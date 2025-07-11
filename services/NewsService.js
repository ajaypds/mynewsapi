const axios = require('axios');
const NewsArticle = require('../models/NewsArticle');
const CategoryService = require('./CategoryService');

class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        this.baseUrl = 'https://newsapi.org/v2';
        this.categoryService = new CategoryService();
    }

    // Get date one day before current date
    getYesterdayDate() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    // Get today's date
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    }

    // Validate and process date parameter
    processDateParameter(dateParam) {
        if (!dateParam) {
            return this.getYesterdayDate();
        }

        const inputDate = new Date(dateParam);
        const today = new Date(this.getTodayDate());
        const yesterday = new Date(this.getYesterdayDate());

        // If invalid date, use yesterday
        if (isNaN(inputDate.getTime())) {
            console.log(`Invalid date provided: ${dateParam}, using yesterday's date`);
            return this.getYesterdayDate();
        }

        const inputDateStr = inputDate.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        // If date is today or in future, use yesterday
        if (inputDateStr >= todayStr) {
            console.log(`Date ${inputDateStr} is today or future, using yesterday's date`);
            return this.getYesterdayDate();
        }

        // Use the provided date (it's in the past)
        return inputDateStr;
    }

    // Fetch news from NewsAPI
    async fetchNewsFromAPI(date) {
        try {
            console.log(`Fetching news from API for date: ${date}`);
            const response = await axios.get(`${this.baseUrl}/everything`, {
                params: {
                    q: 'India',
                    from: date,
                    to: date,
                    sortBy: 'publishedAt',
                    apiKey: this.apiKey,
                    language: 'en'
                }
            });

            if (response.data.status === 'ok') {
                const totalResults = response.data.totalResults;
                const fetchedArticles = response.data.articles;

                console.log(`Successfully fetched ${fetchedArticles.length} articles from API (Total available: ${totalResults})`);
                return fetchedArticles;
            } else {
                throw new Error(`API Error: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error fetching news from API:', error.message);
            throw error;
        }
    }

    // Save articles to database with automatic categorization
    async saveArticlesToDB(articles, fetchDate) {
        try {
            console.log(`Starting to save ${articles.length} articles to database...`);
            let saved = 0;
            let duplicates = 0;
            let errors = 0;

            for (let i = 0; i < articles.length; i++) {
                try {
                    const article = articles[i];

                    // Automatically categorize based on title
                    const category = this.categoryService.categorizeByTitle(article.title);

                    const newsArticle = new NewsArticle({
                        source: article.source,
                        author: article.author,
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        urlToImage: article.urlToImage,
                        publishedAt: new Date(article.publishedAt),
                        content: article.content,
                        fetchDate: fetchDate,
                        category: category // Add the categorized field
                    });

                    await newsArticle.save();
                    saved++;

                    console.log(`Article categorized as "${category}": ${article.title.substring(0, 50)}...`);

                    // Progress logging every 50 articles
                    if ((i + 1) % 50 === 0) {
                        console.log(`Saved ${saved}/${articles.length} articles...`);
                    }
                } catch (saveError) {
                    if (saveError.code === 11000) {
                        duplicates++;
                    } else {
                        errors++;
                        console.error(`Error saving article ${i + 1}:`, saveError.message);
                    }
                }
            }

            console.log(`Database save complete: ${saved} saved, ${duplicates} duplicates skipped, ${errors} errors`);
            return { saved, duplicates, errors };
        } catch (error) {
            console.error('Error in saveArticlesToDB:', error.message);
            throw error;
        }
    }

    // Get articles from database for a specific date
    async getArticlesFromDB(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const articles = await NewsArticle.find({
                publishedAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ publishedAt: 1 }); // Sort oldest first for proper streaming order

            return articles;
        } catch (error) {
            console.error('Error fetching articles from database:', error.message);
            throw error;
        }
    }

    // Main method to get news (from DB or API) - supports date parameter
    async getNews(date = null) {
        try {
            const targetDate = this.processDateParameter(date);
            console.log(`Getting news for date: ${targetDate}`);

            // First check if we have articles in database for this date
            let articles = await this.getArticlesFromDB(targetDate);

            if (articles.length === 0) {
                console.log(`No articles in database for ${targetDate} - fetching from API...`);

                // Fetch from API
                const apiArticles = await this.fetchNewsFromAPI(targetDate);

                if (apiArticles.length > 0) {
                    // Save to database with automatic categorization
                    await this.saveArticlesToDB(apiArticles, new Date(targetDate));

                    // Fetch the saved articles from database
                    articles = await this.getArticlesFromDB(targetDate);

                    console.log(`Fetched and saved ${articles.length} articles from API`);
                }
            } else {
                console.log(`Found ${articles.length} articles in database for ${targetDate}`);
            }

            return articles;
        } catch (error) {
            console.error('Error in getNews:', error.message);
            throw error;
        }
    }

    // Get articles by category
    async getNewsByCategory(category, date = null) {
        try {
            const targetDate = this.processDateParameter(date);
            console.log(`Getting ${category} news for date: ${targetDate}`);

            const startOfDay = new Date(targetDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            // First try to get from database
            let articles = await NewsArticle.find({
                category: category,
                publishedAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ publishedAt: 1 });

            // If no articles in database for this date, fetch all articles first
            if (articles.length === 0) {
                console.log(`No ${category} articles in database for ${targetDate} - checking if any articles exist...`);

                const allArticles = await this.getArticlesFromDB(targetDate);

                if (allArticles.length === 0) {
                    // No articles at all for this date, fetch from API
                    console.log(`No articles in database for ${targetDate} - fetching from API...`);
                    await this.getNews(targetDate);

                    // Now try to get category articles again
                    articles = await NewsArticle.find({
                        category: category,
                        publishedAt: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        }
                    }).sort({ publishedAt: 1 });
                }
            }

            console.log(`Found ${articles.length} articles in "${category}" category for ${targetDate}`);
            return articles;
        } catch (error) {
            console.error('Error in getNewsByCategory:', error.message);
            throw error;
        }
    }

    // Get category statistics
    async getCategoryStats(date = null) {
        try {
            const targetDate = this.processDateParameter(date);

            const startOfDay = new Date(targetDate);
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(targetDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const stats = await NewsArticle.aggregate([
                {
                    $match: {
                        publishedAt: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);

            console.log(`Category statistics for ${targetDate}:`, stats);
            return stats;
        } catch (error) {
            console.error('Error in getCategoryStats:', error.message);
            throw error;
        }
    }
}

module.exports = NewsService;

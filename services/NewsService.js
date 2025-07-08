const axios = require('axios');
const NewsArticle = require('../models/NewsArticle');

class NewsService {
    constructor() {
        this.apiKey = process.env.NEWS_API_KEY;
        this.baseUrl = 'https://newsapi.org/v2';
    }

    // Get date one day before current date
    getYesterdayDate() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0]; // Format: YYYY-MM-DD
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

    // Save articles to MongoDB
    async saveArticlesToDB(articles, fetchDate) {
        try {
            const savedArticles = [];
            let duplicateCount = 0;
            let errorCount = 0;

            console.log(`Starting to save ${articles.length} articles to database...`);

            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                try {
                    const newsArticle = new NewsArticle({
                        source: article.source,
                        author: article.author,
                        title: article.title,
                        description: article.description,
                        url: article.url,
                        urlToImage: article.urlToImage,
                        publishedAt: new Date(article.publishedAt),
                        content: article.content,
                        fetchDate: fetchDate
                    });

                    const saved = await newsArticle.save();
                    savedArticles.push(saved);

                    // Log progress every 50 articles
                    if ((i + 1) % 50 === 0) {
                        console.log(`Saved ${i + 1}/${articles.length} articles...`);
                    }
                } catch (error) {
                    // Skip duplicate articles (unique constraint on URL)
                    if (error.code === 11000) {
                        duplicateCount++;
                    } else {
                        errorCount++;
                        console.error(`Error saving article ${i + 1}:`, error.message);
                    }
                }
            }

            console.log(`Database save complete: ${savedArticles.length} saved, ${duplicateCount} duplicates skipped, ${errorCount} errors`);
            return savedArticles;
        } catch (error) {
            console.error('Error saving articles to database:', error.message);
            throw error;
        }
    }

    // Get articles from database for a specific date
    async getArticlesFromDB(date) {
        try {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            const articles = await NewsArticle.find({
                fetchDate: {
                    $gte: startDate,
                    $lt: endDate
                }
            }).sort({ publishedAt: 1 }); // Sort oldest first (newest articles will be streamed last)

            return articles;
        } catch (error) {
            console.error('Error fetching articles from database:', error.message);
            throw error;
        }
    }

    // Main method to get news (from DB or API)
    async getNews() {
        try {
            const yesterdayDate = this.getYesterdayDate();
            const fetchDate = new Date(yesterdayDate);

            // First, try to get from database
            let articles = await this.getArticlesFromDB(fetchDate);

            // If no articles in database, fetch from API
            if (articles.length === 0) {
                console.log('No articles in database for', yesterdayDate, '- fetching from API...');
                const apiArticles = await this.fetchNewsFromAPI(yesterdayDate);
                articles = await this.saveArticlesToDB(apiArticles, fetchDate);
                console.log(`Fetched and saved ${articles.length} articles from API`);
            } else {
                console.log(`Found ${articles.length} articles in database for ${yesterdayDate}`);
            }

            return articles;
        } catch (error) {
            console.error('Error in getNews:', error.message);
            throw error;
        }
    }
}

module.exports = NewsService;

class CategoryService {
    constructor() {
        // Define keywords for each category
        this.categoryKeywords = {
            'Politics': [
                'government', 'minister', 'parliament', 'election', 'political', 'party', 'congress', 'bjp',
                'vote', 'democracy', 'policy', 'law', 'constitution', 'supreme court', 'high court',
                'prime minister', 'president', 'governor', 'chief minister', 'cabinet', 'opposition',
                'rally', 'campaign', 'manifesto', 'coalition', 'alliance'
            ],
            'Business': [
                'business', 'economy', 'market', 'stock', 'shares', 'profit', 'loss', 'revenue', 'company',
                'corporate', 'startup', 'investment', 'bank', 'finance', 'rupee', 'dollar', 'trading',
                'nifty', 'sensex', 'ipo', 'merger', 'acquisition', 'earnings', 'quarterly', 'sales',
                'ceo', 'cfo', 'board', 'dividend', 'inflation', 'gdp', 'fiscal', 'budget'
            ],
            'Technology': [
                'technology', 'tech', 'ai', 'artificial intelligence', 'machine learning', 'software',
                'app', 'mobile', 'smartphone', 'computer', 'internet', 'digital', 'cyber', 'data',
                'cloud', 'blockchain', 'cryptocurrency', 'bitcoin', 'startup', 'innovation',
                'google', 'apple', 'microsoft', 'facebook', 'meta', 'twitter', 'instagram',
                'programming', 'coding', 'developer', 'algorithm', 'automation'
            ],
            'Sports': [
                'cricket', 'football', 'hockey', 'tennis', 'badminton', 'kabaddi', 'wrestling',
                'boxing', 'athletics', 'olympics', 'world cup', 'ipl', 'tournament', 'match',
                'player', 'team', 'coach', 'victory', 'defeat', 'score', 'goal', 'run',
                'wicket', 'stadium', 'championship', 'league', 'fifa', 'icc', 'bcci'
            ],
            'Entertainment': [
                'bollywood', 'hollywood', 'movie', 'film', 'actor', 'actress', 'director', 'producer',
                'music', 'song', 'album', 'concert', 'show', 'celebrity', 'star', 'cinema',
                'box office', 'release', 'trailer', 'awards', 'oscar', 'filmfare', 'television',
                'tv', 'serial', 'web series', 'netflix', 'amazon prime', 'ott'
            ],
            'Health': [
                'health', 'medical', 'doctor', 'hospital', 'medicine', 'treatment', 'disease',
                'covid', 'corona', 'virus', 'vaccine', 'vaccination', 'pandemic', 'symptoms',
                'patient', 'healthcare', 'wellness', 'fitness', 'diet', 'nutrition',
                'surgery', 'therapy', 'mental health', 'depression', 'anxiety'
            ],
            'Science': [
                'science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'space',
                'nasa', 'isro', 'satellite', 'rocket', 'mars', 'moon', 'planet', 'climate',
                'environment', 'pollution', 'global warming', 'renewable energy', 'solar',
                'nuclear', 'physics', 'chemistry', 'biology', 'genetics', 'dna'
            ],
            'Education': [
                'education', 'school', 'college', 'university', 'student', 'teacher', 'exam',
                'result', 'admission', 'degree', 'course', 'curriculum', 'academic',
                'scholarship', 'fee', 'education policy', 'neet', 'jee', 'upsc', 'cbse',
                'icse', 'board', 'class', 'grade', 'learning', 'skill development'
            ],
            'Crime': [
                'crime', 'murder', 'theft', 'robbery', 'fraud', 'scam', 'arrest', 'police',
                'investigation', 'court', 'jail', 'prison', 'criminal', 'accused', 'victim',
                'fir', 'case', 'trial', 'verdict', 'sentence', 'bail', 'custody',
                'cybercrime', 'terrorism', 'rape', 'assault', 'kidnapping'
            ],
            'International': [
                'international', 'global', 'world', 'foreign', 'country', 'nation', 'border',
                'diplomatic', 'embassy', 'trade', 'export', 'import', 'agreement', 'treaty',
                'summit', 'meeting', 'visit', 'relations', 'pakistan', 'china', 'usa',
                'uk', 'russia', 'europe', 'asia', 'africa', 'un', 'united nations'
            ],
            'Environment': [
                'environment', 'climate', 'pollution', 'air quality', 'water', 'forest',
                'wildlife', 'conservation', 'green', 'sustainable', 'renewable', 'carbon',
                'emission', 'global warming', 'weather', 'rain', 'drought', 'flood',
                'cyclone', 'earthquake', 'natural disaster', 'biodiversity', 'ecology'
            ],
            'Economy': [
                'economy', 'economic', 'inflation', 'deflation', 'interest rate', 'fiscal',
                'monetary', 'budget', 'tax', 'gst', 'gdp', 'growth', 'recession',
                'recovery', 'employment', 'unemployment', 'jobs', 'wages', 'salary',
                'income', 'poverty', 'wealth', 'development', 'industrial'
            ],
            'Defense': [
                'defense', 'defence', 'military', 'army', 'navy', 'air force', 'soldier',
                'officer', 'war', 'conflict', 'security', 'border', 'weapon', 'missile',
                'fighter jet', 'submarine', 'tank', 'terrorism', 'insurgency',
                'peacekeeping', 'operation', 'strategic', 'national security'
            ]
        };
    }

    categorizeByTitle(title) {
        if (!title || typeof title !== 'string') {
            return 'General';
        }

        const titleLower = title.toLowerCase();
        const categoryScores = {};

        // Initialize scores
        Object.keys(this.categoryKeywords).forEach(category => {
            categoryScores[category] = 0;
        });

        // Calculate scores for each category
        Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
            keywords.forEach(keyword => {
                if (titleLower.includes(keyword.toLowerCase())) {
                    // Give higher score for exact matches
                    if (titleLower.includes(' ' + keyword.toLowerCase() + ' ') ||
                        titleLower.startsWith(keyword.toLowerCase() + ' ') ||
                        titleLower.endsWith(' ' + keyword.toLowerCase()) ||
                        titleLower === keyword.toLowerCase()) {
                        categoryScores[category] += 2;
                    } else {
                        categoryScores[category] += 1;
                    }
                }
            });
        });

        // Find category with highest score
        let maxScore = 0;
        let bestCategory = 'General';

        Object.entries(categoryScores).forEach(([category, score]) => {
            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        });

        // If no keywords matched, return General
        return maxScore > 0 ? bestCategory : 'General';
    }

    // Method to get all available categories
    getAvailableCategories() {
        return Object.keys(this.categoryKeywords);
    }

    // Method to add custom keywords to a category
    addKeywordsToCategory(category, keywords) {
        if (this.categoryKeywords[category]) {
            this.categoryKeywords[category].push(...keywords);
        }
    }
}

module.exports = CategoryService;

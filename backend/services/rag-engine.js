/**
 * RAG Engine - Retrieval Augmented Generation
 * Semantic search + vector embeddings for better context
 * 
 * Setup required:
 * npm install @xenova/transformers dotenv
 */

const { env, pipeline } = require('@xenova/transformers');
const Career = require('../models/Career');
const University = require('../models/University');
const User = require('../models/User');

// Initialize embedding model (lightweight, can run locally)
env.allowLocalModels = true;
env.allowRemoteModels = false; // Use local for privacy

let embeddingPipeline = null;

/**
 * Initialize embedding model (call once on startup)
 */
const initializeEmbeddings = async () => {
  try {
    console.log('Initializing embedding model...');
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✓ Embedding model ready');
    return embeddingPipeline;
  } catch (err) {
    console.error('Failed to initialize embeddings:', err.message);
    console.warn('⚠ RAG will run in degraded mode (keyword search only)');
    return null;
  }
};

/**
 * Generate embeddings for text
 */
const generateEmbedding = async (text) => {
  if (!embeddingPipeline) {
    console.warn('Embedding pipeline not initialized');
    return null;
  }

  try {
    const result = await embeddingPipeline(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert to array
    return Array.from(result.data);
  } catch (err) {
    console.error('Embedding generation failed:', err.message);
    return null;
  }
};

/**
 * Cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
};

/**
 * Retrieve relevant careers based on student profile
 */
const retrieveRelevantCareers = async (studentProfile, topK = 8) => {
  try {
    const {
      skills = [],
      interests = [],
      academicStrengths = [],
      personalityTraits = []
    } = studentProfile;

    // Build search query
    const searchQuery = [
      ...skills,
      ...interests,
      ...academicStrengths,
      ...personalityTraits
    ].join(' ');

    // Fetch all careers from DB
    const allCareers = await Career.find().lean();

    if (!embeddingPipeline) {
      // Fallback: keyword-based search
      return keywordSearchCareers(searchQuery, allCareers, topK);
    }

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(searchQuery);
    if (!queryEmbedding) {
      return keywordSearchCareers(searchQuery, allCareers, topK);
    }

    // Score careers
    const scoredCareers = await Promise.all(
      allCareers.map(async (career) => {
        const careerText = `${career.title} ${career.description} ${(career.skills || []).join(' ')}`;
        const careerEmbedding = await generateEmbedding(careerText);

        if (!careerEmbedding) {
          return { ...career, relevanceScore: 0.5 };
        }

        const score = cosineSimilarity(queryEmbedding, careerEmbedding);
        return { ...career, relevanceScore: score };
      })
    );

    // Sort and return top K
    return scoredCareers
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK)
      .map(c => {
        const { relevanceScore, ...career } = c;
        return { ...career, searchRelevance: Math.round(relevanceScore * 100) };
      });
  } catch (err) {
    console.error('Career retrieval failed:', err.message);
    return [];
  }
};

/**
 * Retrieve relevant universities
 */
const retrieveRelevantUniversities = async (studentProfile, topK = 6) => {
  try {
    const { targetCareer, academicScores = {}, location = null } = studentProfile;

    let query = {};
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const allUniversities = await University.find(query).lean();

    if (!embeddingPipeline) {
      // Fallback: simple filtering
      return allUniversities.slice(0, topK);
    }

    // Build search query combining career + location
    const searchQuery = targetCareer ? `${targetCareer} ${location || ''}` : location || 'general';
    const queryEmbedding = await generateEmbedding(searchQuery);

    if (!queryEmbedding) {
      return allUniversities.slice(0, topK);
    }

    // Score universities
    const scoredUnis = await Promise.all(
      allUniversities.map(async (uni) => {
        const uniText = `${uni.name} ${uni.location} ${(uni.programs || []).join(' ')}`;
        const uniEmbedding = await generateEmbedding(uniText);

        if (!uniEmbedding) {
          return { ...uni, relevanceScore: 0.5 };
        }

        const score = cosineSimilarity(queryEmbedding, uniEmbedding);
        return { ...uni, relevanceScore: score };
      })
    );

    return scoredUnis
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, topK)
      .map(u => {
        const { relevanceScore, ...uni } = u;
        return { ...uni, searchRelevance: Math.round(relevanceScore * 100) };
      });
  } catch (err) {
    console.error('University retrieval failed:', err.message);
    return [];
  }
};

/**
 * Retrieve similar student profiles for benchmarking
 */
const retrieveSimilarStudents = async (studentProfile, topK = 5) => {
  try {
    const studentText = `${studentProfile.skills?.join(' ')} ${studentProfile.interests?.join(' ')}`;
    const queryEmbedding = await generateEmbedding(studentText);

    if (!queryEmbedding) {
      return [];
    }

    // Fetch student profiles with assessments
    const allStudents = await User.find({ personalityTest: { $exists: true } })
      .select('name academicInfo personalityTest skillEvaluation')
      .limit(100)
      .lean();

    const scoredStudents = await Promise.all(
      allStudents.map(async (user) => {
        const userText = `${user.personalityTest?.archetype} ${user.skillEvaluation?.strengths?.join(' ')}`;
        const userEmbedding = await generateEmbedding(userText);

        if (!userEmbedding) {
          return { ...user, similarity: 0.5 };
        }

        const score = cosineSimilarity(queryEmbedding, userEmbedding);
        return { ...user, similarity: score };
      })
    );

    return scoredStudents
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(u => {
        const { similarity, ...user } = u;
        return { ...user, similarityScore: Math.round(similarity * 100) };
      });
  } catch (err) {
    console.error('Similar students retrieval failed:', err.message);
    return [];
  }
};

/**
 * Fallback: Keyword-based search
 */
const keywordSearchCareers = (query, careers, topK) => {
  const keywords = query.toLowerCase().split(/\s+/);

  const scored = careers.map(career => {
    let score = 0;
    const careerText = `${career.title} ${career.description} ${(career.skills || []).join(' ')}`.toLowerCase();

    keywords.forEach(keyword => {
      if (keyword.length > 2) {
        const count = (careerText.match(new RegExp(keyword, 'g')) || []).length;
        score += count * 10;
      }
    });

    return { ...career, relevanceScore: score };
  });

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK)
    .map(c => {
      const { relevanceScore, ...career } = c;
      return { ...career, searchRelevance: Math.min(100, Math.round((relevanceScore / 50) * 100)) };
    });
};

/**
 * Build augmented context for AI prompt
 */
const buildAugmentedContext = async (studentProfile) => {
  try {
    const relevantCareers = await retrieveRelevantCareers(studentProfile, 5);
    const relevantUniversities = await retrieveRelevantUniversities(studentProfile, 4);
    const benchmarkStudents = await retrieveSimilarStudents(studentProfile, 3);

    return {
      relevantCareers: relevantCareers.map(c => ({
        title: c.title,
        description: c.description,
        relevance: c.searchRelevance
      })),
      relevantUniversities: relevantUniversities.map(u => ({
        name: u.name,
        programs: u.programs,
        location: u.location,
        relevance: u.searchRelevance
      })),
      benchmarkInsights: benchmarkStudents.map(s => ({
        archetype: s.personalityTest?.archetype,
        careerChoices: s.academicInfo?.majorInterest,
        similarity: s.similarityScore
      })),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error('Context building failed:', err.message);
    return {
      relevantCareers: [],
      relevantUniversities: [],
      benchmarkInsights: [],
      error: err.message
    };
  }
};

module.exports = {
  initializeEmbeddings,
  generateEmbedding,
  cosineSimilarity,
  retrieveRelevantCareers,
  retrieveRelevantUniversities,
  retrieveSimilarStudents,
  buildAugmentedContext
};

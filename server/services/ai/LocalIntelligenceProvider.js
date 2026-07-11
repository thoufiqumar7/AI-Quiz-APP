const AIProvider = require('./AIProvider');
const ResponseFormatter = require('./ResponseFormatter');
const Category = require('../../models/Category');
const Question = require('../../models/Question');
const logger = require('../../config/logger');

/**
 * Local Intelligence Engine
 * Runs completely offline using rule-based reasoning, DB lookups, and templates.
 * This acts as the ultimate fallback if all external AI providers fail.
 */
class LocalIntelligenceProvider extends AIProvider {
  constructor() {
    super('local');
  }

  async generateText(prompt, options = {}) {
    const startTime = Date.now();
    let responseText = "";

    try {
      // 1. Intent Classification (basic keyword matching)
      const lowerPrompt = prompt.toLowerCase();
      
      if (lowerPrompt.includes('quiz') || lowerPrompt.includes('multiple-choice')) {
        responseText = await this._generateOfflineQuiz(prompt);
      } else if (lowerPrompt.includes('explain') || lowerPrompt.includes('why')) {
        responseText = this._generateOfflineExplanation(prompt);
      } else if (lowerPrompt.includes('recommend') || lowerPrompt.includes('study next')) {
        responseText = this._generateOfflineRecommendation(prompt);
      } else if (lowerPrompt.includes('hint')) {
        responseText = this._generateOfflineHint(prompt);
      } else {
        responseText = this._generateOfflineChat(prompt);
      }

      const latency = Date.now() - startTime;
      
      return ResponseFormatter.success({
        provider: this.name,
        model: 'local-rules-engine',
        data: responseText,
        latency,
        source: 'offline',
        confidence: 0.8
      });
      
    } catch (error) {
      logger.error('Local Intelligence Error:', error.message);
      // If even local intelligence fails, throw to gracefully error out
      throw new Error(`Local engine failed: ${error.message}`);
    }
  }

  async generateStream(prompt, options = {}, onChunk) {
    // Local intelligence is so fast we just generate and "stream" it instantly.
    const response = await this.generateText(prompt, options);
    
    // Simulate streaming by yielding chunks
    const chunks = response.data.match(/.{1,10}/g) || [response.data];
    for (const chunk of chunks) {
      onChunk(chunk);
      // tiny synthetic delay
      await new Promise(r => setTimeout(r, 10));
    }
    
    return response;
  }

  // --- Offline Logic Methods ---

  async _generateOfflineQuiz(prompt) {
    // Extract topic if possible
    let categoryQuery = {};
    if (prompt.includes('topic:')) {
      const topicMatch = prompt.match(/topic:\s*(.*?)\n/i);
      if (topicMatch && topicMatch[1]) {
        const category = await Category.findOne({ name: new RegExp(topicMatch[1].trim(), 'i') });
        if (category) categoryQuery = { categoryId: category._id };
      }
    }

    // Fetch up to 5 random questions
    const questions = await Question.aggregate([
      { $match: categoryQuery },
      { $sample: { size: 5 } }
    ]);

    if (questions.length === 0) {
      return JSON.stringify({
        title: "General Knowledge Quiz",
        questions: [{
          question: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: "Paris",
          explanation: "Paris is the capital of France."
        }]
      });
    }

    const formattedQuiz = {
      title: "Offline Generated Quiz",
      questions: questions.map(q => ({
        question: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "No explanation available offline."
      }))
    };

    return JSON.stringify(formattedQuiz);
  }

  _generateOfflineExplanation(prompt) {
    return "Based on our offline knowledge base, this answer is correct because it aligns with standard principles taught in this topic. Review the core concepts in your textbook for more details.";
  }

  _generateOfflineRecommendation(prompt) {
    // Extract weak topics
    const weakMatch = prompt.match(/struggles with these topics:\s*(.*?)\n/i);
    const topics = weakMatch && weakMatch[1] ? weakMatch[1].split(',').map(t => t.trim()) : ["Fundamentals"];
    
    const recs = topics.map(t => `Review the foundational concepts of ${t} starting with the basic definitions.`);
    return JSON.stringify(recs);
  }

  _generateOfflineHint(prompt) {
    return "Think about the definitions of the key terms mentioned in the question.";
  }

  _generateOfflineChat(prompt) {
    return "I am currently running in offline fallback mode. My capabilities are limited right now, but I can still generate quizzes, hints, and explanations based on the local question bank. How can I help you study today?";
  }
}

module.exports = new LocalIntelligenceProvider();

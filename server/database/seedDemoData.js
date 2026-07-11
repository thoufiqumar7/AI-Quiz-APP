const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const QuizSession = require('../models/QuizSession');
const UserAnalytics = require('../models/UserAnalytics');
const Leaderboard = require('../models/Leaderboard');
const Category = require('../models/Category');

const DEMO_EMAIL = 'demo@smartquiz.ai';

async function seedDemoData() {
  try {
    await mongoose.connect(env.mongoUri);
    console.log('Connected to DB');

    const demoUser = await User.findOne({ email: DEMO_EMAIL });
    if (!demoUser) {
      console.log('Demo user not found. Please run the server once to create it.');
      process.exit(0);
    }

    // 1. Update Demo User profile
    demoUser.xpPoints = 12500;
    demoUser.currentLevel = 15;
    demoUser.streakCount = 14;
    demoUser.longestStreak = 21;
    await demoUser.save();
    console.log('Updated Demo User profile.');

    // Get categories
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log('No categories found. Run npm run seed first.');
      process.exit(0);
    }

    // 2. Clear old demo sessions & analytics
    await QuizSession.deleteMany({ userId: demoUser._id });
    await UserAnalytics.deleteOne({ userId: demoUser._id });

    // 3. Create dummy QuizSessions
    const now = new Date();
    const sessions = [];
    
    for (let i = 0; i < 10; i++) {
      const category = categories[i % categories.length];
      const completedAt = new Date(now.getTime() - (Math.random() * 7 * 24 * 60 * 60 * 1000));
      
      sessions.push({
        userId: demoUser._id,
        category: category._id,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100) + 50,
        accuracy: Math.floor(Math.random() * 40) + 60,
        startedAt: new Date(completedAt.getTime() - 600000),
        completedAt,
        timeTaken: Math.floor(Math.random() * 300) + 120,
        timeLimitSec: 600,
        questionCount: 10,
        questions: [], // omit for dummy data
        answers: []
      });
    }
    
    await QuizSession.insertMany(sessions);
    console.log('Inserted Demo QuizSessions.');

    // 4. Create UserAnalytics
    const analytics = new UserAnalytics({
      userId: demoUser._id,
      strongTopics: ['Arrays', 'Promises', 'Data Structures'],
      weakTopics: ['Streams', 'Graph Theory', 'Express Middleware'],
      averageAccuracy: 82.5,
      totalQuizzes: 10,
      totalCorrectAnswers: 85,
      totalWrongAnswers: 15,
      totalScore: 850,
      averageTimePerQuestion: 15.5,
      categoryPerformance: categories.map(c => ({
        categoryId: c._id,
        categoryName: c.name,
        attempts: Math.floor(Math.random() * 5) + 1,
        averageAccuracy: Math.floor(Math.random() * 30) + 70,
        averagePoints: Math.floor(Math.random() * 100) + 50,
      })),
      recentPerformance: sessions.slice(0, 5).map(s => ({
        completedAt: s.completedAt,
        categoryName: categories.find(c => c._id.equals(s.category))?.name || 'General',
        difficulty: s.difficulty,
        accuracy: s.accuracy,
        totalPoints: s.score,
        timeTaken: s.timeTaken
      })),
      smartInsights: [
        "Your accuracy in JavaScript Arrays is consistently high. Time to move to harder questions.",
        "You struggle with Node.js Streams. Consider reviewing the concept fundamentals.",
        "Great job! You are currently on a 14-day learning streak."
      ]
    });
    
    await analytics.save();
    console.log('Inserted Demo UserAnalytics.');

    // 5. Seed Leaderboard (Current Month/Week)
    await Leaderboard.deleteMany({});
    
    const fakeUsers = [
      { name: 'Alex Johnson', xpPoints: 14500, currentLevel: 18, rank: 1 },
      { name: 'Maria Garcia', xpPoints: 13200, currentLevel: 16, rank: 2 },
      { name: 'Demo User', userId: demoUser._id, xpPoints: 12500, currentLevel: 15, rank: 3 },
      { name: 'David Smith', xpPoints: 11900, currentLevel: 14, rank: 4 },
      { name: 'Emma Wilson', xpPoints: 10500, currentLevel: 12, rank: 5 },
      { name: 'James Brown', xpPoints: 9800, currentLevel: 11, rank: 6 },
    ];
    
    // Seed global leaderboard collection if applicable, or we just rely on users table.
    // Wait, let's check Leaderboard schema.
    const leaderboardEntries = fakeUsers.map(u => ({
      userId: u.userId || new mongoose.Types.ObjectId(),
      period: 'all-time',
      periodStart: new Date('2020-01-01'),
      periodEnd: new Date('2099-12-31'),
      score: u.xpPoints,
      quizzesCompleted: Math.floor(u.xpPoints / 100),
      averageAccuracy: Math.floor(Math.random() * 20) + 75
    }));
    
    await Leaderboard.insertMany(leaderboardEntries);
    
    // Actually we need to make sure User collection has these fake users so they appear in /api/leaderboard if it joins.
    // If it joins, let's just insert them.
    for (let u of fakeUsers) {
      if (!u.userId) {
        const _id = new mongoose.Types.ObjectId();
        await User.create({
          _id,
          name: u.name,
          email: `${u.name.toLowerCase().replace(' ', '.')}@example.com`,
          password: 'Password123!',
          xpPoints: u.xpPoints,
          currentLevel: u.currentLevel,
        });
        // update leaderboard entry
        await Leaderboard.updateOne({ score: u.xpPoints }, { userId: _id });
      }
    }
    
    console.log('Inserted Fake Users and Leaderboard.');

    console.log('✅ Realistic Demo Data Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed demo data:', error);
    process.exit(1);
  }
}

seedDemoData();

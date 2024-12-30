require('dotenv').config();
const mongoose = require('mongoose');
const Vocabulary = require('../models/Vocabulary');

const MONGODB_URI = 'mongodb://localhost:27017/esl-learning-app';

const scenarios = [
  {
    type: 'scenario',
    title: 'Coffee Shop Conversation',
    description: 'Practice ordering drinks and food at a coffee shop',
    category: 'daily_life',
    difficulty: 'beginner',
  },
  {
    type: 'scenario',
    title: 'Job Interview',
    description: 'Common questions and responses in a job interview',
    category: 'work',
    difficulty: 'intermediate',
  },
  {
    type: 'scenario',
    title: 'Doctor\'s Appointment',
    description: 'Describing symptoms and understanding medical advice',
    category: 'health',
    difficulty: 'beginner',
  },
  {
    type: 'scenario',
    title: 'Shopping for Groceries',
    description: 'Learn vocabulary for food items and shopping interactions',
    category: 'shopping',
    difficulty: 'beginner',
  },
  {
    type: 'scenario',
    title: 'Public Transportation',
    description: 'How to ask for directions and use public transport',
    category: 'travel',
    difficulty: 'beginner',
  },
  {
    type: 'scenario',
    title: 'Restaurant Dining',
    description: 'Ordering food and making reservations at restaurants',
    category: 'daily_life',
    difficulty: 'beginner',
  }
];

async function seedScenarios() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing scenarios
    await Vocabulary.deleteMany({ type: 'scenario' });
    console.log('Cleared existing scenarios');

    // Insert new scenarios
    const result = await Vocabulary.insertMany(scenarios);
    console.log('Inserted scenarios:', result.length);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding scenarios:', error);
    process.exit(1);
  }
}

seedScenarios();

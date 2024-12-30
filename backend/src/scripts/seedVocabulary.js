require('dotenv').config();
const mongoose = require('mongoose');
const Vocabulary = require('../models/Vocabulary');

const sampleVocabulary = [
  {
    word: 'family',
    definition: 'A group of people who are related to each other',
    examples: [
      'I have a big family with many cousins.',
      'We have family dinner every Sunday.'
    ],
    difficulty: 'beginner',
    category: 'relationships',
  },
  {
    word: 'weather',
    definition: 'The state of the atmosphere at a particular time and place',
    examples: [
      'The weather is sunny today.',
      'What\'s the weather like in your city?'
    ],
    difficulty: 'beginner',
    category: 'nature',
  },
  {
    word: 'food',
    definition: 'Things that people and animals eat',
    examples: [
      'I love Italian food.',
      'What kind of food do you like?'
    ],
    difficulty: 'beginner',
    category: 'daily life',
  },
  {
    word: 'home',
    definition: 'The place where you live',
    examples: [
      'I\'m going home now.',
      'Welcome to my home!'
    ],
    difficulty: 'beginner',
    category: 'daily life',
  },
  {
    word: 'work',
    definition: 'Activity you do to earn money or achieve a goal',
    examples: [
      'I work at a hospital.',
      'Do you like your work?'
    ],
    difficulty: 'beginner',
    category: 'career',
  },
  {
    word: 'grocery',
    definition: 'Food and other commodities sold by a grocer',
    examples: [
      'I need to buy groceries for dinner tonight.',
      'The grocery store is open until midnight.'
    ],
    difficulty: 'beginner',
    category: 'shopping',
  },
  {
    word: 'appointment',
    definition: 'An arrangement to meet someone at a particular time and place',
    examples: [
      'I have a doctor\'s appointment tomorrow morning.',
      'Don\'t forget to make an appointment with your child\'s teacher.'
    ],
    difficulty: 'beginner',
    category: 'general',
  },
  {
    word: 'restaurant',
    definition: 'A place where you can buy and eat a meal',
    examples: [
      'Let\'s go to a restaurant for dinner.',
      'This restaurant serves delicious food.'
    ],
    difficulty: 'beginner',
    category: 'food',
  },
  {
    word: 'friend',
    definition: 'A person you know well and like',
    examples: [
      'She is my best friend.',
      'I made many new friends at school.'
    ],
    difficulty: 'beginner',
    category: 'relationships',
  },
  {
    word: 'school',
    definition: 'A place where children go to learn',
    examples: [
      'My children go to school by bus.',
      'The school is closed on weekends.'
    ],
    difficulty: 'beginner',
    category: 'education',
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/esl-app');
    console.log('Connected to MongoDB');

    // Clear existing vocabulary
    await Vocabulary.deleteMany({});
    console.log('Cleared existing vocabulary');

    // Insert sample vocabulary
    await Vocabulary.insertMany(sampleVocabulary);
    console.log('Sample vocabulary inserted successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

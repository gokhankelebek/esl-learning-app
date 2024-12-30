require('dotenv').config();
const mongoose = require('mongoose');
const Vocabulary = require('../models/Vocabulary');

// Base scenarios structure
const ESL_SCENARIOS = {
  'Coffee Shop': {
    title: 'Coffee Shop',
    description: 'Learn essential vocabulary and phrases for ordering at a coffee shop.',
    category: 'daily_life',
    difficulty: 'beginner',
    vocabulary: [
      { word: 'coffee', translation: '', definition: 'A hot drink made from roasted coffee beans' },
      { word: 'tea', translation: '', definition: 'A hot drink made by infusing tea leaves in water' },
      { word: 'water', translation: '', definition: 'A clear, colorless liquid essential for life' },
      { word: 'milk', translation: '', definition: 'A white liquid produced by mammals' },
      { word: 'cup', translation: '', definition: 'A small container used for drinking' }
    ],
    phrases: [
      { phrase: 'Can I have...?', usage: 'Ordering something' },
      { phrase: 'How much is...?', usage: 'Asking about price' },
      { phrase: 'For here or to go?', usage: 'Asking about eating location' }
    ]
  },
  'Restaurant': {
    title: 'Restaurant',
    description: 'Master common phrases and vocabulary for dining out.',
    category: 'daily_life',
    difficulty: 'beginner',
    vocabulary: [
      { word: 'menu', translation: '', definition: 'A list of available food and drinks' },
      { word: 'waiter', translation: '', definition: 'A person who serves food in a restaurant' },
      { word: 'bill', translation: '', definition: 'A document showing how much you need to pay' },
      { word: 'table', translation: '', definition: 'A piece of furniture with a flat top' },
      { word: 'order', translation: '', definition: 'To request food or drinks in a restaurant' }
    ],
    phrases: [
      { phrase: 'Table for two', usage: 'Requesting a table' },
      { phrase: 'The menu, please', usage: 'Asking for the menu' },
      { phrase: 'The bill, please', usage: 'Asking for the check' }
    ]
  },
  'Shopping': {
    title: 'Shopping',
    description: 'Learn essential vocabulary for shopping and making purchases.',
    category: 'daily_life',
    difficulty: 'beginner',
    vocabulary: [
      { word: 'price', translation: '', definition: 'The amount of money needed to buy something' },
      { word: 'size', translation: '', definition: 'How big or small something is' },
      { word: 'color', translation: '', definition: 'The appearance of something in terms of light' },
      { word: 'cash', translation: '', definition: 'Physical money in the form of bills and coins' },
      { word: 'card', translation: '', definition: 'A plastic payment card (credit or debit)' }
    ],
    phrases: [
      { phrase: 'How much is this?', usage: 'Asking about price' },
      { phrase: 'Do you have this in...?', usage: 'Asking about size/color' },
      { phrase: 'Can I try this on?', usage: 'Asking to try clothes' }
    ]
  }
};

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing scenarios
    await Vocabulary.deleteMany({ type: 'scenario' });
    console.log('Cleared existing scenarios');

    // Convert scenarios to the correct format and save them
    const scenariosToSave = Object.entries(ESL_SCENARIOS).map(([key, scenario]) => ({
      type: 'scenario',
      title: scenario.title,
      description: scenario.description,
      category: scenario.category,
      difficulty: scenario.difficulty,
      vocabulary: scenario.vocabulary,
      phrases: scenario.phrases
    }));

    // Save all scenarios
    await Vocabulary.insertMany(scenariosToSave);
    console.log('Scenarios saved successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();

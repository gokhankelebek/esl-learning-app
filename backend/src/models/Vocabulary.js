const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['fill-in-blank', 'multiple-choice', 'matching', 'dialogue-completion'],
    required: true
  },
  question: String,
  answer: String,
  alternatives: [String],
  explanation: String
});

const dialogueSchema = new mongoose.Schema({
  situation: String,
  conversation: [{
    role: String,
    text: String
  }],
  keyVocabulary: [{
    word: String,
    definition: String,
    usage: String,
    level: String
  }]
});

const phraseSchema = new mongoose.Schema({
  phrase: String,
  usage: String
});

const wordSchema = new mongoose.Schema({
  word: String,
  translation: String,
  definition: String
});

const vocabularySchema = new mongoose.Schema({
  // For individual words
  word: {
    type: String,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'daily_life',
      'work',
      'education',
      'relationships',
      'health',
      'shopping',
      'travel',
      'technology',
      'entertainment',
      'nature',
      'emotions'
    ]
  },
  
  // For both words and scenarios
  type: {
    type: String,
    enum: ['word', 'scenario'],
    default: 'word',
    required: true
  },
  
  // For scenarios
  title: String,
  description: String,
  category: {
    type: String,
    enum: [
      'daily_life',
      'work',
      'education',
      'relationships',
      'health',
      'shopping',
      'travel',
      'technology',
      'entertainment',
      'sports',
      'food',
      'culture',
      'business',
      'emergency',
      'transportation'
    ]
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  vocabulary: [wordSchema],
  phrases: [phraseSchema],
  dialogues: [dialogueSchema],
  exercises: [exerciseSchema],
  culturalNotes: String,
  
  // Common fields
  definition: String,
  examples: [String],
  collocations: [String],
  synonyms: [String],
  antonyms: [String],
  usage_notes: String,
  phonetic: String,
  audio_url: String,
  image_url: String,
  tags: [String],
  common_mistakes: [String],
  relatedWords: [{
    word: String,
    relationship: {
      type: String,
      enum: ['synonym', 'antonym', 'related']
    }
  }],
  usage: {
    type: String,
    enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection']
  },
  
  // Cache control
  cacheKey: String,
  expiresAt: Date,
  aiGenerated: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
vocabularySchema.index({ difficulty: 1, category: 1 });
vocabularySchema.index({ word: 'text' });
vocabularySchema.index({ cacheKey: 1 });
vocabularySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
vocabularySchema.index({ type: 1, category: 1 });
vocabularySchema.index({ type: 1, difficulty: 1 });
vocabularySchema.index({ word: 'text', title: 'text', description: 'text' });

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  progress: {
    completedScenarios: [{
      scenarioId: String,
      completedAt: Date,
      score: Number,
    }],
    vocabularyMastery: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    phraseMastery: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  preferences: {
    dailyGoal: {
      type: Number,
      default: 10,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  stats: {
    totalPracticeTime: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastPracticeDate: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update progress
userSchema.methods.updateScenarioProgress = async function(scenarioId, score) {
  const completedScenario = {
    scenarioId,
    completedAt: new Date(),
    score
  };

  // Update or add to completed scenarios
  const existingIndex = this.progress.completedScenarios
    .findIndex(s => s.scenarioId === scenarioId);

  if (existingIndex >= 0) {
    this.progress.completedScenarios[existingIndex] = completedScenario;
  } else {
    this.progress.completedScenarios.push(completedScenario);
  }

  // Update stats
  this.stats.lastPracticeDate = new Date();
  
  // Update streak
  const lastActiveDate = new Date(this.stats.lastPracticeDate);
  const today = new Date();
  const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    this.stats.streakDays += 1;
  } else if (diffDays > 1) {
    this.stats.streakDays = 1;
  }

  await this.save();
  return this;
};

// Method to update vocabulary mastery
userSchema.methods.updateVocabularyMastery = async function(word, score) {
  const currentMastery = this.progress.vocabularyMastery.get(word) || 0;
  
  this.progress.vocabularyMastery.set(word, Math.min(100, currentMastery + score));

  await this.save();
  return this;
};

// Method to update phrase mastery
userSchema.methods.updatePhraseMastery = async function(phrase, score) {
  const currentMastery = this.progress.phraseMastery.get(phrase) || 0;
  
  this.progress.phraseMastery.set(phrase, Math.min(100, currentMastery + score));

  await this.save();
  return this;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

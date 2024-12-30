const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user progress
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress stats');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update vocabulary mastery
router.post('/vocabulary/:wordId', auth, async (req, res) => {
  try {
    const { mastery } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.progress.vocabularyMastery) {
      user.progress.vocabularyMastery = {};
    }

    user.progress.vocabularyMastery[req.params.wordId] = mastery;
    await user.save();

    res.json(user.progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update phrase mastery
router.post('/phrase/:phraseId', auth, async (req, res) => {
  try {
    const { mastery } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.progress.phraseMastery) {
      user.progress.phraseMastery = {};
    }

    user.progress.phraseMastery[req.params.phraseId] = mastery;
    await user.save();

    res.json(user.progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Complete scenario
router.post('/scenario/:scenarioId', auth, async (req, res) => {
  try {
    const { score } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.progress.completedScenarios) {
      user.progress.completedScenarios = [];
    }

    const scenarioProgress = {
      scenarioId: req.params.scenarioId,
      completedAt: new Date(),
      score
    };

    user.progress.completedScenarios.push(scenarioProgress);
    await user.save();

    res.json(user.progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

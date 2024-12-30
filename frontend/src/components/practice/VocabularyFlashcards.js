import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Container,
  Stack,
  Paper
} from '@mui/material';
import {
  VolumeUp as VolumeUpIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const VocabularyFlashcards = ({ scenarioId }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVocabulary();
  }, [scenarioId]);

  const fetchVocabulary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vocabulary/scenario/${scenarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Combine A1 and A2 vocabulary
      const allVocabulary = [
        ...response.data.scenario.vocabulary.A1.map(word => ({ word, level: 'A1' })),
        ...response.data.scenario.vocabulary.A2.map(word => ({ word, level: 'A2' }))
      ];
      
      // Shuffle the cards
      const shuffled = allVocabulary.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = async (mastered) => {
    // Update progress
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/progress/vocabulary', {
        word: cards[currentIndex].word,
        score: mastered ? 10 : -5
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setProgress(((currentIndex + 1) / cards.length) * 100);
    }
  };

  const handleReset = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setProgress(0);
  };

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(cards[currentIndex].word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Practice Complete! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You've reviewed all {cards.length} words in this set.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Practice Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {currentIndex + 1} of {cards.length} words
        </Typography>

        <Card
          sx={{
            minHeight: 200,
            cursor: 'pointer',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
            position: 'relative'
          }}
          onClick={handleFlip}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backfaceVisibility: 'hidden',
              position: isFlipped ? 'absolute' : 'relative',
              width: '100%'
            }}
          >
            <Typography variant="h4" component="div" gutterBottom>
              {cards[currentIndex].word}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Level: {cards[currentIndex].level}
            </Typography>
            <IconButton onClick={(e) => { e.stopPropagation(); speakWord(); }}>
              <VolumeUpIcon />
            </IconButton>
          </CardContent>

          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              position: isFlipped ? 'relative' : 'absolute',
              width: '100%'
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              Definition and example will be shown here
            </Typography>
          </CardContent>
        </Card>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 3 }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<ThumbDownIcon />}
            onClick={() => handleNext(false)}
          >
            Need Practice
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ThumbUpIcon />}
            onClick={() => handleNext(true)}
          >
            Mastered
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default VocabularyFlashcards;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';
import confetti from 'canvas-confetti';

const PhraseMatching = ({ scenarioId }) => {
  const [phrases, setPhrases] = useState([]);
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchPhrases();
  }, [scenarioId]);

  const fetchPhrases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vocabulary/scenario/${scenarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allPhrases = response.data.scenario.phrases.basic;
      const shuffledPhrases = allPhrases
        .map(phrase => ({
          text: phrase,
          translation: 'Translation of: ' + phrase, // Replace with actual translations
          id: Math.random().toString(36).substr(2, 9)
        }))
        .sort(() => Math.random() - 0.5);

      setPhrases(shuffledPhrases);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching phrases:', error);
      setLoading(false);
    }
  };

  const handlePhraseClick = async (phrase) => {
    if (matchedPairs.includes(phrase.id)) return;

    if (!selectedPhrase) {
      setSelectedPhrase(phrase);
    } else {
      setAttempts(attempts + 1);

      if (selectedPhrase.text === phrase.text) {
        // Correct match
        setMatchedPairs([...matchedPairs, selectedPhrase.id, phrase.id]);
        setScore(score + 1);

        // Update progress
        try {
          const token = localStorage.getItem('token');
          await axios.post('/api/progress/phrase', {
            phrase: selectedPhrase.text,
            score: 10
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          console.error('Error updating progress:', error);
        }

        // Check if game is complete
        if (matchedPairs.length + 2 === phrases.length) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setShowSuccess(true);
        }
      }
      setSelectedPhrase(null);
    }
  };

  const handleReset = () => {
    const shuffled = [...phrases].sort(() => Math.random() - 0.5);
    setPhrases(shuffled);
    setSelectedPhrase(null);
    setMatchedPairs([]);
    setScore(0);
    setAttempts(0);
    setShowSuccess(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Match the Phrases
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score: {score} | Attempts: {attempts}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(matchedPairs.length / phrases.length) * 100}
            sx={{ mt: 2 }}
          />
        </Paper>

        <Grid container spacing={2}>
          {phrases.map((phrase) => (
            <Grid item xs={12} sm={6} key={phrase.id}>
              <Card
                onClick={() => handlePhraseClick(phrase)}
                sx={{
                  cursor: matchedPairs.includes(phrase.id) ? 'default' : 'pointer',
                  bgcolor: matchedPairs.includes(phrase.id)
                    ? 'success.light'
                    : selectedPhrase?.id === phrase.id
                    ? 'primary.light'
                    : 'background.paper',
                  opacity: matchedPairs.includes(phrase.id) ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent>
                  <Typography variant="body1">
                    {phrase.text}
                  </Typography>
                  {matchedPairs.includes(phrase.id) && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {phrase.translation}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reset Game
          </Button>
        </Box>

        <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
          <DialogTitle>Congratulations! 🎉</DialogTitle>
          <DialogContent>
            <Typography>
              You've successfully matched all phrases!
              Score: {score} | Attempts: {attempts}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleReset} color="primary">
              Play Again
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PhraseMatching;

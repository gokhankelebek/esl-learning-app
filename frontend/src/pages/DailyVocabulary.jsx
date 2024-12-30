import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';
import VocabularyCard from '../components/VocabularyCard';
import { getVocabularyOfTheDay, markWordAsLearned } from '../services/api';

const DailyVocabulary = () => {
  const [words, setWords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching vocabulary data...');
        const data = await getVocabularyOfTheDay();
        console.log('Received data:', data);
        setWords(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vocabulary:', err);
        setError(err.message || 'Failed to load daily vocabulary. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkLearned = async (wordId) => {
    try {
      await markWordAsLearned(wordId);
      setWords(words.map(word => 
        word._id === wordId 
          ? { ...word, learned: true }
          : word
      ));
    } catch (err) {
      setError('Failed to mark word as learned. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Daily Vocabulary
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {words.length === 0 ? (
          <Typography>No words available for today. Check back tomorrow!</Typography>
        ) : (
          words.map((word) => (
            <VocabularyCard
              key={word._id}
              word={word}
              onMarkLearned={handleMarkLearned}
            />
          ))
        )}
      </Box>
    </Container>
  );
};

export default DailyVocabulary;

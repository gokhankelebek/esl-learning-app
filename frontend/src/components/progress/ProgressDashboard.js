import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const ProgressDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/progress/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgressData(response.data.summary);
      setLoading(false);
    } catch (err) {
      setError('Failed to load progress data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Learning Progress
        </Typography>

        <Grid container spacing={3}>
          {/* Overall Stats */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Overall Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={(progressData.stats.totalPracticeTime / (30 * 60)) * 100}
                    size={80}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary">
                      {Math.round((progressData.stats.totalPracticeTime / (30 * 60)) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Daily Goal Progress
                  </Typography>
                  <Typography variant="h6">
                    {Math.floor(progressData.stats.totalPracticeTime / 60)} mins
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                🔥 {progressData.stats.streakDays} Day Streak
              </Typography>
            </Paper>
          </Grid>

          {/* Vocabulary Progress */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Vocabulary Mastery
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Words Mastered
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(progressData.vocabularyMastery.mastered / progressData.vocabularyMastery.total) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {progressData.vocabularyMastery.mastered} / {progressData.vocabularyMastery.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Phrase Progress */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Phrase Mastery
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phrases Mastered
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(progressData.phraseMastery.mastered / progressData.phraseMastery.total) * 100}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {progressData.phraseMastery.mastered} / {progressData.phraseMastery.total}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity Timeline */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Timeline>
                {progressData.completedScenarios.slice(-5).map((scenario, index) => (
                  <TimelineItem key={index}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < 4 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1">
                        Completed: {scenario.scenarioId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score: {scenario.score}%
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProgressDashboard;

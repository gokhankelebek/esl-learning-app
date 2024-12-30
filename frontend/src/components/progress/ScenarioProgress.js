import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ScenarioProgress = () => {
  const { scenarioId } = useParams();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchScenarioProgress();
  }, [scenarioId]);

  const fetchScenarioProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/progress/scenario/${scenarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load scenario progress');
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

  const getMasteryColor = (level) => {
    if (level >= 80) return 'success';
    if (level >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Scenario Progress: {scenarioId}
      </Typography>

      {/* Overall Progress */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Performance
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completion Score
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.scenarioProgress?.score || 0}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {progress.scenarioProgress?.score || 0}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Last Completed:
            </Typography>
            <Typography>
              {progress.scenarioProgress?.completedAt
                ? new Date(progress.scenarioProgress.completedAt).toLocaleDateString()
                : 'Not completed yet'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Vocabulary Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Vocabulary Mastery
          </Typography>
          <List>
            {Object.entries(progress.vocabularyProgress).map(([word, data], index) => (
              <React.Fragment key={word}>
                <ListItem>
                  <ListItemText
                    primary={word}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={data.level}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={getMasteryColor(data.level)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            Mastery: {data.level}%
                          </Typography>
                          <Typography variant="caption">
                            Last Practice: {new Date(data.lastPracticed).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <Chip
                    label={data.level >= 80 ? 'Mastered' : 'In Progress'}
                    color={getMasteryColor(data.level)}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </ListItem>
                {index < Object.entries(progress.vocabularyProgress).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Phrase Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phrase Mastery
          </Typography>
          <List>
            {Object.entries(progress.phraseProgress).map(([phrase, data], index) => (
              <React.Fragment key={phrase}>
                <ListItem>
                  <ListItemText
                    primary={phrase}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={data.level}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={getMasteryColor(data.level)}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption">
                            Mastery: {data.level}%
                          </Typography>
                          <Typography variant="caption">
                            Last Practice: {new Date(data.lastPracticed).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <Chip
                    label={data.level >= 80 ? 'Mastered' : 'In Progress'}
                    color={getMasteryColor(data.level)}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </ListItem>
                {index < Object.entries(progress.phraseProgress).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ScenarioProgress;

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Mic as MicIcon,
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

const ScenarioRolePlay = ({ scenarioId }) => {
  const [scenario, setScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const mediaRecorder = useRef(null);
  const speechRecognition = useRef(null);

  useEffect(() => {
    fetchScenario();
    initializeSpeechRecognition();
  }, [scenarioId]);

  const fetchScenario = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/vocabulary/scenario/${scenarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScenario(response.data.scenario);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scenario:', error);
      setLoading(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      speechRecognition.current.lang = 'en-US';

      speechRecognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(transcript);
      };
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        // Handle audio data
      };

      mediaRecorder.current.start();
      speechRecognition.current?.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      speechRecognition.current?.stop();
      setIsRecording(false);
      analyzeSpeech();
    }
  };

  const analyzeSpeech = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/progress/scenario/speech', {
        scenarioId,
        transcript,
        step: currentStep
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error analyzing speech:', error);
    }
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = async () => {
    if (currentStep < scenario.phrases.situational.length - 1) {
      setCurrentStep(currentStep + 1);
      setTranscript('');
      setFeedback(null);
    } else {
      // Complete scenario
      try {
        const token = localStorage.getItem('token');
        await axios.post(`/api/progress/scenario/${scenarioId}`, {
          score: calculateScore()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  const calculateScore = () => {
    // Implement scoring logic based on feedback
    return 85; // Example score
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
            Role Play: {scenario.name}
          </Typography>
          
          <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
            {scenario.phrases.situational.map((_, index) => (
              <Step key={index}>
                <StepLabel>Scene {index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Line:
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {scenario.phrases.situational[currentStep]}
              </Typography>
              <IconButton onClick={() => speakText(scenario.phrases.situational[currentStep])}>
                <VolumeUpIcon />
              </IconButton>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            {!isRecording ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={startRecording}
              >
                Start Speaking
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopRecording}
              >
                Stop Recording
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={() => setShowTips(true)}
            >
              Show Tips
            </Button>
          </Box>

          {transcript && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.100' }}>
              <Typography variant="subtitle2" gutterBottom>
                Your Speech:
              </Typography>
              <Typography>{transcript}</Typography>
            </Paper>
          )}

          {feedback && (
            <Card sx={{ mb: 3, bgcolor: feedback.score >= 80 ? 'success.light' : 'warning.light' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Feedback
                </Typography>
                <List>
                  {feedback.points.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {point.type === 'positive' ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                      </ListItemIcon>
                      <ListItemText primary={point.text} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!feedback}
          >
            {currentStep < scenario.phrases.situational.length - 1 ? 'Next Scene' : 'Complete Practice'}
          </Button>
        </Paper>
      </Box>

      <Dialog open={showTips} onClose={() => setShowTips(false)}>
        <DialogTitle>Speaking Tips</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon><CheckIcon /></ListItemIcon>
              <ListItemText 
                primary="Speak clearly and at a natural pace"
                secondary="Don't rush through the words"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon /></ListItemIcon>
              <ListItemText 
                primary="Use appropriate intonation"
                secondary="Match your tone to the context"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckIcon /></ListItemIcon>
              <ListItemText 
                primary="Practice the pronunciation"
                secondary="Use the speaker icon to hear correct pronunciation"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTips(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScenarioRolePlay;

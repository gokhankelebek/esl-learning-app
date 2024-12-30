import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const DialogPractice = ({ dialog, onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [practiceMode, setPracticeMode] = useState("listen"); // 'listen' or 'speak'

  useEffect(() => {
    if (!dialog || !dialog.lines) return;
    setProgress((currentLine / dialog.lines.length) * 100);
  }, [currentLine, dialog]);

  const handleNext = () => {
    if (currentLine < dialog.lines.length - 1) {
      setCurrentLine((prev) => prev + 1);
      setShowTranslation(false);
    } else if (practiceMode === "listen") {
      // Switch to speaking practice
      setPracticeMode("speak");
      setCurrentLine(0);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentLine > 0) {
      setCurrentLine((prev) => prev - 1);
      setShowTranslation(false);
    }
  };

  const speakLine = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  if (!dialog || !dialog.lines) return null;

  const currentDialogLine = dialog.lines[currentLine];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {practiceMode === "listen" ? "Listen and Learn" : "Practice Speaking"}
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {Math.round(progress)}% Complete
        </Typography>
      </Box>

      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {dialog.title || "Dialog Practice"}
            </Typography>

            <Paper
              elevation={3}
              sx={{ p: 3, mb: 3, bgcolor: "background.default" }}
            >
              <Stack spacing={2}>
                {dialog.lines.slice(0, currentLine + 1).map((line, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      opacity: index === currentLine ? 1 : 0.6,
                    }}
                  >
                    <PersonIcon
                      sx={{
                        mr: 1,
                        color:
                          line.speaker === "A"
                            ? "primary.main"
                            : "secondary.main",
                      }}
                    />
                    <Box sx={{ flex: 1, textAlign: "left" }}>
                      <Typography variant="body1">
                        {line.text}
                        {index === currentLine && (
                          <IconButton
                            onClick={() => speakLine(line.text)}
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <VolumeUpIcon />
                          </IconButton>
                        )}
                      </Typography>
                      {showTranslation && index === currentLine && (
                        <Typography variant="body2" color="text.secondary">
                          {line.translation}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {practiceMode === "speak" && (
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                Try to speak the highlighted line!
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowTranslation(!showTranslation)}
                sx={{ mr: 2 }}
              >
                {showTranslation ? "Hide" : "Show"} Translation
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                startIcon={practiceMode === "speak" ? <CheckIcon /> : null}
              >
                {currentLine < dialog.lines.length - 1
                  ? "Next"
                  : practiceMode === "listen"
                  ? "Start Speaking Practice"
                  : "Complete Dialog"}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentLine === 0}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={
            currentLine === dialog.lines.length - 1 && practiceMode === "speak"
          }
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default DialogPractice;

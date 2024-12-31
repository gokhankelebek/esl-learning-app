import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Paper,
  Collapse,
  CircularProgress,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  Lightbulb as LightbulbIcon,
  Translate as TranslateIcon,
} from "@mui/icons-material";

const PhrasePractice = ({ phrases, onComplete }) => {
  const [currentPhrases, setCurrentPhrases] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [mastered, setMastered] = useState(new Set());
  const [showTranslation, setShowTranslation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [aiContent, setAiContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (phrases) {
      const allPhrases = Object.entries(phrases).flatMap(
        ([category, phraseList]) =>
          phraseList.map((phrase) => ({ phrase, category }))
      );
      setCurrentPhrases(allPhrases);
    }
  }, [phrases]);

  const fetchAIContent = async (phrase) => {
    try {
      setLoadingContent(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found");
        setAiContent({
          translation: "Translation not available",
          examples: [],
          grammarNotes: "",
          culturalNotes: "",
        });
        return;
      }

      const response = await fetch(
        "http://localhost:5001/api/vocabulary/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: phrase, type: "sentence" }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        console.warn("Authentication failed, using fallback content");
        setAiContent({
          translation: "Translation not available",
          examples: [],
          grammarNotes: "",
          culturalNotes: "",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch AI content: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setAiContent(data.data);
      } else {
        setAiContent({
          translation: "Translation not available",
          examples: [],
          grammarNotes: "",
          culturalNotes: "",
        });
      }
    } catch (error) {
      console.error("Error fetching AI content:", error);
      setAiContent({
        translation: "Translation not available",
        examples: [],
        grammarNotes: "",
        culturalNotes: "",
      });
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (currentPhrases.length > 0 && currentIndex < currentPhrases.length) {
      fetchAIContent(currentPhrases[currentIndex].phrase);
    }
  }, [currentIndex, currentPhrases]);

  const speakPhrase = async (phrase) => {
    try {
      setLoadingAudio(true);
      const response = await fetch("http://localhost:5001/api/vocabulary/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: phrase }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("TTS Error:", error);
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleMastered = () => {
    const newMastered = new Set(mastered);
    newMastered.add(currentIndex);
    setMastered(newMastered);
    setProgress((newMastered.size / currentPhrases.length) * 100);

    if (newMastered.size === currentPhrases.length) {
      onComplete?.();
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (currentIndex < currentPhrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
      setShowHint(false);
    }
  };

  if (!currentPhrases.length || currentIndex >= currentPhrases.length)
    return null;

  const currentPhrase = currentPhrases[currentIndex];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h4">Practice Phrases</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} />
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="overline" display="block" gutterBottom>
              {currentPhrase.category}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h5">{currentPhrase.phrase}</Typography>
              <IconButton
                onClick={() => speakPhrase(currentPhrase.phrase)}
                disabled={loadingAudio}
              >
                {loadingAudio ? (
                  <CircularProgress size={24} />
                ) : (
                  <VolumeUpIcon />
                )}
              </IconButton>
            </Stack>

            <Collapse in={showTranslation}>
              <Paper
                elevation={3}
                sx={{ p: 2, mt: 2, bgcolor: "secondary.light" }}
              >
                {loadingContent ? (
                  <CircularProgress size={20} />
                ) : (
                  <Typography variant="h6" color="secondary.contrastText">
                    {aiContent?.translation || "Translation not available"}
                  </Typography>
                )}
              </Paper>
            </Collapse>

            <Collapse in={showHint}>
              <Paper
                elevation={3}
                sx={{ p: 2, mt: 2, bgcolor: "primary.light" }}
              >
                {loadingContent ? (
                  <CircularProgress size={20} />
                ) : (
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      color="primary.contrastText"
                    >
                      Similar Examples:
                    </Typography>
                    {aiContent?.examples?.map((example, index) => (
                      <Typography
                        key={index}
                        variant="body1"
                        color="primary.contrastText"
                        paragraph
                      >
                        • {example}
                      </Typography>
                    ))}

                    {aiContent?.grammarNotes && (
                      <>
                        <Typography
                          variant="h6"
                          gutterBottom
                          color="primary.contrastText"
                          sx={{ mt: 2 }}
                        >
                          Grammar Notes:
                        </Typography>
                        <Typography
                          variant="body1"
                          color="primary.contrastText"
                          paragraph
                        >
                          {aiContent.grammarNotes}
                        </Typography>
                      </>
                    )}

                    {aiContent?.culturalNotes && (
                      <>
                        <Typography
                          variant="h6"
                          gutterBottom
                          color="primary.contrastText"
                          sx={{ mt: 2 }}
                        >
                          Cultural Context:
                        </Typography>
                        <Typography
                          variant="body1"
                          color="primary.contrastText"
                        >
                          {aiContent.culturalNotes}
                        </Typography>
                      </>
                    )}
                  </Box>
                )}
              </Paper>
            </Collapse>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                onClick={() => setShowTranslation(!showTranslation)}
                startIcon={<TranslateIcon />}
              >
                {showTranslation ? "Hide Translation" : "Show Translation"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowHint(!showHint)}
                startIcon={<LightbulbIcon />}
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleMastered}
                startIcon={<CheckIcon />}
              >
                I Know This
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PhrasePractice;

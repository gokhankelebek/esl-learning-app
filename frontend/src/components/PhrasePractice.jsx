import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Stack,
  Fade,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const PhrasePractice = ({ phrases, vocabulary, onComplete }) => {
  const [currentCategory, setCurrentCategory] = useState("basic");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mastered, setMastered] = useState({
    basic: [],
    situational: [],
    cultural: [],
  });

  const categories = ["basic", "situational", "cultural"];
  const currentPhrases = phrases[currentCategory] || [];

  useEffect(() => {
    // Initialize mastered state for each category
    const initialMastered = {};
    categories.forEach((category) => {
      initialMastered[category] = new Array(
        phrases[category]?.length || 0
      ).fill(false);
    });
    setMastered(initialMastered);
  }, [phrases]);

  const handleNext = () => {
    if (currentIndex < currentPhrases.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowTranslation(false);
    } else if (categories.indexOf(currentCategory) < categories.length - 1) {
      // Move to next category
      const nextCategory = categories[categories.indexOf(currentCategory) + 1];
      setCurrentCategory(nextCategory);
      setCurrentIndex(0);
      setShowTranslation(false);
    }
    updateProgress();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowTranslation(false);
    } else if (categories.indexOf(currentCategory) > 0) {
      // Move to previous category
      const prevCategory = categories[categories.indexOf(currentCategory) - 1];
      setCurrentCategory(prevCategory);
      setCurrentIndex(phrases[prevCategory].length - 1);
      setShowTranslation(false);
    }
  };

  const handleMastered = () => {
    const newMastered = { ...mastered };
    newMastered[currentCategory][currentIndex] = true;
    setMastered(newMastered);
    handleNext();

    // Check if all phrases are mastered
    const allMastered = Object.values(newMastered).every((categoryMastered) =>
      categoryMastered.every(Boolean)
    );
    if (allMastered) {
      onComplete();
    }
  };

  const updateProgress = () => {
    const totalPhrases = Object.values(phrases).reduce(
      (sum, category) => sum + category.length,
      0
    );
    const masteredCount = Object.values(mastered).reduce(
      (sum, category) => sum + category.filter(Boolean).length,
      0
    );
    const newProgress = (masteredCount / totalPhrases) * 100;
    setProgress(newProgress);
  };

  const speakPhrase = (phrase) => {
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const currentPhrase = currentPhrases[currentIndex];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Practice Phrases
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {Math.round(progress)}% Mastered
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              color={category === currentCategory ? "primary" : "default"}
              onClick={() => {
                setCurrentCategory(category);
                setCurrentIndex(0);
                setShowTranslation(false);
              }}
            />
          ))}
        </Stack>
      </Box>

      {currentPhrase && (
        <Card sx={{ minHeight: 300 }}>
          <CardContent>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" gutterBottom>
                {currentPhrase.phrase}
                <IconButton
                  onClick={() => speakPhrase(currentPhrase.phrase)}
                  size="large"
                >
                  <VolumeUpIcon />
                </IconButton>
              </Typography>

              {showTranslation && (
                <Fade in={showTranslation}>
                  <Box>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      gutterBottom
                    >
                      {currentPhrase.translation}
                    </Typography>
                    {currentPhrase.context && (
                      <Typography variant="body2" color="text.secondary">
                        Context: {currentPhrase.context}
                      </Typography>
                    )}
                  </Box>
                </Fade>
              )}

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowTranslation(!showTranslation)}
                  sx={{ mr: 2 }}
                >
                  {showTranslation ? "Hide" : "Show"} Translation
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleMastered}
                  startIcon={<CheckIcon />}
                >
                  I Know This
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentIndex === 0 && currentCategory === categories[0]}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={
            currentIndex === currentPhrases.length - 1 &&
            currentCategory === categories[categories.length - 1]
          }
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PhrasePractice;

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const UNSPLASH_ACCESS_KEY =
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY || "your_unsplash_key";

// Words that are too abstract or not suitable for images
const SKIP_IMAGE_WORDS = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "with",
  "by",
  "about",
  "like",
  "through",
  "after",
  "over",
  "between",
  "out",
  "against",
  "during",
  "without",
  "before",
  "under",
  "around",
  "among",
  "want",
  "need",
  "can",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "must",
  "shall",
];

const VocabularyLearning = ({ vocabulary, onComplete }) => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mastered, setMastered] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [currentImage, setCurrentImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [audioCache, setAudioCache] = useState({});
  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    const allWords = Object.entries(vocabulary).reduce(
      (acc, [level, words]) => {
        return [
          ...acc,
          ...words.map((word) => ({
            word,
            level,
            mastered: false,
          })),
        ];
      },
      []
    );

    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setMastered(new Array(shuffledWords.length).fill(false));
  }, [vocabulary]);

  const shouldFetchImage = useCallback(
    (word) => {
      // Skip fetching for abstract words
      if (SKIP_IMAGE_WORDS.includes(word.toLowerCase())) {
        return false;
      }
      // Skip if we already have it in cache
      if (imageCache[word] !== undefined) {
        return false;
      }
      return true;
    },
    [imageCache]
  );

  const fetchWordImage = useCallback(
    async (word) => {
      // If we have it in cache, use that
      if (imageCache[word]) {
        setCurrentImage(imageCache[word]);
        return;
      }

      // If it's in the skip list, don't fetch
      if (SKIP_IMAGE_WORDS.includes(word.toLowerCase())) {
        setCurrentImage(null);
        return;
      }

      try {
        setLoadingImage(true);
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${word}&per_page=1`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        );
        const data = await response.json();
        const imageUrl = data.results?.[0]?.urls?.small || null;

        // Update cache
        setImageCache((prev) => ({
          ...prev,
          [word]: imageUrl,
        }));
        setCurrentImage(imageUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
        setCurrentImage(null);
        // Cache the failure too to avoid retrying
        setImageCache((prev) => ({
          ...prev,
          [word]: null,
        }));
      } finally {
        setLoadingImage(false);
      }
    },
    [imageCache]
  );

  useEffect(() => {
    const currentWord = words[currentIndex]?.word;
    if (currentWord && shouldFetchImage(currentWord)) {
      fetchWordImage(currentWord);
    } else if (currentWord) {
      // Use cached image
      setCurrentImage(imageCache[currentWord] || null);
    }
  }, [currentIndex, words, shouldFetchImage, fetchWordImage, imageCache]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowTranslation(false);
    }
    updateProgress();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowTranslation(false);
    }
  };

  const handleMastered = () => {
    const newMastered = [...mastered];
    newMastered[currentIndex] = true;
    setMastered(newMastered);
    handleNext();

    // Check if all words are mastered
    if (newMastered.filter(Boolean).length === words.length) {
      onComplete();
    }
  };

  const updateProgress = () => {
    const masteredCount = mastered.filter(Boolean).length;
    const newProgress = (masteredCount / words.length) * 100;
    setProgress(newProgress);
  };

  const speakWord = async (word) => {
    if (!word) return;

    try {
      // Check if we have the audio cached
      if (audioCache[word]) {
        const audio = new Audio(audioCache[word]);
        audio.play();
        return;
      }

      setLoadingAudio(true);

      // Debug token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        throw new Error("Authentication token is missing");
      }
      console.log("Token found:", token.substring(0, 20) + "...");

      // Fetch audio from our backend with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch("/api/vocabulary/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: word }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log("Response status:", response.status);
        console.log("Response status text:", response.statusText);
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the audio URL
      setAudioCache((prev) => ({
        ...prev,
        [word]: audioUrl,
      }));

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("TTS Error:", error);
      // Only fallback to browser's TTS if it wasn't an abort error
      if (error.name !== "AbortError") {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setLoadingAudio(false);
    }
  };

  if (!words.length || currentIndex >= words.length) return null;

  const currentWord = words[currentIndex];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Learn New Words
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          {Math.round(progress)}% Mastered
        </Typography>
      </Box>

      <Card
        sx={{
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              {currentWord.word}
              <IconButton
                onClick={() => speakWord(currentWord.word)}
                size="large"
                sx={{ ml: 2 }}
                disabled={loadingAudio}
              >
                {loadingAudio ? (
                  <CircularProgress size={24} />
                ) : (
                  <VolumeUpIcon />
                )}
              </IconButton>
            </Typography>

            {loadingImage ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                <CircularProgress />
              </Box>
            ) : currentImage ? (
              <CardMedia
                component="img"
                image={currentImage}
                alt={currentWord.word}
                sx={{
                  height: 200,
                  width: "auto",
                  margin: "0 auto",
                  objectFit: "contain",
                  my: 3,
                }}
              />
            ) : null}

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

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default VocabularyLearning;

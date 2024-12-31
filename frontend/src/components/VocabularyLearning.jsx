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
  Paper,
  Stack,
  Fade,
  Chip,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Lightbulb as LightbulbIcon,
  Translate as TranslateIcon,
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

// Comprehensive translations for all vocabulary words
const translations = {
  // Coffee Shop
  coffee: "kahve",
  tea: "çay",
  water: "su",
  milk: "süt",
  hot: "sıcak",
  cold: "soğuk",
  cup: "fincan",
  drink: "içmek",
  want: "istemek",
  like: "beğenmek",
  order: "sipariş",
  menu: "menü",
  price: "fiyat",
  sugar: "şeker",
  sweet: "tatlı",
  size: "boyut",
  table: "masa",
  wait: "beklemek",

  // Restaurant
  food: "yemek",
  eat: "yemek (fiil)",
  chair: "sandalye",
  plate: "tabak",
  spoon: "kaşık",
  fork: "çatal",
  knife: "bıçak",
  waiter: "garson",
  bill: "hesap",
  reservation: "rezervasyon",
  appetizer: "başlangıç",
  "main course": "ana yemek",
  dessert: "tatlı",
  spicy: "baharatlı",

  // Doctor's Office
  sick: "hasta",
  pain: "ağrı",
  head: "baş",
  stomach: "mide",
  feel: "hissetmek",
  hurt: "acımak",
  better: "daha iyi",
  worse: "daha kötü",
  appointment: "randevu",
  doctor: "doktor",
  nurse: "hemşire",
  medicine: "ilaç",
  prescription: "reçete",
  fever: "ateş",
  cough: "öksürük",
  symptoms: "belirtiler",

  // Meeting People
  hello: "merhaba",
  hi: "selam",
  goodbye: "hoşça kal",
  name: "isim",
  nice: "güzel",
  meet: "tanışmak",
  friend: "arkadaş",
  from: "-den/-dan",
  yes: "evet",
  no: "hayır",
  introduce: "tanıtmak",
  welcome: "hoş geldiniz",
  pleasure: "memnuniyet",
  country: "ülke",
  language: "dil",
  culture: "kültür",
  visit: "ziyaret etmek",
  stay: "kalmak",

  // Job Interview
  work: "çalışmak",
  job: "iş",
  help: "yardım",
  good: "iyi",
  time: "zaman",
  day: "gün",
  week: "hafta",
  start: "başlamak",
  finish: "bitirmek",
  thank: "teşekkür etmek",
  experience: "deneyim",
  skills: "beceriler",
  education: "eğitim",
  salary: "maaş",
  schedule: "program",
  position: "pozisyon",
  team: "takım",
  company: "şirket",

  // Apartment Hunting
  room: "oda",
  house: "ev",
  door: "kapı",
  window: "pencere",
  big: "büyük",
  small: "küçük",
  clean: "temiz",
  new: "yeni",
  old: "eski",
  rent: "kira",
  lease: "kira sözleşmesi",
  utilities: "faturalar",
  furnished: "mobilyalı",
  available: "müsait",
  deposit: "depozito",
  bedroom: "yatak odası",
  bathroom: "banyo",

  // Emergency
  police: "polis",
  fire: "yangın",
  hospital: "hastane",
  emergency: "acil durum",
  stop: "durmak",
  now: "şimdi",
  here: "burada",
  call: "aramak",
  please: "lütfen",
  ambulance: "ambulans",
  accident: "kaza",
  injured: "yaralı",
  danger: "tehlike",
  safe: "güvenli",
  quickly: "hızlıca",
  immediately: "derhal",

  // Technology
  phone: "telefon",
  text: "mesaj",
  problem: "sorun",
  battery: "batarya",
  screen: "ekran",
  charger: "şarj aleti",
  settings: "ayarlar",
  password: "şifre",
  update: "güncelleme",
  storage: "depolama",
  data: "veri",

  // Library
  book: "kitap",
  read: "okumak",
  study: "çalışmak",
  quiet: "sessiz",
  find: "bulmak",
  look: "bakmak",
  take: "almak",
  return: "iade etmek",
  card: "kart",
  borrow: "ödünç almak",
  renew: "yenilemek",
  reference: "referans",
  catalog: "katalog",
  database: "veritabanı",
  research: "araştırma",
  periodical: "süreli yayın",
  fine: "ceza",

  // Classroom
  teacher: "öğretmen",
  student: "öğrenci",
  pen: "kalem",
  paper: "kağıt",
  desk: "sıra",
  board: "tahta",
  write: "yazmak",
  learn: "öğrenmek",
  assignment: "ödev",
  homework: "ev ödevi",
  project: "proje",
  presentation: "sunum",
  exam: "sınav",
  grade: "not",
  lecture: "ders",
  notes: "notlar",

  // Shopping
  buy: "satın almak",
  sell: "satmak",
  cheap: "ucuz",
  expensive: "pahalı",
  cash: "nakit",
  credit: "kredi",
  receipt: "fiş",
  bag: "çanta",
  try: "denemek",
  fit: "uymak",
  color: "renk",
  style: "stil",
  brand: "marka",
  discount: "indirim",
  sale: "satış",
  price: "fiyat",
  cost: "maliyet",
  change: "değiştirmek",
  refund: "iade",
  exchange: "değişim",
};

// Add example sentences for words
const examples = {
  // Coffee Shop
  coffee: "Would you like some coffee?",
  tea: "I drink green tea every morning.",
  water: "Can I have a glass of water?",
  milk: "Do you take milk in your coffee?",
  hot: "The coffee is too hot to drink.",
  cold: "I prefer cold drinks in summer.",
  cup: "She bought a new coffee cup.",
  drink: "What would you like to drink?",
  want: "I want a large coffee, please.",
  like: "I like my coffee black.",
  order: "Are you ready to order?",
  menu: "Can I see the menu, please?",
  price: "What's the price of a cappuccino?",
  sugar: "How many sugars do you take?",
  sweet: "This cake is very sweet.",
  size: "What size coffee would you like?",
  table: "Is this table free?",
  wait: "Please wait while I prepare your drink.",

  // Restaurant
  food: "The food here is delicious.",
  eat: "Let's eat dinner together.",
  chair: "Please take a chair and sit down.",
  plate: "Your plate is empty already!",
  spoon: "You'll need a spoon for the soup.",
  fork: "Could you pass me a fork?",
  knife: "Be careful with that sharp knife.",
  waiter: "The waiter is coming to take our order.",
  bill: "Could we have the bill, please?",
  reservation: "Do you have a reservation?",
  appetizer: "Would you like to order an appetizer?",
  "main course": "For main course, I'll have the steak.",
  dessert: "Would you like to see the dessert menu?",
  spicy: "This curry is very spicy.",

  // Doctor's Office
  sick: "I've been sick since Monday.",
  pain: "I have pain in my back.",
  head: "My head hurts.",
  stomach: "I have a stomach ache.",
  feel: "I don't feel well today.",
  hurt: "Does it hurt when I press here?",
  better: "I feel much better now.",
  worse: "My cough is getting worse.",
  appointment: "I need to make an appointment.",
  doctor: "The doctor will see you now.",
  nurse: "The nurse took my temperature.",
  medicine: "Take this medicine twice a day.",
  prescription: "You can get your prescription at the pharmacy.",
  fever: "You have a high fever.",
  cough: "This cough has lasted for weeks.",
  symptoms: "What are your symptoms?",

  // Add more examples for other categories...
};

const VocabularyLearning = ({ vocabulary, onComplete, scenarioTitle }) => {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [mastered, setMastered] = useState(new Set());
  const [showHint, setShowHint] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (vocabulary) {
      const allWords = [
        ...Object.entries(vocabulary).flatMap(([level, words]) =>
          words.map((word) => ({ word, level }))
        ),
      ];
      setWords(allWords);
    }
  }, [vocabulary]);

  useEffect(() => {
    if (
      words.length > 0 &&
      !SKIP_IMAGE_WORDS.includes(words[currentIndex].word.toLowerCase())
    ) {
      fetchImage(words[currentIndex].word);
    } else {
      setCurrentImage(null);
    }
  }, [currentIndex, words]);

  const fetchImage = async (word) => {
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
      if (data.results && data.results.length > 0) {
        setCurrentImage(data.results[0].urls.regular);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setCurrentImage(null);
    } finally {
      setLoadingImage(false);
    }
  };

  const speakWord = async (word) => {
    try {
      setLoadingAudio(true);
      const response = await fetch("http://localhost:5001/api/vocabulary/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: word }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio: " + response.statusText);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

      // Clean up
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("TTS Error:", error);
      // Fallback to browser's TTS
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
      setShowHint(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
      setShowHint(false);
    }
  };

  const handleMastered = () => {
    const newMastered = new Set(mastered);
    newMastered.add(currentIndex);
    setMastered(newMastered);
    setProgress((newMastered.size / words.length) * 100);

    if (newMastered.size === words.length) {
      setCompletionMessage(`Great job! You've learned all the vocabulary for "${scenarioTitle}". 
        Now let's practice using these words in sentences and dialogues!`);
      setTimeout(() => {
        onComplete?.("vocabulary_complete");
      }, 3000);
    } else {
      handleNext();
    }
  };

  const fetchAIContent = async (word) => {
    try {
      setLoadingContent(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found");
        setAiContent({
          translation: translations[word.toLowerCase()],
          examples: [examples[word.toLowerCase()] || ""],
          usageNotes: "",
          collocations: [],
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
          body: JSON.stringify({ text: word, type: "word" }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        // Handle authentication errors by falling back to static content
        console.warn("Authentication failed, using fallback content");
        setAiContent({
          translation: translations[word.toLowerCase()],
          examples: [examples[word.toLowerCase()] || ""],
          usageNotes: "",
          collocations: [],
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
        // Fallback to static content if AI response is not in expected format
        setAiContent({
          translation: translations[word.toLowerCase()],
          examples: [examples[word.toLowerCase()] || ""],
          usageNotes: "",
          collocations: [],
        });
      }
    } catch (error) {
      console.error("Error fetching AI content:", error);
      // Fallback to static content on error
      setAiContent({
        translation: translations[word.toLowerCase()],
        examples: [examples[word.toLowerCase()] || ""],
        usageNotes: "",
        collocations: [],
      });
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      fetchAIContent(words[currentIndex].word);
    }
  }, [currentIndex, words]);

  if (!words.length || currentIndex >= words.length) return null;

  const currentWord = words[currentIndex];
  const translation =
    translations[currentWord.word.toLowerCase()] || "Çeviri mevcut değil";

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h4">Learn New Words</Typography>
          <Chip
            label={`${Math.round(progress)}% Complete`}
            color="primary"
            variant="outlined"
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Card
        sx={{
          minHeight: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          overflow: "visible",
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Typography variant="h3" component="h1">
                {currentWord.word}
              </Typography>
              <IconButton
                onClick={() => speakWord(currentWord.word)}
                size="large"
                disabled={loadingAudio}
              >
                {loadingAudio ? (
                  <CircularProgress size={24} />
                ) : (
                  <VolumeUpIcon />
                )}
              </IconButton>
            </Stack>

            <Chip
              label={currentWord.level}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />

            <Collapse in={showTranslation}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mt: 2,
                  backgroundColor: "secondary.light",
                  color: "secondary.contrastText",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  <TranslateIcon color="secondary" />
                  <Typography variant="h5" color="secondary.dark">
                    {loadingContent ? (
                      <CircularProgress size={20} />
                    ) : (
                      aiContent?.translation || translation
                    )}
                  </Typography>
                </Stack>
              </Paper>
            </Collapse>

            <Fade in={showHint}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mt: 2,
                  backgroundColor: "primary.light",
                  color: "primary.contrastText",
                }}
              >
                {loadingContent ? (
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Examples:
                    </Typography>
                    {aiContent?.examples?.map((example, index) => (
                      <Typography key={index} variant="body1" paragraph>
                        • {example}
                      </Typography>
                    ))}

                    {aiContent?.collocations && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Common Collocations:
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {aiContent.collocations.join(", ")}
                        </Typography>
                      </>
                    )}

                    {aiContent?.usageNotes && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Usage Notes:
                        </Typography>
                        <Typography variant="body1">
                          {aiContent.usageNotes}
                        </Typography>
                      </>
                    )}
                  </>
                )}
              </Paper>
            </Fade>

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
                  borderRadius: 2,
                }}
              />
            ) : null}

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
                color="secondary"
              >
                {showTranslation ? "Hide Translation" : "Show Translation"}
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

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        sx={{ mt: 4 }}
      >
        <Tooltip title={currentIndex === 0 ? "First word" : "Previous word"}>
          <span>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              startIcon={<ArrowBackIcon />}
            >
              Previous
            </Button>
          </span>
        </Tooltip>

        <Button
          variant="outlined"
          onClick={() => setShowHint(!showHint)}
          color="secondary"
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>

        <Tooltip
          title={currentIndex === words.length - 1 ? "Last word" : "Next word"}
        >
          <span>
            <Button
              variant="outlined"
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Collapse in={!!completionMessage}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            mb: 2,
            backgroundColor: "success.light",
            color: "success.contrastText",
            textAlign: "center",
          }}
        >
          <Typography variant="h6">{completionMessage}</Typography>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default VocabularyLearning;

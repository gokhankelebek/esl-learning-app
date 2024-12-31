const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Vocabulary = require("../models/Vocabulary");
const User = require("../models/User");
const textToSpeech = require("@google-cloud/text-to-speech");
const util = require("util");
const fs = require("fs");
const path = require("path");

// Initialize Gemini AI
let genAI;
try {
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "your_gemini_api_key"
  ) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.warn("Failed to initialize Gemini AI:", error);
}

// Initialize Text-to-Speech client
console.log("Initializing Google Cloud Text-to-Speech client...");
console.log(
  "GOOGLE_APPLICATION_CREDENTIALS:",
  process.env.GOOGLE_APPLICATION_CREDENTIALS
);
console.log("GOOGLE_CLOUD_PROJECT_ID:", process.env.GOOGLE_CLOUD_PROJECT_ID);

try {
  const ttsClient = new textToSpeech.TextToSpeechClient();
  console.log("TTS client initialized successfully");
} catch (error) {
  console.error("Failed to initialize TTS client:", error);
}

// Base scenarios structure
const ESL_SCENARIOS = {
  // DAILY LIFE
  "Coffee Shop": {
    category: "daily_life",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "coffee",
        "tea",
        "water",
        "milk",
        "hot",
        "cold",
        "cup",
        "drink",
        "want",
        "like",
      ],
      A2: ["order", "menu", "price", "sugar", "sweet", "size", "table", "wait"],
    },
    phrases: {
      basic: ["Can I have...?", "How much is...?", "For here or to go?"],
      situational: ["One coffee please", "Extra sugar", "No milk"],
      cultural: [
        "Would you like room for cream?",
        "What's your name for the order?",
      ],
    },
  },

  Restaurant: {
    category: "daily_life",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "food",
        "eat",
        "drink",
        "menu",
        "table",
        "chair",
        "plate",
        "spoon",
        "fork",
        "knife",
      ],
      A2: [
        "waiter",
        "order",
        "bill",
        "reservation",
        "appetizer",
        "main course",
        "dessert",
        "spicy",
      ],
    },
    phrases: {
      basic: [
        "Table for two",
        "The menu, please",
        "Can I order?",
        "The bill, please",
      ],
      situational: [
        "Is this spicy?",
        "Medium rare, please",
        "More water, please",
      ],
      cultural: [
        "Would you like to hear the specials?",
        "How would you like that cooked?",
      ],
    },
  },

  // TRANSPORTATION
  "Public Transport": {
    category: "transportation",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "bus",
        "train",
        "stop",
        "ticket",
        "here",
        "there",
        "go",
        "wait",
        "door",
        "seat",
      ],
      A2: [
        "station",
        "platform",
        "schedule",
        "delay",
        "arrival",
        "departure",
        "pass",
        "transfer",
      ],
    },
    phrases: {
      basic: [
        "Where is the bus?",
        "One ticket please",
        "Next stop?",
        "Excuse me",
      ],
      situational: [
        "Is this seat taken?",
        "Does this bus go to...?",
        "When is the next train?",
      ],
      cultural: [
        "Stand clear of the doors",
        "Mind the gap",
        "Please exit through the rear",
      ],
    },
  },

  // SHOPPING
  "Grocery Store": {
    category: "shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "buy",
        "food",
        "fruit",
        "milk",
        "bread",
        "meat",
        "fish",
        "water",
        "cart",
        "bag",
      ],
      A2: [
        "fresh",
        "frozen",
        "price",
        "sale",
        "discount",
        "aisle",
        "cashier",
        "receipt",
      ],
    },
    phrases: {
      basic: [
        "Where is...?",
        "How much is this?",
        "I need...",
        "Paper or plastic?",
      ],
      situational: ["Is this fresh?", "Do you have...?", "Which aisle?"],
      cultural: ["Would you like a bag?", "Do you have a loyalty card?"],
    },
  },

  // HEALTH
  "Doctor's Office": {
    category: "health",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "sick",
        "pain",
        "head",
        "stomach",
        "cold",
        "hot",
        "feel",
        "hurt",
        "better",
        "worse",
      ],
      A2: [
        "appointment",
        "doctor",
        "nurse",
        "medicine",
        "prescription",
        "fever",
        "cough",
        "symptoms",
      ],
    },
    phrases: {
      basic: ["I feel sick", "It hurts here", "I need medicine", "Help please"],
      situational: [
        "What are your symptoms?",
        "How long has this...?",
        "Take this medicine",
      ],
      cultural: [
        "Do you take my insurance?",
        "Fill this prescription",
        "Follow up in a week",
      ],
    },
  },

  // SOCIAL
  "Meeting People": {
    category: "social",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "hello",
        "hi",
        "goodbye",
        "name",
        "nice",
        "meet",
        "friend",
        "from",
        "yes",
        "no",
      ],
      A2: [
        "introduce",
        "welcome",
        "pleasure",
        "country",
        "language",
        "culture",
        "visit",
        "stay",
      ],
    },
    phrases: {
      basic: [
        "Nice to meet you",
        "My name is...",
        "How are you?",
        "Where are you from?",
      ],
      situational: [
        "What brings you here?",
        "How long are you staying?",
        "Let's keep in touch",
      ],
      cultural: [
        "Pleased to meet you",
        "Welcome to...",
        "Make yourself at home",
      ],
    },
  },

  // WORK
  "Job Interview": {
    category: "work",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "work",
        "job",
        "help",
        "good",
        "time",
        "day",
        "week",
        "start",
        "finish",
        "thank",
      ],
      A2: [
        "experience",
        "skills",
        "education",
        "salary",
        "schedule",
        "position",
        "team",
        "company",
      ],
    },
    phrases: {
      basic: [
        "I have experience in...",
        "I can...",
        "I want to...",
        "Thank you for...",
      ],
      situational: [
        "Tell me about yourself",
        "What are your strengths?",
        "Any questions?",
      ],
      cultural: [
        "Business casual attire",
        "Follow up with an email",
        "Bring your resume",
      ],
    },
  },

  // HOUSING
  "Apartment Hunting": {
    category: "housing",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "room",
        "house",
        "door",
        "window",
        "big",
        "small",
        "clean",
        "new",
        "old",
        "like",
      ],
      A2: [
        "rent",
        "lease",
        "utilities",
        "furnished",
        "available",
        "deposit",
        "bedroom",
        "bathroom",
      ],
    },
    phrases: {
      basic: [
        "How much is rent?",
        "Is it available?",
        "Can I see...?",
        "I like it",
      ],
      situational: [
        "Utilities included?",
        "When can I move in?",
        "Sign the lease",
      ],
      cultural: [
        "First and last month's rent",
        "Credit check required",
        "References needed",
      ],
    },
  },

  // EMERGENCY
  "Emergency Help": {
    category: "emergency",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "help",
        "police",
        "fire",
        "hospital",
        "emergency",
        "stop",
        "now",
        "here",
        "call",
        "please",
      ],
      A2: [
        "ambulance",
        "accident",
        "injured",
        "danger",
        "safe",
        "quickly",
        "immediately",
      ],
    },
    phrases: {
      basic: ["Help!", "Call 911!", "I need help", "This is an emergency"],
      intermediate: [
        "Could you please help me?",
        "I need medical assistance",
        "Please call an ambulance",
      ],
    },
  },

  // TECHNOLOGY
  "Phone Problems": {
    category: "technology",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "phone",
        "call",
        "text",
        "help",
        "work",
        "stop",
        "start",
        "new",
        "old",
        "problem",
      ],
      A2: [
        "battery",
        "screen",
        "charger",
        "settings",
        "password",
        "update",
        "storage",
        "data",
      ],
    },
    phrases: {
      basic: [
        "It is not working",
        "I need help",
        "Can you fix it?",
        "How do I...?",
      ],
      situational: [
        "My battery died",
        "I forgot my password",
        "It will not turn on",
      ],
      cultural: [
        "Do you have AppleCare?",
        "Make a backup first",
        "Check warranty status",
      ],
    },
  },

  // ENTERTAINMENT
  "Movie Theater": {
    category: "entertainment",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "movie",
        "film",
        "watch",
        "see",
        "ticket",
        "seat",
        "time",
        "show",
        "start",
        "end",
      ],
      A2: [
        "screening",
        "subtitle",
        "dubbed",
        "rating",
        "review",
        "genre",
        "concession",
        "preview",
      ],
    },
    phrases: {
      basic: [
        "What is playing?",
        "Two tickets please",
        "Where is our seat?",
        "I want popcorn",
      ],
      situational: [
        "Is it subtitled?",
        "Which showing?",
        "Are there previews?",
      ],
      cultural: [
        "Please silence your phones",
        "No outside food allowed",
        "Rated PG-13",
      ],
    },
  },

  Concert: {
    category: "entertainment",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "music",
        "song",
        "sing",
        "dance",
        "listen",
        "loud",
        "fun",
        "stage",
        "time",
        "night",
      ],
      A2: [
        "performance",
        "venue",
        "ticket",
        "backstage",
        "encore",
        "festival",
        "lineup",
        "acoustic",
      ],
    },
    phrases: {
      basic: [
        "Great show!",
        "I love this song",
        "Can you hear?",
        "Let's dance",
      ],
      situational: [
        "Where is the merchandise?",
        "When do doors open?",
        "Is there an opener?",
      ],
      cultural: [
        "No flash photography",
        "Standing room only",
        "Meet and greet passes",
      ],
    },
  },

  // SPORTS & FITNESS
  "Gym Workout": {
    category: "fitness",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "run",
        "walk",
        "lift",
        "push",
        "pull",
        "strong",
        "fast",
        "slow",
        "water",
        "rest",
      ],
      A2: [
        "exercise",
        "weights",
        "machine",
        "trainer",
        "membership",
        "routine",
        "repetition",
        "set",
      ],
    },
    phrases: {
      basic: [
        "How does this work?",
        "I need help",
        "Too heavy",
        "One more set",
      ],
      situational: [
        "Can you spot me?",
        "Is this form correct?",
        "How many reps?",
      ],
      cultural: [
        "Wipe down equipment",
        "No phone calls on gym floor",
        "Proper gym attire required",
      ],
    },
  },

  "Sports Game": {
    category: "sports",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "play",
        "game",
        "team",
        "win",
        "lose",
        "score",
        "watch",
        "fun",
        "good",
        "bad",
      ],
      A2: [
        "tournament",
        "championship",
        "referee",
        "penalty",
        "overtime",
        "league",
        "season",
        "fan",
      ],
    },
    phrases: {
      basic: ["Good game!", "Who is winning?", "Great play!", "Go team!"],
      situational: [
        "What is the score?",
        "How much time left?",
        "That was a foul!",
      ],
      cultural: [
        "Tailgating tradition",
        "Home team advantage",
        "Fantasy league",
      ],
    },
  },

  // EDUCATION
  "Library Visit": {
    category: "education",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "book",
        "read",
        "study",
        "quiet",
        "help",
        "find",
        "look",
        "take",
        "return",
        "card",
      ],
      A2: [
        "borrow",
        "renew",
        "reference",
        "catalog",
        "database",
        "research",
        "periodical",
        "fine",
      ],
    },
    phrases: {
      basic: [
        "Where is...?",
        "Can I borrow this?",
        "I need help",
        "Library card please",
      ],
      situational: [
        "How long can I keep it?",
        "Is this available?",
        "Can I renew online?",
      ],
      cultural: [
        "Please be quiet",
        "No food or drinks",
        "Return books on time",
      ],
    },
  },

  Classroom: {
    category: "education",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "teacher",
        "student",
        "book",
        "pen",
        "paper",
        "desk",
        "board",
        "write",
        "read",
        "learn",
      ],
      A2: [
        "assignment",
        "homework",
        "project",
        "presentation",
        "exam",
        "grade",
        "lecture",
        "notes",
      ],
    },
    phrases: {
      basic: [
        "I do not understand",
        "Can you repeat?",
        "How do you spell...?",
        "May I...?",
      ],
      situational: [
        "When is it due?",
        "Can I make it up?",
        "Is this going to be on the test?",
      ],
      cultural: ["Raise your hand", "Office hours", "Academic integrity"],
    },
  },

  // TRAVEL
  "Hotel Check-in": {
    category: "travel",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "room",
        "bed",
        "key",
        "stay",
        "night",
        "day",
        "help",
        "need",
        "want",
        "here",
      ],
      A2: [
        "reservation",
        "check-in",
        "check-out",
        "amenities",
        "deposit",
        "concierge",
        "suite",
        "lobby",
      ],
    },
    phrases: {
      basic: [
        "I have a reservation",
        "Room number?",
        "Where is...?",
        "Wake-up call please",
      ],
      situational: [
        "Is breakfast included?",
        "Can I extend my stay?",
        "Is Wi-Fi free?",
      ],
      cultural: [
        "Tipping housekeeping",
        "Room service hours",
        "Do not disturb",
      ],
    },
  },

  Airport: {
    category: "travel",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "plane",
        "fly",
        "bag",
        "gate",
        "wait",
        "time",
        "late",
        "early",
        "ticket",
        "seat",
      ],
      A2: [
        "boarding",
        "security",
        "passport",
        "customs",
        "luggage",
        "terminal",
        "layover",
        "arrival",
      ],
    },
    phrases: {
      basic: [
        "Where's my gate?",
        "Boarding pass please",
        "Is it on time?",
        "This way?",
      ],
      situational: [
        "Any carry-on?",
        "Window or aisle?",
        "How long is the layover?",
      ],
      cultural: [
        "Remove shoes at security",
        "3-1-1 liquids rule",
        "Arrive 2 hours early",
      ],
    },
  },

  // CELEBRATIONS
  "Birthday Party": {
    category: "celebrations",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "happy",
        "birthday",
        "party",
        "cake",
        "gift",
        "sing",
        "eat",
        "drink",
        "friend",
        "fun",
      ],
      A2: [
        "celebration",
        "invitation",
        "surprise",
        "decoration",
        "candle",
        "wish",
        "present",
        "guest",
      ],
    },
    phrases: {
      basic: ["Happy Birthday!", "Make a wish", "Open presents", "Thank you"],
      situational: [
        "Blow out the candles",
        "What time is the party?",
        "Should I bring anything?",
      ],
      cultural: [
        "RSVP to invitation",
        "Birthday traditions",
        "Gift-giving etiquette",
      ],
    },
  },

  "Holiday Season": {
    category: "celebrations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "holiday",
        "happy",
        "new",
        "year",
        "give",
        "get",
        "family",
        "friend",
        "food",
        "home",
      ],
      A2: [
        "tradition",
        "celebration",
        "decoration",
        "festival",
        "custom",
        "seasonal",
        "greeting",
        "feast",
      ],
    },
    phrases: {
      basic: [
        "Happy Holidays!",
        "Season's Greetings",
        "Best wishes",
        "Happy New Year",
      ],
      situational: [
        "What do you celebrate?",
        "Any special plans?",
        "Traditional dinner?",
      ],
      cultural: [
        "Different holiday customs",
        "Gift exchange traditions",
        "Holiday greeting etiquette",
      ],
    },
  },

  // PARENT AT SCHOOL
  "Parent-Teacher Conference": {
    category: "parent_school",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "child",
        "teacher",
        "school",
        "class",
        "good",
        "help",
        "work",
        "home",
        "read",
        "write",
      ],
      A2: [
        "progress",
        "behavior",
        "homework",
        "grades",
        "improvement",
        "participation",
        "attendance",
        "performance",
      ],
    },
    phrases: {
      basic: [
        "How is my child doing?",
        "Is there homework?",
        "Can you help?",
        "Thank you",
      ],
      situational: [
        "What can we do at home?",
        "Is there extra help?",
        "When is the next test?",
      ],
      cultural: [
        "Parent portal access",
        "Academic support services",
        "After-school programs",
      ],
    },
  },

  "School Registration": {
    category: "parent_school",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "name",
        "age",
        "grade",
        "form",
        "sign",
        "date",
        "year",
        "start",
        "new",
        "school",
      ],
      A2: [
        "enrollment",
        "documents",
        "requirements",
        "immunization",
        "district",
        "transfer",
        "guardian",
        "records",
      ],
    },
    phrases: {
      basic: [
        "Fill out this form",
        "Sign here please",
        "Start date?",
        "Which grade?",
      ],
      situational: [
        "Need these documents",
        "Proof of residence",
        "Emergency contacts",
      ],
      cultural: [
        "School district zones",
        "Registration deadlines",
        "Required vaccinations",
      ],
    },
  },

  "School Events": {
    category: "parent_school",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "show",
        "play",
        "game",
        "time",
        "day",
        "come",
        "watch",
        "fun",
        "help",
        "bring",
      ],
      A2: [
        "performance",
        "volunteer",
        "fundraiser",
        "potluck",
        "assembly",
        "field trip",
        "carnival",
        "showcase",
      ],
    },
    phrases: {
      basic: ["What time?", "Where is it?", "Can I help?", "My child is in..."],
      situational: [
        "Need volunteers",
        "Bring food?",
        "Take pictures?",
        "Sign permission slip",
      ],
      cultural: [
        "Parent involvement",
        "Volunteer opportunities",
        "School community events",
      ],
    },
  },

  "School Problems": {
    category: "parent_school",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "problem",
        "help",
        "talk",
        "friend",
        "teacher",
        "class",
        "sad",
        "happy",
        "better",
        "change",
      ],
      A2: [
        "bullying",
        "difficulty",
        "counselor",
        "support",
        "intervention",
        "accommodation",
        "resolution",
        "meeting",
      ],
    },
    phrases: {
      basic: [
        "There's a problem",
        "My child is upset",
        "Who can help?",
        "What happened?",
      ],
      situational: [
        "Can we meet?",
        "Need to change classes",
        "Having trouble with...",
      ],
      cultural: [
        "Anti-bullying policy",
        "Support services available",
        "Conflict resolution",
      ],
    },
  },

  "After School Activities": {
    category: "parent_school",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "sport",
        "art",
        "music",
        "play",
        "learn",
        "time",
        "day",
        "week",
        "fun",
        "friend",
      ],
      A2: [
        "program",
        "schedule",
        "enrollment",
        "equipment",
        "materials",
        "instructor",
        "practice",
        "competition",
      ],
    },
    phrases: {
      basic: ["Which activities?", "What time?", "How much?", "Sign up here"],
      situational: [
        "Need equipment?",
        "Practice schedule?",
        "Transportation available?",
      ],
      cultural: [
        "Activity scholarships",
        "Tryout procedures",
        "Parent attendance policy",
      ],
    },
  },

  "School Lunch": {
    category: "parent_school",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "food",
        "eat",
        "drink",
        "lunch",
        "money",
        "pay",
        "like",
        "want",
        "bring",
        "menu",
      ],
      A2: [
        "cafeteria",
        "nutrition",
        "allergy",
        "balance",
        "account",
        "dietary",
        "restriction",
        "snack",
      ],
    },
    phrases: {
      basic: [
        "What's for lunch?",
        "How much?",
        "Add money please",
        "Special diet",
      ],
      situational: [
        "Food allergy",
        "Lunch account balance",
        "Forgot lunch today",
      ],
      cultural: [
        "Free/reduced lunch program",
        "Healthy eating guidelines",
        "No sharing food policy",
      ],
    },
  },

  "Homework Help": {
    category: "parent_school",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "help",
        "work",
        "home",
        "book",
        "read",
        "write",
        "math",
        "study",
        "learn",
        "time",
      ],
      A2: [
        "assignment",
        "project",
        "deadline",
        "resources",
        "tutorial",
        "research",
        "online",
        "practice",
      ],
    },
    phrases: {
      basic: [
        "Need help with...",
        "Don't understand",
        "When is it due?",
        "Show me how",
      ],
      situational: [
        "Where's the textbook?",
        "Online resources?",
        "Study guide available?",
      ],
      cultural: [
        "Homework policy",
        "Academic integrity",
        "Parent resource center",
      ],
    },
  },

  // BASIC COMMUNICATION
  "Greetings and Introductions": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "hello",
        "hi",
        "goodbye",
        "bye",
        "morning",
        "afternoon",
        "evening",
        "night",
        "please",
        "thanks",
      ],
      A2: [
        "pleasure",
        "welcome",
        "introduce",
        "greetings",
        "farewell",
        "acquaintance",
        "formal",
        "informal",
      ],
    },
    phrases: {
      basic: [
        "Good morning/afternoon/evening",
        "How are you?",
        "Nice to meet you",
        "See you later/tomorrow/soon",
      ],
      situational: [
        "Long time no see!",
        "How are you doing?",
        "Take care!",
        "Have a good one!",
      ],
      cultural: [
        "Handshake vs bow",
        "Formal vs casual greetings",
        "Personal space norms",
      ],
    },
  },

  "Basic Greetings": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "hello",
        "hi",
        "goodbye",
        "morning",
        "afternoon",
        "evening",
        "night",
        "please",
        "thanks",
        "bye",
      ],
      A2: [
        "greeting",
        "introduction",
        "farewell",
        "casual",
        "formal",
        "polite",
        "informal",
        "welcome",
      ],
    },
    phrases: {
      basic: [
        "How are you?",
        "Good morning",
        "Have a nice day",
        "See you later",
      ],
      situational: ["Nice to meet you", "Good to see you", "Take care"],
      cultural: [
        "Formal vs informal greetings",
        "Time-specific greetings",
        "Handshake etiquette",
      ],
    },
  },

  "Apologies and Excuses": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "sorry",
        "late",
        "mistake",
        "wrong",
        "bad",
        "time",
        "traffic",
        "sick",
        "work",
        "forget",
      ],
      A2: [
        "apologize",
        "excuse",
        "forgiveness",
        "delayed",
        "emergency",
        "circumstances",
        "unavoidable",
        "regret",
      ],
    },
    phrases: {
      basic: ["I am sorry", "My mistake", "Excuse me", "Will not happen again"],
      situational: [
        "Traffic was terrible",
        "I was not feeling well",
        "Something came up",
        "Lost track of time",
      ],
      cultural: [
        "Formal apology etiquette",
        "Accepting apologies gracefully",
        "When to apologize",
      ],
    },
  },

  "Phone Conversations": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "hello",
        "bye",
        "yes",
        "no",
        "please",
        "thanks",
        "call",
        "phone",
        "speak",
        "hear",
      ],
      A2: [
        "voicemail",
        "message",
        "hold",
        "transfer",
        "extension",
        "callback",
        "reception",
        "direct",
      ],
    },
    phrases: {
      basic: [
        "Hello, this is...",
        "Can I speak to...?",
        "Please hold",
        "I will call back",
      ],
      situational: [
        "The line is busy",
        "Leave a message",
        "Bad connection",
        "Wrong number",
      ],
      cultural: [
        "Business call etiquette",
        "Appropriate call times",
        "Voice message formats",
      ],
    },
  },

  "Small Talk": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "weather",
        "good",
        "bad",
        "hot",
        "cold",
        "rain",
        "sun",
        "work",
        "weekend",
        "family",
      ],
      A2: [
        "forecast",
        "plans",
        "vacation",
        "hobby",
        "interest",
        "recent",
        "local",
        "news",
      ],
    },
    phrases: {
      basic: [
        "Nice weather today",
        "How was your weekend?",
        "What is new?",
        "How is work?",
      ],
      situational: [
        "Any plans for...?",
        "Have you heard about...?",
        "What do you think of...?",
        "Did you see the game?",
      ],
      cultural: [
        "Safe conversation topics",
        "Topics to avoid",
        "Reading social cues",
      ],
    },
  },

  "Asking for Help": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "help",
        "please",
        "need",
        "want",
        "can",
        "show",
        "tell",
        "where",
        "how",
        "what",
      ],
      A2: [
        "assistance",
        "direction",
        "guidance",
        "clarify",
        "explain",
        "support",
        "advice",
        "information",
      ],
    },
    phrases: {
      basic: [
        "Can you help me?",
        "I need help",
        "Please show me",
        "I do not understand",
      ],
      situational: [
        "Could you explain...?",
        "I am looking for...",
        "Which way to...?",
        "How does this work?",
      ],
      cultural: [
        "Polite ways to ask",
        "When to ask for help",
        "Professional vs casual requests",
      ],
    },
  },

  "Making Plans": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "meet",
        "time",
        "place",
        "day",
        "when",
        "where",
        "what",
        "who",
        "yes",
        "no",
      ],
      A2: [
        "schedule",
        "appointment",
        "reservation",
        "available",
        "confirm",
        "cancel",
        "reschedule",
        "suggest",
      ],
    },
    phrases: {
      basic: [
        "Are you free...?",
        "Let's meet at...",
        "What time works?",
        "See you then!",
      ],
      situational: [
        "Need to reschedule",
        "Running late",
        "Can we make it...?",
        "That works for me",
      ],
      cultural: [
        "Punctuality expectations",
        "Cancellation etiquette",
        "Follow-up confirmation",
      ],
    },
  },

  "Expressing Feelings": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "happy",
        "sad",
        "good",
        "bad",
        "tired",
        "sick",
        "hungry",
        "thirsty",
        "hot",
        "cold",
      ],
      A2: [
        "excited",
        "worried",
        "stressed",
        "relaxed",
        "frustrated",
        "disappointed",
        "grateful",
        "surprised",
      ],
    },
    phrases: {
      basic: [
        "I feel...",
        "Are you okay?",
        "That is great!",
        "I am sorry to hear that",
      ],
      situational: [
        "What is wrong?",
        "Cheer up!",
        "Feel better soon",
        "I know how you feel",
      ],
      cultural: [
        "Emotional expression norms",
        "Appropriate reactions",
        "Comfort phrases",
      ],
    },
  },

  "Giving Compliments": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "nice",
        "good",
        "great",
        "like",
        "love",
        "beautiful",
        "new",
        "pretty",
        "cool",
        "amazing",
      ],
      A2: [
        "wonderful",
        "fantastic",
        "impressive",
        "excellent",
        "stylish",
        "talented",
        "creative",
        "outstanding",
      ],
    },
    phrases: {
      basic: ["I like your...", "That looks nice", "Good job!", "Well done!"],
      situational: [
        "Where did you get it?",
        "It suits you",
        "You are really good at...",
        "That is impressive!",
      ],
      cultural: [
        "Accepting compliments gracefully",
        "Professional vs personal compliments",
        "Appropriate topics for compliments",
      ],
    },
  },

  "Agreeing and Disagreeing": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "yes",
        "no",
        "maybe",
        "right",
        "wrong",
        "sure",
        "okay",
        "think",
        "agree",
        "disagree",
      ],
      A2: [
        "certainly",
        "absolutely",
        "perhaps",
        "possibly",
        "opinion",
        "perspective",
        "point",
        "view",
      ],
    },
    phrases: {
      basic: [
        "I agree",
        "You are right",
        "I do not think so",
        "Maybe you are right",
      ],
      situational: [
        "I see your point, but...",
        "That is a good point",
        "I respectfully disagree",
        "Let us agree to disagree",
      ],
      cultural: [
        "Polite disagreement",
        "Saving face",
        "Cultural differences in directness",
      ],
    },
  },

  "Giving Directions": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "left",
        "right",
        "straight",
        "turn",
        "stop",
        "go",
        "near",
        "far",
        "here",
        "there",
      ],
      A2: [
        "intersection",
        "corner",
        "block",
        "landmark",
        "distance",
        "opposite",
        "between",
        "beside",
      ],
    },
    phrases: {
      basic: [
        "Turn left/right",
        "Go straight",
        "Stop here",
        "It is over there",
      ],
      situational: [
        "You cannot miss it",
        "Look for the...",
        "It is about 5 minutes",
        "If you see..., you have gone too far",
      ],
      cultural: [
        "Using landmarks vs street names",
        "Distance measurements",
        "Public transportation references",
      ],
    },
  },

  "Expressing Opinions": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "think",
        "like",
        "good",
        "bad",
        "better",
        "worse",
        "sure",
        "maybe",
        "yes",
        "no",
      ],
      A2: [
        "believe",
        "opinion",
        "prefer",
        "rather",
        "consider",
        "suggest",
        "recommend",
        "advise",
      ],
    },
    phrases: {
      basic: [
        "I think...",
        "In my opinion...",
        "What do you think?",
        "How about...?",
      ],
      situational: [
        "From my perspective...",
        "It seems to me...",
        "I am not sure, but...",
        "That depends on...",
      ],
      cultural: [
        "Direct vs indirect opinions",
        "Professional context etiquette",
        "Respecting different viewpoints",
      ],
    },
  },

  "Making Requests": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "please",
        "help",
        "can",
        "want",
        "need",
        "give",
        "take",
        "show",
        "tell",
        "do",
      ],
      A2: [
        "would",
        "could",
        "mind",
        "favor",
        "possible",
        "appreciate",
        "wondering",
        "kindly",
      ],
    },
    phrases: {
      basic: ["Can you...?", "Please help me", "I need...", "Would you...?"],
      situational: [
        "Would you mind...?",
        "Could I ask a favor?",
        "Is it possible to...?",
        "I was wondering if...",
      ],
      cultural: [
        "Levels of politeness",
        "Formal vs informal requests",
        "When to be indirect",
      ],
    },
  },

  "Offering Help": {
    category: "basic_communication",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "help",
        "can",
        "need",
        "want",
        "let",
        "me",
        "you",
        "do",
        "show",
        "tell",
      ],
      A2: [
        "assist",
        "support",
        "guidance",
        "available",
        "willing",
        "happy",
        "glad",
        "service",
      ],
    },
    phrases: {
      basic: ["Can I help?", "Let me help you", "Need a hand?", "I will do it"],
      situational: [
        "Would you like me to...?",
        "I would be happy to...",
        "Let me know if...",
        "Just ask if you need anything",
      ],
      cultural: [
        "When to offer help",
        "Accepting/declining help gracefully",
        "Professional helping boundaries",
      ],
    },
  },

  "Clarifying Information": {
    category: "basic_communication",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "what",
        "when",
        "where",
        "who",
        "why",
        "how",
        "say",
        "mean",
        "understand",
        "repeat",
      ],
      A2: [
        "clarify",
        "explain",
        "specific",
        "exactly",
        "detail",
        "meaning",
        "correct",
        "precise",
      ],
    },
    phrases: {
      basic: [
        "Could you repeat that?",
        "What do you mean?",
        "I do not understand",
        "Can you explain?",
      ],
      situational: [
        "Let me make sure I understand...",
        "So you are saying...",
        "In other words...",
        "Does that mean...?",
      ],
      cultural: [
        "Asking for clarification politely",
        "Following up on unclear points",
        "Non-verbal communication cues",
      ],
    },
  },

  "Handling Misunderstandings": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "sorry",
        "wrong",
        "mean",
        "say",
        "think",
        "understand",
        "slow",
        "repeat",
        "clear",
        "help",
      ],
      A2: [
        "misunderstand",
        "confusion",
        "clarify",
        "rephrase",
        "interpret",
        "assume",
        "mistake",
        "correct",
      ],
    },
    phrases: {
      basic: [
        "I do not understand",
        "Could you repeat that?",
        "What do you mean?",
        "Did you say...?",
      ],
      situational: [
        "There seems to be a misunderstanding",
        "Let me explain again",
        "That's not what I meant",
        "I thought you said...",
      ],
      cultural: [
        "Admitting confusion politely",
        "Non-verbal signals of confusion",
        "When to ask for clarification",
      ],
    },
  },

  "Pronunciation Problems": {
    category: "communication_challenges",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "say",
        "word",
        "speak",
        "hear",
        "sound",
        "slow",
        "fast",
        "again",
        "please",
        "help",
      ],
      A2: [
        "pronounce",
        "accent",
        "stress",
        "syllable",
        "intonation",
        "rhythm",
        "native",
        "clear",
      ],
    },
    phrases: {
      basic: [
        "How do you say...?",
        "Please speak slowly",
        "One more time?",
        "Like this?",
      ],
      situational: [
        "I am having trouble with this word",
        "Could you write it down?",
        "Is this the right pronunciation?",
        "It sounds different when you say it",
      ],
      cultural: [
        "Regional accent variations",
        "Common pronunciation patterns",
        "When to ask for help",
      ],
    },
  },

  "Technical Language": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "what",
        "mean",
        "word",
        "use",
        "help",
        "know",
        "learn",
        "tell",
        "show",
        "explain",
      ],
      A2: [
        "terminology",
        "jargon",
        "specific",
        "technical",
        "professional",
        "field",
        "industry",
        "specialized",
      ],
    },
    phrases: {
      basic: [
        "What does ... mean?",
        "Is there a simpler word?",
        "Could you explain?",
        "I am new to this",
      ],
      situational: [
        "Could you use everyday language?",
        "Is there an example?",
        "That's a new term for me",
        "I am not familiar with that term",
      ],
      cultural: [
        "Industry-specific terminology",
        "Professional communication norms",
        "When to ask for definitions",
      ],
    },
  },

  "Fast Speech": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "fast",
        "slow",
        "speak",
        "talk",
        "listen",
        "hear",
        "wait",
        "stop",
        "please",
        "help",
      ],
      A2: [
        "pace",
        "speed",
        "rapid",
        "conversation",
        "native",
        "follow",
        "catch",
        "keep up",
      ],
    },
    phrases: {
      basic: [
        "Too fast, please",
        "Could you slow down?",
        "Not so fast",
        "I missed that",
      ],
      situational: [
        "I am having trouble following",
        "Could you say that again slowly?",
        "I did not catch that",
        "You lost me there",
      ],
      cultural: [
        "Speech patterns in different contexts",
        "Natural conversation speed",
        "When to ask someone to slow down",
      ],
    },
  },

  "Idioms and Slang": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "mean",
        "say",
        "word",
        "use",
        "know",
        "learn",
        "new",
        "different",
        "help",
        "understand",
      ],
      A2: [
        "expression",
        "phrase",
        "informal",
        "casual",
        "literal",
        "figurative",
        "common",
        "local",
      ],
    },
    phrases: {
      basic: [
        "What does that mean?",
        "Is that a saying?",
        "We do not say that in my language",
        "That's new to me",
      ],
      situational: [
        "I have never heard that before",
        "Is that slang?",
        "We have a similar saying",
        "That's interesting!",
      ],
      cultural: [
        "Common idioms in context",
        "Regional slang variations",
        "Formal vs informal usage",
      ],
    },
  },

  "Cultural References": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "what",
        "who",
        "why",
        "when",
        "where",
        "know",
        "learn",
        "tell",
        "show",
        "help",
      ],
      A2: [
        "reference",
        "culture",
        "tradition",
        "custom",
        "history",
        "popular",
        "local",
        "social",
      ],
    },
    phrases: {
      basic: [
        "What's that about?",
        "We do not have that",
        "That's interesting",
        "Tell me more",
      ],
      situational: [
        "I am not familiar with that",
        "Is this an American thing?",
        "We do it differently",
        "Could you explain the background?",
      ],
      cultural: [
        "Pop culture references",
        "Historical context",
        "Local customs and traditions",
      ],
    },
  },

  "Phone and Video Calls": {
    category: "communication_challenges",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "hear",
        "speak",
        "see",
        "wait",
        "stop",
        "start",
        "problem",
        "help",
        "clear",
        "bad",
      ],
      A2: [
        "connection",
        "signal",
        "quality",
        "reception",
        "background",
        "noise",
        "delay",
        "technical",
      ],
    },
    phrases: {
      basic: [
        "I cannot hear you",
        "Bad connection",
        "You're breaking up",
        "Can you hear me?",
      ],
      situational: [
        "Let me call you back",
        "The signal is poor",
        "There's an echo",
        "Let's switch to chat",
      ],
      cultural: [
        "Video call etiquette",
        "Technical problem handling",
        "Professional call behavior",
      ],
    },
  },

  // NEIGHBOR RELATIONS
  "Meeting New Neighbors": {
    category: "neighbor_relations",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "hello",
        "hi",
        "name",
        "live",
        "here",
        "new",
        "nice",
        "meet",
        "welcome",
        "neighbor",
      ],
      A2: [
        "introduce",
        "recently",
        "moved",
        "community",
        "neighborhood",
        "local",
        "resident",
        "area",
      ],
    },
    phrases: {
      basic: [
        "Nice to meet you",
        "I just moved in",
        "Welcome to the neighborhood",
        "I live next door",
      ],
      situational: [
        "Let me know if you need anything",
        "How long have you lived here?",
        "Do you know the area?",
        "Here's my number if you need help",
      ],
      cultural: [
        "Housewarming traditions",
        "Neighborhood etiquette",
        "Community expectations",
      ],
    },
  },

  "Noise Complaints": {
    category: "neighbor_relations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "noise",
        "loud",
        "quiet",
        "night",
        "sleep",
        "music",
        "party",
        "sorry",
        "please",
        "help",
      ],
      A2: [
        "disturbance",
        "complaint",
        "consideration",
        "volume",
        "reasonable",
        "hours",
        "disturb",
        "respect",
      ],
    },
    phrases: {
      basic: [
        "It's too loud",
        "Could you please be quieter?",
        "I cannot sleep",
        "The music is loud",
      ],
      situational: [
        "I have to work early",
        "The walls are thin",
        "Would you mind turning it down?",
        "It's after quiet hours",
      ],
      cultural: [
        "Quiet hours policies",
        "How to make polite complaints",
        "When to contact management",
      ],
    },
  },

  "Shared Spaces": {
    category: "neighbor_relations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "clean",
        "use",
        "share",
        "space",
        "park",
        "yard",
        "hall",
        "door",
        "stairs",
        "trash",
      ],
      A2: [
        "common",
        "facility",
        "maintain",
        "responsibility",
        "schedule",
        "community",
        "access",
        "rules",
      ],
    },
    phrases: {
      basic: [
        "Please clean up",
        "It's my turn",
        "Where does this go?",
        "Can I use...?",
      ],
      situational: [
        "The washing machine is broken",
        "Someone left their things",
        "When is garbage day?",
        "Who's responsible for...?",
      ],
      cultural: [
        "Shared space etiquette",
        "Community responsibilities",
        "Building regulations",
      ],
    },
  },

  "Borrowing and Lending": {
    category: "neighbor_relations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "help",
        "need",
        "borrow",
        "give",
        "take",
        "return",
        "thank",
        "please",
        "sorry",
        "time",
      ],
      A2: [
        "lend",
        "favor",
        "emergency",
        "temporary",
        "appreciate",
        "spare",
        "extra",
        "tools",
      ],
    },
    phrases: {
      basic: [
        "Can I borrow...?",
        "Do you have a...?",
        "I'll return it soon",
        "Thank you so much",
      ],
      situational: [
        "Just for a few minutes",
        "I'll be careful with it",
        "When do you need it back?",
        "I really appreciate it",
      ],
      cultural: [
        "Borrowing etiquette",
        "What's appropriate to borrow",
        "How to return items properly",
      ],
    },
  },

  "Building Maintenance": {
    category: "neighbor_relations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "fix",
        "break",
        "water",
        "light",
        "heat",
        "cold",
        "door",
        "window",
        "work",
        "problem",
      ],
      A2: [
        "maintenance",
        "repair",
        "plumbing",
        "electrical",
        "emergency",
        "service",
        "request",
        "issue",
      ],
    },
    phrases: {
      basic: [
        "Something's broken",
        "We need repairs",
        "No hot water",
        "It's not working",
      ],
      situational: [
        "Who should I contact?",
        "Is this an emergency?",
        "When will it be fixed?",
        "Can someone look at it?",
      ],
      cultural: [
        "Maintenance request procedures",
        "Emergency vs routine repairs",
        "Tenant responsibilities",
      ],
    },
  },

  "Package Handling": {
    category: "neighbor_relations",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "package",
        "mail",
        "box",
        "door",
        "take",
        "give",
        "hold",
        "wait",
        "thank",
        "help",
      ],
      A2: [
        "delivery",
        "signature",
        "receive",
        "forward",
        "collect",
        "secure",
        "missing",
        "track",
      ],
    },
    phrases: {
      basic: [
        "Did you get my package?",
        "Can you hold this?",
        "It was delivered here",
        "Sign for me please",
      ],
      situational: [
        "I'll be away tomorrow",
        "It's quite valuable",
        "Let me know when it arrives",
        "I can pick it up later",
      ],
      cultural: [
        "Package theft prevention",
        "Delivery notification etiquette",
        "Building security protocols",
      ],
    },
  },

  "Community Events": {
    category: "neighbor_relations",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "party",
        "meet",
        "food",
        "drink",
        "bring",
        "come",
        "join",
        "fun",
        "time",
        "day",
      ],
      A2: [
        "gathering",
        "potluck",
        "organize",
        "participate",
        "volunteer",
        "contribute",
        "community",
        "social",
      ],
    },
    phrases: {
      basic: [
        "Would you like to come?",
        "Everyone is welcome",
        "Bring something to share",
        "Join us!",
      ],
      situational: [
        "What should I bring?",
        "Who else is coming?",
        "Need help setting up?",
        "Great to see everyone",
      ],
      cultural: [
        "Community event etiquette",
        "Potluck traditions",
        "Building community spirit",
      ],
    },
  },

  // RETAIL SHOPPING
  "Membership and Loyalty Programs": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "card",
        "member",
        "join",
        "pay",
        "save",
        "cost",
        "price",
        "year",
        "month",
        "free",
      ],
      A2: [
        "membership",
        "subscription",
        "benefits",
        "rewards",
        "discount",
        "renewal",
        "exclusive",
        "premium",
      ],
    },
    phrases: {
      basic: [
        "How much is membership?",
        "I want to join",
        "Can I see the benefits?",
        "Where do I sign up?",
      ],
      situational: [
        "Is it worth getting a membership?",
        "What are the member benefits?",
        "When does it expire?",
        "Can I share my card?",
      ],
      cultural: [
        "Membership store culture",
        "Cost-saving strategies",
        "Family sharing policies",
      ],
    },
  },

  "Bulk Shopping": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "big",
        "box",
        "pack",
        "lot",
        "many",
        "heavy",
        "cart",
        "help",
        "carry",
        "car",
      ],
      A2: [
        "wholesale",
        "quantity",
        "bulk",
        "package",
        "storage",
        "transport",
        "stock up",
        "supply",
      ],
    },
    phrases: {
      basic: [
        "Where are the carts?",
        "This is too heavy",
        "Can you help me carry?",
        "I need a lot of...",
      ],
      situational: [
        "Do you sell in smaller quantities?",
        "How long does it last?",
        "I'm buying for an event",
        "Can I fit this in my car?",
      ],
      cultural: [
        "Bulk buying habits",
        "Storage considerations",
        "American shopping culture",
      ],
    },
  },

  "Returns and Exchanges": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "wrong",
        "size",
        "color",
        "break",
        "change",
        "money",
        "back",
        "receipt",
        "new",
        "old",
      ],
      A2: [
        "refund",
        "exchange",
        "policy",
        "warranty",
        "condition",
        "original",
        "damaged",
        "store credit",
      ],
    },
    phrases: {
      basic: [
        "I want to return this",
        "It doesn't work",
        "Wrong size/color",
        "Where's customer service?",
      ],
      situational: [
        "Do I need the receipt?",
        "What's the return policy?",
        "Can I get a refund?",
        "It's still under warranty",
      ],
      cultural: [
        "Return policy expectations",
        "Customer service norms",
        "Receipt keeping habits",
      ],
    },
  },

  "Finding Items": {
    category: "retail_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "where",
        "find",
        "look",
        "help",
        "aisle",
        "shelf",
        "section",
        "here",
        "there",
        "show",
      ],
      A2: [
        "locate",
        "department",
        "directory",
        "category",
        "inventory",
        "available",
        "stock",
        "display",
      ],
    },
    phrases: {
      basic: [
        "Where can I find...?",
        "Which aisle?",
        "Is it in stock?",
        "Can you help me find...?",
      ],
      situational: [
        "Is there more in the back?",
        "When will you get more?",
        "Can you check other stores?",
        "Is it seasonal?",
      ],
      cultural: [
        "Store layout patterns",
        "Asking for assistance",
        "Self-service expectations",
      ],
    },
  },

  "Price Checking": {
    category: "retail_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "price",
        "cost",
        "sale",
        "cheap",
        "save",
        "deal",
        "buy",
        "pay",
        "money",
        "tag",
      ],
      A2: [
        "discount",
        "promotion",
        "compare",
        "value",
        "markdown",
        "clearance",
        "special",
        "offer",
      ],
    },
    phrases: {
      basic: [
        "How much is this?",
        "Is it on sale?",
        "That's too expensive",
        "Any discounts?",
      ],
      situational: [
        "The price tag is missing",
        "Is this the final price?",
        "Can you price match?",
        "When does the sale end?",
      ],
      cultural: [
        "Bargaining expectations",
        "Price matching policies",
        "Sale shopping culture",
      ],
    },
  },

  "Checkout Process": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "line",
        "wait",
        "pay",
        "cash",
        "card",
        "bag",
        "receipt",
        "fast",
        "slow",
        "next",
      ],
      A2: [
        "register",
        "cashier",
        "payment",
        "transaction",
        "express",
        "self-checkout",
        "queue",
        "total",
      ],
    },
    phrases: {
      basic: [
        "Which line is faster?",
        "Cash or card?",
        "Do you have bags?",
        "Is this line open?",
      ],
      situational: [
        "Can I use self-checkout?",
        "Is there an express lane?",
        "Paper or plastic?",
        "Did you get everything?",
      ],
      cultural: ["Queue etiquette", "Payment preferences", "Bagging customs"],
    },
  },

  "Farmers Market": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "fresh",
        "food",
        "fruit",
        "buy",
        "sell",
        "local",
        "farm",
        "grow",
        "taste",
        "price",
      ],
      A2: [
        "organic",
        "seasonal",
        "produce",
        "vendor",
        "homemade",
        "artisanal",
        "sustainable",
        "craft",
      ],
    },
    phrases: {
      basic: [
        "Is this fresh?",
        "Can I taste?",
        "How much per pound?",
        "When was this picked?",
      ],
      situational: [
        "Is it organic?",
        "Did you grow this?",
        "What's in season?",
        "Can you hold this for me?",
      ],
      cultural: [
        "Farmers market etiquette",
        "Seasonal shopping",
        "Supporting local vendors",
      ],
    },
  },

  "Clothing Section": {
    category: "retail_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "size",
        "small",
        "medium",
        "large",
        "color",
        "try",
        "wear",
        "fit",
        "price",
        "sale",
      ],
      A2: [
        "fitting room",
        "measurements",
        "alterations",
        "style",
        "pattern",
        "material",
        "brand",
        "collection",
      ],
    },
    phrases: {
      basic: [
        "Where's the fitting room?",
        "Do you have my size?",
        "Can I try this on?",
        "It's too big/small",
      ],
      situational: [
        "Do you have it in another color?",
        "Is this the last one?",
        "Can you check other stores?",
        "Does it come in petite/tall?",
      ],
      cultural: [
        "Size variations by brand",
        "Return policies for clothing",
        "Fitting room etiquette",
      ],
    },
  },

  // GROCERY SHOPPING
  "Fresh Produce": {
    category: "grocery_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "fruit",
        "fresh",
        "ripe",
        "green",
        "red",
        "sweet",
        "soft",
        "hard",
        "wash",
        "clean",
      ],
      A2: [
        "organic",
        "seasonal",
        "local",
        "pesticide-free",
        "conventional",
        "produce",
        "variety",
        "selection",
      ],
    },
    phrases: {
      basic: [
        "Is this ripe?",
        "Can I taste?",
        "How much per pound?",
        "When was this picked?",
      ],
      situational: [
        "Is it organic?",
        "Did you grow this?",
        "What's in season?",
        "Can you hold this for me?",
      ],
      cultural: [
        "Produce selection tips",
        "Organic vs conventional",
        "Seasonal availability",
      ],
    },
  },

  "Meat and Seafood": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "meat",
        "fish",
        "fresh",
        "frozen",
        "cut",
        "pound",
        "price",
        "cook",
        "raw",
        "cold",
      ],
      A2: [
        "poultry",
        "seafood",
        "butcher",
        "marinade",
        "portion",
        "grade",
        "quality",
        "preparation",
      ],
    },
    phrases: {
      basic: [
        "Is this fresh?",
        "How much per pound?",
        "Can you cut this?",
        "I need it for today",
      ],
      situational: [
        "How should I cook this?",
        "Can you clean the fish?",
        "What's good for grilling?",
        "Is this grass-fed?",
      ],
      cultural: [
        "Meat grades and quality",
        "Seafood seasonality",
        "Butcher counter etiquette",
      ],
    },
  },

  "Dairy and Eggs": {
    category: "grocery_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "milk",
        "cheese",
        "eggs",
        "yogurt",
        "fresh",
        "cold",
        "date",
        "buy",
        "need",
        "want",
      ],
      A2: [
        "dairy",
        "expiration",
        "organic",
        "lactose-free",
        "pasteurized",
        "alternative",
        "variety",
        "selection",
      ],
    },
    phrases: {
      basic: [
        "What's the date on this?",
        "Is this fresh?",
        "Where's the milk?",
        "Do you have eggs?",
      ],
      situational: [
        "Is this lactose-free?",
        "Do you have plant-based options?",
        "What's the fat content?",
        "Are these cage-free?",
      ],
      cultural: ["Dairy alternatives", "Expiration dates", "Organic options"],
    },
  },

  "Bakery Section": {
    category: "grocery_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "bread",
        "fresh",
        "hot",
        "warm",
        "sweet",
        "cake",
        "buy",
        "slice",
        "whole",
        "half",
      ],
      A2: [
        "pastry",
        "baked",
        "artisan",
        "specialty",
        "custom",
        "order",
        "variety",
        "selection",
      ],
    },
    phrases: {
      basic: [
        "Is this fresh?",
        "Can you slice this?",
        "When was this baked?",
        "I want a whole loaf",
      ],
      situational: [
        "Do you bake daily?",
        "Can I order a cake?",
        "What's still warm?",
        "Are these gluten-free?",
      ],
      cultural: [
        "Fresh baking schedules",
        "Custom order policies",
        "Bread selection tips",
      ],
    },
  },

  "International Foods": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "food",
        "spice",
        "sauce",
        "rice",
        "noodle",
        "cook",
        "taste",
        "hot",
        "sweet",
        "sour",
      ],
      A2: [
        "ethnic",
        "cuisine",
        "ingredient",
        "authentic",
        "imported",
        "specialty",
        "traditional",
        "regional",
      ],
    },
    phrases: {
      basic: [
        "Where's the Asian section?",
        "Do you have this sauce?",
        "Is this spicy?",
        "How do you cook this?",
      ],
      situational: [
        "Is this authentic?",
        "What can I substitute?",
        "Are these imported?",
        "What dishes can I make?",
      ],
      cultural: [
        "Cultural food authenticity",
        "Regional variations",
        "Cooking adaptations",
      ],
    },
  },

  "Frozen Foods": {
    category: "grocery_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "frozen",
        "cold",
        "ice",
        "box",
        "bag",
        "heat",
        "cook",
        "time",
        "easy",
        "fast",
      ],
      A2: [
        "convenience",
        "microwave",
        "prepared",
        "storage",
        "defrost",
        "instructions",
        "portion",
        "meal",
      ],
    },
    phrases: {
      basic: [
        "Where are the frozen meals?",
        "How do I cook this?",
        "Is this pre-cooked?",
        "How long does it last?",
      ],
      situational: [
        "Can I microwave this?",
        "How do I defrost it?",
        "Are these healthy?",
        "What's the serving size?",
      ],
      cultural: [
        "Convenience food culture",
        "Frozen vs fresh",
        "Quick meal options",
      ],
    },
  },

  "Deli Counter": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "meat",
        "cheese",
        "slice",
        "thin",
        "thick",
        "pound",
        "fresh",
        "cold",
        "cut",
        "taste",
      ],
      A2: [
        "delicatessen",
        "cured",
        "smoked",
        "imported",
        "specialty",
        "prepared",
        "sandwich",
        "platter",
      ],
    },
    phrases: {
      basic: [
        "Half a pound, please",
        "Sliced thin/thick",
        "Can I taste this?",
        "What's fresh today?",
      ],
      situational: [
        "I'm making sandwiches",
        "What's good for a party?",
        "Can you make a platter?",
        "What's similar to...?",
      ],
      cultural: [
        "American deli traditions",
        "Regional specialties",
        "Kosher/Halal options",
      ],
    },
  },

  "Health Foods": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "health",
        "good",
        "fresh",
        "clean",
        "green",
        "raw",
        "diet",
        "food",
        "eat",
        "drink",
      ],
      A2: [
        "organic",
        "natural",
        "supplement",
        "vitamin",
        "gluten-free",
        "vegan",
        "superfood",
        "nutrition",
      ],
    },
    phrases: {
      basic: [
        "Is this healthy?",
        "No sugar added?",
        "All natural?",
        "Where are vitamins?",
      ],
      situational: [
        "I'm on a special diet",
        "What's good for energy?",
        "Any side effects?",
        "Recommended dosage?",
      ],
      cultural: [
        "Health food trends",
        "Supplement regulations",
        "Diet culture",
      ],
    },
  },

  "Regional Food Variations": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "food",
        "local",
        "taste",
        "like",
        "try",
        "eat",
        "cook",
        "make",
        "buy",
        "find",
      ],
      A2: [
        "regional",
        "specialty",
        "traditional",
        "authentic",
        "homestyle",
        "Southern",
        "Northeastern",
        "Southwestern",
      ],
    },
    phrases: {
      basic: [
        "What's local here?",
        "Is this Southern style?",
        "How do you eat this?",
        "Popular in this area?",
      ],
      situational: [
        "What's (state) famous for?",
        "Is this how locals make it?",
        "Traditional recipe?",
        "Regional favorite?",
      ],
      cultural: [
        "Regional food differences",
        "Local cooking styles",
        "Traditional preparations",
      ],
    },
  },

  "Seasonal and Holiday Foods": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "holiday",
        "special",
        "season",
        "time",
        "party",
        "family",
        "cook",
        "eat",
        "buy",
        "make",
      ],
      A2: [
        "tradition",
        "celebration",
        "decoration",
        "festival",
        "custom",
        "seasonal",
        "greeting",
        "feast",
      ],
    },
    phrases: {
      basic: [
        "When is it available?",
        "Holiday special?",
        "Only for Christmas?",
        "Traditional dish?",
      ],
      situational: [
        "How early should I order?",
        "What's popular for...?",
        "Special preparation?",
        "Family size portion?",
      ],
      cultural: [
        "Holiday food traditions",
        "Seasonal availability",
        "Celebration customs",
      ],
    },
  },

  "Fusion Foods": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "mix",
        "new",
        "taste",
        "try",
        "like",
        "spice",
        "sauce",
        "food",
        "cook",
        "eat",
      ],
      A2: [
        "fusion",
        "combination",
        "innovative",
        "creative",
        "blend",
        "modern",
        "contemporary",
        "hybrid",
      ],
    },
    phrases: {
      basic: [
        "What's this mix?",
        "Is it spicy?",
        "How do you eat it?",
        "What's inside?",
      ],
      situational: [
        "Is it like traditional...?",
        "Modern version?",
        "Special sauce?",
        "Chef's creation?",
      ],
      cultural: [
        "Fusion food trends",
        "Cultural combinations",
        "Modern adaptations",
      ],
    },
  },

  "Specialty Diets": {
    category: "grocery_shopping",
    difficulty: "A2",
    vocabulary: {
      A1: [
        "food",
        "eat",
        "can",
        "no",
        "yes",
        "safe",
        "check",
        "need",
        "want",
        "ask",
      ],
      A2: [
        "allergen",
        "restriction",
        "vegetarian",
        "vegan",
        "kosher",
        "halal",
        "gluten-free",
        "dairy-free",
      ],
    },
    phrases: {
      basic: [
        "Is this vegetarian?",
        "Contains nuts?",
        "Gluten-free options?",
        "Where's kosher food?",
      ],
      situational: [
        "Cross-contamination?",
        "Separate preparation?",
        "Certification?",
        "Ingredient list?",
      ],
      cultural: [
        "Dietary accommodations",
        "Religious considerations",
        "Allergy awareness",
      ],
    },
  },

  "Prepared Foods": {
    category: "grocery_shopping",
    difficulty: "A1",
    vocabulary: {
      A1: [
        "hot",
        "cold",
        "ready",
        "eat",
        "take",
        "box",
        "plate",
        "fresh",
        "warm",
        "serve",
      ],
      A2: [
        "prepared",
        "takeout",
        "catering",
        "portion",
        "serving",
        "reheating",
        "container",
        "menu",
      ],
    },
    phrases: {
      basic: [
        "Is this ready to eat?",
        "Still hot?",
        "How many servings?",
        "Need to heat it?",
      ],
      situational: [
        "Good for party?",
        "How long does it last?",
        "Reheating instructions?",
        "Family size?",
      ],
      cultural: [
        "Convenience food culture",
        "Take-out traditions",
        "American portion sizes",
      ],
    },
  },
};

// Add this near your ESL_SCENARIOS definition to verify the structure
console.log("=== Verifying ESL_SCENARIOS structure ===");
const sampleScenario = ESL_SCENARIOS["Coffee Shop"];
console.log("Sample scenario structure:", {
  title: "Coffee Shop",
  data: sampleScenario,
  keys: Object.keys(sampleScenario),
});

// Get or generate a scenario
async function getScenario(theme, level) {
  try {
    // First, check if we have a pre-defined scenario
    if (ESL_SCENARIOS[theme]) {
      return ESL_SCENARIOS[theme];
    }

    // If not, generate one using Gemini
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate an ESL learning scenario for the theme "${theme}" at ${level} level.
      Include:
      - A list of 10 relevant vocabulary words
      - 5 common phrases used in this scenario
      - 3 example dialogues
      - Grammar points to focus on
      Format the response as a JSON object.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      try {
        const scenarioData = JSON.parse(generatedText);
        return scenarioData;
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        return {
          theme,
          level,
          vocabulary: [],
          phrases: [],
          dialogues: [],
          grammarPoints: [],
        };
      }
    } else {
      return {
        theme,
        level,
        vocabulary: [],
        phrases: [],
        dialogues: [],
        grammarPoints: [],
      };
    }
  } catch (error) {
    console.error("Error generating scenario:", error);
    throw error;
  }
}

// Routes
router.get("/scenarios", auth, async (req, res) => {
  try {
    console.log("Fetching scenarios...");

    // Convert ESL_SCENARIOS object to array format with nested data structure
    const scenariosArray = Object.entries(ESL_SCENARIOS).map(
      ([title, scenarioData]) => ({
        _id: title.toLowerCase().replace(/\s+/g, "-"),
        title,
        description: `Practice ${title.toLowerCase()} vocabulary and phrases`,
        data: {
          category: scenarioData.category || "general",
          difficulty: scenarioData.difficulty || "beginner",
          vocabulary: scenarioData.vocabulary || {},
          phrases: scenarioData.phrases || {},
        },
      })
    );

    console.log(`Found ${scenariosArray.length} scenarios`);
    console.log("Sample scenario:", scenariosArray[0]);

    // Send response
    return res.json({
      status: "success",
      data: scenariosArray,
      count: scenariosArray.length,
    });
  } catch (error) {
    console.error("Error in /scenarios route:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching scenarios",
      error: error.message,
    });
  }
});

// Get scenario by ID
router.get("/scenarios/:id", auth, async (req, res) => {
  try {
    const scenarioId = req.params.id;
    const title = Object.keys(ESL_SCENARIOS).find(
      (key) => key.toLowerCase().replace(/\s+/g, "-") === scenarioId
    );

    if (!title || !ESL_SCENARIOS[title]) {
      return res.status(404).json({
        status: "error",
        message: "Scenario not found",
      });
    }

    const scenarioData = ESL_SCENARIOS[title];
    const scenario = {
      _id: scenarioId,
      title,
      description: `Practice ${title.toLowerCase()} vocabulary and phrases`,
      data: {
        category: scenarioData.category || "general",
        difficulty: scenarioData.difficulty || "beginner",
        vocabulary: scenarioData.vocabulary || {},
        phrases: scenarioData.phrases || {},
      },
    };

    return res.json({
      status: "success",
      data: scenario,
    });
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error fetching scenario",
      error: error.message,
    });
  }
});

// Get vocabulary words for a scenario
router.get("/scenarios/:id/vocabulary", auth, async (req, res) => {
  try {
    const scenario = await Vocabulary.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    res.json(scenario.vocabulary);
  } catch (error) {
    console.error("Error fetching vocabulary:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Get phrases for a scenario
router.get("/scenarios/:id/phrases", auth, async (req, res) => {
  try {
    const scenario = await Vocabulary.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    res.json(scenario.phrases);
  } catch (error) {
    console.error("Error fetching phrases:", error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
});

// Get vocabulary item details
router.get("/item/:id", auth, async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    if (!vocabulary) {
      return res.status(404).json({
        status: "error",
        message: "Vocabulary item not found",
      });
    }
    res.json({
      status: "success",
      data: vocabulary,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error fetching vocabulary item",
      error: error.message,
    });
  }
});

// Update vocabulary progress
router.post("/progress/:id", auth, async (req, res) => {
  try {
    const { score } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.updateVocabularyMastery(req.params.id, score);

    res.json({
      status: "success",
      message: "Progress updated successfully",
      data: user.progress.vocabularyMastery.get(req.params.id),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating progress",
      error: error.message,
    });
  }
});

// TTS endpoint
router.post("/tts", auth, async (req, res) => {
  try {
    console.log("TTS request received");
    console.log("Auth header:", req.headers.authorization);
    console.log("User:", req.user);
    console.log("Request body:", req.body);

    const { text } = req.body;
    if (!text) {
      console.log("No text provided in request");
      return res.status(400).json({ error: "Text is required" });
    }

    // Create cache directory if it doesn't exist
    const cacheDir = path.join(__dirname, "../../cache/tts");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Generate cache filename based on text content
    const cacheFile = path.join(
      cacheDir,
      `${Buffer.from(text).toString("base64")}.mp3`
    );

    // Check if we have this audio cached
    if (fs.existsSync(cacheFile)) {
      console.log("Serving cached audio file");
      return res.sendFile(cacheFile);
    }

    console.log("Generating new audio for:", text);

    // Initialize TTS client if not already initialized
    const ttsClient = new textToSpeech.TextToSpeechClient();

    // Construct the request
    const request = {
      input: { text },
      voice: { languageCode: "en-US", name: "en-US-Standard-C" },
      audioConfig: { audioEncoding: "MP3" },
    };

    // Perform the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request);
    console.log("Audio generated successfully");

    // Write the audio content to cache
    await util.promisify(fs.writeFile)(
      cacheFile,
      response.audioContent,
      "binary"
    );
    console.log("Audio file cached");

    // Send the audio file
    res.sendFile(cacheFile);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Error generating speech" });
  }
});

// Add new endpoint for AI-generated examples and translations
router.post("/generate", auth, async (req, res) => {
  try {
    const { text, type } = req.body;

    if (!text) {
      return res.status(400).json({
        status: "error",
        message: "Text is required",
      });
    }

    // Use Gemini to generate examples and translations
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      type === "word"
        ? `For the English word "${text}", provide:
      1. Turkish translation
      2. Three natural example sentences using this word
      3. Common collocations
      4. Usage notes (if any)
      Return ONLY a JSON object with these fields: translation, examples (array), collocations (array), usageNotes (string). Do not include markdown formatting, code blocks, or any other text.`
        : `For the English sentence "${text}", provide:
      1. Turkish translation
      2. Two similar example sentences
      3. Grammar notes
      4. Cultural context (if relevant)
      Return ONLY a JSON object with these fields: translation, examples (array), grammarNotes (string), culturalNotes (string). Do not include markdown formatting, code blocks, or any other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    try {
      // Remove any markdown formatting or code blocks
      const cleanJson = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const data = JSON.parse(cleanJson);
      return res.json({
        status: "success",
        data,
      });
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw AI response:", generatedText);
      return res.status(500).json({
        status: "error",
        message: "Error processing AI response",
        error: parseError.message,
      });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return res.status(500).json({
      status: "error",
      message: "Error generating content",
      error: error.message,
    });
  }
});

module.exports = router;

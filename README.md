# ESL Learning App

A modern web application for learning English as a Second Language (ESL) through interactive scenarios, vocabulary practice, and speech synthesis.

## Features

- 🎯 Scenario-based learning with real-world contexts
- 🗣️ Text-to-Speech powered by Google Cloud
- 📚 Vocabulary learning with visual aids
- 🔄 Progressive learning path
- 📱 Responsive design for all devices

## Tech Stack

### Frontend

- React with Vite
- Material-UI for components
- Axios for API calls
- React Router for navigation

### Backend

- Node.js with Express
- MongoDB for data storage
- Google Cloud Text-to-Speech API
- JWT for authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Cloud account with Text-to-Speech API enabled

### Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
cd esl-learning-app
```

2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create `.env` files in both backend and frontend directories:

Backend `.env`:

```
MONGODB_URI=mongodb://localhost:27017/esl-learning-app
JWT_SECRET=your_jwt_secret
PORT=5001
```

Frontend `.env`:

```
VITE_API_URL=http://localhost:5001/api
```

4. Start the development servers:

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

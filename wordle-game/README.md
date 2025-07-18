# Sreyans Custom Wordle

A custom Wordle game built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation
1. Navigate to the project directory:
   ```bash
   cd wordle-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Game
Start the development server:
```bash
npm run dev
```

The game will be available at: **http://localhost:5173**

### Stopping the Server
Press `Ctrl + C` in the terminal or run:
```bash
pkill -f "vite"
```

## 🎮 How to Play
- Guess the 5-letter word in 6 attempts
- Green tile: Letter is correct and in the right position
- Yellow tile: Letter is correct but in the wrong position
- Gray tile: Letter is not in the word

## 📁 Project Structure
```
wordle-game/
├── src/
│   ├── App.tsx          # Main game component
│   ├── main.tsx         # Entry point
│   └── App.css          # Styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## 🛠️ Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎯 Features
- Custom Wordle implementation
- Responsive design
- Real-time feedback
- Modern React with TypeScript

Enjoy playing! 🎉 
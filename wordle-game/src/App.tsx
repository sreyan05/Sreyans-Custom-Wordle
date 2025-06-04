import React, { useState, useEffect } from 'react'
import './App.css'

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  averageTime: number;
  bestTime: number;
  startTime: number | null;
}

// List of common 5-letter words to use as fallback
const FALLBACK_WORDS = ['HELLO', 'WORLD', 'APPLE', 'HOUSE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH', 'FLAME', 'GHOST'];

// Timer options in seconds
const TIMER_OPTIONS = [
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '3 minutes', value: 180 },
  { label: '5 minutes', value: 300 }
];

function App() {
  const [word, setWord] = useState<string>('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [currentGuess, setCurrentGuess] = useState<string>('')
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [showWord, setShowWord] = useState<boolean>(false)
  const [showStats, setShowStats] = useState<boolean>(false)
  const [isTimedMode, setIsTimedMode] = useState<boolean>(false)
  const [selectedTimer, setSelectedTimer] = useState<number>(180) // Default to 3 minutes
  const [timeLeft, setTimeLeft] = useState<number>(selectedTimer)
  const [normalModeStats, setNormalModeStats] = useState<GameStats>(() => {
    const savedStats = localStorage.getItem('normalModeStats')
    return savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      averageTime: 0,
      bestTime: Infinity,
      startTime: null
    }
  })
  const [timedModeStats, setTimedModeStats] = useState<GameStats>(() => {
    const savedStats = localStorage.getItem('timedModeStats')
    return savedStats ? JSON.parse(savedStats) : {
      gamesPlayed: 0,
      gamesWon: 0,
      averageTime: 0,
      bestTime: Infinity,
      startTime: null
    }
  })
  const [isPaused, setIsPaused] = useState<boolean>(false)

  // Timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isTimedMode && !gameOver && timeLeft > 0 && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            setMessage('Time\'s up! Game Over!');
            updateStats(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimedMode, gameOver, timeLeft, isPaused]);

  // Update timeLeft when selectedTimer changes
  useEffect(() => {
    setTimeLeft(selectedTimer);
  }, [selectedTimer]);

  const getRandomWord = async () => {
    try {
      // Try to get a random word from the dictionary API
      const randomWord = FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord.toLowerCase()}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data[0] && data[0].word) {
          return data[0].word.toUpperCase()
        }
      }
      // If API call fails, use a random word from our fallback list
      return randomWord
    } catch (error) {
      console.error('Error fetching word:', error)
      // If there's an error, use a random word from our fallback list
      return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
    }
  }

  const startNewGame = async () => {
    // Reset all game state
    setGuesses([])
    setCurrentGuess('')
    setGameOver(false)
    setMessage('')
    setShowWord(false)
    
    // Only reset timer and stats when starting a completely new game (not auto-continuing)
    if (!isTimedMode || timeLeft === 0) {
      setTimeLeft(selectedTimer)
      setIsPaused(false)
      
      // Reset stats when starting a new game
      if (isTimedMode) {
        const newStats = {
          gamesPlayed: 0,
          gamesWon: 0,
          averageTime: 0,
          bestTime: Infinity,
          startTime: Date.now()
        }
        setTimedModeStats(newStats)
        localStorage.setItem('timedModeStats', JSON.stringify(newStats))
      } else {
        setNormalModeStats(prev => ({
          ...prev,
          startTime: Date.now()
        }))
      }
    }
    
    // Get a new random word
    const newWord = await getRandomWord()
    setWord(newWord)
  }

  // Add effect to auto-start new games in timer mode
  useEffect(() => {
    if (isTimedMode && gameOver && timeLeft > 0 && !isPaused) {
      // Small delay before starting new game
      const timer = setTimeout(() => {
        startNewGame()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isTimedMode, gameOver, timeLeft, isPaused])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameOver) return

      const key = event.key.toUpperCase()
      
      if (key === 'ENTER' && currentGuess.length === 5) {
        // Check if the word exists in dictionary
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess.toLowerCase()}`)
          .then(response => {
            if (response.ok) {
              setGuesses([...guesses, currentGuess])
              setCurrentGuess('')
              setMessage('')
              
              if (currentGuess === word) {
                setGameOver(true)
                setMessage('Congratulations! You won!')
                updateStats(true)
              } else if (guesses.length === 5) {
                setGameOver(true)
                setMessage(`Game Over! The word was ${word}`)
                updateStats(false)
              }
            } else {
              setMessage('Not a valid word!')
            }
          })
          .catch(() => {
            setMessage('Not a valid word!')
          })
      } else if (key === 'BACKSPACE') {
        setCurrentGuess(prev => prev.slice(0, -1))
        setMessage('')
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key)
        setMessage('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentGuess, gameOver, guesses, word])

  const handleKeyPress = (key: string) => {
    if (gameOver) return

    if (key === 'ENTER' && currentGuess.length === 5) {
      // Check if the word exists in dictionary
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${currentGuess.toLowerCase()}`)
        .then(response => {
          if (response.ok) {
            setGuesses([...guesses, currentGuess])
            setCurrentGuess('')
            setMessage('')
            
            if (currentGuess === word) {
              setGameOver(true)
              setMessage('Congratulations! You won!')
              updateStats(true)
            } else if (guesses.length === 5) {
              setGameOver(true)
              setMessage(`Game Over! The word was ${word}`)
              updateStats(false)
            }
          } else {
            setMessage('Not a valid word!')
          }
        })
        .catch(() => {
          setMessage('Not a valid word!')
        })
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
      setMessage('')
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key)
      setMessage('')
    }
  }

  const updateStats = (won: boolean) => {
    const currentStats = isTimedMode ? timedModeStats : normalModeStats;
    if (!currentStats.startTime) return;

    const timeTaken = (Date.now() - currentStats.startTime) / 1000 // Convert to seconds
    const newStats = {
      gamesPlayed: currentStats.gamesPlayed + 1,
      gamesWon: won ? currentStats.gamesWon + 1 : currentStats.gamesWon,
      averageTime: won ? 
        ((currentStats.averageTime * currentStats.gamesWon) + timeTaken) / (currentStats.gamesWon + 1) : 
        currentStats.averageTime,
      bestTime: won ? Math.min(currentStats.bestTime, timeTaken) : currentStats.bestTime,
      startTime: currentStats.startTime // Keep the same startTime for continuous games
    }

    if (isTimedMode) {
      setTimedModeStats(newStats)
      localStorage.setItem('timedModeStats', JSON.stringify(newStats))
    } else {
      setNormalModeStats(newStats)
      localStorage.setItem('normalModeStats', JSON.stringify(newStats))
    }
  }

  const getTileColor = (letter: string, index: number, guess: string) => {
    if (letter === word[index]) return 'green'
    if (word.includes(letter)) return 'yellow'
    return 'gray'
  }

  const formatTime = (seconds: number) => {
    if (seconds === Infinity) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const toggleTimedMode = () => {
    setIsTimedMode(!isTimedMode)
    // Reset timer and stats when switching modes
    setTimeLeft(selectedTimer)
    setIsPaused(false)
    startNewGame()
  }

  const handleTimerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimer(Number(event.target.value))
  }

  const togglePause = () => {
    setIsPaused(!isPaused);
  }

  return (
    <div className="App">
      <div className="header">
        <h1>Sreyan's Custom Wordle</h1>
        <div className="button-group">
          <div className="mode-selector">
            <button 
              className={`mode-button ${isTimedMode ? 'active' : ''}`} 
              onClick={toggleTimedMode}
            >
              {isTimedMode ? 'Click for Normal Mode' : 'Click for Timer Mode'}
            </button>
            {isTimedMode && (
              <select 
                className="timer-select"
                value={selectedTimer}
                onChange={handleTimerChange}
              >
                {TIMER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button className="stats-button" onClick={() => setShowStats(!showStats)}>
            Stats
          </button>
          <button className="show-word-button" onClick={() => setShowWord(!showWord)}>
            {showWord ? 'Hide Word' : 'Show Word'}
          </button>
          <button className="new-game-button" onClick={startNewGame}>
            New Game
          </button>
        </div>
      </div>
      {isTimedMode && (
        <div className="timer-container">
          <div className="timer">
            <div className="timer-label">Time Left:</div>
            <div className="timer-value">{formatTime(timeLeft)}</div>
          </div>
          {!gameOver && (
            <button 
              className={`pause-button ${isPaused ? 'paused' : ''}`}
              onClick={togglePause}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
        </div>
      )}
      {showStats && (
        <div className="stats-panel">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{isTimedMode ? timedModeStats.gamesPlayed : normalModeStats.gamesPlayed}</div>
              <div className="stat-label">Games Played</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{isTimedMode ? timedModeStats.gamesWon : normalModeStats.gamesWon}</div>
              <div className="stat-label">Games Won</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatTime(isTimedMode ? timedModeStats.averageTime : normalModeStats.averageTime)}</div>
              <div className="stat-label">Average Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatTime(isTimedMode ? timedModeStats.bestTime : normalModeStats.bestTime)}</div>
              <div className="stat-label">Best Time</div>
            </div>
          </div>
        </div>
      )}
      {showWord && (
        <div className="word-reveal">
          The word is: <span className="revealed-word">{word}</span>
        </div>
      )}
      <div className="game-board">
        {[...Array(6)].map((_, rowIndex) => (
          <div key={rowIndex} className="row">
            {[...Array(5)].map((_, colIndex) => {
              const letter = rowIndex === guesses.length 
                ? currentGuess[colIndex] || ''
                : guesses[rowIndex]?.[colIndex] || ''
              const color = rowIndex < guesses.length 
                ? getTileColor(letter, colIndex, guesses[rowIndex])
                : 'white'
              return (
                <div key={colIndex} className={`tile ${color}`}>
                  {letter}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {message && <div className="message">{message}</div>}
      <div className="keyboard">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, index) => (
          <div key={index} className="keyboard-row">
            {row.split('').map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="key"
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        <div className="keyboard-row">
          <button onClick={() => handleKeyPress('ENTER')} className="key wide">Enter</button>
          <button onClick={() => handleKeyPress('BACKSPACE')} className="key wide">Back</button>
        </div>
      </div>
    </div>
  )
}

export default App 
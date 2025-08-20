import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Trophy, Crown, Medal, Star, Zap } from 'lucide-react'
import { useQuiz } from '@/contexts/QuizContext'
import toast from 'react-hot-toast'
import Confetti from 'react-confetti'

const PlayerInterface = () => {
  const {
    session,
    players,
    currentQuestion,
    joinSession,
    submitAnswer,
    subscribeToSession,
    currentPlayer,
    isHost
  } = useQuiz()
  
  const [playerName, setPlayerName] = useState('')
  const [sessionCode, setSessionCode] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Load cached player name and session
  useEffect(() => {
    const cachedName = localStorage.getItem('quiz-player-name')
    const cachedSession = localStorage.getItem('quiz-session-code')
    
    if (cachedName) {
      setPlayerName(cachedName)
    }
    if (cachedSession) {
      setSessionCode(cachedSession)
    }
  }, [])

  // Subscribe to session when player joins
  useEffect(() => {
    if (session && !isHost) {
      subscribeToSession(session.sessionCode)
    }
  }, [session, isHost, subscribeToSession])

  // Reset answer state when question changes
  useEffect(() => {
    setHasSubmittedAnswer(false)
    setAnswerText('')
  }, [currentQuestion])

  // Show confetti for top 3 players when quiz ends
  useEffect(() => {
    if (session?.status === 'ended' && currentPlayer) {
      const playerRank = players.find(p => p.id === currentPlayer.id)?.rank
      if (playerRank && playerRank <= 3) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 10000)
      }
    }
  }, [session?.status, currentPlayer, players])

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playerName.trim() || !sessionCode.trim()) {
      toast.error('Please enter both your name and session code')
      return
    }

    setIsJoining(true)
    try {
      await joinSession(sessionCode.toUpperCase().trim(), playerName.trim())
      
      // Cache the values
      localStorage.setItem('quiz-player-name', playerName.trim())
      localStorage.setItem('quiz-session-code', sessionCode.toUpperCase().trim())
      
      toast.success('Successfully joined the quiz!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to join session')
    } finally {
      setIsJoining(false)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!answerText.trim()) {
      toast.error('Please enter your answer')
      return
    }

    try {
      await submitAnswer(answerText.trim())
      setHasSubmittedAnswer(true)
      toast.success('Answer submitted!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit answer')
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-400" />
      case 2:
        return <Medal className="h-8 w-8 text-gray-300" />
      case 3:
        return <Trophy className="h-8 w-8 text-yellow-600" />
      default:
        return <Star className="h-6 w-6 text-purple-400" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-yellow-600 to-yellow-800'
      default:
        return 'from-purple-400 to-purple-600'
    }
  }

  // Join Session Screen
  if (!session || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Zap className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Join Quiz</h2>
              <p className="text-gray-300">Enter your name and session code to participate</p>
            </div>

            <form onSubmit={handleJoinSession} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none"
                  placeholder="Enter your name"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session Code
                </label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none text-center text-2xl font-mono tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isJoining}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Joining...
                  </div>
                ) : (
                  'Join Quiz'
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  // Quiz Ended - Final Scoreboard
  if (session.status === 'ended') {
    const sortedPlayers = [...players].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    const currentPlayerRank = sortedPlayers.findIndex(p => p.id === currentPlayer.id) + 1
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
          />
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">Quiz Completed!</h1>
            <p className="text-xl text-gray-300">Final Results</p>
          </div>

          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
          >
            {/* 2nd Place */}
            {sortedPlayers[1] && (
              <div className="text-center order-1">
                <div className="bg-gradient-to-t from-gray-300 to-gray-100 rounded-t-lg p-4 h-24 flex items-end justify-center">
                  <div className="text-center">
                    <Medal className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-800">2nd</div>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-b-lg">
                  <p className="text-white font-medium">{sortedPlayers[1].playerName}</p>
                  <p className="text-purple-400 font-bold">{sortedPlayers[1].totalScore} pts</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {sortedPlayers[0] && (
              <div className="text-center order-2">
                <div className="bg-gradient-to-t from-yellow-400 to-yellow-200 rounded-t-lg p-4 h-32 flex items-end justify-center">
                  <div className="text-center">
                    <Crown className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-yellow-800">1st</div>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-b-lg border-2 border-yellow-400">
                  <p className="text-white font-medium">{sortedPlayers[0].playerName}</p>
                  <p className="text-yellow-400 font-bold text-xl">{sortedPlayers[0].totalScore} pts</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {sortedPlayers[2] && (
              <div className="text-center order-3">
                <div className="bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg p-4 h-20 flex items-end justify-center">
                  <div className="text-center">
                    <Trophy className="h-7 w-7 text-yellow-800 mx-auto mb-2" />
                    <div className="text-base font-bold text-yellow-900">3rd</div>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-b-lg">
                  <p className="text-white font-medium">{sortedPlayers[2].playerName}</p>
                  <p className="text-yellow-400 font-bold">{sortedPlayers[2].totalScore} pts</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Your Result */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`text-center p-6 rounded-xl mb-6 bg-gradient-to-r ${getRankColor(currentPlayerRank)} bg-opacity-20 border border-current border-opacity-30`}
          >
            <div className="flex items-center justify-center mb-2">
              {getRankIcon(currentPlayerRank)}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              You finished #{currentPlayerRank}!
            </h3>
            <p className="text-xl text-white/90">
              {currentPlayer.totalScore} points
            </p>
            {currentPlayerRank <= 3 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-lg text-white/90 mt-2"
              >
                Amazing job! You made it to the podium!
              </motion.p>
            )}
          </motion.div>

          {/* Full Scoreboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">Complete Scoreboard</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {sortedPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + (index * 0.1) }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === currentPlayer.id 
                      ? 'bg-purple-500/30 border border-purple-400' 
                      : 'bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {index < 3 ? getRankIcon(index + 1) : (
                        <span className="text-white font-bold">#{index + 1}</span>
                      )}
                    </div>
                    <span className={`font-medium ${
                      player.id === currentPlayer.id ? 'text-white' : 'text-gray-300'
                    }`}>
                      {player.playerName}
                      {player.id === currentPlayer.id && ' (You)'}
                    </span>
                  </div>
                  <span className="text-purple-400 font-bold">{player.totalScore} pts</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-8"
          >
            <Link to="/">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                Play Again
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Show Scores Screen
  if (session.status === 'showing_scores') {
    const sortedPlayers = [...players].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Current Scores</h1>
            <p className="text-gray-300">Waiting for the next question...</p>
          </div>

          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.id === currentPlayer.id 
                    ? 'bg-purple-500/30 border border-purple-400' 
                    : 'bg-white/10'
                } ${index < 3 ? 'border border-yellow-400/50' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {index < 3 ? getRankIcon(index + 1) : (
                      <span className="text-white font-bold">#{index + 1}</span>
                    )}
                  </div>
                  <span className={`font-medium ${
                    player.id === currentPlayer.id ? 'text-white' : 'text-gray-300'
                  }`}>
                    {player.playerName}
                    {player.id === currentPlayer.id && ' (You)'}
                  </span>
                </div>
                <span className="text-purple-400 font-bold text-xl">{player.totalScore} pts</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Active Quiz - Answer Screen
  if (session.status === 'active' && currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{currentPlayer.playerName}</h2>
              <p className="text-purple-400">Score: {currentPlayer.totalScore} pts</p>
            </div>
            <div className="text-right">
              <p className="text-gray-300">Session: {session.sessionCode}</p>
              <p className="text-yellow-400 font-bold">{currentQuestion.points} points</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={currentQuestion.imageUrl}
              alt="Quiz question"
              className="max-w-full max-h-80 mx-auto rounded-xl border border-white/20 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
              }}
            />
          </div>

          <AnimatePresence>
            {!hasSubmittedAnswer ? (
              <motion.form
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmitAnswer}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Answer
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none"
                      placeholder="Type your answer here..."
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-6 bg-green-500/20 border border-green-400 rounded-xl"
              >
                <div className="text-green-400 mb-2">
                  <div className="w-12 h-12 border-2 border-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Answer Submitted!</h3>
                <p className="text-gray-300">Your answer: "{answerText}"</p>
                <p className="text-green-400 mt-2">Waiting for other players...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    )
  }

  // Waiting Screen
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center"
      >
        <div className="mb-6">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
          <p className="text-gray-300">The quiz will start soon...</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Your name:</span>
            <span className="text-white font-medium">{currentPlayer.playerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Session:</span>
            <span className="text-purple-400 font-bold">{session.sessionCode}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Players connected:</span>
            <span className="text-white font-bold">{players.length}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PlayerInterface
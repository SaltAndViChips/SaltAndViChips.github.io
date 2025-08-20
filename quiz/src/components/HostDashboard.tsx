import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LogOut, 
  Plus, 
  Play, 
  SkipForward, 
  Trophy, 
  Users, 
  Check, 
  X,
  Eye,
  EyeOff,
  Copy,
  Image as ImageIcon,
  Star
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuiz } from '@/contexts/QuizContext'
import toast from 'react-hot-toast'

const HostDashboard = () => {
  const { host, logout } = useAuth()
  const { 
    session, 
    players, 
    questions, 
    currentQuestion, 
    answers, 
    createSession, 
    addQuestion,
    deleteQuestion,
    resetQuiz,
    nextQuestion, 
    showScores, 
    endQuiz, 
    markAnswerCorrect,
    subscribeToSession,
    unsubscribeFromSession,
    clearSession
  } = useQuiz()
  
  const navigate = useNavigate()
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(10)
  const [showDescription, setShowDescription] = useState(false)
  const [sessionCode, setSessionCode] = useState('')

  useEffect(() => {
    if (!host) {
      navigate('/host/auth')
    }
  }, [host, navigate])

  useEffect(() => {
    return () => {
      unsubscribeFromSession()
    }
  }, [])

  const handleCreateSession = async () => {
    if (!host) return
    
    try {
      const code = await createSession(host.username)
      setSessionCode(code)
      subscribeToSession(code)
      toast.success(`Session created! Code: ${code}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create session')
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageUrl.trim() || !description.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    // Validate imgur URL
    if (!imageUrl.includes('imgur.com')) {
      toast.error('Please use an imgur.com image URL')
      return
    }

    try {
      await addQuestion(imageUrl.trim(), description.trim(), points)
      setImageUrl('')
      setDescription('')
      setPoints(10)
      setShowQuestionForm(false)
      toast.success('Question added successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add question')
    }
  }

  const handleStartQuiz = async () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question before starting')
      return
    }
    
    try {
      await nextQuestion()
      toast.success('Quiz started!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start quiz')
    }
  }

  const handleNextQuestion = async () => {
    try {
      await nextQuestion()
      toast.success('Next question loaded')
    } catch (error: any) {
      toast.error(error.message || 'Failed to load next question')
    }
  }

  const handleShowScores = async () => {
    try {
      await showScores()
      toast.success('Showing scores to players')
    } catch (error: any) {
      toast.error(error.message || 'Failed to show scores')
    }
  }

  const handleEndQuiz = async () => {
    try {
      await endQuiz()
      toast.success('Quiz ended successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to end quiz')
    }
  }

  const handleMarkCorrect = async (answerId: string) => {
    try {
      await markAnswerCorrect(answerId)
      toast.success('Answer marked as correct!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark answer')
    }
  }

  const copySessionCode = () => {
    if (session?.sessionCode) {
      navigator.clipboard.writeText(session.sessionCode)
      toast.success('Session code copied to clipboard!')
    }
  }

  const handleResetQuiz = async () => {
    if (window.confirm('Are you sure you want to reset the quiz? This will delete all questions and restart the session.')) {
      try {
        await resetQuiz()
        toast.success('Quiz reset successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to reset quiz')
      }
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId)
        toast.success('Question deleted successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete question')
      }
    }
  }

  const handleLogout = () => {
    clearSession()
    logout()
    navigate('/')
  }

  if (!host) {
    return null
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Host Dashboard</h1>
            <p className="text-gray-300">Welcome back, {host.fullName}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        {!session ? (
          /* Create Session */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-2xl mx-auto">
              <Play className="h-20 w-20 text-purple-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Host?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Create a new quiz session and let players join with a unique code
              </p>
              <button
                onClick={handleCreateSession}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Quiz Session
              </button>
            </div>
          </motion.div>
        ) : (
          /* Quiz Management */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Session Info & Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Session Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Session Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span className="text-gray-300">Session Code:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-purple-400">{session.sessionCode}</span>
                      <button
                        onClick={copySessionCode}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-300' :
                      session.status === 'active' ? 'bg-green-500/20 text-green-300' :
                      session.status === 'showing_scores' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Players:</span>
                    <span className="text-white font-bold">{players.length}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quiz Controls */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Play className="h-6 w-6 mr-2" />
                  Quiz Controls
                </h3>
                <div className="space-y-3">
                  {session.status === 'waiting' && questions.length > 0 && (
                    <button
                      onClick={handleResetQuiz}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      Reset Quiz
                    </button>
                  )}
                  
                  {session.status === 'waiting' && (
                    <button
                      onClick={handleStartQuiz}
                      disabled={questions.length === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      Start Quiz
                    </button>
                  )}
                  
                  {session.status === 'active' && (
                    <>
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <SkipForward className="h-5 w-5" />
                        <span>Next Question</span>
                      </button>
                      <button
                        onClick={handleShowScores}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <Trophy className="h-5 w-5" />
                        <span>Show Scores</span>
                      </button>
                    </>
                  )}
                  
                  {(session.status === 'showing_scores' || session.status === 'active') && (
                    <button
                      onClick={handleEndQuiz}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      End Quiz
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Players List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  Connected Players
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {players.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No players connected yet</p>
                  ) : (
                    players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            player.isConnected ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-white font-medium">{player.playerName}</span>
                          {player.rank && player.rank <= 3 && (
                            <Star className={`h-4 w-4 ${
                              player.rank === 1 ? 'text-yellow-400' :
                              player.rank === 2 ? 'text-gray-300' :
                              'text-yellow-600'
                            }`} />
                          )}
                        </div>
                        <span className="text-purple-400 font-bold">{player.totalScore}</span>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Questions & Answers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Question Display */}
              {currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                    <span>Current Question</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDescription(!showDescription)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {showDescription ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <span className="text-purple-400 font-bold">{currentQuestion.points} pts</span>
                    </div>
                  </h3>
                  
                  <div className="mb-4">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Quiz question"
                      className="w-full max-w-md mx-auto rounded-xl border border-white/20"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4='
                      }}
                    />
                  </div>
                  
                  <AnimatePresence>
                    {showDescription && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/10 rounded-lg p-4 mb-4"
                      >
                        <p className="text-white">{currentQuestion.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Live Answers */}
              {session.status === 'active' && answers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Live Answers</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {answers.map((answer) => (
                      <motion.div
                        key={answer.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between bg-white/10 rounded-lg p-4 border ${
                          answer.isCorrect ? 'border-green-400 bg-green-500/20' : 'border-white/20'
                        }`}
                      >
                        <div>
                          <p className="text-white font-medium">{answer.playerName}</p>
                          <p className="text-gray-300">{answer.answerText}</p>
                        </div>
                        {!answer.isCorrect && (
                          <button
                            onClick={() => handleMarkCorrect(answer.id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        {answer.isCorrect && (
                          <div className="text-green-400">
                            <Check className="h-6 w-6" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Questions Management */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <ImageIcon className="h-6 w-6 mr-2" />
                    Questions ({questions.length})
                  </h3>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-all"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                {/* Question Form */}
                <AnimatePresence>
                  {showQuestionForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddQuestion}
                      className="bg-white/10 rounded-lg p-4 mb-4 space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Image URL (imgur.com)
                        </label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none"
                          placeholder="https://i.imgur.com/example.jpg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description (Hidden until revealed)
                        </label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none"
                          placeholder="What is shown in this image?"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={points}
                          onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all outline-none"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          Add Question
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuestionForm(false)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Questions List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {questions.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      No questions added yet. Add your first question to get started!
                    </p>
                  ) : (
                    questions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-4 bg-white/10 rounded-lg p-3 border ${
                          currentQuestion?.id === question.id ? 'border-purple-400 bg-purple-500/20' : 'border-white/20'
                        }`}
                      >
                        <img
                          src={question.imageUrl}
                          alt={`Question ${index + 1}`}
                          className="w-16 h-12 object-cover rounded-lg border border-white/20"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+'
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium">Question {index + 1}</p>
                          <p className="text-gray-300 text-sm">{question.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-purple-400 font-bold">{question.points} pts</div>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all"
                            title="Delete question"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostDashboard
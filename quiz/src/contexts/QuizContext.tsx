import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface QuizSession {
  id: string
  sessionCode: string
  status: 'waiting' | 'active' | 'showing_scores' | 'ended'
  currentQuestionId: string | null
  hostUsername: string
}

interface Player {
  id: string
  playerName: string
  totalScore: number
  isConnected: boolean
  rank?: number
}

interface Question {
  id: string
  imageUrl: string
  description: string
  points: number
  questionOrder: number
  isRevealed: boolean
}

interface Answer {
  id: string
  questionId: string
  playerId: string
  playerName: string
  answerText: string
  isCorrect: boolean
  submittedAt: string
}

interface QuizContextType {
  session: QuizSession | null
  players: Player[]
  questions: Question[]
  currentQuestion: Question | null
  answers: Answer[]
  createSession: (hostUsername: string) => Promise<string>
  joinSession: (sessionCode: string, playerName: string) => Promise<void>
  updateSessionStatus: (status: string, questionId?: string) => Promise<void>
  resetQuiz: () => Promise<void>
  addQuestion: (imageUrl: string, description: string, points: number) => Promise<void>
  deleteQuestion: (questionId: string) => Promise<void>
  nextQuestion: () => Promise<void>
  showScores: () => Promise<void>
  endQuiz: () => Promise<void>
  submitAnswer: (answerText: string) => Promise<void>
  markAnswerCorrect: (answerId: string) => Promise<void>
  subscribeToSession: (sessionCode: string) => void
  unsubscribeFromSession: () => void
  clearSession: () => void
  currentPlayer: Player | null
  isHost: boolean
}

const QuizContext = createContext<QuizContextType | undefined>(undefined)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<QuizSession | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null)

  // ✅ NEW: fetch a question by ID if missing locally
  const fetchCurrentQuestion = async (questionId: string) => {
    try {
      const response = await fetch('https://bkkxqycigwahyoxtpolz.supabase.co/functions/v1/session-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4'
        },
        body: JSON.stringify({
          action: 'get_question',
          questionId
        })
      })
      const result = await response.json()
      if (response.ok && result.data?.question) {
        setCurrentQuestion(result.data.question)
        setAnswers([])
      }
    } catch (err) {
      console.error('Failed to fetch current question', err)
    }
  }

  // ... keep your existing useEffect for restoring session/player

  // ... keep resetQuiz, createSession, joinSession, updateSessionStatus, addQuestion, deleteQuestion

  const nextQuestion = async (): Promise<void> => {
    if (!session || !questions.length) return
    const currentIndex = currentQuestion ? questions.findIndex(q => q.id === currentQuestion.id) : -1
    const nextIndex = currentIndex + 1
    if (nextIndex < questions.length) {
      const nextQ = questions[nextIndex]
      setCurrentQuestion(nextQ)
      await updateSessionStatus('active', nextQ.id)
      setAnswers([])
      if (realtimeChannel) {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'NEW_QUESTION',
          payload: { question: nextQ }
        })
      }
    }
  }

  // ... keep showScores, endQuiz, submitAnswer, markAnswerCorrect, clearSession, loadScores, loadAnswers, setupRealtimeChannel

  const subscribeToSession = (sessionCode: string) => {
    setupRealtimeChannel(sessionCode)

    // ✅ patched session subscription
    const sessionSub = supabase
      .channel(`session-db-${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `session_code=eq.${sessionCode}`
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any
            setSession(prev => prev ? {
              ...prev,
              status: newData.status,
              currentQuestionId: newData.current_question_id
            } : null)

            // ✅ Always ensure we have the full question
            if (newData.current_question_id) {
              const cached = questions.find(q => q.id === newData.current_question_id)
              if (cached) {
                setCurrentQuestion(cached)
                setAnswers([])
              } else {
                fetchCurrentQuestion(newData.current_question_id)
              }
            }
          }
        }
      )
      .subscribe()

    const playersSub = supabase
      .channel(`players-db-${sessionCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        loadScores()
      })
      .subscribe()

    const answersSub = supabase
      .channel(`answers-db-${sessionCode}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers' }, () => {
        if (currentQuestion) {
          loadAnswers(currentQuestion.id)
        }
      })
      .subscribe()

    setSubscriptions([sessionSub, playersSub, answersSub])
  }

  // ... keep unsubscribeFromSession and cleanup useEffect

  return (
    <QuizContext.Provider
      value={{
        session,
        players,
        questions,
        currentQuestion,
        answers,
        createSession,
        joinSession,
        updateSessionStatus,
        resetQuiz,
        addQuestion,
        deleteQuestion,
        nextQuestion,
        showScores,
        endQuiz,
        submitAnswer,
        markAnswerCorrect,
        subscribeToSession,
        unsubscribeFromSession,
        clearSession,
        currentPlayer,
        isHost
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const context = useContext(QuizContext)
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}

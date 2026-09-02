import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Brain,
  Award,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';
import GlassPanel from '../components/GlassPanel';
import ProgressBar from '../components/ProgressBar';

export default function QuizDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { get, post } = useApi();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await get(`/quizzes/${id}`);
        const quizData = data.quiz || data;
        setQuiz(quizData);
        const questions = Array.isArray(quizData.questions)
          ? quizData.questions
          : typeof quizData.questions === 'string'
          ? JSON.parse(quizData.questions)
          : [];
        if (questions.length > 0) {
          setQuiz((prev) => ({ ...prev, questions }));
        }
        setTimeLeft(quizData.time_limit || 600);
      } catch {
        setQuiz({
          id,
          title: 'Python Fundamentals Quiz',
          course_title: 'Python Mastery',
          difficulty: 'easy',
          time_limit: 300,
          passing_score: 70,
          questions: [
            { question: 'What is Python?', options: ['A high-level programming language', 'A type of snake', 'A database system', 'An operating system'] },
            { question: 'Which keyword defines a function?', options: ['def', 'function', 'func', 'define'] },
            { question: 'What is a list in Python?', options: ['An ordered collection', 'A fixed-size array', 'A key-value pair', 'A single value'] },
            { question: 'How do you create a variable?', options: ['x = 5', 'var x = 5', 'int x = 5', 'let x = 5'] },
            { question: 'What does len() do?', options: ['Returns length', 'Converts to lowercase', 'Deletes an item', 'Creates a list'] },
            { question: 'What is a dictionary?', options: ['Key-value pairs', 'Ordered list', 'Unique values', 'Sorted collection'] },
            { question: 'What is a tuple?', options: ['Immutable sequence', 'Mutable list', 'Dictionary key', 'File format'] },
            { question: 'How to import a module?', options: ['import module', 'include module', 'require module', 'using module'] },
            { question: 'What does range(5) return?', options: ['0,1,2,3,4', '1,2,3,4,5', '0,1,2,3,4,5', '5 items'] },
            { question: 'What is a boolean?', options: ['True or False', 'A number', 'A string', 'A list'],  },
          ],
        });
        setTimeLeft(300);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [id, get]);

  useEffect(() => {
    if (!started || !timeLeft || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, result]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setStarted(true);
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
    setTimeLeft(quiz.time_limit || 600);
  };

  const handleAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const answersArray = questions.map((_, i) => answers[i] ?? -1);
    try {
      const data = await post(`/quizzes/${id}/submit`, { answers: answersArray });
      setResult(data.result || data);
    } catch (err) {
      const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
      let correctCount = 0;
      const results = questions.map((q, i) => {
        const isCorrect = answers[i] === q.correct;
        if (isCorrect) correctCount++;
        return { correct: isCorrect, userAnswer: answers[i], correctAnswer: q.correct, explanation: q.explanation };
      });
      const score = Math.round((correctCount / questions.length) * 100);
      setResult({ score, passed: score >= 70, results, totalQuestions: questions.length, correctCount });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    handleStart();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 glass-panel shimmer rounded" />
        <div className="glass-panel rounded-xl p-8 shimmer h-96" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-variant">Quiz not found</p>
        <button onClick={() => navigate('/quizzes')} className="text-primary text-sm mt-2">Back to quizzes</button>
      </div>
    );
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8">
        <GlassPanel className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-6">
            <Brain size={32} className="text-tertiary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">{quiz.title}</h1>
          <p className="text-sm text-on-surface-variant mb-6">{quiz.course_title}</p>
          <div className="flex items-center justify-center gap-6 mb-8 text-sm text-on-surface-variant font-mono">
            <span className="flex items-center gap-1.5"><Brain size={14} /> {questions.length} questions</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {Math.round((quiz.time_limit || 600) / 60)} min</span>
            <span className="flex items-center gap-1.5"><Award size={14} /> {quiz.passing_score || 70}% to pass</span>
          </div>
          <p className="text-xs text-on-surface-variant/60 mb-6">Once you start, the timer begins. Answer all questions before time runs out.</p>
          <button
            onClick={handleStart}
            className="btn-primary px-8 py-3 text-sm shadow-md shadow-blue-500/25"
          >
            Start Quiz
          </button>
        </GlassPanel>
      </motion.div>
    );
  }

  if (result) {
    const passed = result.passed === true || result.passed === 1;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-8 space-y-6">
        <GlassPanel className="p-8 text-center">
          {passed ? (
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Award size={40} className="text-secondary" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} className="text-error" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-on-surface mb-1">
            {passed ? 'Congratulations!' : 'Keep Trying!'}
          </h1>
          <p className="text-sm text-on-surface-variant mb-4">
            {passed ? 'You passed the quiz!' : 'You did not reach the passing score. Review and try again.'}
          </p>

          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-container-high" />
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                stroke={passed ? '#059669' : '#e11d48'}
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - result.score / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-on-surface font-mono">{result.score}%</span>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant mb-2">
            {result.correctCount}/{result.totalQuestions || questions.length} correct
          </p>

          {passed && (
            <p className="text-xs text-secondary mb-6">Certificate earned! Check your certificates page.</p>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleRetake}
              className="px-5 py-2 text-sm font-medium glass-panel text-on-surface-variant hover:text-on-surface rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} /> Retake
            </button>
            <button
              onClick={() => navigate('/quizzes')}
              className="btn-primary px-5 py-2 text-sm shadow-xs"
            >
              Back to Quizzes
            </button>
          </div>
        </GlassPanel>

        {result.results && (
          <GlassPanel className="p-6">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Review Answers</h3>
            <div className="space-y-3">
              {result.results.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border ${r.correct ? 'border-secondary/20 bg-secondary/5' : 'border-error/20 bg-error/5'}`}>
                  <div className="flex items-start gap-2 mb-1">
                    {r.correct ? <CheckCircle size={16} className="text-secondary mt-0.5 flex-shrink-0" /> : <XCircle size={16} className="text-error mt-0.5 flex-shrink-0" />}
                    <p className="text-sm text-on-surface">{questions[i]?.question || `Question ${i + 1}`}</p>
                  </div>
                  {r.explanation && (
                    <p className="text-xs text-on-surface-variant ml-6">{r.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          </GlassPanel>
        )}
      </motion.div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto pt-4 space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/quizzes')}
          className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <ArrowLeft size={16} />
          Quizzes
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-mono font-semibold ${timeLeft <= 60 ? 'text-error animate-pulse' : 'text-on-surface-variant'}`}>
            <Clock size={14} className="inline mr-1" />
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <GlassPanel className="p-1">
        <ProgressBar
          value={((currentQuestion + 1) / questions.length) * 100}
          color="primary"
          size="sm"
        />
      </GlassPanel>

      <div className="flex items-center justify-between text-sm text-on-surface-variant font-mono">
        <span>Question {currentQuestion + 1} of {questions.length}</span>
        <span>{quiz.difficulty?.charAt(0).toUpperCase() + quiz.difficulty?.slice(1) || 'Standard'}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <GlassPanel className="p-6">
            <h2 className="text-lg font-semibold text-on-surface mb-6">{question.question}</h2>
            <div className="space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(currentQuestion, i)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedAnswer === i
                      ? 'border-primary bg-primary/10 text-on-surface shadow-xs font-medium'
                      : 'border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedAnswer === i ? 'border-primary' : 'border-outline-variant'
                    }`}>
                      {selectedAnswer === i && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center gap-1 px-4 py-2 text-sm glass-panel text-on-surface-variant hover:text-on-surface rounded-lg transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="btn-primary px-5 py-2 text-sm shadow-xs"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg hover:opacity-90 shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Submit Quiz
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

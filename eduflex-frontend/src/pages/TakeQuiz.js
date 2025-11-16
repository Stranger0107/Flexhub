// eduflex-frontend/src/pages/TakeQuiz.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { toast } from "react-toastify";

export default function TakeQuiz() {
  const { user, fetchQuizById, submitQuiz } = useApp();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // ⭐ NEW: For one-by-one navigation
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);

      const quizData = await fetchQuizById(quizId);
      if (!quizData) {
        toast.error("Quiz not found");
        setLoading(false);
        return;
      }

      // ❗ Check if user already attempted
      const alreadySubmitted = quizData.submissions?.find(
        (s) => s.student === user._id || s.student?._id === user._id
      );

      if (alreadySubmitted) {
        setSubmitted(true);
        setScore(alreadySubmitted.score);
        setAnswers(alreadySubmitted.answers); // show user's past answers
      }

      setQuiz(quizData);
      setAnswers(Array(quizData.questions.length).fill(null));
      setLoading(false);
    };

    loadQuiz();
  }, [quizId, fetchQuizById, user]);

  // ==============================
  // Select option
  // ==============================
  const selectOption = (optionIndex) => {
    setAnswers((prev) =>
      prev.map((ans, i) => (i === currentQuestion ? optionIndex : ans))
    );
  };

  // ==============================
  // Submit quiz
  // ==============================
  const handleSubmit = async () => {
    if (submitted) {
      toast.warning("You have already submitted this quiz.");
      return;
    }

    if (answers.some((a) => a === null)) {
      toast.warning("Please answer all questions.");
      return;
    }

    const cleaned = answers.map((a) => Number(a));
    const res = await submitQuiz(quizId, cleaned);

    if (res?.score !== undefined) {
      toast.success("Quiz submitted successfully!");
      setScore(res.score);
      setSubmitted(true);
    }
  };

  // ==============================
  // Loading state
  // ==============================
  if (loading) return <div className="p-8">Loading quiz...</div>;
  if (!quiz) return <div className="p-8">Quiz not found.</div>;

  // ======================================
  //  SHOW RESULTS IF ALREADY SUBMITTED
  // ======================================
  if (submitted) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-green-700">
          Quiz: {quiz.title}
        </h2>

        <div className="bg-green-50 p-6 rounded-lg border border-green-300">
          <h3 className="text-xl font-semibold text-green-700 mb-3">
            Your Score: {score} / {quiz.questions.length}
          </h3>

          <ul className="space-y-4">
            {quiz.questions.map((q, i) => (
              <li key={i} className="p-4 bg-white rounded shadow-sm">
                <p className="font-semibold mb-1">
                  {i + 1}. {q.questionText}
                </p>

                <p className="text-sm text-gray-600">
                  Correct Answer:{" "}
                  <span className="text-green-600 font-medium">
                    {q.options[q.correctOption]}
                  </span>
                </p>

                <p
                  className={`text-sm ${
                    answers[i] === q.correctOption
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  Your Answer: {q.options[answers[i]]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ======================================
  // QUESTION NAVIGATION UI
  // ======================================
  const q = quiz.questions[currentQuestion];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-700">
        Quiz: {quiz.title}
      </h2>

      <div className="p-6 bg-white rounded-lg shadow-md border">
        <p className="text-gray-600 mb-2">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>

        <h3 className="text-lg font-semibold mb-4">{q.questionText}</h3>

        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <label
              key={idx}
              className="block p-3 border rounded cursor-pointer hover:bg-green-50"
            >
              <input
                type="radio"
                name="answer"
                value={idx}
                checked={answers[currentQuestion] === idx}
                onChange={() => selectOption(idx)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((q) => q - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
          >
            Previous
          </button>

          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((q) => q + 1)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

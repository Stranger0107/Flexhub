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

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const quizData = await fetchQuizById(quizId);
      if (!quizData) {
        toast.error("Quiz not found");
        setLoading(false);
        return;
      }
      setQuiz(quizData);
      setAnswers(Array(quizData.questions.length).fill(null));
      setLoading(false);
    };
    loadQuiz();
  }, [quizId, fetchQuizById]);

  const handleSelect = (qi, ans) => {
    setAnswers(prev => prev.map((a, i) => (i === qi ? ans : a)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (answers.some(a => a === null)) {
      toast.warning("Please answer all questions.");
      return;
    }
    const res = await submitQuiz(quizId, answers);
    if (res?.submission) {
      setScore(res.submission.score);
      setSubmitted(true);
      toast.success("Quiz submitted successfully!");
    }
  };

  if (loading) return <div className="p-8">Loading quiz...</div>;
  if (!quiz) return <div className="p-8">Quiz not found.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        Quiz: {quiz.title}
      </h2>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          {quiz.questions.map((q, i) => (
            <div
              key={i}
              className="mb-6 border-b pb-4 border-gray-200"
            >
              <div className="font-semibold mb-2">
                {i + 1}. {q.questionText}
              </div>
              {q.options.map((opt, idx) => (
                <label key={idx} className="block mb-1">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={idx}
                    checked={answers[i] === idx}
                    onChange={() => handleSelect(i, idx)}
                    className="mr-2"
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          ))}

          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700"
          >
            Submit Quiz
          </button>
        </form>
      ) : (
        <div className="mt-6 bg-green-50 p-6 rounded-lg border border-green-300">
          <h3 className="text-green-700 font-bold text-lg">
            Your Score: {score} / {quiz.questions.length}
          </h3>

          <ul className="mt-4 space-y-3">
            {quiz.questions.map((q, i) => (
              <li key={i}>
                <p className="font-semibold">
                  {i + 1}. {q.questionText}
                </p>
                <p className="text-sm text-gray-700">
                  ✅ Correct: {q.options[q.correctOption]?.text}
                </p>
                <p
                  className={`text-sm ${
                    answers[i] === q.correctOption
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  Your answer: {q.options[answers[i]]?.text || "—"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

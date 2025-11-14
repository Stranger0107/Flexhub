import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../contexts/AppContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

export default function ProfessorAssignments() {
  const {
    user,
    authLoading: contextLoading,
    fetchProfessorAssignments,
    fetchProfessorCourseById,
    gradeSubmission,
  } = useApp();

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [gradingState, setGradingState] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Helper: Get the full object for the selected ID
  const selectedAssignment = useMemo(
    () => assignments.find((a) => a._id === selectedAssignmentId) || null,
    [assignments, selectedAssignmentId]
  );

  // 1. Function to load all assignments (used on mount & refresh)
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProfessorAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (!contextLoading && user) loadData();
    // eslint-disable-next-line
  }, [user, contextLoading]); // removed fetchProfessorAssignments to prevent infinite loop if stable ref changes

  // 2. When assignment is selected, fetch students & sync submissions
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedAssignment) return;

      try {
        // Debug: Log the submissions we have for this assignment
        console.log("🔍 [Debug] Selected Assignment Submissions:", selectedAssignment.submissions);

        const courseId =
          typeof selectedAssignment.course === "object"
            ? selectedAssignment.course._id
            : selectedAssignment.course;

        const courseData = await fetchProfessorCourseById(courseId);
        const students = courseData?.students || [];
        setEnrolledStudents(students);

        // Initialize grading inputs
        const initialGrading = {};
        students.forEach((stu) => {
          const sId = String(stu._id || stu.id);
          // Match submission
          const sub = selectedAssignment.submissions?.find(
            (s) => String(s.student?._id || s.student) === sId
          );
          
          if (sub) {
            initialGrading[sId] = {
              grade: sub.grade ?? "",
              feedback: sub.feedback ?? "",
            };
          }
        });
        setGradingState(initialGrading);
      } catch (error) {
        console.error("Error loading course details:", error);
        toast.error("Failed to load student list.");
      }
    };

    loadStudents();
  }, [selectedAssignmentId, selectedAssignment, fetchProfessorCourseById]);

  const handleInput = (studentId, key, value) => {
    setGradingState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [key]: value,
      },
    }));
  };

  const handleGrade = async (studentId) => {
    const state = gradingState[studentId] || {};
    const grade = state.grade;
    const feedback = state.feedback;

    if (grade === "" || grade === undefined) {
      toast.warning("Please enter a grade.");
      return;
    }

    const success = await gradeSubmission(
      selectedAssignment._id,
      studentId,
      { grade: Number(grade), feedback }
    );

    if (success) {
      // Refresh data to reflect changes from backend
      await loadData();
      toast.success("Grade saved!");
    }
  };

  // Manual Refresh Wrapper
  const handleRefresh = (e) => {
    e.stopPropagation();
    loadData();
  };

  if (isLoading && assignments.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-lg">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="p-8 pl-24 min-h-screen flex flex-col md:flex-row gap-6">
      {/* LEFT: List of Assignments */}
      <div className="w-full md:w-1/3 flex flex-col h-[calc(100vh-100px)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
            title="Force Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pr-2 flex-1">
          {assignments.length === 0 && (
            <div className="text-gray-400 italic">No assignments found.</div>
          )}
          {assignments.map((a) => (
            <div
              key={a._id}
              className={`p-4 rounded-lg border shadow-sm cursor-pointer transition-all duration-200 
                ${
                  selectedAssignmentId === a._id
                    ? "border-green-500 bg-green-50 ring-1 ring-green-500"
                    : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                }`}
              onClick={() => setSelectedAssignmentId(a._id)}
            >
              <div className="font-bold text-gray-800">{a.title}</div>
              <div className="text-xs text-gray-500 mt-1 truncate">
                Course: {typeof a.course === "object" ? a.course.title : "..."}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A"}
              </div>
              <div className="mt-3 flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  {a.submissions?.length || 0} Subs
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Grading Panel */}
      <div className="w-full md:w-2/3 bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-[calc(100vh-100px)] overflow-y-auto">
        {!selectedAssignment ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p>Select an assignment from the left to grade.</p>
          </div>
        ) : (
          <>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedAssignment.title}</h2>
                  <p className="text-gray-600 mt-1 text-sm">{selectedAssignment.description}</p>
                </div>
                <button onClick={handleRefresh} className="text-xs text-blue-500 hover:underline">
                  Sync Data
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-500 flex gap-6">
                <span>
                  <strong>Due:</strong> {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </span>
                <span>
                  <strong>Enrolled:</strong> {enrolledStudents.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Submission</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Feedback</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrolledStudents.map((stu, index) => {
                    const studentId = String(stu._id || stu.id || `fallback-${index}`);
                    
                    const submission = selectedAssignment.submissions?.find(
                      (s) => String(s.student?._id || s.student) === studentId
                    );

                    const isSubmitted = !!submission;
                    const isGraded = submission && submission.grade !== undefined && submission.grade !== null;

                    return (
                      <tr key={studentId} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {stu.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {stu.email || "No Email"}
                          </div>
                          {/* Debug Info (remove in prod if desired) */}
                          {/* <div className="text-[10px] text-gray-300">{studentId}</div> */}
                        </td>
                        <td className="px-4 py-3">
                          {isGraded ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                              Graded
                            </span>
                          ) : isSubmitted ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              Submitted
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {isSubmitted ? (
                            submission.submission.includes("/uploads") ? (
                              <a
                                href={`${API_BASE_URL}${submission.submission}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                View File
                              </a>
                            ) : (
                              <span className="block truncate max-w-[150px] bg-gray-100 px-2 py-1 rounded" title={submission.submission}>
                                {submission.submission}
                              </span>
                            )
                          ) : (
                            <span className="text-gray-300 italic">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!isSubmitted}
                            className="border border-gray-300 rounded px-2 py-1 w-16 text-center focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-400 transition"
                            value={gradingState[studentId]?.grade || ""}
                            onChange={(e) => handleInput(studentId, "grade", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            disabled={!isSubmitted}
                            className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-400 transition text-sm"
                            placeholder={isSubmitted ? "Feedback" : ""}
                            value={gradingState[studentId]?.feedback || ""}
                            onChange={(e) => handleInput(studentId, "feedback", e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleGrade(studentId)}
                            disabled={!isSubmitted}
                            className={`text-xs px-3 py-1.5 rounded text-white font-medium transition shadow-sm
                              ${isSubmitted 
                                ? "bg-green-600 hover:bg-green-700 active:bg-green-800" 
                                : "bg-gray-300 cursor-not-allowed"}
                            `}
                          >
                            {isGraded ? "Update" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {enrolledStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                        No students are enrolled in this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
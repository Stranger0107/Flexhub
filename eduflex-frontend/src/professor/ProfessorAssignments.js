// src/professor/ProfessorAssignments.js
import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import { toast } from "react-toastify";

export default function ProfessorAssignments() {
  const {
    user,
    authLoading: contextLoading,
    fetchAssignmentsForCourse,
    fetchMyProfessorCourses,
  } = useApp();

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Fetch all assignments for professor
  useEffect(() => {
    const fetchAllAssignments = async () => {
      setIsLoading(true);
      try {
        const courses = await fetchMyProfessorCourses();
        const allAssignments = [];
        for (const c of courses) {
          const courseAssignments = await fetchAssignmentsForCourse(c._id);
          (courseAssignments || []).forEach((a) =>
            allAssignments.push({ ...a, courseTitle: c.title })
          );
        }
        setAssignments(allAssignments);
      } catch (err) {
        toast.error("Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading && user) fetchAllAssignments();
  }, [user, contextLoading, fetchAssignmentsForCourse, fetchMyProfessorCourses]);

  const openAssignment = (assignment) => {
    setSelectedAssignment(assignment);
  };

  if (isLoading || contextLoading) {
    return (
      <div className="flex items-center justify-center h-80 text-lg">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="p-8 pl-24 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Assignments - Grading</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        <div>
          <h3 className="text-lg mb-3 font-bold">All Assignments</h3>
          <div className="space-y-4">
            {assignments.length === 0 && (
              <div className="text-gray-400">No assignments found.</div>
            )}
            {assignments.map((a) => (
              <div
                key={a._id}
                className={`p-4 rounded border ${
                  selectedAssignment && selectedAssignment._id === a._id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 bg-white"
                } cursor-pointer hover:border-green-400 transition`}
                onClick={() => openAssignment(a)}
              >
                <div className="text-green-700 font-bold">{a.title}</div>
                <div className="text-sm text-gray-500">
                  {a.courseTitle} | Due:{" "}
                  {a.dueDate
                    ? new Date(a.dueDate).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions Placeholder */}
        <div>
          <h3 className="text-lg mb-3 font-bold">
            Submissions {selectedAssignment ? `for "${selectedAssignment.title}"` : ""}
          </h3>
          {!selectedAssignment && (
            <div className="text-gray-400 p-4">
              Select an assignment to view submissions.
            </div>
          )}
          {selectedAssignment && (
            <div className="text-gray-400 p-4">
              No submissions yet (feature coming soon).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

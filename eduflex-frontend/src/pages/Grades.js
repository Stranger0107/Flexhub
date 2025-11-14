// src/pages/Grades.js
import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";

function Grades() {
  const { getStudentGrades } = useApp();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterGrade, setFilterGrade] = useState("all");

  useEffect(() => {
    const fetchGrades = async () => {
      setLoading(true);
      const data = await getStudentGrades();
      setGrades(data || []);
      setLoading(false);
    };
    fetchGrades();
  }, [getStudentGrades]);

  // Unique courses for filter
  const uniqueCourses = [
    ...new Set(grades.map(grade => grade.course)),
  ];

  // Sort and filter grades
  const filteredAndSortedGrades = grades
    .filter(grade => {
      const matchesCourse =
        filterCourse === "all" || grade.course === filterCourse;
      
      // Simple grade filtering logic based on letters derived from score
      // Assumed mapping: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)
      const matchesGrade = (() => {
          if (filterGrade === "all") return true;
          const g = grade.grade; // 'A', 'B', etc. from context transform
          if (filterGrade === "A") return g === 'A';
          if (filterGrade === "B") return g === 'B';
          if (filterGrade === "C") return g === 'C';
          if (filterGrade === "below-C") return ['D', 'F'].includes(g);
          return true;
      })();

      return matchesCourse && matchesGrade;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "course":
          aValue = a.course?.toLowerCase();
          bValue = b.course?.toLowerCase();
          break;
        case "score":
          aValue = parseInt(a.score.replace("%", "")) || 0;
          bValue = parseInt(b.score.replace("%", "")) || 0;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      if (sortOrder === "asc") return aValue > bValue ? 1 : -1;
      else return aValue < bValue ? 1 : -1;
    });

  // Stats calculation
  const calculateStats = () => {
    if (filteredAndSortedGrades.length === 0)
      return { average: 0, highest: 0, lowest: 0, totalAssignments: 0 };
    const scores = filteredAndSortedGrades.map(
      grade => parseInt(grade.score.replace("%", "")) || 0
    );
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return {
      average,
      highest,
      lowest,
      totalAssignments: filteredAndSortedGrades.length,
    };
  };

  const stats = calculateStats();

  // Grade color helpers
  const getGradeColor = grade => {
    if (["A"].includes(grade)) return "#10b981";
    if (["B"].includes(grade)) return "#3b82f6";
    if (["C"].includes(grade)) return "#f59e0b";
    return "#ef4444";
  };
  const getGradeBackground = grade => {
    if (["A"].includes(grade)) return "#f0fdf4";
    if (["B"].includes(grade)) return "#eff6ff";
    if (["C"].includes(grade)) return "#fefce8";
    return "#fef2f2";
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }}></div>
          <p>Loading grades...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {/* Header */}
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        My Grades
      </h1>
      <p style={{ fontSize: "1rem", color: "#555", marginBottom: "1.5rem" }}>
        Track your academic performance and analyze your progress.
      </p>

      {/* Statistics Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.average}%</div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Average Score</div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
          color: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(59, 130, 246, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.highest}%</div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Highest Score</div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.lowest}%</div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Lowest Score</div>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          color: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(139, 92, 246, 0.3)"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.totalAssignments}</div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Assignments Graded</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        marginBottom: "2rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ marginBottom: "1rem" }}>Filter & Sort</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Course Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Filter by Course
            </label>
            <select
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                background: "white",
                minWidth: "150px"
              }}>
              <option value="all">All Courses</option>
              {uniqueCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
          {/* Grade Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Filter by Grade
            </label>
            <select
              value={filterGrade}
              onChange={e => setFilterGrade(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                background: "white",
                minWidth: "150px"
              }}>
              <option value="all">All Grades</option>
              <option value="A">A (90-100)</option>
              <option value="B">B (80-89)</option>
              <option value="C">C (70-79)</option>
              <option value="below-C">Below C</option>
            </select>
          </div>
          {/* Sort By */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                background: "white",
                minWidth: "150px"
              }}>
              <option value="date">Date</option>
              <option value="course">Course</option>
              <option value="score">Score</option>
            </select>
          </div>
          {/* Sort Order */}
          <div>
            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.5rem" }}>
              Order
            </label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                background: "white",
                minWidth: "120px"
              }}>
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
          {/* Reset Button */}
          <div style={{ alignSelf: "flex-end" }}>
            <button
              onClick={() => {
                setFilterCourse("all");
                setFilterGrade("all");
                setSortBy("date");
                setSortOrder("desc");
              }}
              style={{
                padding: "0.5rem 1rem",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div style={{
        background: "white",
        borderRadius: "0.75rem",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        {filteredAndSortedGrades.length > 0 ? (
          <div>
            {/* Table Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              gap: "1rem",
              padding: "1rem 1.5rem",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: "600",
              color: "#374151"
            }}>
              <div>Assignment</div>
              <div>Course</div>
              <div>Grade</div>
              <div>Score</div>
              <div>Date</div>
            </div>
            {/* Table Rows */}
            {filteredAndSortedGrades.map((grade, index) => (
              <div
                key={grade.id || index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom: index < filteredAndSortedGrades.length - 1 ? "1px solid #f3f4f6" : "none",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ fontWeight: "500" }}>{grade.assignment}</div>
                <div style={{ color: "#666" }}>{grade.course}</div>
                <div>
                  <span style={{
                    display: "inline-block",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "1rem",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    background: getGradeBackground(grade.grade),
                    color: getGradeColor(grade.grade)
                  }}>
                    {grade.grade}
                  </span>
                </div>
                <div style={{ fontWeight: "600", color: getGradeColor(grade.grade) }}>
                  {grade.score}
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {new Date(grade.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
            <h3>No grades found</h3>
            <p>No graded assignments match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Grades;
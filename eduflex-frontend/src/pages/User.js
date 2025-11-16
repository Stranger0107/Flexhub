import React, { useEffect, useState } from "react";
import { useApp } from "../contexts/AppContext";

const profilePic =
  "https://ui-avatars.com/api/?background=10b981&color=fff&rounded=true&size=128&name=User";

export default function User() {
  const {
    user,
    loadUserProfile,
    fetchUserStats,
    fetchEnrolledCourses,
    fetchRecentGrades,
  } = useApp();

  const [stats, setStats] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEverything = async () => {
      setLoading(true);

      await loadUserProfile();
      const s = await fetchUserStats();
      const c = await fetchEnrolledCourses();
      const g = await fetchRecentGrades();

      setStats(s);
      setEnrolledCourses(c);
      setRecentGrades(g);

      setLoading(false);
    };

    loadEverything();
  }, []);

  if (loading || !user) {
    return <div className="flex justify-center items-center h-80">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg">
      {/* HEADER */}
      <div className="flex gap-6 items-center">
        <img src={profilePic} className="w-28 h-28 rounded-full shadow" />

        <div>
          <h1 className="text-3xl font-bold text-green-700">{user.name}</h1>

          <p className="text-gray-600">
            <span className="font-semibold">{user.role.toUpperCase()}</span>
            {user.role === "student" && user.studentId ? ` • ID: ${user.studentId}` : ""}
          </p>

          <p className="text-gray-500 text-sm">{user.email}</p>

          <p className="text-xs text-gray-400 mt-1">
            Joined: {new Date(user.joinedAt).toDateString()}
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <StatsCard title="Courses" value={stats?.totalCourses} color="#3b82f6" />
        <StatsCard title="Pending" value={stats?.pendingAssignments} color="#ef4444" />
        <StatsCard title="Avg Grade" value={stats?.averageGrade} color="#22c55e" />
        <StatsCard title="Progress" value={stats?.overallProgress} color="#f59e0b" />
      </div>

      {/* COURSES */}
      <h2 className="text-xl font-semibold text-green-700 mb-3">Enrolled Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {enrolledCourses.length === 0 && (
          <p className="text-gray-500">No enrolled courses</p>
        )}

        {enrolledCourses.map((c) => (
          <div key={c._id} className="p-4 bg-gray-50 border rounded-lg">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-xs text-gray-600">Credits: {c.credits}</p>
          </div>
        ))}
      </div>

      {/* GRADES */}
      <h2 className="text-xl font-semibold text-green-700 mb-3">Recent Grades</h2>
      {recentGrades.length === 0 ? (
        <p className="text-gray-500">No grades yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recentGrades.map((g, i) => (
            <div
              key={i}
              className="p-4 bg-white border rounded-lg shadow-sm flex justify-between"
            >
              <div>
                <strong>{g.assignmentTitle}</strong>
                <p className="text-xs text-gray-500">{g.course}</p>
              </div>
              <span className="text-green-600 font-bold text-xl">{g.grade}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsCard({ title, value, color }) {
  return (
    <div className="px-5 py-4 rounded-xl shadow-md text-center"
         style={{ background: `${color}15` }}>
      <div className="text-xl font-bold" style={{ color }}>
        {value ?? 0}
      </div>
      <p className="text-xs opacity-80">{title}</p>
    </div>
  );
}

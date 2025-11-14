import React, { useState } from "react";
import { useApp } from "../contexts/AppContext";

export default function CreateAssignmentForm({ courseId }) {
  const { createAssignment } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("courseId", courseId);

    if (attachment) {
      formData.append("file", attachment);
    }

    await createAssignment(formData, true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
      <input type="date" onChange={(e) => setDueDate(e.target.value)} />

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setAttachment(e.target.files[0])}
      />

      <button type="submit">
        Create Assignment
      </button>
    </form>
  );
}

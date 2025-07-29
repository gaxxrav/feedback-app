import React, { useEffect, useState } from 'react';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/boards/')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-8">Loading boards...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Boards</h1>
      <ul className="space-y-4">
        {boards.map((board) => (
          <li key={board.id} className="bg-white shadow rounded p-4 border border-gray-200">
            <div className="font-semibold text-lg">{board.name}</div>
            <div className="text-gray-600">{board.description}</div>
            <div className="text-xs text-gray-400 mt-2">{board.is_public ? 'Public' : 'Private'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardList;

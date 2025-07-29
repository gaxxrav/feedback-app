import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './utils/api';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await api.get('/boards/');
        setBoards(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch boards');
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (loading) return <div className="text-center py-8">Loading boards...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Boards</h1>
        <Link
          to="/create-board"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Board
        </Link>
      </div>
      
      {boards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No boards found. Create your first board to get started!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="block bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-lg text-gray-900 mb-2">{board.name}</div>
              <div className="text-gray-600 text-sm mb-3">{board.description}</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  board.is_public 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {board.is_public ? 'Public' : 'Private'}
                </span>
                <span className="text-xs text-gray-400">
                  {board.created_at ? new Date(board.created_at).toLocaleDateString() : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardList;

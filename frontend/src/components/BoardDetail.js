import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';

const BoardDetail = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await api.get(`/boards/${id}/`);
        setBoard(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch board');
        setLoading(false);
      }
    };

    fetchBoard();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading board...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!board) return <div className="text-center py-8">Board not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Boards
        </Link>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              board.is_public 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {board.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          
          {board.description && (
            <p className="text-gray-600 mb-6">{board.description}</p>
          )}
          
          <div className="text-sm text-gray-500">
            Created: {board.created_at ? new Date(board.created_at).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Feedback Items</h2>
        <div className="text-center py-8 text-gray-500">
          No feedback items yet. This feature will be implemented in the next phase.
        </div>
      </div>
    </div>
  );
};

export default BoardDetail; 
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BoardDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
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

  const isCreator = user && board.created_by === user.id;

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
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                board.is_public 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {board.is_public ? 'Public' : 'Private'}
              </span>
              {isCreator && (
                <Link
                  to={`/board/${id}/edit`}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit Board
                </Link>
              )}
            </div>
          </div>
          
          {board.description && (
            <p className="text-gray-600 mb-6">{board.description}</p>
          )}
          
          <div className="text-sm text-gray-500 mb-4">
            Created: {board.created_at ? new Date(board.created_at).toLocaleDateString() : 'Unknown'}
          </div>

          {/* Access Information */}
          {!board.is_public && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Access Control</h3>
              
              {board.allowed_users && board.allowed_users.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Allowed Users:</h4>
                  <div className="flex flex-wrap gap-2">
                    {board.allowed_users.map(user => (
                      <span key={user.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.first_name} {user.last_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {board.allowed_roles && board.allowed_roles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Allowed Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {board.allowed_roles.map(role => (
                      <span key={role.id} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(!board.allowed_users || board.allowed_users.length === 0) && 
               (!board.allowed_roles || board.allowed_roles.length === 0) && (
                <p className="text-sm text-gray-500">No specific users or roles assigned. Only the creator has access.</p>
              )}
            </div>
          )}
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
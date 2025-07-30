import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await api.delete(`/boards/${id}/`);
      navigate('/boards');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete board');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading board...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!board) return <div className="text-center py-8">Board not found</div>;

  const isCreator = user && board.created_by === user.id;
  const hasEditPermission = isCreator || 
    (board.allowed_users && board.allowed_users.some(u => u.id === user?.id)) ||
    (board.allowed_roles && board.allowed_roles.some(r => user?.groups?.includes(r.id)));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/boards"
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
              {hasEditPermission && (
                <>
                  <Link
                    to={`/board/${id}/edit`}
                    className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Edit Board
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete Board'}
                  </button>
                </>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Feedback Items</h2>
          <Link
            to={`/board/${id}/feedback/create`}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Feedback
          </Link>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">View and manage feedback for this board</p>
          <Link
            to={`/board/${id}/feedback`}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Board Feedback →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BoardDetail; 
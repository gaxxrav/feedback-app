import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import api from './utils/api';

const BoardList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingBoardId, setDeletingBoardId] = useState(null);

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

  const handleDelete = async (boardId, boardName) => {
    if (!window.confirm(`Are you sure you want to delete "${boardName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingBoardId(boardId);
    try {
      await api.delete(`/boards/${boardId}/`);
      setBoards(boards.filter(board => board.id !== boardId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete board');
    } finally {
      setDeletingBoardId(null);
    }
  };

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
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {boards.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No boards found. Create your first board to get started!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const isCreator = user && board.created_by === user.id;
            const hasEditPermission = isCreator || 
              (board.allowed_users && board.allowed_users.some(u => u.id === user?.id)) ||
              (board.allowed_roles && board.allowed_roles.some(r => user?.groups?.includes(r.id)));

            return (
              <div
                key={board.id}
                className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <Link
                    to={`/board/${board.id}`}
                    className="flex-1 hover:text-indigo-600 transition-colors"
                  >
                    <div className="font-semibold text-lg text-gray-900 mb-2">{board.name}</div>
                  </Link>
                  {hasEditPermission && (
                    <div className="flex space-x-2 ml-4">
                      <Link
                        to={`/board/${board.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(board.id, board.name)}
                        disabled={deletingBoardId === board.id}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {deletingBoardId === board.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
                
                <Link to={`/board/${board.id}`}>
                  <div className="text-gray-600 text-sm mb-3">{board.description}</div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        board.is_public 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {board.is_public ? 'Public' : 'Private'}
                      </span>
                      {isCreator && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          Creator
                        </span>
                      )}
                    </div>
                    
                    {!board.is_public && (
                      <div className="text-xs text-gray-500">
                        {board.allowed_users?.length > 0 && (
                          <div>Users: {board.allowed_users.length}</div>
                        )}
                        {board.allowed_roles?.length > 0 && (
                          <div>Roles: {board.allowed_roles.length}</div>
                        )}
                        {(!board.allowed_users || board.allowed_users.length === 0) && 
                         (!board.allowed_roles || board.allowed_roles.length === 0) && (
                          <div>Creator only</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {board.created_at ? new Date(board.created_at).toLocaleDateString() : ''}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BoardList;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const EditBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
    allowed_users: [],
    allowed_roles: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardResponse, usersResponse, rolesResponse] = await Promise.all([
          api.get(`/boards/${id}/`),
          api.get('/boards/available_users/'),
          api.get('/boards/available_roles/')
        ]);
        
        const boardData = boardResponse.data;
        setBoard(boardData);
        setFormData({
          name: boardData.name,
          description: boardData.description || '',
          is_public: boardData.is_public,
          allowed_users: boardData.allowed_users?.map(user => user.id) || [],
          allowed_roles: boardData.allowed_roles?.map(role => role.id) || []
        });
        setAvailableUsers(usersResponse.data);
        setAvailableRoles(rolesResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch board');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.put(`/boards/${id}/`, formData);
      navigate(`/board/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update board');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      allowed_users: prev.allowed_users.includes(userId)
        ? prev.allowed_users.filter(id => id !== userId)
        : [...prev.allowed_users, userId]
    }));
  };

  const handleRoleSelection = (roleId) => {
    setFormData(prev => ({
      ...prev,
      allowed_roles: prev.allowed_roles.includes(roleId)
        ? prev.allowed_roles.filter(id => id !== roleId)
        : [...prev.allowed_roles, roleId]
    }));
  };

  if (loading) return <div className="text-center py-8">Loading board...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!board) return <div className="text-center py-8">Board not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to={`/board/${id}`}
          className="text-emerald-600 hover:text-emerald-800 mb-4 inline-block"
        >
          ← Back to Board
        </Link>
        
        <h1 className="text-2xl font-bold mb-6">Edit Board</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Board Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_public"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
            Make this board public (accessible by anyone)
          </label>
        </div>

        {!formData.is_public && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allow Specific Users Access
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {availableUsers.map(user => (
                  <label key={user.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.allowed_users.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {user.first_name} {user.last_name} ({user.username})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allow Users with Specific Roles
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {availableRoles.map(role => (
                  <label key={role.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={formData.allowed_roles.includes(role.id)}
                      onChange={() => handleRoleSelection(role.id)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            to={`/board/${id}`}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditBoard; 
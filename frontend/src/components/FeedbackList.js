import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FeedbackList = () => {
  const { boardId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'created_at'
  });

  useEffect(() => {
    fetchFeedbacks();
  }, [boardId, filters]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      let url = '/feedback/';
      
      // Add board filter if boardId is provided
      if (boardId) {
        url += `?board=${boardId}`;
      }
      
      // Add status filter
      if (filters.status) {
        url += boardId ? '&' : '?';
        url += `status=${filters.status}`;
      }
      
      // Add sorting
      if (filters.sortBy === 'upvotes') {
        url += (boardId || filters.status) ? '&' : '?';
        url += 'ordering=-upvotes_count';
      } else if (filters.sortBy === 'created_at') {
        url += (boardId || filters.status) ? '&' : '?';
        url += 'ordering=-created_at';
      }
      
      const response = await api.get(url);
      setFeedbacks(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (feedbackId) => {
    try {
      const response = await api.post(`/feedback/${feedbackId}/upvote/`);
      // Update the feedback in the list
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.map(feedback => 
          feedback.id === feedbackId 
            ? { 
                ...feedback, 
                upvotes_count: response.data.status === 'upvoted' 
                  ? feedback.upvotes_count + 1 
                  : feedback.upvotes_count - 1,
                is_upvoted: response.data.status === 'upvoted'
              }
            : feedback
        )
      );
    } catch (err) {
      console.error('Upvote error:', err);
    }
  };

  const handleDelete = async (feedbackId, feedbackTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${feedbackTitle}"?`)) {
      return;
    }

    try {
      await api.delete(`/feedback/${feedbackId}/`);
      setFeedbacks(prevFeedbacks => 
        prevFeedbacks.filter(feedback => feedback.id !== feedbackId)
      );
    } catch (err) {
      setError('Failed to delete feedback');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {boardId ? 'Board Feedback' : 'All Feedback'}
        </h1>
        <Link
          to={boardId ? `/board/${boardId}/feedback/create` : '/feedback/create'}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Create Feedback
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="created_at">Newest First</option>
              <option value="upvotes">Most Upvoted</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {feedbacks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No feedback found. Create the first feedback to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white shadow rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link
                    to={`/feedback/${feedback.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {feedback.title}
                  </Link>
                  <p className="text-gray-600 mt-2 line-clamp-2">
                    {feedback.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                    {getStatusText(feedback.status)}
                  </span>
                  
                  {(feedback.created_by === user?.id || user?.is_admin || user?.is_moderator) && (
                    <>
                      <Link
                        to={`/feedback/${feedback.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(feedback.id, feedback.title)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>By {feedback.created_by}</span>
                  <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                  {feedback.board && (
                    <Link
                      to={`/board/${feedback.board}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Board: {feedback.board}
                    </Link>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  {feedback.tags && feedback.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {feedback.tags.slice(0, 2).map((tag) => (
                        <span key={tag.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag.name}
                        </span>
                      ))}
                      {feedback.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{feedback.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleUpvote(feedback.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      feedback.is_upvoted
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>⬆</span>
                    <span>{feedback.upvotes_count}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList; 
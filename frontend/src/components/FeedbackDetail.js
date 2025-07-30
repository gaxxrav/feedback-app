import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FeedbackDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoting, setUpvoting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/feedback/${id}/`);
      setFeedback(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      const response = await api.post(`/feedback/${id}/upvote/`);
      
      setFeedback(prev => ({
        ...prev,
        upvotes_count: response.data.status === 'upvoted' 
          ? prev.upvotes_count + 1 
          : prev.upvotes_count - 1,
        is_upvoted: response.data.status === 'upvoted'
      }));
    } catch (err) {
      console.error('Upvote error:', err);
    } finally {
      setUpvoting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setChangingStatus(true);
      await api.post(`/feedback/${id}/change_status/`, { status: newStatus });
      
      setFeedback(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (err) {
      setError('Failed to change status');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${feedback.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/feedback/${id}/`);
      navigate('/feedback');
    } catch (err) {
      setError('Failed to delete feedback');
    } finally {
      setDeleting(false);
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

  const canEdit = feedback && (
    feedback.created_by === user?.id || 
    user?.is_admin || 
    user?.is_moderator
  );

  const canChangeStatus = feedback && (
    feedback.created_by === user?.id || 
    user?.is_admin || 
    user?.is_moderator
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8 text-gray-500">
          Feedback not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link
          to="/feedback"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Feedback
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{feedback.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
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
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(feedback.status)}`}>
              {getStatusText(feedback.status)}
            </span>
            
            {canEdit && (
              <>
                <Link
                  to={`/feedback/${id}/edit`}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{feedback.description}</p>
        </div>

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {feedback.tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status Management */}
        {canChangeStatus && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Status</h2>
            <div className="flex space-x-2">
              {['open', 'in_progress', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={changingStatus || feedback.status === status}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    feedback.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upvotes */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upvotes</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                feedback.is_upvoted
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              <span>👍</span>
              <span>{feedback.upvotes_count} upvotes</span>
            </button>
            {feedback.is_upvoted && (
              <span className="text-sm text-gray-500">You upvoted this feedback</span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-500">
            <p>Created: {new Date(feedback.created_at).toLocaleString()}</p>
            {feedback.updated_at !== feedback.created_at && (
              <p>Last updated: {new Date(feedback.updated_at).toLocaleString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail; 
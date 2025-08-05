import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

const FeedbackCard = ({ feedback, isDragging }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({ id: feedback.id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
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
      case 'resolved':
        return 'Resolved';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-3">
        <Link
          to={`/feedback/${feedback.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
        >
          {feedback.title}
        </Link>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
          {getStatusText(feedback.status)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {feedback.description}
      </p>

      {/* Tags */}
      {feedback.tags && feedback.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
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

      {/* Card Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          <span>By {feedback.created_by}</span>
          <span>•</span>
          <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>👍</span>
          <span>{feedback.upvotes_count || 0}</span>
        </div>
      </div>

      {/* Drag Handle */}
      <div className="mt-2 flex justify-center">
        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default FeedbackCard; 
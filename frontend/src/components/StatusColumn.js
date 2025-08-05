import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import FeedbackCard from './FeedbackCard';

const StatusColumn = ({ status, label, feedbacks, color }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  console.log('StatusColumn drop zone:', { status, isOver });

  // Ensure feedbacks is an array
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        </div>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
          {safeFeedbacks.length}
        </span>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-50 rounded-lg p-4 min-h-[500px] transition-colors ${
          isOver ? 'bg-gray-100' : ''
        }`}
        data-status={status}
      >
        <div className="space-y-3">
          {safeFeedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No feedback</p>
            </div>
          ) : (
            safeFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                isDragging={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusColumn; 
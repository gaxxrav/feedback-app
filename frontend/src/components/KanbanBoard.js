import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusColumn from './StatusColumn';
import FeedbackCard from './FeedbackCard';

const KanbanBoard = () => {
  const { user } = useAuth();
  const [kanbanData, setKanbanData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (user) {
      fetchKanbanData();
    }
  }, [user]);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/kanban/');
      setKanbanData(response.data);
    } catch (err) {
      console.error('Error fetching kanban data:', err);
      setError(err.response?.data?.detail || 'Failed to fetch Kanban data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    console.log('Drag end event:', { 
      active: { id: active.id, data: active.data }, 
      over: { id: over?.id, data: over?.data } 
    });

    if (!over || active.id === over.id) {
      return;
    }

    const activeFeedback = findFeedbackById(active.id);
    
    // Check if the target is a status column (droppable) or another feedback item
    const targetStatus = over.id;
    
    console.log('Target status:', targetStatus, 'Type:', typeof targetStatus);
    
    // Validate that we have the required data
    if (!activeFeedback) {
      console.error('Active feedback not found:', active.id);
      return;
    }

    // Check if targetStatus is a valid status (not a feedback ID)
    const validStatuses = ['open', 'in_progress', 'resolved', 'completed'];
    if (!validStatuses.includes(targetStatus)) {
      console.error('Invalid target status:', targetStatus, 'Valid statuses:', validStatuses);
      return;
    }

    if (!kanbanData[activeFeedback.status] || !kanbanData[targetStatus]) {
      console.error('Invalid status:', { current: activeFeedback.status, target: targetStatus });
      return;
    }

    if (activeFeedback.status === targetStatus) {
      return;
    }

    // Optimistically update the UI
    const optimisticData = { ...kanbanData };
    
    // Remove from old status
    if (optimisticData[activeFeedback.status] && optimisticData[activeFeedback.status].feedbacks) {
      optimisticData[activeFeedback.status].feedbacks = optimisticData[activeFeedback.status].feedbacks.filter(
        f => f.id !== activeFeedback.id
      );
    }
    
    // Add to new status
    const updatedFeedback = { ...activeFeedback, status: targetStatus };
    if (optimisticData[targetStatus] && optimisticData[targetStatus].feedbacks) {
      optimisticData[targetStatus].feedbacks.unshift(updatedFeedback);
    }
    
    setKanbanData(optimisticData);

    // Send API request
    try {
      setUpdatingStatus(true);
      await api.patch(`/feedback/${activeFeedback.id}/`, {
        status: targetStatus
      });
    } catch (err) {
      // Revert on error
      console.error('Failed to update status:', err);
      fetchKanbanData();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const findFeedbackById = (id) => {
    for (const status in kanbanData) {
      const feedback = kanbanData[status].feedbacks.find(f => f.id === parseInt(id));
      if (feedback) return feedback;
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'completed':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-8 text-gray-500">
          Please log in to view the Kanban board.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Validate kanbanData structure
  if (!kanbanData || Object.keys(kanbanData).length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-8 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const statuses = Object.keys(kanbanData);
  const allFeedbacks = statuses.flatMap(status => 
    kanbanData[status]?.feedbacks?.map(feedback => feedback.id) || []
  );

  console.log('Rendering KanbanBoard with:', { 
    statuses, 
    kanbanDataKeys: Object.keys(kanbanData),
    totalFeedbacks: allFeedbacks.length 
  });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kanban Board</h1>
        <p className="text-gray-600">Drag and drop feedback items to change their status</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statuses.map((status) => (
            <StatusColumn
              key={status}
              status={status}
              label={kanbanData[status]?.label || status}
              feedbacks={kanbanData[status]?.feedbacks || []}
              color={getStatusColor(status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <FeedbackCard
              feedback={findFeedbackById(activeId)}
              isDragging={true}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {updatingStatus && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-md shadow-lg">
          Updating status...
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 
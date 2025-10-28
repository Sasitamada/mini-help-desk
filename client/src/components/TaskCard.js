import React from 'react';
import { format } from 'date-fns';

const TaskCard = ({ task, onClick, onDragStart }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  return (
    <div
      className="task-card"
      onClick={onClick}
      draggable={true}
      onDragStart={onDragStart}
      style={{ cursor: 'grab' }}
    >
      <div className="task-title">{task.title}</div>
      {task.description && (
        <div style={{ 
          fontSize: '12px', 
          color: '#6c757d', 
          marginBottom: '8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {task.description}
        </div>
      )}
      
      <div className="task-meta">
        <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span style={{ color: new Date(task.dueDate) < new Date() ? '#c72525' : '#6c757d' }}>
            📅 {format(new Date(task.dueDate), 'MMM dd')}
          </span>
        )}
        {task.subtasks && task.subtasks.length > 0 && (
          <span>
            ✓ {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

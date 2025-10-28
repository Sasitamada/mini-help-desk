import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';

const TaskModal = ({ task, onClose, onSave, onDelete, project }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignedTo: null
  });

  const [subtasks, setSubtasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo || null
      });
      setSubtasks(task.subtasks || []);
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    if (task) {
      try {
        const response = await commentsAPI.getByTask(task._id);
        setComments(response.data);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      subtasks
    });
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { title: newSubtask, completed: false }]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const handleDeleteSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task) {
      try {
        await commentsAPI.create({
          content: newComment,
          task: task._id,
          author: '507f1f77bcf86cd799439011' // Mock user ID
        });
        setNewComment('');
        loadComments();
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
        <div className="modal-header">
          <div className="modal-title">{task ? 'Edit Task' : 'Create New Task'}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Task Title</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        {/* Subtasks */}
        <div className="form-group">
          <label className="form-label">Subtasks</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add subtask"
            />
            <button className="btn btn-secondary" onClick={handleAddSubtask}>Add</button>
          </div>
          {subtasks.map((subtask, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px',
              background: '#f7f8f9',
              borderRadius: '4px',
              marginBottom: '4px'
            }}>
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleToggleSubtask(index)}
              />
              <span style={{ flex: 1, textDecoration: subtask.completed ? 'line-through' : 'none' }}>
                {subtask.title}
              </span>
              <button 
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => handleDeleteSubtask(index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Comments (only show if editing existing task) */}
        {task && (
          <div className="form-group">
            <label className="form-label">Comments</label>
            <div style={{ marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
              {comments.map(comment => (
                <div key={comment._id} style={{ 
                  padding: '12px',
                  background: '#f7f8f9',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                    {comment.author?.fullName || comment.author?.username || 'User'}
                  </div>
                  <div style={{ fontSize: '14px' }}>{comment.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
              />
              <button className="btn btn-primary" onClick={handleAddComment}>Post</button>
            </div>
          </div>
        )}

        <div className="button-group" style={{ justifyContent: 'space-between', marginTop: '24px' }}>
          <div>
            {task && onDelete && (
              <button className="btn" style={{ background: '#fee', color: '#c72525' }} onClick={onDelete}>
                Delete Task
              </button>
            )}
          </div>
          <div>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;

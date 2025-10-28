import React, { useState } from 'react';

const CreateWorkspaceModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#7b68ee'
  });

  const handleSubmit = () => {
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const colors = [
    '#7b68ee', '#4a9eff', '#2ecc71', '#e74c3c', 
    '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New Workspace</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <label className="form-label">Workspace Name</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter workspace name"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  border: formData.color === color ? '3px solid #333' : '2px solid #e0e0e0',
                  background: color,
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
        <div className="button-group" style={{ justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create Workspace</button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;

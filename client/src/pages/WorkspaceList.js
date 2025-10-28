import React, { useState, useEffect } from 'react';
import { workspacesAPI, projectsAPI } from '../services/api';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' });

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await workspacesAPI.getAll();
      setWorkspaces(response.data);
      if (response.data.length > 0 && !selectedWorkspace) {
        handleWorkspaceSelect(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };

  const handleWorkspaceSelect = async (workspace) => {
    setSelectedWorkspace(workspace);
    try {
      const response = await projectsAPI.getByWorkspace(workspace._id);
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      await workspacesAPI.create(newWorkspace);
      setShowCreateModal(false);
      setNewWorkspace({ name: '', description: '' });
      loadWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      await projectsAPI.create({
        ...projectData,
        workspace: selectedWorkspace._id
      });
      loadProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const loadProjects = async () => {
    if (selectedWorkspace) {
      try {
        const response = await projectsAPI.getByWorkspace(selectedWorkspace._id);
        setProjects(response.data);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>
        Workspaces
      </h1>

      {/* Workspaces List */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {workspaces.map(workspace => (
              <div
                key={workspace.id}
                onClick={() => handleWorkspaceSelect(workspace)}
                className="card"
                style={{ 
                  minWidth: '280px',
                  cursor: 'pointer',
                  border: selectedWorkspace?.id === workspace.id ? '2px solid #7b68ee' : '1px solid #e0e0e0'
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '8px', 
                  background: workspace.color || '#7b68ee' 
                }}
              ></div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{workspace.name}</h3>
            </div>
            <p style={{ fontSize: '14px', color: '#6c757d' }}>
              {workspace.description || 'No description'}
            </p>
          </div>
        ))}
        
        <div
          onClick={() => setShowCreateModal(true)}
          className="card"
          style={{ 
            minWidth: '280px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #e0e0e0',
            color: '#6c757d'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>+</div>
            <div>New Workspace</div>
          </div>
        </div>
      </div>

      {/* Projects List for Selected Workspace */}
      {selectedWorkspace && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: '600' }}>
            Projects in {selectedWorkspace.name}
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {projects.map(project => (
              <div key={project.id} className="card" style={{ minWidth: '240px', cursor: 'pointer' }} onClick={() => window.location.href = `/project/${project.id}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '6px', 
                      background: project.color || '#4a9eff' 
                    }}
                  ></div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{project.name}</h4>
                </div>
                <p style={{ fontSize: '13px', color: '#6c757d' }}>
                  {project.description || 'No description'}
                </p>
              </div>
            ))}
            <div
              onClick={() => handleCreateProject({ name: 'New Project', description: '' })}
              className="card"
              style={{ 
                minWidth: '240px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #e0e0e0',
                color: '#6c757d'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>+</div>
                <div>New Project</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create New Workspace</div>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Workspace Name</label>
              <input
                type="text"
                className="form-input"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                placeholder="Enter workspace name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows="3"
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="button-group" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateWorkspace}>
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;

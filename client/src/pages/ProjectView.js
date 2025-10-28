import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';

const ProjectView = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await projectsAPI.getById(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAll({ projectId });
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create({
        ...taskData,
        project: projectId,
        workspace: project?.workspace?._id || project?.workspace
      });
      loadTasks();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await tasksAPI.update(taskId, updates);
      loadTasks();
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSearch = async (query) => {
    try {
      const response = await tasksAPI.getAll({ projectId, search: query });
      setTasks(response.data);
    } catch (error) {
      console.error('Error searching tasks:', error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!project) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Project not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
            {project.name}
          </h1>
          <p style={{ color: '#6c757d' }}>{project.description || 'No description'}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Task
        </button>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <select className="form-select" style={{ width: 'auto' }}>
          <option>All Tasks</option>
          <option>My Tasks</option>
          <option>High Priority</option>
        </select>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search tasks..." 
          style={{ flex: '1', maxWidth: '300px' }}
        />
      </div>

      <KanbanBoard 
        tasks={tasks}
        onTaskClick={(task) => setSelectedTask(task)}
        onTaskDrop={handleTaskDrop}
      />

      {showCreateModal && (
        <TaskModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTask}
          project={project}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(updates) => handleUpdateTask(selectedTask._id, updates)}
          onDelete={() => {
            handleDeleteTask(selectedTask._id);
            setSelectedTask(null);
          }}
          project={project}
        />
      )}
    </div>
  );
};

export default ProjectView;

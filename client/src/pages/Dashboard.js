import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    doneTasks: 0,
    recentTasks: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await tasksAPI.getAll();
      const tasks = response.data;
      
      setStats({
        totalTasks: tasks.length,
        todoTasks: tasks.filter(t => t.status === 'todo').length,
        inProgressTasks: tasks.filter(t => t.status === 'inprogress').length,
        doneTasks: tasks.filter(t => t.status === 'done').length,
        recentTasks: tasks.slice(0, 10)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statusData = [
    { name: 'To Do', value: stats.todoTasks },
    { name: 'In Progress', value: stats.inProgressTasks },
    { name: 'Done', value: stats.doneTasks }
  ];

  const COLORS = ['#7b68ee', '#4a9eff', '#2ecc71'];

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '600' }}>
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Tasks</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>{stats.totalTasks}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>To Do</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7b68ee' }}>{stats.todoTasks}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>In Progress</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4a9eff' }}>{stats.inProgressTasks}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Done</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2ecc71' }}>{stats.doneTasks}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Task Status Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7b68ee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Recent Tasks</h3>
        {stats.recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
            No tasks yet. Create a workspace and start adding tasks!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recentTasks.map(task => (
              <div 
                key={task.id} 
                style={{ 
                  padding: '12px', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{task.title}</div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    Project • {task.status}
                  </div>
                </div>
                <div className={`priority-badge priority-${task.priority || 'medium'}`}>
                  {task.priority || 'medium'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

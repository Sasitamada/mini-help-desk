import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // TODO: Implement search functionality
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith('/workspaces/')) {
      return 'Workspace Details';
    }
    switch(location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/workspaces': return 'Workspaces';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-title">
          {getPageTitle()}
        </div>
      </div>
      <div className="header-actions">
        <div style={{ position: 'relative' }}>
          {showSearch ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                autoFocus
                style={{ width: '300px' }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSearch(false)}>Cancel</button>
            </form>
          ) : (
            <button className="btn btn-secondary" onClick={() => setShowSearch(true)}>
              🔍 Search
            </button>
          )}
        </div>
        <button className="btn btn-secondary" onClick={handleSettings}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
};

export default Header;

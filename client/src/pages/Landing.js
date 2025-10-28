import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleSignUpSuccess = () => {
    setShowSignUpModal(false);
  };

  return (
    <div className="landing-page">
      {/* Top Right Buttons */}
      <div className="landing-header">
        <button className="landing-btn-login" onClick={() => setShowLoginModal(true)}>
          Log In
        </button>
        <button className="landing-btn-signup" onClick={() => setShowSignUpModal(true)}>
          SignUp
        </button>
      </div>

      {/* Centered Content */}
      <div className="landing-center">
        <div className="landing-content">
          <h1 className="landing-title">
            A mini helpdesk here you can create Tasks,
          </h1>
          <h2 className="landing-subtitle">
            change status, and add comments.
          </h2>
          <button className="landing-btn-get-started" onClick={handleGetStarted}>
            Get Started
          </button>
          <p className="landing-free">Free Forever.</p>
        </div>
      </div>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
      
      {showSignUpModal && (
        <LoginModal
          onClose={() => setShowSignUpModal(false)}
          onSuccess={handleSignUpSuccess}
          isSignUp={true}
        />
      )}
    </div>
  );
};

export default Landing;
import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [twoFA, setTwoFA] = useState({
    sms: false,
    totp: false
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfileData({
      fullName: user.fullName || 'User Name',
      email: user.email || '',
      password: ''
    });
  }, []);

  const handleSave = () => {
    alert('Settings saved successfully!');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
      ...user,
      fullName: profileData.fullName,
      email: profileData.email
    }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 'bold', 
        marginBottom: '40px',
        color: '#1a1a1a'
      }}>
        My Settings
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '40px',
        marginBottom: '40px'
      }}>
        {/* Left Column */}
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            marginBottom: '12px',
            color: '#1a1a1a'
          }}>
            Profile
          </h2>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            Your personal information and account security settings.
          </p>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#1a1a1a'
            }}>
              Two-factor authentication (2FA)
            </h3>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              Keep your account secure by enabling 2FA via SMS or using a temporary one-time passcode (TOTP) from an authenticator app.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Avatar and Name */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#6b5ce6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {getInitials(profileData.fullName)}
            </div>
            <div>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '500',
                marginBottom: '4px',
                color: '#1a1a1a'
              }}>
                {profileData.fullName}
              </p>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '2px solid #e4e6e8',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                placeholder="Enter your full name"
              />
              <span style={{ 
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}>👤</span>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '2px solid #e4e6e8',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                placeholder="Enter your email"
              />
              <span style={{ 
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}>📧</span>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={profileData.password}
                onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '2px solid #e4e6e8',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                placeholder="Enter new password"
              />
              <span style={{ 
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px'
              }}>🔒</span>
            </div>
          </div>

          {/* 2FA Options */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                flex: 1
              }}>
                <input
                  type="checkbox"
                  checked={twoFA.sms}
                  onChange={(e) => setTwoFA({ ...twoFA, sms: e.target.checked })}
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
                  Text Message (SMS)
                </span>
              </label>
              <span style={{
                background: '#6b5ce6',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Business
              </span>
            </div>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '13px',
              marginLeft: '32px',
              marginBottom: '20px'
            }}>
              Receive a one-time passcode via SMS each time you log in.
            </p>
          </div>

          <div>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={twoFA.totp}
                onChange={(e) => setTwoFA({ ...twoFA, totp: e.target.checked })}
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
                Authenticator App (TOTP)
              </span>
            </label>
            <p style={{ 
              color: '#6c757d', 
              fontSize: '13px',
              marginLeft: '32px'
            }}>
              Use an app to receive a temporary one-time passcode each time you log in.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        paddingTop: '32px',
        borderTop: '1px solid #e4e6e8'
      }}>
        <button
          onClick={handleSave}
          style={{
            background: '#1a1a1a',
            color: 'white',
            padding: '14px 32px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#333'}
          onMouseOut={(e) => e.target.style.background = '#1a1a1a'}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export default Settings;

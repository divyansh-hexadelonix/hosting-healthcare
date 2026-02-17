import React, { useState, useEffect } from 'react';
import { useAuth } from './assets/AuthContext';
import { Edit2,Monitor, Verified } from 'lucide-react';
import './myProfile.css';

const MyProfile: React.FC = () => {
  const { user, login } = useAuth();

  // State for form fields (pre-filled with user data or placeholders)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    medicalLicense: user?.medicalLicense || '',
    contactNumber: user?.contactNumber || '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
          window.scrollTo(0, 0);
        }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        medicalLicense: user.medicalLicense || '',
        contactNumber: user.contactNumber || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (!user) {
      return; 
    }

    let passwordUpdated = false;

    // Fetch DB to update persistence
    const storedUsersJSON = localStorage.getItem('hh_users_db');
    let users = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const userIndex = users.findIndex((dbUser: any) => dbUser.email === user.email);

    // --- Password Update Logic ---
    if (formData.newPassword || formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        alert("New passwords do not match. Please try again.");
        return;
      }
      if (formData.newPassword.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
      }

      if (userIndex > -1) {
        users[userIndex].password = formData.newPassword;
        passwordUpdated = true;
      } else {
        alert("Error: Could not update password. User not found in the database");
        return;
      }
    }

    // --- Profile Details Update Logic (DB) ---
    if (userIndex > -1) {
      users[userIndex].name = formData.fullName;
      users[userIndex].contactNumber = formData.contactNumber;
      users[userIndex].medicalLicense = formData.medicalLicense;
      
      // Save back to localStorage
      localStorage.setItem('hh_users_db', JSON.stringify(users));
    }

    // --- Profile Details Update Logic (Context) ---
    login({
      ...user,
      name: formData.fullName,
      contactNumber: formData.contactNumber,
      medicalLicense: formData.medicalLicense,
    });

    // --- Reset form and show alert ---
    setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));

    if (passwordUpdated) {
      alert("Profile and password updated successfully!");
    } else {
      alert("Profile details updated successfully!");
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      medicalLicense: user?.medicalLicense || '',
      contactNumber: user?.contactNumber || '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card-container">
        
        {/* Purple Header Section */}
        <div className="profile-header-strip">
          <h1>Profile</h1>
        </div>

        <div className="profile-content-body">
          {/* User Avatar Section */}
          <div className="profile-user-section">
            <div className="profile-avatar-wrapper">
              <img 
                src={user?.profileImage || "https://ui-avatars.com/api/?background=random&name=" + (user?.name || 'User')} 
                alt="User" 
                className="main-profile-img" 
              />
              <button className="edit-avatar-btn">
                <Edit2 size={14} />
              </button>
            </div>
            <div className="profile-user-info">
              <h2 className="profile-user-name">
                {user?.name || ''} 
                <Verified size={18} className="verified-badge" fill="#6d28d9" color="white" />
              </h2>
              <p className="profile-user-email">{user?.email || ''}</p>
            </div>
          </div>

          {/* Form Section */}
          <form className="profile-form-grid">
            
            {/* Row 1 */}
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                readOnly 
                className="input-readonly"
              />
            </div>

            {/* Row 2 */}
            <div className="form-group">
              <label>Medical License Number</label>
              <input 
                type="text" 
                name="medicalLicense" 
                value={formData.medicalLicense} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleInputChange} 
              />
            </div>

            {/* Change Password Section */}
            <div className="full-width-section">
              <h3 className="section-heading">Change Password</h3>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                placeholder="**********" 
                value={formData.newPassword} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="**********" 
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
              />
            </div>

            {/* Membership Section */}
            <div className="full-width-section membership-section">
              <h3 className="section-heading">Membership</h3>
              <p className="active-plan-label">Active Plan</p>
              <p className="plan-name">Yearly Membership</p>
              
              <button type="button" className="renew-plan-btn">
                <Monitor size={18} className="btn-icon" /> 
                Renew Subscription Plan
              </button>
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="profile-footer-actions">
            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            <button className="update-btn" onClick={handleUpdate}>Update Profile</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
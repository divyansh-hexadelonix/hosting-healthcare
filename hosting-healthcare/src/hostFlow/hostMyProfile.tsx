import React, { useState, useEffect } from 'react';
import { Edit2,Monitor, Verified } from 'lucide-react';
import './hostMyProfile.css';

const MyProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  const loadHostUser = () => {
    const stored = localStorage.getItem('hh_host_user');
    if (stored) setUser(JSON.parse(stored));
  };

  useEffect(() => {
    loadHostUser();
  }, []);

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

    // --- Profile Details Update Logic (DB)
    if (userIndex > -1) {
      users[userIndex].name = formData.fullName;
      users[userIndex].contactNumber = formData.contactNumber;
      users[userIndex].medicalLicense = formData.medicalLicense;
      
      // Save back to localStorage
      localStorage.setItem('hh_users_db', JSON.stringify(users));
    }

    // --- Profile Details Update Logic (Context)
    const updatedUser = {
      ...user,
      name: formData.fullName,
      contactNumber: formData.contactNumber,
      medicalLicense: formData.medicalLicense,
    };
    
    localStorage.setItem('hh_host_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event('hh_host_user_updated'));

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
    <div className="host-profile-page-wrapper">
      <div className="host-profile-card-container">
        
        {/* Purple Header Section */}
        <div className="host-profile-header-strip">
          <h1>Profile</h1>
        </div>

        <div className="host-profile-content-body">
          {/* User Avatar Section */}
          <div className="host-profile-user-section">
            <div className="host-profile-avatar-wrapper">
              <img 
                src={user?.profileImage || "https://ui-avatars.com/api/?background=random&name=" + (user?.name || 'User')} 
                alt="User" 
                className="host-main-profile-img" 
              />
              <button className="host-edit-avatar-btn">
                <Edit2 size={14} />
              </button>
            </div>
            <div className="host-profile-user-info">
              <h2 className="host-profile-user-name">
                {user?.name || ''} 
                <Verified size={18} className="verified-badge" fill="#6d28d9" color="white" />
              </h2>
              <p className="host-profile-user-email">{user?.email || ''}</p>
            </div>
          </div>

          {/* Form Section */}
          <form className="host-profile-form-grid">
            
            {/* Row 1 */}
            <div className="host-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="host-form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                readOnly 
                className="host-input-readonly"
              />
            </div>

            {/* Row 2 */}
            <div className="host-form-group">
              <label>Medical License Number</label>
              <input 
                type="text" 
                name="medicalLicense" 
                value={formData.medicalLicense} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="host-form-group">
              <label>Contact Number</label>
              <input 
                type="text" 
                name="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleInputChange} 
              />
            </div>

            {/* Change Password Section */}
            <div className="host-full-width-section" style={{ marginTop: '-10px' }}>
              <h3 className="host-section-heading">Change Password</h3>
            </div>

            <div className="host-form-group" style={{ marginTop: '-4px'}}>
              <label>New Password</label>
              <input 
                type="password" 
                name="newPassword" 
                placeholder="**********" 
                value={formData.newPassword} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="host-form-group" style={{ marginTop: '-4px'}}>
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
            <div className="host-full-width-section host-membership-section">
              <h3 className="host-section-heading">Membership</h3>
              <p className="host-active-plan-label">Active Plan</p>
              <p className="host-plan-name">Yearly Membership</p>
              
              <button type="button" className="host-renew-plan-btn">
                <Monitor size={18} className="host-btn-icon" /> 
                Renew Subscription Plan
              </button>
            </div>
          </form>

          {/* Footer Buttons */}
          <div className="host-profile-footer-actions">
            <button className="host-cancel-btn" onClick={handleCancel}>Cancel</button>
            <button className="host-update-btn" onClick={handleUpdate}>Update Profile</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
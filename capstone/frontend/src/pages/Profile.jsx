import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Edit2, Save, X, Camera, CheckCircle } from 'lucide-react';
import CustomAlert from '../components/CustomAlert';
import { API_URL } from '../config/apiConfig';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userType, setUserType] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    university: '',
    major: '',
    graduationYear: '',
    company: '',
    industry: '',
    skills: [],
    hourlyRate: '',
    portfolio: ''
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const verified = localStorage.getItem('isVerified') === 'true';
    const type = localStorage.getItem('userType');
    
    setUserEmail(email);
    setIsVerified(verified);
    setUserType(type);
    
    // Load saved profile data scoped per user so different accounts don't leak
    const profileKey = `profileData:${email}`;
    const savedProfile = localStorage.getItem(profileKey);
    const legacyProfile = localStorage.getItem('profileData');
    const parsed = savedProfile ? JSON.parse(savedProfile) : legacyProfile ? JSON.parse(legacyProfile) : null;

    if (parsed) {
      setProfileData({ ...parsed, email }); // enforce current login email
    } else {
      setProfileData(prev => ({ ...prev, email: email || '' }));
    }

    // Clean up legacy key to avoid cross-account bleed
    if (legacyProfile) {
      localStorage.removeItem('profileData');
    }
    
    // Try to load from backend
    const loadFromBackend = async () => {
      try {
        const endpoint = type === 'student' ? `/student/profile?email=${encodeURIComponent(email)}` : `/client/profile/${encodeURIComponent(email)}`;
        const response = await fetch(`${API_URL}${endpoint}`);
        if (response.ok) {
          const backendProfile = await response.json();
          console.log('Loaded profile from backend:', backendProfile);
          setProfileData(prev => ({ ...prev, ...backendProfile, email }));
        }
      } catch (err) {
        console.log('Could not load from backend, using local:', err);
      }
    };
    
    if (email && type) {
      loadFromBackend();
    }
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const profileKey = `profileData:${userEmail}`;
    const dataToSave = { ...profileData, email: userEmail };
    
    // Save to localStorage (for immediate UI feedback)
    localStorage.setItem(profileKey, JSON.stringify(dataToSave));
    
    // Also save to allProfiles for public viewing
    const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '{}');
    allProfiles[userEmail] = { ...dataToSave, verified: isVerified };
    localStorage.setItem('allProfiles', JSON.stringify(allProfiles));
    
    // Determine endpoint based on user type
    const endpoint = userType === 'student' ? '/student/profile' : '/client/profile';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        const result = await response.json();
        setIsEditing(false);
        setAlert({ message: '✅ Profile updated and saved successfully!', type: 'success' });
        console.log('Backend save response:', result);
      } else {
        setIsEditing(false);
        setAlert({ message: '⚠️ Profile updated locally. Backend save failed, but data is retained.', type: 'warning' });
        console.error('Backend save failed:', response.status);
      }
    } catch (err) {
      setIsEditing(false);
      setAlert({ message: '⚠️ Profile updated locally. Network error, but data is retained.', type: 'warning' });
      console.error('Backend save error:', err);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleCancel = () => {
    const profileKey = `profileData:${userEmail}`;
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData({ ...parsed, email: userEmail });
    }
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Decorative Background */}
      <div className="absolute top-10 right-20 animate-float opacity-30">
        <div className="w-32 h-32 bg-gradient-to-br from-brand-orange/50 to-purple-500/50 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-20 animate-float-delayed opacity-30">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-500/50 to-cyan-500/50 rounded-full blur-3xl"></div>
      </div>

      {alert && (
        <CustomAlert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)}
          duration={3000}
        />
      )}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="rounded-2xl p-8 mb-8 border backdrop-blur-sm hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange to-brand-glow rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-brand-orange to-brand-glow rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <User className="w-12 h-12 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center hover:bg-orange-600 hover:scale-125 transition-all duration-300 shadow-lg">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {profileData.name || 'Your Name'}
              </h1>
              <p className="mb-3" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {isVerified ? (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">Verified Student</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-500/30">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-semibold">External Client</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-semibold">{userType === 'student' ? 'Student' : 'Client'}</span>
                </div>
              </div>
            </div>
            <div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-3 rounded-lg font-semibold transition border border-red-500/30"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Profile Information</h2>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                  style={{ 
                    backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                    color: 'var(--text-primary)', 
                    borderColor: 'var(--border-color)',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  className="w-full rounded-lg px-4 py-3 border outline-none transition cursor-not-allowed"
                  style={{ 
                    backgroundColor: 'var(--bg-dark)', 
                    color: 'var(--text-muted)', 
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                  style={{ 
                    backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                    color: 'var(--text-primary)', 
                    borderColor: 'var(--border-color)',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="City, State/Country"
                  className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                  style={{ 
                    backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                    color: 'var(--text-primary)', 
                    borderColor: 'var(--border-color)',
                    cursor: isEditing ? 'text' : 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Bio</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition resize-none"
                style={{ 
                  backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                  color: 'var(--text-primary)', 
                  borderColor: 'var(--border-color)',
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
            </div>

            {/* Student-Specific Fields */}
            {isVerified && (
              <>
                <div className="border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Academic Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>University</label>
                      <input
                        type="text"
                        name="university"
                        value={profileData.university}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="University name"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Major/Field of Study</label>
                      <input
                        type="text"
                        name="major"
                        value={profileData.major}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g., Computer Science"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Expected Graduation Year</label>
                      <input
                        type="text"
                        name="graduationYear"
                        value={profileData.graduationYear}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g., 2026"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Student Skills & Portfolio Section */}
            {isVerified && (
              <>
                <div className="border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Skills & Expertise</h3>
                  
                  {/* Skills Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Add Skills</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        disabled={!isEditing}
                        placeholder="e.g., React, Graphic Design, Content Writing..."
                        className="flex-1 rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                      <button
                        onClick={handleAddSkill}
                        disabled={!isEditing || !newSkill.trim()}
                        className="px-6 py-3 bg-brand-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Skills Display */}
                  <div className="flex flex-wrap gap-3">
                    {profileData.skills && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill, index) => {
                        const colors = [
                          'from-brand-orange/30 to-orange-500/30 text-brand-orange border-brand-orange/40',
                          'from-purple-500/30 to-pink-500/30 text-purple-400 border-purple-500/40',
                          'from-blue-500/30 to-cyan-500/30 text-blue-400 border-blue-500/40',
                          'from-green-500/30 to-emerald-500/30 text-green-400 border-green-500/40',
                          'from-yellow-500/30 to-amber-500/30 text-yellow-400 border-yellow-500/40',
                          'from-red-500/30 to-pink-500/30 text-red-400 border-red-500/40'
                        ];
                        const colorClass = colors[index % colors.length];
                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${colorClass} rounded-xl font-semibold border backdrop-blur-sm hover:scale-110 hover:shadow-lg transition-all duration-300`}
                          >
                            {skill}
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:scale-125 rounded-full w-5 h-5 flex items-center justify-center transition-all duration-200 hover:rotate-90"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        );
                      })
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No skills added yet</p>
                    )}
                  </div>

                  {/* Hourly Rate and Portfolio */}
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Hourly Rate (₹)</label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={profileData.hourlyRate}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g., 500"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Portfolio URL</label>
                      <input
                        type="url"
                        name="portfolio"
                        value={profileData.portfolio}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="https://your-portfolio.com"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Client-Specific Fields */}
            {!isVerified && (
              <>
                <div className="border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Business Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={profileData.company}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Company or organization"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Industry</label>
                      <input
                        type="text"
                        name="industry"
                        value={profileData.industry}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g., Technology, Marketing"
                        className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                        style={{ 
                          backgroundColor: isEditing ? 'var(--input-bg)' : 'var(--bg-dark)', 
                          color: 'var(--text-primary)', 
                          borderColor: 'var(--border-color)',
                          cursor: isEditing ? 'text' : 'not-allowed'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { User, Mail, Award, FileText, Camera } from 'lucide-react';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    skills: [],
    bio: '',
    rating: 0,
    verified: false,
    portfolio: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch student profile from backend
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/student/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        alert('Profile saved successfully!');
      }
    } catch (error) {
      alert('Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-8">Student Profile</h1>

          {/* Verification Badge */}
          {profile.verified && (
            <div className="mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              <span className="text-green-400">✓ University Verified</span>
            </div>
          )}

          {/* Profile Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> University Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-brand-dark rounded-lg px-4 py-3 text-brand-muted border border-white/10 cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-brand-muted mt-1">*Verified email cannot be changed</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <label className="block text-white text-sm font-semibold mb-2">Professional Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell clients about your experience and expertise..."
              rows="4"
              className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
            />
          </div>

          {/* Skills */}
          <div className="mb-8">
            <label className="block text-white text-sm font-semibold mb-2">Skills</label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., JavaScript, Graphic Design)"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 bg-brand-dark rounded-lg px-4 py-2 text-white border border-white/10 focus:border-brand-orange outline-none"
              />
              <button
                onClick={addSkill}
                className="bg-brand-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <div key={idx} className="bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                  {skill}
                  <button onClick={() => removeSkill(idx)} className="hover:text-red-400">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8 p-4 bg-brand-dark rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-brand-muted">Your Rating</span>
              <span className="text-2xl font-bold text-brand-orange">{profile.rating} ⭐</span>
            </div>
          </div>

          {/* Portfolio */}
          <div className="mb-8">
            <label className="block text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Portfolio
            </label>
            <button className="w-full border-2 border-dashed border-brand-orange/50 rounded-lg p-8 hover:border-brand-orange transition flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-brand-orange" />
              <span className="text-brand-orange">Upload Portfolio Work</span>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

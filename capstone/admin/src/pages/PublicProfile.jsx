import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, GraduationCap, Star, MessageCircle, Calendar, Award, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [userType, setUserType] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    // Get current user
    const currentUser = localStorage.getItem('userEmail');
    setCurrentUserId(currentUser);

    const loadProfile = async () => {
      const savedProfiles = JSON.parse(localStorage.getItem('allProfiles') || '{}');
      let profile = null;
      let type = '';

      try {
        const studentRes = await fetch(`${API_URL}/student/profile/${encodeURIComponent(userId)}`);
        if (studentRes.ok) {
          profile = await studentRes.json();
          type = 'student';
        } else {
          const clientRes = await fetch(`${API_URL}/client/profile/${encodeURIComponent(userId)}`);
          if (clientRes.ok) {
            profile = await clientRes.json();
            type = 'client';
          }
        }
      } catch (err) {
        console.error('Public profile fetch failed:', err);
      }

      if (!profile) {
        profile = savedProfiles[userId] || null;
        type = profile ? (profile.verified ? 'student' : 'client') : '';
      }

      if (!profile) {
        // Return minimal profile if not found (don't show dummy data)
        profile = {
          name: userId.split('@')[0] || 'User',
          email: userId,
          phone: '',
          bio: 'No profile information available.',
          location: '',
          university: '',
          major: '',
          graduationYear: '',
          company: '',
          industry: '',
          rating: 0,
          completedOrders: 0,
          responseTime: '',
          memberSince: '',
          skills: [],
          verified: userId.includes('edu') || userId.includes('.ac') || userId.includes('lpu.in')
        };
        type = profile.verified ? 'student' : 'client';
      }

      profile.name = profile.name || userId.split('@')[0] || 'User';
      profile.email = profile.email || userId;

      setProfileData(profile);
      setUserType(type || (profile.verified ? 'student' : 'client'));
    };

    loadProfile();
  }, [userId]);

  const handleStartChat = () => {
    navigate(`/messages?user=${userId}`);
  };

  if (!profileData) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="rounded-2xl p-8 mb-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-brand-orange to-brand-glow rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-white" />
              </div>
              {userType === 'student' && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Verified Student</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {profileData.name}
                  </h1>
                  {profileData.location && (
                    <p className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                      <MapPin className="w-4 h-4" />
                      {profileData.location}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleStartChat}
                  className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send Message
                </button>
              </div>

              {profileData.bio && (
                <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {profileData.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profileData.rating}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Rating</p>
                </div>

                <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-brand-orange" />
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profileData.completedOrders}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Orders</p>
                </div>

                <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                  <div className="mb-1">
                    <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profileData.responseTime}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Response Time</p>
                </div>

                <div className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {profileData.memberSince}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Education/Business Info */}
          <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            {userType === 'student' ? (
              <>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <GraduationCap className="w-6 h-6 text-brand-orange" />
                  Education
                </h2>
                {profileData.university && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>University</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{profileData.university}</p>
                  </div>
                )}
                {profileData.major && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Major</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{profileData.major}</p>
                  </div>
                )}
                {profileData.graduationYear && (
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Expected Graduation</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{profileData.graduationYear}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Briefcase className="w-6 h-6 text-brand-orange" />
                  Business Info
                </h2>
                {profileData.company && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Company</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{profileData.company}</p>
                  </div>
                )}
                {profileData.industry && (
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Industry</p>
                    <p className="text-lg" style={{ color: 'var(--text-primary)' }}>{profileData.industry}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <div className="rounded-2xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-lg font-semibold border border-brand-orange/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl p-6 mt-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p style={{ color: 'var(--text-primary)' }}>{profileData.email}</p>
            </div>
            {profileData.phone && (
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Phone</p>
                <p style={{ color: 'var(--text-primary)' }}>{profileData.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

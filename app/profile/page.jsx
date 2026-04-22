"use client";
import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Mail, PlusCircle, Loader2, FileText, CalendarDays, Edit3, Github, Linkedin, Twitter, Globe, Facebook, Youtube, Instagram, Trash2, Save, X, Award, Eye, Building2, Briefcase, ThumbsUp, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/Navbar';
import Login from '../../components/Login';
import ProfileCard from '../../components/Card';
import ProfileAvatar from '../../components/ProfileAvatar';
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";
import ShareProfileButton from '../../components/ShareProfileButton';

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/25 dark:bg-slate-950/70 backdrop-blur-sm transition-colors duration-500">
    <div className="relative flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.2)] transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-900/95">
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl animate-pulse dark:bg-cyan-400/10" />
      <span className="absolute h-16 w-16 rounded-full border border-blue-500/25 border-t-blue-600 animate-spin dark:border-cyan-400/25 dark:border-t-cyan-300" />
      <div className="relative h-11 w-11">
        <Image src="/app_icon.png" alt="theInterview loading" fill className="object-contain" />
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const email = session?.user?.email || "john.doe@example.com";
  const [globalLoading, setGlobalLoading] = useState(false);

  // New states for profile fields
  const [profileData, setProfileData] = useState({
    headline: '',
    about: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      leetcode: '',
      codeforces: '',
      codechef: '',
      youtube: '',
      instagram: '',
      custom: []
    },
    college: '',
    branch: '',
    batch: '',
    role: '',
    currentCompany: '',
    views: 0
  });

  const profile_pic = resolveProfileImage({ ...profileData, image: session?.user?.image });
  const name = resolveProfileName({ ...profileData, name: session?.user?.name });
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null); // 'headline', 'about', 'skills', 'education', 'social'
  const [editingSocialField, setEditingSocialField] = useState(null); // 'linkedin', 'twitter', etc.
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (status === 'loading' || !session) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [status, session]);

  useEffect(() => {
    if (!email) return;

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    const fetchProfileData = async () => {
      try {
        const response = await fetch(`/api/user/profile?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setProfileData({
              headline: data.user.headline || '',
              about: data.user.about || '',
              skills: data.user.skills || [],
              socialLinks: {
                linkedin: data.user.socialLinks?.linkedin || '',
                twitter: data.user.socialLinks?.twitter || '',
                facebook: data.user.socialLinks?.facebook || '',
                leetcode: data.user.socialLinks?.leetcode || '',
                codeforces: data.user.socialLinks?.codeforces || '',
                codechef: data.user.socialLinks?.codechef || '',
                youtube: data.user.socialLinks?.youtube || '',
                instagram: data.user.socialLinks?.instagram || '',
                custom: data.user.socialLinks?.custom || []
              },
              college: data.user.college || '',
              branch: data.user.branch || '',
              batch: data.user.batch || '',
              role: data.user.role || '',
              currentCompany: data.user.currentCompany || '',
              views: data.user.views || 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchPosts();
    if (status === 'authenticated' && session?.user?.email) {
      fetchProfileData();
    }
  }, [email, status]);

  const stats = React.useMemo(() => {
    if (!posts || posts.length === 0) return null;
    const totalReads = posts.reduce((sum, item) => sum + (Number(item?.views) || 0), 0);
    const totalLikes = posts.reduce((sum, item) => sum + (Array.isArray(item?.likes) ? item.likes.length : 0), 0);
    const uniqueCompanies = new Set(posts.map((item) => item.company).filter(Boolean));
    return {
      posts: posts.length,
      reads: totalReads,
      likes: totalLikes,
      companies: uniqueCompanies.size
    };
  }, [posts]);

  const handleSaveProfile = async (dataToSave = profileData) => {
    setSavingProfile(true);
    try {
      if (editingSocialField) setEditingSocialField(null);
      if (showSocialOptions) setShowSocialOptions(false);
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (response.ok) {
        setIsEditing(false);
        setEditingField(null);
        setEditingSocialField(null);
        setProfileData(dataToSave);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileData.skills.includes(skillInput.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleCustomLinkAdd = () => {
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        custom: [...profileData.socialLinks.custom, { name: '', url: '' }]
      }
    });
  };

  const handleCustomLinkUpdate = (index, field, value) => {
    const updatedCustom = [...profileData.socialLinks.custom];
    updatedCustom[index][field] = value;
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        custom: updatedCustom
      }
    });
  };

  const handleCustomLinkRemove = (index) => {
    setProfileData({
      ...profileData,
      socialLinks: {
        ...profileData.socialLinks,
        custom: profileData.socialLinks.custom.filter((_, i) => i !== index)
      }
    });
  };

  if (status === 'loading') {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.1),transparent_34%),linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] transition-colors duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
        <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/20" />
        <div className="pointer-events-none absolute right-[-100px] top-60 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/20" />
        <div className="relative flex min-h-screen items-center justify-center">
          <div className="relative flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.2)] transition-colors duration-500 dark:border-slate-700/80 dark:bg-slate-900/95">
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl animate-pulse dark:bg-cyan-400/10" />
            <span className="absolute h-16 w-16 rounded-full border border-blue-500/25 border-t-blue-600 animate-spin dark:border-cyan-400/25 dark:border-t-cyan-300" />
            <div className="relative h-11 w-11">
              <Image src="/app_icon.png" alt="theInterview loading" fill className="object-contain" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.1),transparent_34%),linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] transition-colors duration-500">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
        <Navbar showThemeToggle />
        {globalLoading && <LoadingScreen />}
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 transition-colors duration-500">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white dark:border-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.15)]">
                <ProfileAvatar src={profile_pic} alt="Profile" name={name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{name}</h1>
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 dark:bg-slate-800 px-4 py-2 text-slate-700 dark:text-slate-300 md:justify-start">
                  <Mail size={16} className="text-blue-600" />
                  <span>{email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/25 dark:bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 p-8 shadow-2xl">
            <Login />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.1),transparent_34%),linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.38),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(15,23,42,0.06),transparent_45%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.06),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(2,6,23,0.72),transparent_52%)]" />
      <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/20" />
      <div className="pointer-events-none absolute right-[-100px] top-60 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-500/20" />

      <Navbar showThemeToggle />

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Headline</label>
                  <input
                    type="text"
                    value={profileData.headline}
                    onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                    placeholder="e.g. Software Engineer at Google"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Skills (Press Enter or click Add)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                      placeholder="e.g. React"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                    />
                    <button onClick={addSkill} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Add</button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {skill}
                        <button onClick={() => removeSkill(skill)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">About Me</label>
                <textarea
                  value={profileData.about}
                  onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                  rows={4}
                  placeholder="Tell others about your background and experience..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b pb-2 dark:border-slate-800">Social Links</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { id: 'linkedin', icon: <Linkedin size={18} />, label: 'LinkedIn' },
                    { id: 'twitter', icon: <Twitter size={18} />, label: 'Twitter' },
                    { id: 'facebook', icon: <Facebook size={18} />, label: 'Facebook' },
                    { id: 'leetcode', icon: <Award size={18} />, label: 'LeetCode' },
                    { id: 'codeforces', icon: <Award size={18} />, label: 'Codeforces' },
                    { id: 'codechef', icon: <Award size={18} />, label: 'CodeChef' },
                    { id: 'youtube', icon: <Youtube size={18} />, label: 'YouTube' },
                    { id: 'instagram', icon: <Instagram size={18} />, label: 'Instagram' },
                  ].map(({ id, icon, label }) => (
                    <div key={id} className="space-y-1">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {icon}
                        {label}
                      </label>
                      <input
                        type="text"
                        value={profileData.socialLinks[id]}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          socialLinks: { ...profileData.socialLinks, [id]: e.target.value }
                        })}
                        placeholder={`https://${id}.com/username`}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Custom Links</h4>
                    <button onClick={handleCustomLinkAdd} className="text-xs font-semibold text-blue-600 hover:text-blue-700">+ Add Link</button>
                  </div>
                  {profileData.socialLinks.custom.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleCustomLinkUpdate(idx, 'name', e.target.value)}
                        placeholder="Link Name (e.g. Portfolio)"
                        className="w-1/3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleCustomLinkUpdate(idx, 'url', e.target.value)}
                        placeholder="URL"
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
                      />
                      <button onClick={() => handleCustomLinkRemove(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto mt-2 max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="rounded-3xl border border-slate-300/80 dark:border-slate-600/80 bg-white/90 dark:bg-slate-800/90 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 transition-colors duration-500">
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="relative group">
              <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-white ring-4 ring-blue-500/40 dark:border-slate-800 shadow-[0_16px_32px_rgba(15,23,42,0.18)] transition-all duration-300 group-hover:scale-105 dark:ring-cyan-400/35">
                <ProfileAvatar src={profile_pic || null} alt={`${name}'s profile picture`} name={name} className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex w-full items-center justify-between">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{name}</h1>
                  <div className="ml-3 shrink-0 flex items-center gap-2">
                    <ShareProfileButton email={email} name={name} />
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-500 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-red-900/20"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </div>

                {/* Headline Section */}
                {editingField === 'headline' ? (
                  <div className="flex items-center gap-2 max-w-lg">
                    <input
                      autoFocus
                      className="flex-1 rounded-lg border border-blue-500 bg-white dark:bg-slate-900 px-3 py-1.5 text-slate-900 dark:text-white outline-none ring-2 ring-blue-500/20"
                      value={profileData.headline}
                      onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                    />
                    <button onClick={() => handleSaveProfile()} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"><Save size={18} /></button>
                    <button onClick={() => setEditingField(null)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X size={18} /></button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    {profileData.headline ? (
                      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{profileData.headline}</p>
                    ) : (
                      <button
                        onClick={() => setEditingField('headline')}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-cyan-500/35 dark:bg-cyan-950/30 dark:text-cyan-300"
                      >
                        <PlusCircle size={14} /> Add headline
                      </button>
                    )}
                    {profileData.headline && (
                      <button onClick={() => setEditingField('headline')} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-500 transition-all">
                        <Edit3 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Education Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{email.replace(/(?<=.{2}).(?=[^@]*@)/g, '•')}</span>
                </div>

                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />



                <div className="flex flex-wrap items-center gap-2">
                  {/* College */}
                  {editingField === 'education' ? (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input placeholder="College" className="bg-transparent text-sm outline-none w-32" value={profileData.college} onChange={(e) => setProfileData({ ...profileData, college: e.target.value })} />
                      <input placeholder="Branch" className="bg-transparent text-sm outline-none w-24 border-l border-slate-200 px-2" value={profileData.branch} onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })} />
                      <input placeholder="Batch" className="bg-transparent text-sm outline-none w-16 border-l border-slate-200 px-2" value={profileData.batch} onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })} />
                      <input placeholder="Current Company" className="bg-transparent text-sm outline-none w-32 border-l border-slate-200 px-2" value={profileData.currentCompany} onChange={(e) => setProfileData({ ...profileData, currentCompany: e.target.value })} />
                      <button onClick={() => handleSaveProfile()} className="text-blue-600 font-bold text-xs px-2">SAVE</button>
                      <button onClick={() => setEditingField(null)}><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {(profileData.college || profileData.currentCompany) ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {profileData.college && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                              <Building2 size={12} /> {profileData.college} {profileData.branch} {profileData.batch}
                            </span>
                          )}
                          {profileData.currentCompany && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-xs font-semibold text-blue-600 dark:border-blue-800/30 dark:bg-blue-900/10 dark:text-blue-400">
                              <Briefcase size={12} /> @{profileData.currentCompany}
                            </span>
                          )}
                          <button onClick={() => setEditingField('education')} className="p-1 text-slate-400 hover:text-blue-500 transition-all"><Edit3 size={14} /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingField('education')}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <PlusCircle size={12} /> Add College / Company
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links Row */}
              <div className="border-t border-slate-100 dark:border-slate-800/50 pt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  {Object.entries(profileData.socialLinks).map(([key, value]) => {
                    if (key === 'custom' || !value) return null;
                    const icons = {
                      linkedin: <Linkedin size={18} />,
                      twitter: <Twitter size={18} />,
                      facebook: <Facebook size={18} />,
                      leetcode: <Award size={18} />,
                      codeforces: <Award size={18} />,
                      codechef: <Award size={18} />,
                      youtube: <Youtube size={18} />,
                      instagram: <Instagram size={18} />,
                      github: <Github size={18} />,
                    };
                    return (
                      <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-blue-500 dark:hover:text-blue-400">
                        {icons[key]}
                      </a>
                    );
                  })}
                </div>

                <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                {/* Inline Social Editor or active capsules */}
                {editingSocialField ? (
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-blue-500/50 shadow-sm ring-2 ring-blue-500/10 animate-in fade-in zoom-in duration-200">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase px-2">{editingSocialField}</span>
                    <input
                      autoFocus
                      placeholder={`Paste ${editingSocialField} link...`}
                      className="bg-transparent text-xs outline-none w-48 text-slate-900 dark:text-white"
                      value={profileData.socialLinks[editingSocialField] || ''}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        socialLinks: { ...profileData.socialLinks, [editingSocialField]: e.target.value }
                      })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                    />
                    <button onClick={() => handleSaveProfile()} className="text-blue-600 hover:text-blue-700 p-1"><Save size={14} /></button>
                    <button onClick={() => setEditingSocialField(null)} className="text-slate-400 hover:text-red-500 p-1"><X size={14} /></button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Only show active platform capsules */}
                    {['linkedin', 'github', 'twitter', 'leetcode', 'codeforces', 'codechef', 'youtube', 'instagram', 'facebook'].map(platform => {
                      const hasLink = !!profileData.socialLinks[platform];
                      if (!hasLink) return null;
                      return (
                        <button
                          key={platform}
                          onClick={() => setEditingSocialField(platform)}
                          className="text-[10px] font-bold uppercase py-1 px-2.5 rounded-full border bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 hover:scale-105 transition-all"
                        >
                          {platform}
                        </button>
                      );
                    })}

                    {/* Add Social Options */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSocialOptions(!showSocialOptions)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <PlusCircle size={12} /> ADD SOCIAL
                      </button>

                      {showSocialOptions && (
                        <div className="absolute left-0 top-full mt-2 z-20 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-64">
                          {['linkedin', 'github', 'twitter', 'leetcode', 'codeforces', 'codechef', 'youtube', 'instagram', 'facebook'].map(platform => (
                            <button
                              key={platform}
                              onClick={() => {
                                setEditingSocialField(platform);
                                setShowSocialOptions(false);
                              }}
                              className="text-[10px] font-bold uppercase py-1 px-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                            >
                              {platform}
                            </button>
                          ))}
                          <button onClick={() => setIsEditing(true)} className="w-full text-[10px] font-bold uppercase py-1.5 text-center bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 transition-colors">Manage Custom Links</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Section */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {profileData.skills.map(skill => (
                  <span key={skill} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-red-500"><X size={10} /></button>
                  </span>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Add skill"
                    className="rounded-full border border-slate-300/80 bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  {profileData.skills.length > 0 && <button onClick={() => handleSaveProfile()} className="text-[10px] font-bold text-blue-600 uppercase">Save Skills</button>}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mt-8 border-t border-slate-200/90 dark:border-slate-700/80 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">About</h3>
              {!profileData.about && !editingField === 'about' && (
                <button onClick={() => setEditingField('about')} className="text-sm text-blue-600 font-semibold flex items-center gap-1"><PlusCircle size={14} /> Add About</button>
              )}
              {profileData.about && editingField !== 'about' && (
                <button onClick={() => setEditingField('about')} className="text-slate-400 hover:text-blue-500"><Edit3 size={14} /></button>
              )}
            </div>

            {editingField === 'about' ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={4}
                  value={profileData.about}
                  onChange={(e) => setProfileData({ ...profileData, about: e.target.value })}
                  placeholder="Share a bit about your journey..."
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingField(null)} className="px-4 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={() => handleSaveProfile()} className="px-6 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-500/20">Save About</button>
                </div>
              </div>
            ) : profileData.about ? (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{profileData.about}</p>
            ) : (
              <div className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 py-3 text-slate-400 transition-all hover:border-blue-400 hover:text-blue-500 dark:border-slate-700" onClick={() => setEditingField('about')}>
                <div className="flex flex-col items-center justify-center">
                  <PlusCircle size={20} className="mb-1.5" />
                  <span className="text-sm font-medium">Add a bio to let people know you better</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {stats && (
        <div className="relative mx-auto mt-10 max-w-6xl px-4 sm:px-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-200/80 dark:border-blue-800/45 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Your Articles</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><FileText size={18} className="text-blue-600" /> {stats.posts}</div>
            </div>
            <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/45 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Reads</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><Eye size={18} className="text-indigo-600" /> {stats.reads}</div>
            </div>
            <div className="rounded-2xl border border-pink-200/80 dark:border-pink-800/45 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Likes</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><ThumbsUp size={18} className="text-pink-600" /> {stats.likes}</div>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/45 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">Companies Impacted</div>
              <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><Building2 size={18} className="text-emerald-600" /> {stats.companies}</div>
            </div>
          </section>
        </div>
      )}

      <div className="relative mx-auto mt-10 max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10">
        {/* Your Experiences section */}
        <section className="rounded-3xl border border-slate-300/80 dark:border-slate-600/80 bg-white/90 dark:bg-slate-800/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 transition-colors duration-500">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl md:text-2xl">
                Your Experiences{!loadingPosts && <span className="ml-2 inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/70 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-cyan-500/35 dark:bg-cyan-950/30 dark:text-cyan-300">{posts.length}</span>}
              </h2>
            </div>
            <Link href="/post">
              <button className="flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-[0.5px] hover:border-blue-300 hover:text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300 sm:px-5 sm:py-2.5 sm:text-sm">
                <PlusCircle size={16} />
                <span>Share Experience</span>
              </button>
            </Link>
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-blue-200/80 bg-blue-50/70 dark:border-cyan-700/50 dark:bg-cyan-900/20">
                <FileText size={26} className="text-blue-600 dark:text-cyan-300" />
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">No experiences shared yet</h3>
              <p className="text-slate-500 mb-6">Your interview story can help seniors prepare smarter.</p>
              <Link href="/post">
                <button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-500/20">Share Your First Experience</button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {posts.map((post) => (
                <div key={post.uid} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl">
                  <ProfileCard profile={{ ...post, profile_pic: profile_pic || post.profile_pic }} edit={true} deletePost={true} setGlobalLoading={setGlobalLoading} disableCardClick={true} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;

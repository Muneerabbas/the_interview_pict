import Link from "next/link";
import { MongoClient } from "mongodb";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Eye,
  FileText,
  GraduationCap,
  Mail,
  ThumbsUp,
  Linkedin,
  Twitter,
  Facebook,
  Globe,
  Youtube,
  Instagram,
  Award,
  Github
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProfileAvatar from "@/components/ProfileAvatar";
import ArticleCard from "@/components/ArticleCard";
import ShareProfileButton from "@/components/ShareProfileButton";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

const client = new MongoClient(process.env.MONGODB_URI);

async function getPublicProfile(email) {
  try {
    await client.connect();
    const db = client.db("int-exp");
    const experience = db.collection("experience");
    const userCollection = db.collection("user");

    const posts = await experience.find({ email }).sort({ date: -1 }).toArray();
    // Get user statistics and profile info
    const userData = await userCollection.findOneAndUpdate(
      { gmail: email },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!userData && (!posts || posts.length === 0)) {
      return { posts: [], stats: null, profile: null };
    }

    const totalReads = posts.reduce((sum, item) => sum + (Number(item?.views) || 0), 0);
    const totalLikes = posts.reduce((sum, item) => sum + (Array.isArray(item?.likes) ? item.likes.length : 0), 0);
    const companies = new Set(posts.map((item) => item.company).filter(Boolean));

    const first = posts[0];
    const profile = {
      name: resolveProfileName({ ...first, ...userData }),
      email,
      profilePic: resolveProfileImage({ ...first, ...userData }),
      branch: userData?.branch || first?.branch || "Branch not shared",
      batch: userData?.batch || first?.batch || "",
      role: userData?.role || first?.role || "Role not shared",
      college: userData?.college || "",
      currentCompany: userData?.currentCompany || "",
      headline: userData?.headline || "",
      about: userData?.about || "",
      views: userData?.views || 0,
      skills: userData?.skills || [],
      socialLinks: userData?.socialLinks || { custom: [] }
    };

    const stats = {
      posts: posts.length,
      reads: totalReads,
      likes: totalLikes,
      companies: companies.size,
    };

    return { posts, stats, profile };
  } catch (error) {
    console.error("Public profile fetch error:", error);
    return { posts: [], stats: null, profile: null };
  }
}

export default async function PublicProfilePage({ params }) {
  const resolvedParams = await params;
  const rawEmail = resolvedParams?.email || "";
  const email = decodeURIComponent(rawEmail);
  const { posts, stats, profile } = await getPublicProfile(email);

  const SocialIcon = ({ type, size = 18 }) => {
    const icons = {
      linkedin: <Linkedin size={size} />,
      twitter: <Twitter size={size} />,
      facebook: <Facebook size={size} />,
      leetcode: <Award size={size} />,
      codeforces: <Award size={size} />,
      codechef: <Award size={size} />,
      youtube: <Youtube size={size} />,
      instagram: <Instagram size={size} />,
      github: <Github size={size} />,
      custom: <Globe size={size} />
    };
    return icons[type] || <Globe size={size} />;
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.1),transparent_34%),linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)]" />
      <div className="pointer-events-none absolute left-[-140px] top-24 h-72 w-72 rounded-full bg-sky-300/30 dark:bg-sky-500/10 blur-3xl transition-colors duration-500" />
      <div className="pointer-events-none absolute right-[-120px] top-[320px] h-72 w-72 rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl transition-colors duration-500" />

      <Navbar />
      <ProfileViewTracker email={profile?.email} />

      <div className="relative mx-auto mt-2 max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="mb-4">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500/40 dark:hover:text-cyan-300"
          >
            <ArrowLeft size={16} />
            Back to feed
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/88 dark:bg-slate-800/88 p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 transition-colors duration-500">
          {profile ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white ring-2 ring-blue-500/40 dark:border-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.15)]">
                  <ProfileAvatar
                    src={profile.profilePic}
                    alt={profile.name}
                    name={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
                    <ShareProfileButton email={profile.email} name={profile.name} />
                  </div>
                  {profile.headline && (
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{profile.headline}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/85 dark:bg-slate-800 px-4 py-1.5 text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
                      <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm">{profile.email.replace(/(?<=.{2}).(?=[^@]*@)/g, "•")}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10 px-4 py-1.5 text-indigo-700 dark:text-indigo-300 shadow-sm transition-colors">
                      <Eye size={16} className="text-indigo-600 dark:text-indigo-400" />
                      <span className="text-sm font-semibold">{profile.views} Views</span>
                    </div>
                  </div>

                  {/* Social Links Row */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2 md:justify-start">
                    <div className="flex gap-4">
                      {Object.entries(profile.socialLinks).map(([key, value]) => {
                        if (key === 'custom' || !value) return null;
                        return (
                          <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-blue-500 dark:hover:text-blue-400">
                            <SocialIcon type={key} size={20} />
                          </a>
                        );
                      })}
                      {profile.socialLinks.custom?.map((link, idx) => (
                        <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-blue-500 dark:hover:text-blue-400" title={link.name}>
                          <Globe size={20} />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {profile.college && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <Building2 size={12} />
                    {profile.college}
                  </span>
                )}
                {profile.currentCompany && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                    <Briefcase size={12} />
                    {profile.currentCompany}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <GraduationCap size={12} />
                  {profile.branch} {profile.batch}
                </span>
                {profile.role && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300">
                    <Building2 size={12} />
                    {profile.role}
                  </span>
                )}
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  {profile.skills.map(skill => (
                    <span key={skill} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {profile.about && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{profile.about}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-600 dark:text-slate-300">
              No public profile found for this user.
            </div>
          )}
        </section>

        {stats && (
          <div className="relative mx-auto mt-6 max-w-6xl">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Articles</div>
                <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><FileText size={18} className="text-blue-600" /> {stats.posts}</div>
              </div>
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reads</div>
                <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><Eye size={18} className="text-indigo-600" /> {stats.reads}</div>
              </div>
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Likes</div>
                <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><ThumbsUp size={18} className="text-pink-600" /> {stats.likes}</div>
              </div>
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-white/90 dark:bg-slate-900/70 p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Companies</div>
                <div className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-slate-100"><Building2 size={18} className="text-emerald-600" /> {stats.companies}</div>
              </div>
            </section>
          </div>
        )}

        <div className="relative mx-auto mt-8 max-w-6xl pb-14">
          <section className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/88 dark:bg-slate-800/88 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Public Articles</h2>
            {posts.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">This user has not shared any articles yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {posts.map((post) => (
                  <ArticleCard key={post.uid || post._id?.toString()} article={post} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

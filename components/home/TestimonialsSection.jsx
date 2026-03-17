const blogPosts = [
  {
    author: "Siddhant Vishnu",
    title: "Community Member",
    content: "\"Unbelivable stuff from seniors ❤️!Can't ask for more\"",
    avatar: "S",
    avatarBg: "from-emerald-500 to-green-700",
  },
  {
    author: "Shlok S",
    title: "Community Member",
    content: "\"Bro abhi job lag jaegi\"",
    avatar: "S",
    avatarBg: "from-rose-500 to-pink-700",
  },
  {
    author: "Shreya Hiwarkar",
    title: "Community Member",
    content: "\"Great work ! Really helpful\"",
    avatar: "S",
    avatarBg: "from-amber-500 to-orange-700",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 py-20 text-slate-100 sm:py-24">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl">What Community Says 💬</h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-400 sm:text-base">
            Real feedback from candidates using The Interview Room to prepare better and share experiences.
          </p>
        </div>

      <div className="mx-auto flex w-full max-w-7xl gap-6 overflow-x-auto pb-2">
        {blogPosts.map((post, index) => (
          <article
            key={`${post.author}-${index}`}
            className="group min-w-[280px] max-w-[350px] rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(13,127,242,0.12)] sm:min-w-[320px] sm:max-w-[320px] sm:p-6"
          >
            <div className="mb-5 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${post.avatarBg} font-bold text-white ring-2 ring-primary/30`}>
                {post.avatar}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{post.author}</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">{post.title}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{post.content}</p>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Grid3X3, Search, User } from "lucide-react";
import { useMemo, useState } from "react";
import ProfileAvatar from "./ProfileAvatar";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/post", label: "Post" },
  { href: "/profile", label: "Profile" },
];

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const userImage = useMemo(() => session?.user?.image || "", [session?.user?.image]);

  const onSearch = (event) => {
    event.preventDefault();
    const query = searchText.trim() || "Himanshu-Nilay-Neeraj";
    router.push(`/search/${encodeURIComponent(query)}`);
  };

  const onAuthClick = async () => {
    if (session) {
      await signOut({ callbackUrl: "/" });
      return;
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-background-dark/95 backdrop-blur-md">
      <div className="overflow-x-auto">
        <div className="mx-auto flex h-20 min-w-[980px] max-w-[1600px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3 text-primary">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 shadow-[0_0_15px_rgba(13,127,242,0.3)]">
              <Grid3X3 size={18} className="text-primary" />
            </div>
            <h2 className="text-[32px] font-bold leading-none tracking-tight text-slate-100">The Interview Room</h2>
          </Link>

          <form onSubmit={onSearch} className="flex h-10 min-w-[280px] max-w-[520px] flex-1">
            <div className="flex h-full w-full items-stretch rounded-full border border-border-dark bg-surface-dark transition-all duration-300 focus-within:border-primary">
              <div className="flex items-center justify-center pl-4 text-slate-400">
                <Search size={18} />
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent text-sm font-normal text-slate-100 placeholder:text-slate-500 focus:ring-0"
                placeholder="Search companies, roles, or topics..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
          </form>

          <nav className="ml-auto flex shrink-0 items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative text-sm transition-colors ${
                    active ? "font-semibold text-primary" : "font-medium text-slate-400 hover:text-primary"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(13,127,242,0.6)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="h-6 w-px shrink-0 bg-border-dark" />

          <button
            onClick={onAuthClick}
            className="flex h-10 min-w-[96px] shrink-0 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-[0_4px_12px_rgba(13,127,242,0.3)] transition-all hover:bg-primary/90"
          >
            {session ? "Logout" : "Login"}
          </button>

          <Link
            href={session ? "/profile" : "/login"}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-surface-dark transition-colors hover:border-primary/50"
            aria-label="Profile"
          >
            {userImage ? (
              <ProfileAvatar
                src={userImage}
                alt="User profile avatar"
                className="size-full rounded-full object-cover"
              />
            ) : (
              <User size={18} className="text-slate-300" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

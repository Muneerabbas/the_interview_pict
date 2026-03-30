import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import TeamMemberCard from "../../components/TeamMemberCard";

import himg from "../../public/h1.jpg";
import nimg from "../../public/n2.jpg";
import niimg from "../../public/n1.jpg";
import m1img from "../../public/m1.jpeg";
import m2img from "../../public/m2.jpeg";
import logo from "../../public/app_icon.png";

const TeamPage = () => {
  return (
    <div className="min-h-screen bg-[#eef4ff] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar showThemeToggle />
      <div className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(14,165,233,0.18),_transparent_24%),linear-gradient(180deg,_#f7fbff_0%,_#eef4ff_55%,_#edf2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.28),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(37,99,235,0.2),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#0b1120_55%,_#111827_100%)]" />
        <div className="absolute left-[-8rem] top-28 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl team-float-slow dark:bg-cyan-500/15" />
        <div className="absolute right-[-5rem] top-20 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl team-float-delayed dark:bg-blue-500/15" />
        <div className="absolute bottom-16 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-indigo-300/20 blur-3xl team-float-slow dark:bg-indigo-500/15" />

        <div className="container relative mx-auto px-6 pb-16 pt-10">
          <div className="mx-auto max-w-6xl">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/65 px-6 py-12 shadow-[0_30px_80px_rgba(37,99,235,0.14)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_30px_80px_rgba(2,6,23,0.6)] sm:px-10 lg:px-14">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-cyan-500/50" />
              <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-cyan-500/10" />

              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="team-fade-up inline-flex items-center gap-3 rounded-full border border-blue-200/80 bg-blue-50/90 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm dark:border-cyan-500/40 dark:bg-cyan-950/35 dark:text-cyan-300">
                    <span className="team-pulse-dot h-2.5 w-2.5 rounded-full bg-blue-500 dark:bg-cyan-400" />
                    Students building in public
                  </div>

                  <div className="mt-6 flex items-center gap-4">
                    <div className="team-logo-glow relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-[0_20px_45px_rgba(37,99,235,0.35)] sm:h-20 sm:w-20">
                      <Image
                        src={logo}
                        alt="theInterview logo"
                        width={52}
                        height={52}
                        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                        priority
                      />
                    </div>
                    <p className="team-fade-up-delay text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                      Core Team
                    </p>
                  </div>

                  <h1 className="team-fade-up mt-6 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.05em] text-slate-950 dark:text-slate-100 sm:text-6xl lg:text-7xl">
                    Meet the people behind{" "}
                    <span className="bg-gradient-to-r from-blue-700 via-cyan-500 to-indigo-500 bg-clip-text text-transparent">
                      theInterview
                    </span>
                  </h1>

                  <p className="team-fade-up-delay mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                    A student-led crew shaping a cleaner place to learn from real
                    interview journeys, company by company and story by story.
                  </p>
                </div>

                <div className="team-fade-up-delay grid grid-cols-2 gap-4 sm:min-w-[320px]">
                  <div className="rounded-3xl border border-white/80 bg-slate-950 px-5 py-5 text-white shadow-xl dark:border-slate-700/80 dark:bg-slate-800">
                    <p className="text-3xl font-bold">5</p>
                    <p className="mt-2 text-sm text-slate-300">Builders shipping the platform</p>
                  </div>
                  <div className="rounded-3xl border border-blue-100 bg-blue-50/90 px-5 py-5 text-slate-900 shadow-lg dark:border-cyan-500/40 dark:bg-cyan-950/35 dark:text-slate-100">
                    <p className="text-3xl font-bold text-blue-700 dark:text-cyan-300">PICT</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Created by students for students</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-10">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                    Team Members
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
                    The people designing, writing, and maintaining the experience.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-6 place-items-center sm:grid-cols-2 lg:grid-cols-3">
                <TeamMemberCard
                  img={himg}
                  name="Himanshu Gholse"
                  subtitle="PICT'26 ENTC"
                  linkedin="https://www.linkedin.com/in/himanshu-gholse-6604ba227/"
                  github="https://github.com/himanshug-08"
                  email="himanshugholse08@gmail.com"
                />
                <TeamMemberCard
                  img={nimg}
                  name="Neeraj Magdum"
                  subtitle="PICT'26 CE"
                  linkedin="https://www.linkedin.com/in/neerajmagdum/"
                  github="https://github.com/nirz306"
                  email="neerajmagdum10@gmail.com"
                />
                <TeamMemberCard
                  img={niimg}
                  name="Nilay Tayade"
                  subtitle="PICT'26 CE • Upcoming Barclays Intern"
                  linkedin="https://www.linkedin.com/in/nilay-tayade/"
                  github="https://github.com/nilaytayade"
                  email="nilaytayadee@gmail.com"
                />
                <TeamMemberCard
                  img={m1img}
                  name="Muneer Abbas"
                  subtitle="PICT'28 CE"
                  linkedin="https://www.linkedin.com/in/muneer-abass-67a095285/"
                  github="https://github.com/muneerabbas"
                  email="muneer.abbas5678@gmail.com"
                />
                <TeamMemberCard
                  img={m2img}
                  name="Manas Khairnar"
                  subtitle="PICT CE"
                  linkedin="https://www.linkedin.com/in/manas-khairnar-98329132b/"
                  github="https://github.com/derpx06"
                  email="manaskhairnar1511@gmail.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;

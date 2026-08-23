"use client";
import React, { useRef, useState, useEffect } from 'react';
import TeamMemberCard from "../../components/TeamMemberCard";
import logo from "../../public/app_icon.png";
import { TEAM } from "@/data/team";
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import Navbar from "../../components/Navbar";

export default function Aboutus() {
  const storyRef = useRef(null);



  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-slate-50 font-sans dark:bg-slate-950">
      <Navbar showThemeToggle />

      {/* First Screen */}
      <div className='relative flex min-h-screen flex-col pt-16'>
        {/* Header - added padding so it doesn't overlap navbar */}
        <header className="w-full pb-3 pt-12 lg:pt-14">
          <div className="group mx-auto flex w-fit flex-col items-center gap-4">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              <Image
                src={logo}
                alt="The Interview Room logo"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                the<span className="text-blue-600 dark:text-blue-500">Interview</span>Room
              </h1>
              <p className="mx-auto mt-3 max-w-xl px-4 text-base leading-relaxed text-slate-500 dark:text-slate-400">
                Students building a simple place to share and learn from real interview experiences.
              </p>
            </div>
          </div>
        </header>

        {/* Team Content */}
        <div className='flex flex-grow flex-col pb-12 pt-5'>
          <div className='container mx-auto px-6'>
            <div className="mx-auto mb-8 w-full max-w-5xl border-t border-slate-200 pt-6 text-center dark:border-slate-800">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Team
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                Built by students who have been through the same interview journey.
              </p>
            </div>

            <div className="mx-auto mt-6 max-w-5xl">
              <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:sm:col-span-2 [&>*:last-child]:lg:col-span-1 [&>*:last-child]:lg:col-start-2">
                {TEAM.map((member) => (
                  <TeamMemberCard key={member.name} {...member} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Arrow - Only visible on desktop */}
        <div className="absolute bottom-3 hidden w-full flex-col items-center gap-2 lg:flex">
          <button
            onClick={scrollToStory}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
            aria-label="Scroll to Our Story"
          >
            <ChevronDown size={20} />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
            Continue to Our Story
          </span>
        </div>
      </div>

      {/* Second Screen */}
      <div ref={storyRef} className='relative flex flex-col'>
        <div className='container relative z-10 mx-auto px-6 pb-12 pt-8 sm:pt-10'>
          <div className="mx-auto mb-8 h-px max-w-4xl bg-slate-200 dark:bg-slate-800" />
          <section className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <h2 className="mb-5 text-left text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Our Story</h2>
            <div className="mx-auto max-w-2xl space-y-5 text-left text-slate-700 dark:text-slate-300">
              <p className="text-[16px] leading-[1.75]">
                We all know that preparing for job interviews can be a daunting task 😬. But what if there was a way to make it a little easier? That's when the idea for our website came to life 💡.
              </p>
              <p className="text-[16px] leading-[1.75]">
                As we navigated through our own job search journeys, we realized one thing: there was a huge gap in resources that focused on real, firsthand interview experiences. Sure, you can find advice on how to answer questions, but what about the actual experience? What's the atmosphere like? What kind of questions do companies ask? What should you expect during the process?
              </p>
              <p className="text-[16px] leading-[1.75]">
                So, we decided to create a platform where people could share their unique interview experiences—no filters, no sugarcoating 🚫.
              </p>
              <p className="text-[16px] leading-[1.75]">
                Through our website, we hope to build a community of people supporting each other 🤝, sharing knowledge, and making the interview process a little less intimidating. Because we believe that understanding the process is just as important as preparing the answers.
              </p>
              {/* Pull-quote tagline */}
              <blockquote className="mt-6 rounded-r-xl border-l-4 border-blue-500 bg-blue-50/55 py-3 pl-4 pr-3 dark:border-blue-500 dark:bg-blue-950/30">
                <p className="text-[19px] font-bold leading-[1.55] text-blue-800 dark:text-blue-300 sm:text-[21px]">By the students, for the students 👋</p>
              </blockquote>
            </div>
          </section>
        </div>
      </div>


    </main>
  );
}
"use client";
import React, { useRef, useState, useEffect } from 'react';
import TeamMemberCard from "../../components/TeamMemberCard";
import himg from '../../public/h1.jpg';
import nimg from '../../public/n2.jpg';
import niimg from '../../public/n1.jpg';
import m1img from "../../public/m1.jpeg";
import m2img from "../../public/m2.jpeg";
import p1img from "../../public/p1.jpeg";
import logo from "../../public/app_icon.png";
import default1 from "../../public/default1.png";
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import Navbar from "../../components/Navbar";

export default function Aboutus() {
  const storyRef = useRef(null);



  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen overflow-x-clip font-sans bg-transparent">
      {/* Fixed Premium Background Layer */}
      <div className="fixed inset-0 -z-30 bg-[#f8fbff] dark:bg-[#020617]">
        {/* Base Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]" />
      </div>

      {/* Glow Layer */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
        <div className="absolute left-[-140px] top-24 h-[400px] w-[400px] rounded-full bg-sky-300/20 blur-[120px] dark:bg-sky-500/15" />
        <div className="absolute right-[-120px] top-[320px] h-[400px] w-[400px] rounded-full bg-indigo-300/20 blur-[120px] dark:bg-indigo-500/15" />
      </div>

      {/* Grid layer */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]"
        style={{
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }}
      />

      <Navbar showThemeToggle />

      {/* First Screen */}
      <div className='min-h-screen flex flex-col relative pt-16'>
        {/* Header - added padding so it doesn't overlap navbar */}
        <header className="w-full pt-16 pb-6 lg:pt-20">
          <div className="group mx-auto flex w-fit flex-col items-center gap-3">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl transition duration-300 group-hover:bg-blue-600/15 dark:bg-cyan-500/10 dark:group-hover:bg-cyan-400/15" />
              <Image
                src={logo}
                alt="theInterview Logo"
                fill
                sizes="96px"
                className="relative object-contain drop-shadow-sm group-hover:animate-logo-spin"
                priority
              />
            </div>

            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                the<span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-400">Interview</span>Room
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl px-4">
                Students building a simple place to share and learn from real interview experiences.
              </p>
            </div>
          </div>
        </header>

        {/* Team Content */}
        <div className='flex-grow flex flex-col pt-12 pb-20'>
          <div className='container mx-auto px-6'>
            <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-10 text-slate-900 dark:text-slate-100">
              Team
            </h2>

            <div className="mx-auto mt-10 max-w-5xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
                <TeamMemberCard img={himg} name="Himanshu Gholse" subtitle="PICT'26 ENTC" linkedin="https://www.linkedin.com/in/himanshu-gholse-6604ba227/" github="https://github.com/himanshug-08" email="himanshugholse08@gmail.com" />
                <TeamMemberCard img={nimg} name="Neeraj Magdum" subtitle="PICT'26 CE" linkedin="https://www.linkedin.com/in/neerajmagdum/" github="https://github.com/nirz306" email="neerajmagdum10@gmail.com" />
                <TeamMemberCard img={niimg} name="Nilay Tayade" subtitle="PICT'26 CE • Upcoming Barclays Intern" linkedin="https://www.linkedin.com/in/nilay-tayade/" github="https://github.com/nilaytayade" email="nilaytayadee@gmail.com" />
                <TeamMemberCard img={m1img} name="Muneer Abbas" subtitle="PICT'28 CE" linkedin="https://www.linkedin.com/in/muneer-abass-67a095285/" github="https://github.com/muneerabbas" email="muneer.abbas5678@gmail.com" />
                <TeamMemberCard img={m2img} name="Manas Khairnar" subtitle="PICT`28 CE" linkedin="https://www.linkedin.com/in/manas-khairnar-98329132b/" github="https://github.com/derpx06" email="manaskhairnar1511@gmail.com" />
                <TeamMemberCard img={p1img} name="Parag Dharamkar" subtitle="PICT'28 CE" linkedin="https://www.linkedin.com/in/parag-dharamkar-b5529632a?utm_source=share_via&utm_content=profile&utm_medium=member_android" github="https://github.com/ParagD1606" email="paragdharamkar2006@gmail.com" />
                <TeamMemberCard img={default1} name="Riddhesh Kataria" subtitle="PICT'28 CE" linkedin="#" github="#" email="#" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Arrow - Only visible on desktop */}
        <div className="hidden lg:flex justify-center pb-8 absolute bottom-0 w-full">
          <button
            onClick={scrollToStory}
            className="p-2 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/35 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 animate-bounce dark:bg-cyan-500 dark:shadow-cyan-500/30 dark:hover:bg-cyan-400"
            aria-label="Scroll to Our Story"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Second Screen */}
      <div ref={storyRef} className='min-h-screen flex flex-col relative overflow-hidden'>
        <div className='container mx-auto px-6 py-16 relative z-10'>
          <section className="max-w-3xl mx-auto rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_14px_40px_rgba(2,6,23,0.6)] sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-24 h-24  animate-bubble1" style={{ top: '-5%', left: '10%' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-16 h-16  animate-bubble2" style={{ bottom: '15%', right: '20%' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-32 h-32  animate-bubble3" style={{ top: '20%', right: '5%' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-12 h-12  animate-bubble4" style={{ bottom: '-10%', left: '30%' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-20 h-20  animate-bubble2" style={{ top: '30%', left: '20%', animationDelay: '2s' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-10 h-10  animate-bubble1" style={{ bottom: '25%', left: '5%', animationDelay: '4s' }} />
              <div className="absolute bg-blue-400/10 dark:bg-cyan-400/5 rounded-full w-18 h-18  animate-bubble3" style={{ top: '5%', right: '30%', animationDelay: '3s' }} />
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center relative z-20">Our Story</h2>
            <div className="mx-auto max-w-[640px] space-y-5 text-slate-700 dark:text-slate-300 relative z-20">
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
              <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 dark:border-cyan-500 dark:bg-cyan-950/20 pl-4 py-2 pr-3 rounded-r-xl mt-6">
                <p className="text-[16px] leading-[1.75] font-semibold italic text-blue-800 dark:text-cyan-300">By the students, for the students 🧑‍🎓</p>
              </blockquote>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        /* Existing animations */
        @keyframes bubble1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bubble2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes bubble3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes bubble4 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        @keyframes logo-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .group-hover:animate-logo-spin {
          animation: logo-spin 1s ease-in-out;
        }

        .animate-bubble1 { animation: bubble1 6s infinite ease-in-out; }
        .animate-bubble2 { animation: bubble2 7s infinite ease-in-out; }
        .animate-bubble3 { animation: bubble3 8s infinite ease-in-out; }
        .animate-bubble4 { animation: bubble4 9s infinite ease-in-out; }
      `}</style>
    </main>
  );
}
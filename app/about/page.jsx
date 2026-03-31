"use client";
import React, { useRef } from 'react';
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
import { ChevronDown, Sparkles, Heart, Coffee, Code2, Users2, Rocket } from 'lucide-react';
import Navbar from "../../components/Navbar";
import { motion } from "framer-motion";

export default function Aboutus() {
  const storyRef = useRef(null);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const team = [
    { img: himg, name: "Himanshu Gholse", subtitle: "PICT'26 ENTC", linkedin: "https://www.linkedin.com/in/himanshu-gholse-6604ba227/", github: "https://github.com/himanshug-08", email: "himanshugholse08@gmail.com" },
    { img: nimg, name: "Neeraj Magdum", subtitle: "PICT'26 CE", linkedin: "https://www.linkedin.com/in/neerajmagdum/", github: "https://github.com/nirz306", email: "neerajmagdum10@gmail.com" },
    { img: niimg, name: "Nilay Tayade", subtitle: "PICT'26 CE • Upcoming Barclays Intern", linkedin: "https://www.linkedin.com/in/nilay-tayade/", github: "https://github.com/nilaytayade", email: "nilaytayadee@gmail.com" },
    { img: m1img, name: "Muneer Abbas", subtitle: "PICT'28 CE", linkedin: "https://www.linkedin.com/in/muneer-abass-67a095285/", github: "https://github.com/muneerabbas", email: "muneer.abbas5678@gmail.com" },
    { img: m2img, name: "Manas Khairnar", subtitle: "PICT`28 CE", linkedin: "https://www.linkedin.com/in/manas-khairnar-98329132b/", github: "https://github.com/derpx06", email: "manaskhairnar1511@gmail.com" },
    { img: p1img, name: "Parag Dharamkar", subtitle: "PICT'28 CE", linkedin: "https://www.linkedin.com/in/parag-dharamkar-b5529632a?utm_source=share_via&utm_content=profile&utm_medium=member_android", github: "https://github.com/ParagD1606", email: "paragdharamkar2006@gmail.com" },
    { img: default1, name: "Riddhesh Kataria", subtitle: "PICT'28 CE", linkedin: "#", github: "#", email: "#" },
  ];

  return (
    <main className="relative min-h-screen overflow-x-clip font-sans bg-transparent">
      {/* Fixed Premium Background */}
      <div className="fixed inset-0 -z-30 bg-[#f8fbff] dark:bg-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.15),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.12),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#f4f7fb_55%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.12),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.08),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]" />
      </div>

      <Navbar showThemeToggle />

      {/* Hero & Team Section (Combined at the top) */}
      <div className='relative pt-24 pb-20'>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-16"
          >
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />
              <Image src={logo} alt="Logo" fill sizes="96px" className="object-contain" priority />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-100 italic">
              the<span className="text-blue-600 dark:text-cyan-400">Interview</span>Room
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">
              Meet the Visionaries
            </p>
          </motion.div>

          {/* Team Grid - Immediately Visible */}
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-center max-w-7xl mb-20">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <TeamMemberCard {...member} />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={scrollToStory}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <span className="text-xs font-black uppercase tracking-widest">Our Story</span>
              <ChevronDown size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div ref={storyRef} className='relative py-24 bg-slate-50/50 dark:bg-slate-950/30'>
        <div className='container mx-auto px-6 relative z-10'>
          <motion.div
            {...fadeInUp}
            className="max-w-4xl mx-auto rounded-[2.5rem] border border-slate-200 bg-white/60 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60 sm:p-16"
          >
            <div className="text-center mb-12">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 dark:text-cyan-400">Our Journey</span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 mt-4">
                Empowering Students,<br />One Story at a Time.
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto">
              <p>Preparing for interviews shouldn't be a solitary struggle. We created a space for real, unfiltered human experiences.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 font-bold">
                <div className="p-6 rounded-3xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100 dark:border-slate-700">
                  <Heart className="text-red-500 mb-3" />
                  Community First
                </div>
                <div className="p-6 rounded-3xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-700">
                  <Coffee className="text-amber-500 mb-3" />
                  Raw Perspectives
                </div>
              </div>
              <p>Demystifying the hiring process together. By the students, for the students. 🧑‍🎓</p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
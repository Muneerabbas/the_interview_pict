// aboutus/page.js
"use client";
import React, { useRef } from 'react';
import FounderCard from '../../components/FounderCard';
import himg from '../../public/h1.jpg';
import nimg from '../../public/n2.jpg';
import niimg from '../../public/n1.jpg';
import logo from "../../public/icon.svg";
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const Aboutus = () => {
  const storyRef = useRef(null);

  const scrollToStory = () => {
    storyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='flex flex-col bg-blue-50'>
      {/* First Screen */}
      <div className='min-h-screen flex flex-col relative'>
        {/* Logo Section - Fixed at top */}
        <div className="w-full pt-8 pb-4">
          <Link href="/" className="group flex flex-col items-center transition-transform duration-300 hover:scale-105">
            <div className="animate-logo-entrance">
              <Image
                src={logo}
                alt="theInterview Logo"
                width={80}
                height={80}
                className="group-hover:animate-logo-spin mb-2"
              />
            </div>
            <span className="text-4xl font-bold text-blue-600 animate-text-entrance group-hover:text-blue-700">
              theInterview
            </span>
          </Link>
        </div>

        {/* Team Content - Centered vertically with reduced gap */}
        <div className='flex-grow flex flex-col justify-center -mt-16'>
          <div className='container mx-auto px-6'>
            <h1 className='text-4xl font-bold text-center mb-12 text-gray-900'>Team</h1>
            <div className='founder flex flex-col lg:flex-row gap-8 justify-center items-center'>
              <FounderCard
                img={himg}
                name="Himanshu Gholse"
                linkedin="https://www.linkedin.com/in/himanshu-gholse-6604ba227/"
                github="https://github.com/himanshug-08"
                des="PICT'26 ENTC"
                email="himanshugholse08@gmail.com"
                phone="+91 8805857669"
              />
              <FounderCard
                img={nimg}
                name="Neeraj Magdum"
                linkedin="https://www.linkedin.com/in/neerajmagdum/"
                github="https://github.com/nirz306"
                des="PICT'26 CE"
                email="neerajmagdum10@gmail.com"
                phone="+91 7972065984"
              />
              <FounderCard
                img={niimg}
                name="Nilay Tayade"
                linkedin="https://www.linkedin.com/in/nilay-tayade/"
                github="https://github.com/nilaytayade"
                des="PICT'26 CE\nUpcoming Barclays Intern"
                email="nilaytayadee@gmail.com"
                phone="+91 9370088933"
              />
            </div>
          </div>
        </div>

        {/* Scroll Arrow - Only visible on desktop */}
        <div className="hidden lg:flex justify-center pb-8 absolute bottom-0 w-full">
          <button
            onClick={scrollToStory}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 animate-bounce"
            aria-label="Scroll to Our Story"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Second Screen */}
      <div ref={storyRef} className='min-h-screen flex flex-col relative overflow-hidden'>
        <div className='container mx-auto px-6 py-16 relative z-10'>
          <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-12 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
              <div className="absolute bg-blue-100 rounded-full w-24 h-24 opacity-40 animate-bubble1" style={{ top: '-5%', left: '10%' }} />
              <div className="absolute bg-blue-100 rounded-full w-16 h-16 opacity-40 animate-bubble2" style={{ bottom: '15%', right: '20%' }} />
              <div className="absolute bg-blue-100 rounded-full w-32 h-32 opacity-40 animate-bubble3" style={{ top: '20%', right: '5%' }} />
              <div className="absolute bg-blue-100 rounded-full w-12 h-12 opacity-40 animate-bubble4" style={{ bottom: '-10%', left: '30%' }} />
              {/* Added Bubbles */}
              <div className="absolute bg-blue-100 rounded-full w-20 h-20 opacity-40 animate-bubble2" style={{ top: '30%', left: '20%', animationDelay: '2s' }} />
              <div className="absolute bg-blue-100 rounded-full w-10 h-10 opacity-40 animate-bubble1" style={{ bottom: '25%', left: '5%' , animationDelay: '4s'}} />
              <div className="absolute bg-blue-100 rounded-full w-18 h-18 opacity-40 animate-bubble3" style={{ top: '5%', right: '30%', animationDelay: '3s' }} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center relative z-20">Our Story</h2>
            <div className="space-y-5 text-gray-700 relative z-20">
              <p className="leading-relaxed text-lg">
                We all know that preparing for job interviews can be a daunting task <span role="img" aria-label="grimacing face">😬</span>. But what if there was a way to make it a little easier <span role="img" aria-label="slightly smiling face">🙂</span>? That's when the idea for our website came to life <span role="img" aria-label="light bulb">💡</span>.
              </p>
              <p className="leading-relaxed text-lg">
                As we navigated through our own job search journeys, we realized one thing: there was a huge gap <span role="img" aria-label="warning">⚠️</span> in resources that focused on real, firsthand interview experiences. Sure, you can find advice on how to answer questions, but what about the actual experience? What's the atmosphere like? What kind of questions do companies ask? What should you expect during the process?
              </p>
              <p className="leading-relaxed text-lg">
                So, we decided to create a platform where people could share their unique interview experiences—no filters, no sugarcoating <span role="img" aria-label="no filter">🚫</span>.
              </p>
              <p className="leading-relaxed text-lg">
                Through our website, we hope to build a community of people supporting each other <span role="img" aria-label="people holding hands">🤝</span>, sharing knowledge, and making the interview process a little less intimidating <span role="img" aria-label="relieved face">😌</span>. Because we believe that understanding the process is just as important as preparing the answers.
              </p>
              <p className="leading-relaxed text-lg font-semibold text-center mt-4">
                By the students for the students <span role="img" aria-label="student">🧑‍🎓</span> <span role="img" aria-label="student">🧑‍🎓</span>
              </p>
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

        /* New animations for logo and text */
        @keyframes logo-entrance {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes text-entrance {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logo-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-logo-entrance {
          animation: logo-entrance 1s ease-out forwards;
        }

        .animate-text-entrance {
          animation: text-entrance 1s ease-out forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }

        .group-hover:animate-logo-spin {
          animation: logo-spin 1s ease-in-out;
        }

        /* Existing classes */
        .animate-bubble1 { animation: bubble1 6s infinite ease-in-out; }
        .animate-bubble2 { animation: bubble2 7s infinite ease-in-out; }
        .animate-bubble3 { animation: bubble3 8s infinite ease-in-out; }
        .animate-bubble4 { animation: bubble4 9s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Aboutus;
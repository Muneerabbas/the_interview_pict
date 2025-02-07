"use client";
import React from 'react';
import FounderCard from '../../components/FounderCard';
import himg from '../../public/h1.jpg';
import nimg from '../../public/n2.jpg';
import niimg from '../../public/n1.jpg';
import Navbar from '../../components/Navbar';

const Aboutus = () => {
  return (
    <div className='min-h-screen flex flex-col bg-blue-50 relative overflow-hidden'> {/* Added relative and overflow-hidden for bubble positioning */}
      <Navbar />
      <div className='container mx-auto px-6 mt-28 mb-16 relative z-10'> {/* Added relative z-10 to keep content above bubbles */}
        <h1 className='text-4xl font-bold text-center mb-12 text-gray-900'>Our Team</h1>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 justify-items-center'>
          <FounderCard img={himg} name="Himanshu Gholse" linkedin={"https://www.linkedin.com/in/himanshu-gholse-6604ba227/"} github={"https://github.com/himanshug-08"} des={"PICT'26 ENTC"} email="himanshugholse08@gmail.com" phone="+91 8805857669"/>
          <FounderCard img={nimg} name="Neeraj Magdum" linkedin={"https://www.linkedin.com/in/neerajmagdum/"} github={"https://github.com/nirz306"} des={"PICT'26 CE"} email="neerajmagdum10@gmail.com" phone="+91 7972065984"/>
          <FounderCard img={niimg} name="Nilay Tayade" linkedin={"https://www.linkedin.com/in/nilay-tayade/"} github={"https://github.com/nilaytayade"} des={"PICT'26 CE\nUpcoming Barclays Intern"} email="nilaytayadee@gmail.com" phone="+91 9370088933"/>
        </div>

        <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-12 mt-20 border border-gray-100 relative overflow-hidden"> {/* relative and overflow-hidden for section bubbles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true"> {/* Container for bubbles, pointer-events-none to not interfere with content */}
            <div className="absolute bg-blue-100 rounded-full w-24 h-24 opacity-40 animate-bubble1" style={{ top: '-5%', left: '10%' }} /> {/* Bubble 1 */}
            <div className="absolute bg-blue-100 rounded-full w-16 h-16 opacity-40 animate-bubble2" style={{ bottom: '15%', right: '20%' }} /> {/* Bubble 2 */}
            <div className="absolute bg-blue-100 rounded-full w-32 h-32 opacity-40 animate-bubble3" style={{ top: '20%', right: '5%' }} />   {/* Bubble 3 */}
            <div className="absolute bg-blue-100 rounded-full w-12 h-12 opacity-40 animate-bubble4" style={{ bottom: '-10%', left: '30%' }} />  {/* Bubble 4 */}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center relative z-20">Our Story</h2> {/* Added relative z-20 to keep heading above bubbles */}
          <div className="space-y-5 text-gray-700 relative z-20"> {/* Added relative z-20 to keep text above bubbles */}
            <p className="leading-relaxed text-lg">
              We all know that preparing for job interviews can be a daunting task <span role="img" aria-label="grimacing face">😬</span>. But what if there was a way to make it a little easier <span role="img" aria-label="slightly smiling face">🙂</span>? That’s when the idea for our website came to life <span role="img" aria-label="light bulb">💡</span>.
            </p>
            <p className="leading-relaxed text-lg">
              As we navigated through our own job search journeys, we realized one thing: there was a huge gap <span role="img" aria-label="warning">⚠️</span> in resources that focused on real, firsthand interview experiences. Sure, you can find advice on how to answer questions, but what about the actual experience? What’s the atmosphere like? What kind of questions do companies ask? What should you expect during the process?
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

      {/* Bubble animations - Add this CSS to your global styles or a separate CSS file */}
      <style jsx global>{`
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

        .animate-bubble1 { animation: bubble1 6s infinite ease-in-out; }
        .animate-bubble2 { animation: bubble2 7s infinite ease-in-out; }
        .animate-bubble3 { animation: bubble3 8s infinite ease-in-out; }
        .animate-bubble4 { animation: bubble4 9s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Aboutus;
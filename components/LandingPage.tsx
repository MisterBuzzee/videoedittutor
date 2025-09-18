import React from 'react';
import { DavinciResolveIcon, SonyVegasIcon, FinalCutProIcon } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background shapes for decoration */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse [animation-delay:4s]"></div>
      <div className="absolute -bottom-10 -left-20 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl opacity-50 animate-pulse [animation-delay:2s]"></div>


      <div className="text-center z-10 max-w-3xl animate-fade-in-up">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="p-3 sm:p-4 bg-cyan-600/20 rounded-xl">
            <DavinciResolveIcon className="text-4xl sm:text-5xl text-cyan-400" />
          </div>
          <div className="p-3 sm:p-4 bg-purple-600/20 rounded-xl">
            <SonyVegasIcon className="text-4xl sm:text-5xl text-purple-400" />
          </div>
          <div className="p-3 sm:p-4 bg-blue-600/20 rounded-xl">
            <FinalCutProIcon className="text-4xl sm:text-5xl text-blue-400" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
          AI Video Edit Tutor
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
          Your personal guide to mastering Davinci Resolve, Sony Vegas, and Final Cut Pro. Ask any 'how-to' question and get instant, step-by-step tutorials.
        </p>

        <div className="mt-10">
          <button
            onClick={onEnter}
            className="px-8 py-4 bg-gray-200 text-gray-900 font-bold text-lg rounded-lg shadow-lg hover:bg-gray-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
          >
            Start Learning
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <FeatureCard
                title="Instant Answers"
                description="Get clear, step-by-step instructions for any task, big or small."
            />
            <FeatureCard
                title="Multi-App Support"
                description="In-depth tutorials for Davinci Resolve, Sony Vegas, and Final Cut Pro."
            />
            <FeatureCard
                title="Download & Go"
                description="Save your favorite tutorials as PDFs for offline access anytime."
            />
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{title: string, description: string}> = ({title, description}) => (
    <div className="bg-white/5 p-5 rounded-lg border border-white/10">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
)


export default LandingPage;
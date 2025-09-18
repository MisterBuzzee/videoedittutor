import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from "jspdf";
import { Application, Tutorial, HistoryItem } from '../types';
import { DavinciResolveIcon, SonyVegasIcon, FinalCutProIcon, HistoryIcon, DownloadIcon } from '../constants';
import LoadingSpinner from './LoadingSpinner';

interface TutorInterfaceProps {
  selectedApp: Application;
  onAppChange: (app: Application) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  tutorial: Tutorial | null;
  isInitialState: boolean;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (isOpen: boolean) => void;
  history: HistoryItem[];
  onSelectHistoryItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onSelect, onClear }) => {
  const AppIcon = ({ app }: { app: Application }) => {
    const iconProps = { className: "text-2xl flex-shrink-0" };
    switch (app) {
        case Application.DavinciResolve:
            return <DavinciResolveIcon {...iconProps} />;
        case Application.SonyVegas:
            return <SonyVegasIcon {...iconProps} />;
        case Application.FinalCutPro:
            return <FinalCutProIcon {...iconProps} />;
        default:
            return null;
    }
  };
  
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-panel-title"
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <h2 id="history-panel-title" className="text-xl font-bold">Tutorial History</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors" aria-label="Close history panel">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="flex-grow overflow-y-auto p-4">
            {history.length > 0 ? (
              <ul className="space-y-3">
                {history.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-3"
                    >
                      <AppIcon app={item.app} />
                      <div>
                        <p className="font-semibold leading-tight">{item.tutorial.title}</p>
                        <p className="text-sm text-gray-400 mt-1 truncate">{item.prompt}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                <p>Your generated tutorials will appear here.</p>
              </div>
            )}
          </div>
          
          {history.length > 0 && (
            <footer className="p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={onClear}
                className="w-full py-2 px-4 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 hover:text-red-300 font-semibold transition-colors"
              >
                Clear History
              </button>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};

const TutorialDisplay: React.FC<{ tutorial: Tutorial, app: Application }> = ({ tutorial, app }) => {
    const accentColorClass = {
        [Application.DavinciResolve]: "text-cyan-500",
        [Application.SonyVegas]: "text-purple-500",
        [Application.FinalCutPro]: "text-blue-500",
    }[app];
    const accentColorHex = {
        [Application.DavinciResolve]: "#06b6d4",
        [Application.SonyVegas]: "#a855f7",
        [Application.FinalCutPro]: "#3b82f6",
    }[app];

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;
    
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('AI Video Editing Tutor', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(16);
    doc.setTextColor(150);
    doc.text(`${app} Tutorial`, pageWidth / 2, y, { align: 'center' });
    y += 20;
    
    // Tutorial Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0);
    const titleLines = doc.splitTextToSize(tutorial.title, pageWidth - margin * 2);
    doc.text(titleLines, margin, y);
    y += doc.getTextDimensions(titleLines).h + 10;
    
    // Steps
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    tutorial.steps.forEach((step, index) => {
        const stepPrefix = `Step ${index + 1}: `;
        const stepContent = step.replace(/^Step\s*\d+:\s*/i, '');

        const combinedText = stepPrefix + stepContent;
        const textLines = doc.splitTextToSize(combinedText, pageWidth - margin * 2 - 5);
        const textHeight = doc.getTextDimensions(textLines).h;

        if (y + textHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColorHex);
        doc.text(stepPrefix, margin, y);
        
        const prefixWidth = doc.getTextWidth(stepPrefix);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        doc.text(stepContent, margin + prefixWidth, y, { maxWidth: pageWidth - margin * 2 - prefixWidth });
        
        y += textHeight + 6;
    });

    // Filename
    const slug = tutorial.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    doc.save(`${slug || 'video-tutorial'}.pdf`);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl max-w-3xl w-full animate-fade-in border border-white/10 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white pr-4">{tutorial.title}</h2>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white self-start sm:self-auto flex-shrink-0"
            aria-label="Download tutorial as PDF"
          >
            <DownloadIcon className="text-base" />
            Download PDF
          </button>
        </div>
        <ol className="space-y-5">
            {tutorial.steps.map((step, index) => {
                const cleanedStep = step.replace(/^Step\s*\d+:\s*/i, '');
                return (
                    <li key={index} className="flex gap-3 group">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${accentColorClass} bg-white/10 flex items-center justify-center font-bold mt-0.5`}>
                            {index + 1}
                        </div>
                        <div className="flex-grow">
                            <p className="text-gray-200 leading-relaxed text-base sm:text-lg">
                                {cleanedStep}
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    </div>
  );
};

interface InitialStateDisplayProps {
  app: Application;
  onExampleClick: (prompt: string) => void;
  accentColorClass: string;
}

const InitialStateDisplay: React.FC<InitialStateDisplayProps> = ({ app, onExampleClick, accentColorClass }) => {
    const examplePrompts = {
        [Application.DavinciResolve]: ["How to color grade a cinematic video?", "Create a smooth slow-motion effect", "How to add and edit text titles?"],
        [Application.SonyVegas]: ["How to create a video montage with music?", "Apply a green screen (chroma key) effect", "How to sync audio from multiple cameras?"],
        [Application.FinalCutPro]: ["How to use the magnetic timeline?", "Create a multicam clip", "How to export for social media?"],
    }[app];

    return (
        <div className="text-center animate-fade-in max-w-2xl w-full">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI <span className={accentColorClass}>{app}</span> Tutor</h1>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Ask me how to do anything in {app}.</p>
            <div className="bg-white/5 p-4 sm:p-6 rounded-lg">
                <h3 className="font-semibold text-base sm:text-lg mb-4 text-white">Example Prompts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {examplePrompts.map(p => (
                         <button 
                            key={p} 
                            onClick={() => onExampleClick(p)}
                            className="flex min-h-[5rem] sm:min-h-[6rem] items-center text-center justify-center bg-white/10 p-3 rounded-md text-gray-300 hover:bg-white/20 transition-colors duration-200"
                         >
                            {p}
                         </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const TutorInterface: React.FC<TutorInterfaceProps> = ({
  selectedApp,
  onAppChange,
  prompt,
  setPrompt,
  handleSubmit,
  isLoading,
  error,
  tutorial,
  isInitialState,
  isHistoryOpen,
  setIsHistoryOpen,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const theme = {
    [Application.DavinciResolve]: {
      accent: 'text-cyan-400',
      border: 'border-cyan-500',
      ring: 'focus:ring-cyan-500',
      buttonBg: 'bg-cyan-600',
      buttonHover: 'hover:bg-cyan-500',
    },
    [Application.SonyVegas]: {
      accent: 'text-purple-400',
      border: 'border-purple-500',
      ring: 'focus:ring-purple-500',
      buttonBg: 'bg-purple-600',
      buttonHover: 'hover:bg-purple-500',
    },
    [Application.FinalCutPro]: {
      accent: 'text-blue-400',
      border: 'border-blue-500',
      ring: 'focus:ring-blue-500',
      buttonBg: 'bg-blue-600',
      buttonHover: 'hover:bg-blue-500',
    },
  };
  
  const appIcons: Record<Application, React.FC<{ className?: string }>> = {
    [Application.DavinciResolve]: DavinciResolveIcon,
    [Application.SonyVegas]: SonyVegasIcon,
    [Application.FinalCutPro]: FinalCutProIcon,
  };

  const currentTheme = theme[selectedApp];
  const MobileHeaderIcon = appIcons[selectedApp];

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };
  
  const handleMobileAppChange = (app: Application) => {
    onAppChange(app);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen p-4 sm:p-6 md:p-8">
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={onSelectHistoryItem}
        onClear={onClearHistory}
      />
      
      {/* Mobile Dropdown Overlay - closes menu on outside click */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="sm:hidden fixed inset-0 z-10"
          aria-hidden="true"
        />
      )}

      <header className="flex-shrink-0 z-20 relative">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
            {/* Mobile Header */}
            <div className="sm:hidden flex items-center gap-2">
              <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="p-2 -ml-2 rounded-full hover:bg-white/10" aria-label="Open menu">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <div className={`flex items-center gap-2 font-semibold ${currentTheme.accent}`}>
                  <MobileHeaderIcon className="text-2xl" />
                  <span className="text-white text-lg">{selectedApp}</span>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex items-center">
                {(Object.values(Application)).map((app) => {
                  const isActive = selectedApp === app;
                  const Icon = appIcons[app];
                  return (
                    <button
                        key={app}
                        onClick={() => onAppChange(app)}
                        className={`group flex items-center gap-3 mx-1 px-4 py-2 rounded-lg text-base font-semibold transition-colors duration-200 ${
                            isActive ? 'shadow-lg' : 'text-gray-400 hover:bg-gray-700/80 hover:text-white'
                        }`}
                    >
                        <span
                            className={`flex items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                                isActive ? theme[app].buttonBg : 'bg-transparent'
                            }`}
                        >
                            <Icon
                                className={`text-2xl transition-colors duration-200 ${
                                    isActive ? theme[app].accent : 'text-current'
                                }`}
                            />
                        </span>
                        <span
                            className={`transition-colors duration-200 ${
                                isActive ? 'text-white' : 'text-current'
                            }`}
                        >
                            {app}
                        </span>
                    </button>
                  );
                })}
            </div>
            
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            aria-label="View history"
            disabled={history.length === 0}
          >
            <HistoryIcon className="text-2xl sm:text-3xl" />
          </button>
        </div>
        
        {/* Mobile Dropdown Menu */}
        <div className={`sm:hidden absolute top-full left-0 right-0 mt-2 transition-all duration-200 ease-out origin-top z-30 ${isMobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="bg-gray-800 rounded-lg shadow-xl p-2 mx-4 border border-white/10">
              {(Object.values(Application)).map(app => {
                const isActive = selectedApp === app;
                const Icon = appIcons[app];
                return (
                  <button
                      key={app}
                      onClick={() => handleMobileAppChange(app)}
                      className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors text-base ${
                          isActive ? `${theme[app].buttonBg} ${theme[app].accent}` : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                      <Icon className="text-2xl" />
                      <span className={`font-semibold ${isActive ? 'text-white' : ''}`}>{app}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </header>
      
      <main className={`flex-grow flex justify-center overflow-y-auto py-4 min-h-0 ${
        tutorial && !isLoading ? 'items-start' : 'items-center'
      }`}>
        {isInitialState && <InitialStateDisplay app={selectedApp} onExampleClick={setPrompt} accentColorClass={currentTheme.accent} />}
        {isLoading && <LoadingSpinner />}
        {error && !isLoading && <p className="text-red-400 bg-red-500/10 p-4 rounded-lg text-center">{error}</p>}
        {tutorial && !isLoading && <TutorialDisplay tutorial={tutorial} app={selectedApp} />}
      </main>

      <footer className="flex-shrink-0 pt-4">
        <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask how to... in ${selectedApp}`}
              className={`w-full p-4 pr-24 sm:pr-28 text-sm sm:text-base rounded-lg bg-gray-800 border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all ${currentTheme.border} ${currentTheme.ring}`}
              disabled={isLoading}
              aria-label="Tutorial prompt"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md font-semibold text-white transition-all ${currentTheme.buttonBg} ${currentTheme.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Generate
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default TutorInterface;
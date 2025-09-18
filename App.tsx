import React, { useState, useCallback, useEffect } from 'react';
import TutorInterface from './components/TutorInterface';
import LandingPage from './components/LandingPage';
import { getTutorial } from './services/geminiService';
import { Application, Tutorial, HistoryItem } from './types';

const App: React.FC = () => {
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<Application>(Application.DavinciResolve);
  const [prompt, setPrompt] = useState<string>('');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialState, setIsInitialState] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('videoTutorHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      localStorage.removeItem('videoTutorHistory');
    }
  }, []);
  
  const handleAppChange = useCallback((app: Application) => {
    if (app !== selectedApp) {
      setSelectedApp(app);
      setPrompt('');
      setTutorial(null);
      setError(null);
      setIsInitialState(true);
    }
  }, [selectedApp]);


  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a question.");
      return;
    }

    setIsInitialState(false);
    setIsLoading(true);
    setError(null);
    setTutorial(null);

    try {
      const result = await getTutorial(prompt, selectedApp);
      setTutorial(result);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        app: selectedApp,
        prompt: prompt,
        tutorial: result,
      };

      setHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(item => !(item.prompt === newHistoryItem.prompt && item.app === newHistoryItem.app));
        const updatedHistory = [newHistoryItem, ...filteredHistory];
        localStorage.setItem('videoTutorHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError("Sorry, I couldn't generate a tutorial. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedApp]);

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedApp(item.app);
    setPrompt(item.prompt);
    setTutorial(item.tutorial);
    setIsInitialState(false);
    setError(null);
    setIsLoading(false);
    setIsHistoryOpen(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('videoTutorHistory');
    setIsHistoryOpen(false);
  };

  const handleEnterApp = () => {
    setHasEnteredApp(true);
  };

  if (!hasEnteredApp) {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen font-sans text-white bg-gray-900">
      <TutorInterface
        selectedApp={selectedApp}
        onAppChange={handleAppChange}
        prompt={prompt}
        setPrompt={setPrompt}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        tutorial={tutorial}
        isInitialState={isInitialState}
        isHistoryOpen={isHistoryOpen}
        setIsHistoryOpen={setIsHistoryOpen}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default App;
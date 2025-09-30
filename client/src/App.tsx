import { useState, useEffect } from 'react';
import StrummingPattern from './components/StrummingPattern';
import ChordCarousel from './components/ChordCarousel';
import NavigationControls from './components/NavigationControls';
import MicrophoneIndicator from './components/MicrophoneIndicator';
import EmptyState from './components/EmptyState';
import AddButton from './components/AddButton';
import ProgressionCreator from './components/ProgressionCreator';
import ChordSelector from './components/ChordSelector';
import StrummingPatternSelector from './components/StrummingPatternSelector';
import { ChordProgression, Chord } from './types';
import { startAudio, closeAudio, getFreqArray } from './utils/audioHandle'

function App() {
  const [currentProgression, setCurrentProgression] = useState<ChordProgression | null>(null);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Modal states
  const [showProgressionCreator, setShowProgressionCreator] = useState(false);
  const [showChordSelector, setShowChordSelector] = useState(false);
  const [showStrummingSelector, setShowStrummingSelector] = useState(false);


  useEffect(() => {
    const savedChordProgression = localStorage.getItem('chord_progression');
    const savedStrummingPattern = localStorage.getItem('strumming_pattern');

    if (savedChordProgression) {
      const savedChordProgressionNotNull = JSON.parse(savedChordProgression);
      setCurrentProgression(savedChordProgressionNotNull);
    }

    if (savedStrummingPattern) {
      const savedStrummingPatternNotNull = JSON.parse(savedStrummingPattern);
      if (savedChordProgression) 
      setCurrentProgression({
        ...JSON.parse(savedChordProgression),
        strummingPattern: savedStrummingPatternNotNull
      });
    }
  }, []);

  useEffect(() => {
    if (isListening && currentProgression) {
      const timeout = setTimeout(() => {
        setIsListening(false);
        if (currentChordIndex < currentProgression.chords.length - 1) {
          setCurrentChordIndex(prev => prev + 1);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isListening, currentChordIndex, currentProgression]);

  const handlePrevious = () => {
    if (currentProgression && currentChordIndex > 0) {
      setCurrentChordIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentProgression && currentChordIndex < currentProgression.chords.length - 1) {
      setCurrentChordIndex(prev => prev + 1);
    }
  };

  const toggleMicrophone = () => {
    setMicEnabled(prev => !prev);
  };

useEffect(() => {
  if (micEnabled) {
    startAudio();
  }
  else {
    closeAudio(); 
  }
  getFreqArray();

}, [micEnabled]);


  const handleProgressionSave = (progression: ChordProgression) => {
    setCurrentProgression(progression);
    setCurrentChordIndex(0);
    setCurrentBeat(0);
  };

  const handleChordsChange = (chords: Chord[]) => {
    if (currentProgression) {
      setCurrentProgression({
        ...currentProgression,
        chords
      });
      setCurrentChordIndex(0);
    }
  };

  const handleStrummingPatternChange = (pattern: string[]) => {
    if (currentProgression) {
      setCurrentProgression({
        ...currentProgression,
        strummingPattern: pattern
      });
      localStorage.setItem('strumming_pattern', JSON.stringify(pattern))
      setCurrentBeat(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">

        {!currentProgression ? (
          /* Empty state - no progression */
          <div className="flex items-center justify-center min-h-[60vh]">
            <EmptyState type="progression" onAdd={() => setShowProgressionCreator(true)} />
          </div>
        ) : (
          <>
            {/* Strumming Pattern */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/80 text-lg font-medium">Strumming Pattern</h2>
                <AddButton 
                  onClick={() => setShowStrummingSelector(true)} 
                  label="Edit Pattern"
                  className="text-sm"
                  variant="secondary"
                />
              </div>
              <StrummingPattern 
                pattern={currentProgression.strummingPattern}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
              />
            </div>

            {/* Chord Carousel */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/80 text-lg font-medium">Chord Progression</h2>
                <AddButton 
                  onClick={() => setShowChordSelector(true)} 
                  label="Edit Chords"
                  className="text-sm"
                  variant="ghost"
                />
              </div>
              <ChordCarousel 
                chords={currentProgression.chords}
                currentIndex={currentChordIndex}
              />
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-2">
                {currentProgression.chords.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentChordIndex
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 w-6'
                        : index < currentChordIndex
                        ? 'bg-green-400'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="mb-8">
              <NavigationControls
                onPrevious={handlePrevious}
                onNext={handleNext}
                canGoPrevious={currentChordIndex > 0}
                canGoNext={currentChordIndex < currentProgression.chords.length - 1}
              />
            </div>

            {/* Song info */}
            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 inline-block">
                <h3 className="text-white/80 text-sm font-medium mb-2">Currently Learning</h3>
                <h2 className="text-white text-xl font-bold mb-1">{currentProgression.name}</h2>
                <p className="text-white/60 text-sm">
                  Chord {currentChordIndex + 1} of {currentProgression.chords.length}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Microphone */}
      {currentProgression && (
        <>
        <MicrophoneIndicator
          isListening={isListening}
          isEnabled={micEnabled}
          onToggle={toggleMicrophone }
        />
        {/* {micEnabled && <AudioFrequencyLogger />}  */}
        </>
      )}

      {/* Modals */}
      {showProgressionCreator && (
        <ProgressionCreator
          onSave={handleProgressionSave}
          onClose={() => setShowProgressionCreator(false)}
        />
      )}

      {showChordSelector && currentProgression && (
        <ChordSelector
          selectedChords={currentProgression.chords}
          onChordsChange={handleChordsChange}
          onClose={() => setShowChordSelector(false)}
        />
      )}

      {showStrummingSelector && currentProgression && (
        <StrummingPatternSelector
          currentPattern={currentProgression.strummingPattern}
          onPatternChange={handleStrummingPatternChange}
          onClose={() => setShowStrummingSelector(false)}
        />
      )}
    </div>
  );
}

export default App;
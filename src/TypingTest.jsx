import React, { useState, useEffect, useRef } from 'react';
import './TypingTest.css';

const SAMPLE_TEXTS = [
  "Typing is a valuable skill that can help you work faster and more efficiently every day. Practice regularly to improve your speed and accuracy.",
  "The quick brown fox jumps over the lazy dog while the sun sets behind the mountains, painting the sky with beautiful colors.",
  "Learning to type without looking at the keyboard takes time and patience, but it is worth the effort for anyone who uses a computer often.",
  "Consistent practice with typing tests will help you develop muscle memory and increase your confidence when writing long documents or emails.",
  "A good typist maintains proper posture, keeps their hands relaxed, and focuses on accuracy before trying to increase their speed."
];

function getRandomSample() {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

const TypingTest = () => {
  const [sample, setSample] = useState(getRandomSample());
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showWPM, setShowWPM] = useState(false);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctArr, setCorrectArr] = useState([]);
  const [accuracy, setAccuracy] = useState(100);
  const [liveWPM, setLiveWPM] = useState(0);
  const keyListenerRef = useRef();
  const cardRef = useRef();

  // Split sample and input into words and letters
  const sampleWords = sample.split(' ');
  const inputWords = userInput.split(' ');

  // Reset test
  const resetTest = (newSample = null) => {
    const nextSample = newSample || getRandomSample();
    setSample(nextSample);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setShowWPM(false);
    setError("");
    setCurrentIndex(0);
    setCorrectArr([]);
    setAccuracy(100);
    setLiveWPM(0);
    setTimeout(() => cardRef.current && cardRef.current.focus(), 50);
  };

  // Global keydown handler
  useEffect(() => {
    keyListenerRef.current = (e) => {
      if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'Enter' && e.getModifierState('Tab')) {
        e.preventDefault();
        resetTest();
        return;
      }
      if (showWPM) return;
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === ' ') {
        e.preventDefault();
        if (userInput.length === 0 && startTime === null && e.key.length === 1) {
          setStartTime(Date.now());
        }
        if (e.key === 'Backspace') {
          if (userInput.length > 0) {
            setUserInput(userInput.slice(0, -1));
            setCurrentIndex(currentIndex - 1);
            setCorrectArr(correctArr.slice(0, -1));
          }
        } else if (userInput.length < sample.length) {
          const newInput = userInput + e.key;
          setUserInput(newInput);
          setCurrentIndex(currentIndex + 1);
          const isCorrect = e.key === sample[userInput.length];
          setCorrectArr([...correctArr, isCorrect]);
          if (newInput === sample) {
            setEndTime(Date.now());
            setShowWPM(true);
            const correctCount = [...correctArr, isCorrect].filter(Boolean).length;
            setAccuracy(Math.round((correctCount / sample.length) * 100));
          }
        }
      }
    };
    window.addEventListener('keydown', keyListenerRef.current);
    return () => window.removeEventListener('keydown', keyListenerRef.current);
    // eslint-disable-next-line
  }, [userInput, showWPM, sample, startTime, currentIndex, correctArr]);

  // Debounced live WPM calculation (based on correct characters)
  useEffect(() => {
    if (!startTime || userInput.length === 0) {
      setLiveWPM(0);
      return;
    }
    const now = endTime ? endTime : Date.now();
    const minutes = (now - startTime) / 60000;
    const correctChars = correctArr.filter(Boolean).length;
    const correctWords = correctChars / 5;
    if (minutes > 0) {
      debounce(setLiveWPM, 60)((correctWords / minutes).toFixed(2));
    } else {
      setLiveWPM(0);
    }
  }, [userInput, startTime, endTime, correctArr]);

  useEffect(() => {
    if (cardRef.current) cardRef.current.focus();
  }, []);

  // Render sample text as words and letters
  const renderSample = () => (
    <div className="typingtest-sample monkeytype-words">
      {sampleWords.map((word, wIdx) => {
        const inputWord = inputWords[wIdx] || "";
        return (
          <span
            key={wIdx}
            className={
              'monkeytype-word' +
              (wIdx === inputWords.length - 1 && !showWPM ? ' current-word' : '')
            }
          >
            {word.split('').map((char, lIdx) => {
              const inputChar = inputWord[lIdx];
              let className = 'typingtest-letter';
              if (inputChar !== undefined) {
                className += inputChar === char ? ' correct' : ' incorrect';
              }
              if (
                wIdx === inputWords.length - 1 &&
                lIdx === inputWord.length &&
                !showWPM
              ) {
                className += ' current';
              }
              return (
                <span key={lIdx} className={className}>{char}</span>
              );
            })}
            {/* Add space after word except last */}
            {wIdx < sampleWords.length - 1 && <span className="monkeytype-space"> </span>}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="typingtest-bg">
      <div className="typingtest-card" tabIndex={0} ref={cardRef}>
        {renderSample()}
        {error && <div className="typingtest-error">{error}</div>}
        <div className="typingtest-stats">
          <div><strong>WPM:</strong> {liveWPM}</div>
          {showWPM && <div><strong>Accuracy:</strong> {accuracy}%</div>}
        </div>
        <button className="typingtest-reset" onClick={() => resetTest()}>
          Reset
        </button>
        <div style={{marginTop: '1.5rem', color: '#6c6f7a', fontSize: '0.95rem'}}>
          <kbd>Tab</kbd> + <kbd>Enter</kbd> — new text
        </div>
      </div>
    </div>
  );
};

export default TypingTest; 
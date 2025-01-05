import React, { useState, useEffect, useRef } from 'react';
import Note from './Note';
import './GameBoard.css';
import hitSound from './Assets/hit.mp3';
import missSound from './Assets/miss.mp3';
import song from './Assets/Song.mp3';


const lanes = ['A', 'S', 'D', 'F'];
const hitZone = 550;
// const beatInterval = 1000; 
const noteTimings = [
    { time: 3000, lane: 0 },
    { time: 4100, lane: 2 },
    { time: 5200, lane: 1 },
    { time: 6300, lane: 2 },
    { time: 7400, lane: 1 }, 
    { time: 8500, lane: 2 }, 
  ];
  

const GameBoard = () => {
  const [notes, setNotes] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  const hitSoundRef = useRef(null);
  const missSoundRef = useRef(null);
  const audioRef = useRef(null);

  // ---- Start Game ----
  const startGame = () => {
    // Attempt to play the audio
    audioRef.current.play()
      .then(() => {
        setGameStarted(true);
      })
      .catch((err) => {
        console.error('Failed to start audio:', err);
      });
  };

  useEffect(() => {
    if (!gameStarted) return;
  
    const spawnNotes = setInterval(() => {
      const currentTime = audioRef.current.currentTime * 1000; // Current time in ms
  
      // Find notes whose spawn time is within the current window
      const newNotes = noteTimings.filter(
        (note) => 
          note.time <= currentTime + 100 && // Within 100ms of the current time
          note.time > currentTime - 100      // Ensures it spawns only once
      );
  
      // Add new notes to the game board
      setNotes((prevNotes) => [
        ...prevNotes,
        ...newNotes.map((note) => ({
          lane: note.lane,
          position: 0,
        })),
      ]);
    }, 100);
  
    return () => clearInterval(spawnNotes);
  }, [gameStarted]);
  

  useEffect(() => {
    if (!gameStarted) return;
  
    const moveInterval = setInterval(() => {
      setNotes((prevNotes) =>
        prevNotes
          .map((note) => ({ ...note, position: note.position + 28 }))
          .filter((note) => note.position < 600)
      );
    }, 100);
  
    return () => clearInterval(moveInterval);
  }, [gameStarted]);

  // ---- Handle Key Press / Hit Detection ----
  useEffect(() => {
    const handleKeyPress = (event) => {
      // If game hasn't started yet, ignore
      if (!gameStarted) return;

      // Convert the pressed key to an uppercase letter
      const keyIndex = lanes.indexOf(event.key.toUpperCase());
      if (keyIndex !== -1) {
        // Find a note in that lane that is close to the hit zone
        const hitNoteIndex = notes.findIndex(
          (note) => 
            note.lane === keyIndex &&
            Math.abs(note.position - hitZone) < 20
        );

        if (hitNoteIndex !== -1) {
          // HIT!
          setScore((prevScore) => prevScore + 10);
          setFeedback('HIT!');
          hitSoundRef.current.play();
          // Remove the hit note from the array
          setNotes((prevNotes) =>
            prevNotes.filter((_, index) => index !== hitNoteIndex)
          );
        } else {
          // MISS!
          setFeedback('MISS!');
          missSoundRef.current.play();
        }

        // Clear feedback after 500ms
        setTimeout(() => setFeedback(null), 500);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [notes, gameStarted]);

  return (
    <div className="game-board">
      {/* Start Game Button */}
      {!gameStarted && (
        <button onClick={startGame}>Start Game</button>
      )}

      <h1>Score: {score}</h1>
      {feedback && (
        <div className={`feedback ${feedback.toLowerCase()}`}>
          {feedback}
        </div>
      )}

      {/* Audio elements */}
      <audio ref={hitSoundRef} src={hitSound} />
      <audio ref={missSoundRef} src={missSound} />
      <audio ref={audioRef} src={song} />

      {/* Lanes + Notes */}
      {lanes.map((lane, index) => (
        <div key={index} className="lane">
          <p>{lane}</p>
          {notes
            .filter((note) => note.lane === index)
            .map((note, i) => (
              <Note key={i} position={note.position} />
            ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;

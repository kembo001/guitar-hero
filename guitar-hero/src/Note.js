import React from 'react';
import './Note.css';

const Note = ({ position }) => {
  return <div className="note" style={{ top: `${position}px` }}></div>;
};

export default Note;

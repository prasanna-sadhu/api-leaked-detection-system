import React, { useState, useEffect } from 'react';
import './Loader.css';

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2; // Increment by 2% every 40ms (reaches 100% in 2 seconds)
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="loader-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loader-text">
          <h2>SecretGuard</h2>
          <p>Loading your secure dashboard...</p>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-percentage">{progress}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;

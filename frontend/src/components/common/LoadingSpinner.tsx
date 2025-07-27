import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <svg className="spinner" viewBox="0 0 50 50">
      <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4"></circle>
      <circle className="opacity-75" cx="25" cy="25" r="20" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="31.4 31.4" strokeDashoffset="0">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

export default LoadingSpinner;

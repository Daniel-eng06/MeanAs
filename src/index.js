import React from 'react';
import ReactDOM from 'react-dom/client';
import MeanAsApp from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(
    <React.StrictMode>
      <MeanAsApp />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering the React app:', error);
}

// Optional: Measure performance
reportWebVitals(console.log);

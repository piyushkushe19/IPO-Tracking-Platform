import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#161b27',
            color: '#fff',
            border: '1px solid #1e2535',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#00d09c', secondary: '#161b27' } },
          error: { iconTheme: { primary: '#f05454', secondary: '#161b27' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

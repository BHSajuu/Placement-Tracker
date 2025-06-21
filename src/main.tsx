import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider } from 'convex/react';
import { convex } from './lib/convex';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#374151',
            color: '#fff',
            fontSize: '20px',
            padding: '10px 12px',
            borderRadius: '24px',
            borderLeftWidth: '8px',
            borderLeftColor: '#3b82f6',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
    </ConvexProvider>
  </StrictMode>
);
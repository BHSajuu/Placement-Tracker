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
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#374151',
            color: '#fff',
          },
        }}
      />
    </ConvexProvider>
  </StrictMode>
);
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// These layers intentionally override earlier styles; keep their order explicit.
import '../tokens.css';
import './styles.css';
import './playful.css';
import './arena.css';
import './storybook.css';
import './adventure-extras.css';
import './tactile-play.css';
import './home-layout.css';
import './playgrounds/playgrounds.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

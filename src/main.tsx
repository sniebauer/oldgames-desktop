import React from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import msSansSerif from 'react95/dist/fonts/ms_sans_serif.woff2';
import msSansSerifBold from 'react95/dist/fonts/ms_sans_serif_bold.woff2';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${msSansSerif}') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${msSansSerifBold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }
  html, body, #root { height: 100%; }
  body {
    font-family: 'ms_sans_serif';
    -webkit-font-smoothing: none;
    user-select: none;
  }
`;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

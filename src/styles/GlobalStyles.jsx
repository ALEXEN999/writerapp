import React from "react";
import { createGlobalStyle } from "styled-components";

const BaseStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    color-scheme: light;
  }

  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    background-color: #fdfbf7;
    color: #111827;
    -webkit-font-smoothing: antialiased;
  }

  #root {
    min-height: 100vh;
  }

  /* Typography */
  h1, h2, h3, h4 {
    font-family: "Georgia", "Times New Roman", serif;
    letter-spacing: 0.04em;
  }

  h1 {
    font-size: 1.6rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.2rem;
    font-weight: 600;
  }

  /* Inputs rectos, serios, cómodos */
  input:not([type="checkbox"]):not([type="radio"]),
  textarea,
  select:not(.np-plain) {
    width: 100%;
    font-size: 16px;  !important; /* evita zoom raro en iOS */
    padding: 0.4rem 0.6rem;
    border-radius: 0;
    border: 1px solid #e5e7eb;
    background-color: #fdfdfb;
    color: inherit;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  input:not([type="checkbox"]):not([type="radio"]):focus,
  textarea:focus,
  select:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.15);
  }

  button {
    font-family: inherit;
  }

  /* Scrollbar discreta (solo navegadores que lo soportan) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #d4d4d4;
    border-radius: 999px;
  }
`;

const GlobalStyles = ({ children }) => (
  <>
    <BaseStyles />
    {children}
  </>
);

export default GlobalStyles;
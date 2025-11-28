// src/setupTests.js
import '@testing-library/jest-dom';

// ---- React Router deprecation warning suppressor ----
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0] || "";

  if (
    msg.includes("React Router Future Flag Warning") ||
    msg.includes("v7_startTransition") ||
    msg.includes("v7_relativeSplatPath")
  ) {
    return; // ignore these warnings
  }

  originalWarn(...args);
};

// ---- Global mocks for react-router-dom ----
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '1' }),
  useLocation: () => ({ pathname: '/' }),
}));

// ---- Mock Auth Context ----
jest.mock('./components/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    user: null,
    logout: jest.fn(),
  }),
}));

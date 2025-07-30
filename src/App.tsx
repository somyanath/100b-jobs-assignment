import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import ShortlistPage from './pages/ShortlistPage';

/**
 * Main application component
 * Sets up routing and context providers
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirect root to shortlist page */}
            <Route index element={<Navigate to="/shortlist" replace />} />
            <Route path="shortlist" element={<ShortlistPage />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
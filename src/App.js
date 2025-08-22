// src/App.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import Navbar from './components/Navbar';
import { auth } from './utils/firebaseConfig';
import './index.css';

// Componente principal de la aplicación
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
        Cargando...
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={7000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="glass-toast" 
      />
      <AppContent currentUser={currentUser} />
    </Router>
  );
}

// Componente que maneja la lógica de renderizado
function AppContent({ currentUser }) {
  const location = useLocation();
  
  const showNavbar = !['/auth', '/search'].includes(location.pathname);

  return (
    <motion.div 
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white"
    >
      {showNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route
          path="/admin"
          element={currentUser ? <AdminPage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/profile"
          element={currentUser ? <ProfilePage /> : <Navigate to="/auth" />}
        />
        <Route
          path="/auth"
          element={!currentUser ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<h1>404: Página no encontrada</h1>} />
      </Routes>
    </motion.div>
  );
}

export default App;

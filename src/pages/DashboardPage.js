import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import { Film, Settings, User, LogOut, LayoutDashboard } from 'lucide-react';
import { isAdmin } from '../utils/firebaseConfig';
import { app } from '../utils/firebaseConfig';

const DashboardPage = () => {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth(app);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/'); // No user, redirect to login
        return;
      }
      const admin = await isAdmin(user.uid);
      setIsAdminUser(admin);
      setLoading(false);

      if (admin) {
        toast.success('¡Bienvenido, Administrador!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    };
    checkAdminStatus();
  }, [navigate, auth]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-bg">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg text-text-light font-sans p-8">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-8 bg-secondary-bg rounded-3xl shadow-2xl border border-gray-800"
      >
        <header className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-extrabold text-red-600 tracking-tight">CineNerd Dashboard</h1>
          </div>
          <motion.button
            onClick={handleLogout}
            className="flex items-center text-red-400 hover:text-red-300 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <LogOut size={24} className="mr-2" />
            <span>Salir</span>
          </motion.button>
        </header>
        
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(220, 38, 38, 0.3)" }}
            className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col items-center text-center"
          >
            <Film className="text-red-500 mb-4" size={64} />
            <h2 className="text-3xl font-semibold text-white mb-3">Ver Películas</h2>
            <p className="text-gray-400 mb-6">Explora nuestro catálogo de películas, trailers y disfruta del cine.</p>
            <Link to="/home" className="admin-button-primary">
              Ir a Películas
            </Link>
          </motion.div>

          {isAdminUser && (
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(220, 38, 38, 0.3)" }}
              className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col items-center text-center"
            >
              <Settings className="text-red-500 mb-4" size={64} />
              <h2 className="text-3xl font-semibold text-white mb-3">Administrar Contenido</h2>
              <p className="text-gray-400 mb-6">Controla el universo CineNerd: añade, edita y elimina películas y anuncios.</p>
              <Link to="/admin" className="admin-button-primary">
                Ir a Admin
              </Link>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(220, 38, 38, 0.3)" }}
            className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col items-center text-center"
          >
            <User className="text-red-500 mb-4" size={64} />
            <h2 className="text-3xl font-semibold text-white mb-3">Configuración de Perfil</h2>
            <p className="text-gray-400 mb-6">Personaliza tu experiencia: actualiza tu información y preferencias.</p>
            <Link to="/profile" className="admin-button-primary">
              Editar Perfil
            </Link>
          </motion.div>
        </section>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CineNerd Dashboard. Tu centro de control personal.</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

// Componente de icono para mantener la consistencia
const BrigidCross = ({ size = 32, className = "" }) => (
    <div className={`rounded-xl ${className}`} style={{ width: size, height: size }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-blue-300 w-full h-full"
      >
        <path d="M32 32 L32 8 M32 32 L56 32 M32 32 L32 56 M32 32 L8 32" />
        <path d="M32 8 C28 12, 36 20, 32 24" />
        <path d="M56 32 C52 28, 44 36, 40 32" />
        <path d="M32 56 C36 52, 28 44, 32 40" />
        <path d="M8 32 C12 36, 20 28, 24 32" />
      </svg>
    </div>
);

const Navbar = () => {
    const { currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/auth');
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-lg border-b border-white/10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo y título */}
                <Link to="/home" className="flex items-center space-x-3">
                    <BrigidCross size={32} className="bg-white/10 border border-white/20 shadow-lg p-1.5" />
                    <span className="text-2xl font-extrabold text-white hidden sm:block">
                        Cine Brigitte
                    </span>
                </Link>

                {/* Botón de búsqueda */}
                <div className="flex-grow max-w-xl mx-4">
                    <motion.button
                        onClick={() => navigate('/search')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-3 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                                   text-gray-400 text-left flex items-center space-x-3
                                   hover:bg-white/20 transition-colors"
                    >
                        <Search className="text-blue-300/70" size={20} />
                        <span>Buscar por título...</span>
                    </motion.button>
                </div>

                {/* Botones de usuario */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {currentUser ? (
                        <>
                            <motion.button
                                onClick={() => navigate('/profile')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-blue-900/40 hover:border-blue-500/80 hover:shadow-[0_4px_20px_rgba(59,130,246,0.6)]"
                            >
                                <UserCheck size={20} className="text-blue-300" />
                                <span className="hidden md:inline">Perfil</span>
                            </motion.button>

                            <motion.button
                                onClick={handleSignOut}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-900/50 hover:border-red-500/80 hover:shadow-[0_4px_30px_rgba(239,68,68,0.7)]"
                            >
                                <LogOut size={20} className="text-blue-300 group-hover:text-red-300 transition-colors" />
                                <span className="hidden md:inline group-hover:text-red-300 transition-colors">Salir</span>
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            onClick={() => navigate('/auth')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                        >
                            <User size={20} className="text-blue-300" />
                            <span className="hidden md:inline">Iniciar Sesión</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

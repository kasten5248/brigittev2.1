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
            <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                {/* Logo y título */}
                <Link to="/home" className="flex items-center space-x-2 flex-shrink-0">
                    <BrigidCross size={24} className="bg-white/10 border border-white/20 shadow-lg p-1" />
                    <span className="text-xl sm:text-2xl font-extrabold text-white sm:block">
                        Cine Brigitte
                    </span>
                </Link>

                {/* Botón de búsqueda (icono en móviles, barra en desktop) */}
                <div className="flex-grow max-w-xl mx-auto w-auto">
                    {/* Botón de búsqueda en móviles */}
                    <motion.button
                        onClick={() => navigate('/search')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-2 sm:hidden rounded-full bg-white/10 backdrop-blur-md border border-white/20
                                   text-gray-400 flex items-center justify-center
                                   hover:bg-white/20 transition-colors"
                    >
                        <Search className="text-blue-300/70" size={18} />
                    </motion.button>
                
                    {/* Barra de búsqueda en desktop */}
                    <motion.button
                        onClick={() => navigate('/search')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="hidden sm:flex w-full p-3 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                                   text-gray-400 text-left items-center space-x-3
                                   hover:bg-white/20 transition-colors"
                    >
                        <Search className="text-blue-300/70" size={20} />
                        <span>Buscar por título...</span>
                    </motion.button>
                </div>
                

                {/* Botones de usuario */}
                <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
                    {currentUser ? (
                        <>
                            <motion.button
                                onClick={() => navigate('/profile')}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-blue-900/40 hover:border-blue-500/80 hover:shadow-[0_4px_20px_rgba(59,130,246,0.6)]"
                            >
                                <UserCheck size={16} className="sm:size-5 text-blue-300" />
                                <span className="hidden md:inline">Perfil</span>
                            </motion.button>

                            <motion.button
                                onClick={handleSignOut}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-900/50 hover:border-red-500/80 hover:shadow-[0_4px_30px_rgba(239,68,68,0.7)]"
                            >
                                <LogOut size={16} className="sm:size-5 text-blue-300 group-hover:text-red-300 transition-colors" />
                                <span className="hidden md:inline group-hover:text-red-300 transition-colors">Salir</span>
                            </motion.button>
                        </>
                    ) : (
                        <motion.button
                            onClick={() => navigate('/auth')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                        >
                            <User size={16} className="sm:size-5 text-blue-300" />
                            <span className="hidden md:inline">Iniciar Sesión</span>
                        </motion.button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

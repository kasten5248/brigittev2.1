// src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, LogOut, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';

// Componente de icono para mantener la consistencia
const BrigidCross = ({ size = 24, className = "" }) => (
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

const ProfilePage = () => {
const auth = getAuth();
const user = auth.currentUser;
const navigate = useNavigate();
const [loading, setLoading] = useState(false);

const handleLogout = async () => {
setLoading(true);
try {
await auth.signOut();
toast.success('Sesión cerrada con éxito.');
navigate('/auth');
} catch (error) {
toast.error('Error al cerrar la sesión.');
console.error(error);
} finally {
setLoading(false);
}
};

if (loading) {
return (
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
<Loader2 className="animate-spin text-blue-400 h-10 w-10" />
<span className="ml-4 text-xl">Cerrando sesión...</span>
</div>
);
}

if (!user) {
return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4">
<p className="text-2xl font-bold text-center mb-6">Debes iniciar sesión para ver tu perfil.</p>
<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
onClick={() => navigate('/auth')}
className="group px-6 py-3 rounded-xl font-semibold transition-all
bg-white/10 backdrop-blur-md border border-white/20 text-white
hover:bg-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
flex items-center"
>
Ir a Iniciar Sesión
</motion.button>
</div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4 pt-24 flex flex-col items-center">
<div className="w-full max-w-4xl mb-8 flex items-center justify-between">
<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.97 }}
onClick={() => navigate('/')}
className="group px-4 py-2 rounded-xl font-semibold transition-all
bg-white/10 backdrop-blur-md border border-white/20 text-white
hover:bg-blue-900/40 hover:border-blue-500/80
hover:shadow-[0_4px_20px_rgba(59,130,246,0.6)]
flex items-center"
>
<ArrowLeft className="mr-2 text-blue-300 transition-colors" />
<span className="text-white transition-colors">Volver al inicio</span>
</motion.button>
<div className="flex items-center space-x-3 opacity-90">
<BrigidCross size={24} className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-1.5" />
<span className="text-sm text-blue-200/90">Cine Brigitte</span>
</div>
</div>

<motion.div
initial={{ opacity: 0, y: 36 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
>
<div className="flex items-center justify-center mb-6">
<div className="p-4 rounded-full bg-white/10 border border-white/20">
<User size={48} className="text-blue-300" />
</div>
</div>
<h1 className="text-3xl font-extrabold mb-2 text-white drop-shadow">Perfil de Usuario</h1>
<p className="text-lg text-gray-200/90 mb-8">
Bienvenido, <span className="font-semibold">{user.email}</span>
</p>

<motion.button
onClick={handleLogout}
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
className="group flex items-center justify-center w-full px-4 py-3
bg-white/10 backdrop-blur-md border border-white/20 text-white
rounded-xl font-bold shadow-lg
hover:bg-red-900/50 hover:border-red-500/80
hover:shadow-[0_4px_30px_rgba(239,68,68,0.7)]
transition-all duration-300"
>
<LogOut className="mr-2 text-blue-300 group-hover:text-red-300 transition-colors" size={20} />
<span className="text-white group-hover:text-red-300 transition-colors">Cerrar Sesión</span>
</motion.button>
</motion.div>
</div>
);
};

export default ProfilePage; 

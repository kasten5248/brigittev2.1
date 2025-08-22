import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';

const PlusIcon = ({ size = 60, className = "" }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
);

const AuthPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const auth = getAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                // Lógica de inicio de sesión de Firebase
                await signInWithEmailAndPassword(auth, email, password);
                toast.success(`¡Bienvenido de vuelta, ${email}!`);
            } else {
                // Lógica de registro de Firebase
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success("¡Registro exitoso! ¡Bienvenido a Cine Brigitte!");
            }
            // Espera 1 segundo antes de navegar para que el mensaje se muestre
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error('Error de autenticación:', error);
            let errorMessage = "Ocurrió un error. Por favor, inténtalo de nuevo.";
            
            // Manejo de errores de Firebase
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'El formato del correo electrónico no es válido.';
                    break;
                case 'auth/too-many-requests': 
                    errorMessage = 'Has intentado demasiadas veces. Inténtalo más tarde.';
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Correo o contraseña incorrectos.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Este correo ya está en uso.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
                default:
                    errorMessage = error.message;
                    break;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-blue-950 to-black p-6 text-white">
            <style jsx="true">{`
                .Toastify__toast-container {
                  z-index: 9999;
                }
                /* Estilos personalizados para las notificaciones */
                .Toastify__toast {
                  background: rgba(0,0,0,0.4);
                  border-radius: 0.75rem;
                  backdrop-filter: blur(8px); /* Efecto de cristal líquido */
                  color: #fff;
                  border: 1px solid transparent; /* Quitamos el borde para usar el box-shadow */
                }
                .Toastify__toast--success {
                  box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); /* Brillo verde para los mensajes de éxito */
                }
                .Toastify__toast--error {
                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6); /* Brillo azul para los mensajes de error */
                }
                .Toastify__toast-body {
                  color: white !important;
                }
                /* Estilo para la barra de progreso */
                .Toastify__progress-bar--error {
                    background-color: #3b82f6; /* Color azul del icono */
                }
                .Toastify__progress-bar--success {
                    background-color: #10B981; /* Color verde para la barra de éxito */
                }
            `}</style>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden"
            >
                {/* Columna izquierda - Branding */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="hidden md:flex flex-col justify-center items-start p-10 w-1/2 bg-gradient-to-b from-blue-900/40 to-transparent"
                >
                    <PlusIcon size={70} className="text-blue-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.9)]" />
                    <h2 className="mt-6 text-4xl font-extrabold drop-shadow-lg text-blue-300">
                        Cine Brigitte
                    </h2>
                    <p className="mt-3 text-lg text-gray-300 leading-snug">
                        Tu cine favorito, <span className="text-blue-400 font-semibold">siempre contigo</span>.
                    </p>
                </motion.div>

                {/* Columna derecha - Formulario */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col justify-center p-10 w-full md:w-1/2"
                >
                    <h1 className="text-3xl font-bold mb-6 text-center md:text-left drop-shadow">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h1>
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition"
                            required
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-lg transition-all duration-300 
                            ${isLoading
                                ? "bg-blue-500/40 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.9)]"
                            }`}
                        >
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> Procesando...
                                    </motion.div>
                                ) : (
                                    <motion.span key="button-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                                        {isLogin ? <><LogIn className="w-5 h-5 mr-2" /> Iniciar Sesión</> : <><UserPlus className="w-5 h-5 mr-2" /> Registrarse</>}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>
                    <p className="mt-6 text-center text-gray-300">
                        {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-400 hover:underline font-semibold"
                        >
                            {isLogin ? "Regístrate" : "Inicia sesión"}
                        </button>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthPage;

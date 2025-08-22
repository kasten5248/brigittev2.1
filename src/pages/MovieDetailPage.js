// src/pages/MovieDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import MovieInfo from './MovieInfo';
import MoviePlayer from './MoviePlayer';
import { BrigidCross } from '../components/Navbar';


const MovieDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estado UI / Player
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showPlayerUI, setShowPlayerUI] = useState(false);

    // Cargar película
    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const { data, error } = await supabase
                    .from('movies')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error) throw error;
                if (!data) throw new Error("Película no encontrada.");
                setMovie(data);
            } catch (err) {
                console.error("Error fetching movie details:", err.message);
                setError(err.message === "Película no encontrada." ? err.message : "Error al cargar los detalles de la película.");
            } finally {
                setLoading(false);
            }
        };
        fetchMovie();
    }, [id]);

    const handlePlayClick = () => {
      setShowPlayerUI(true);
    }
    
    const handleCloseVideo = () => {
      setShowPlayerUI(false);
    }

    // ⏳ Loading
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
                <Loader2 className="animate-spin text-blue-400 h-10 w-10" />
                <p className="ml-4 text-lg">Cargando detalles de la película...</p>
            </div>
        );
    }

    // ❗ Error
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4">
                <AlertCircle className="text-blue-400 mb-4" size={48} />
                <p className="text-2xl text-blue-300 font-bold mb-2">Error</p>
                <p className="text-gray-300 text-lg text-center">{error}</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-3 rounded-full font-semibold transition-all
                    bg-white/10 backdrop-blur-md border border-white/20 text-white
                    hover:bg-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                    flex items-center"
                >
                    <ArrowLeft className="mr-2" /> Volver a la página principal
                </motion.button>
            </div>
        );
    }

    // ✅ Vista principal
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white pt-24 pb-10">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/')}
                        className="px-4 py-2 rounded-full font-semibold transition-all
                        bg-white/10 backdrop-blur-md border border-white/20 text-white
                        hover:bg-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]
                        flex items-center"
                    >
                        <ArrowLeft className="mr-2" /> Volver a la lista de películas
                    </motion.button>

                    <div className="flex items-center space-x-3 opacity-90">
                        <BrigidCross size={24} className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg p-1.5" />
                        <span className="text-sm text-blue-200/90">Cine Brigitte</span>
                    </div>
                </div>

                {movie && (
                    <motion.div
                        initial={{ opacity: 0, y: 36 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="rounded-2xl shadow-xl overflow-hidden p-6 md:p-8
                        bg-white/10 backdrop-blur-md border border-white/20"
                    >
                        <AnimatePresence mode="wait">
                            {!showPlayerUI ? (
                                <MovieInfo movie={movie} onPlayClick={handlePlayClick} />
                            ) : (
                                <MoviePlayer movie={movie} onClose={handleCloseVideo} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-black/70 backdrop-blur-md border-t border-white/20 text-center py-6 mt-10">
                <p className="text-blue-300 italic text-lg">
                    @2025 Cine Brigitte — “Historias que iluminan la pantalla”
                </p>
            </footer>
        </div>
    );
};

export default MovieDetailPage;
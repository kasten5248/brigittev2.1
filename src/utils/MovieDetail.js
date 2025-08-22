// src/MovieDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient'; // Importa el cliente de Supabase
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Star, Calendar, Info, Loader2 } from 'lucide-react';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            try {
                // Obtiene la película de Supabase por su ID
                const { data, error } = await supabase
                    .from('movies')
                    .select('*')
                    .eq('id', id)
                    .single(); // Obtiene solo un registro

                if (error) {
                    throw error;
                }

                setMovie(data);
            } catch (err) {
                console.error("Error al obtener la película: ", err.message);
                setError('Ocurrió un error al cargar la película.');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                <Loader2 className="animate-spin text-red-600 h-10 w-10" />
                <span className="ml-4 text-xl">Cargando detalles de la película...</span>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-4">
                <p className="text-2xl text-red-500 font-bold mb-4">{error || 'Película no encontrada.'}</p>
                <motion.button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-white px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="mr-2" size={20} /> Volver a la página de inicio
                </motion.button>
            </div>
        );
    }

    // Convertir el rating a un formato más legible (ej. 7.8)
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

    return (
        <div className="min-h-screen bg-gray-950 text-white pt-24 pb-8">
            <div className="container mx-auto px-4">
                <motion.button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-white px-4 py-2 mb-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="mr-2" size={20} /> Volver
                </motion.button>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col lg:flex-row bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800"
                >
                    {movie.posterUrl && (
                        <div className="lg:w-1/3 w-full flex-shrink-0">
                            <img
                                src={movie.posterUrl}
                                alt={`Póster de ${movie.title}`}
                                className="w-full h-auto lg:h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-8 lg:p-12 flex-grow">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-red-600 mb-4">
                            {movie.title}
                        </h1>
                        <p className="text-lg text-gray-300 mb-6 flex items-center">
                            <Star className="text-yellow-400 mr-2" size={20} />
                            <span className="font-bold text-xl">{rating}</span> / 10
                        </p>
                        
                        <div className="space-y-4 text-gray-400 mb-8">
                            <p className="flex items-center">
                                <Calendar className="text-red-500 mr-3" size={20} />
                                <span className="font-semibold text-white mr-2">Fecha de Lanzamiento:</span>
                                {movie.release_date || 'N/A'}
                            </p>
                            <p className="flex items-start">
                                <Info className="text-red-500 mr-3 mt-1" size={20} />
                                <span className="font-semibold text-white mr-2">Resumen:</span>
                                <span className="flex-1">{movie.overview || 'Sin resumen disponible.'}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MovieDetail;

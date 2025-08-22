// src/pages/MovieInfo.js
import React from 'react';
import { motion } from 'framer-motion';
import { User, Compass, Star, Play } from 'lucide-react';
import { BrigidCross } from '../components/Navbar';

const MovieInfo = ({ movie, onPlayClick }) => {
    return (
        <motion.div
            key="movie-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8"
        >
            {/* Póster + botón reproducir */}
            <div
                className="w-full md:w-80 relative group rounded-xl overflow-hidden flex-shrink-0
                border border-white/10 bg-black/30"
            >
                {movie.cover_image_url ? (
                    <img
                        src={movie.cover_image_url}
                        alt={movie.title}
                        className="w-full h-auto object-cover transition-transform duration-300
                        group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-96 bg-black/40 flex items-center justify-center">
                        <p className="text-center text-gray-300">Sin póster disponible</p>
                    </div>
                )}

                {/* Borde luminoso azul al hover */}
                <div className="pointer-events-none absolute inset-0 rounded-xl
                ring-0 group-hover:ring-2 ring-blue-400/60 transition
                group-hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]" />

                {movie.youtube_url && (
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={onPlayClick}
                        className="absolute inset-0 flex items-center justify-center
                        bg-gradient-to-t from-black/70 via-black/30 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <div className="p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <Play size={56} className="text-blue-300 drop-shadow" />
                        </div>
                    </motion.button>
                )}
            </div>

            {/* Detalles */}
            <div className="w-full md:flex-1">
                <h1 className="text-4xl font-extrabold text-white mb-4 drop-shadow">
                    {movie.title}
                </h1>
                <p className="text-gray-200/90 mb-6 text-lg">
                    {movie.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200/90 mb-2">
                    <div className="flex items-center">
                        <User className="text-blue-300 mr-2" size={20} />
                        <span>Director: <span className="font-semibold text-white">{movie.director}</span></span>
                    </div>
                    <div className="flex items-center">
                        <Compass className="text-blue-300 mr-2" size={20} />
                        <span>Género: <span className="font-semibold text-white">{movie.genre}</span></span>
                    </div>
                    <div className="flex items-center">
                        <Star className="text-blue-300 mr-2" size={20} />
                        <span>Clasificación: <span className="font-semibold text-white">{movie.rating}</span></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MovieInfo;


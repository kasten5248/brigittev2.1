// src/components/MovieCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
    return (
        // Enlazar la tarjeta a la página de detalles de la película
        <Link to={`/movie/${movie.id}`}>
            <motion.div
                className="relative w-full overflow-hidden rounded-xl shadow-lg border border-gray-800 cursor-pointer group"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(59, 130, 246, 0.4)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Contenedor con relación de aspecto para la imagen */}
                <div className="w-full h-0 pb-[150%] relative">
                    <img
                        src={movie.cover_image_url}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                        onError={(e) => {
                            // Placeholder si la imagen falla
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/400x600/1a202c/a0aec0?text=Poster+No+Disponible";
                        }}
                    />
                </div>

                {/* Overlay con el título de la película */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end">
                    <h3 className="text-xl font-bold text-white leading-tight">
                        {movie.title}
                    </h3>
                </div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;

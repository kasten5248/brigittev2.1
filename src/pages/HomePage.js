// src/pages/HomePage.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

// 🔹 Icono de la Cruz de Santa Brígida (SVG)
const BrigidCross = ({ size = 48, className = "" }) => (
<div
className={`p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg ${className}`}
style={{ width: size, height: size }}
>
<svg
xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 64 64"
fill="none"
stroke="currentColor"
strokeWidth="3"
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

const HomePage = ({ searchTerm }) => {
const [movies, setMovies] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const navigate = useNavigate();

// 🔹 Cargar películas desde Supabase
useEffect(() => {
const fetchMovies = async () => {
try {
const { data, error } = await supabase.from("movies").select("*");
if (error) throw error;
setMovies(data);
} catch (err) {
console.error("Error al obtener películas: ", err.message);
setError("Error al cargar las películas. Verifica tu conexión.");
} finally {
setLoading(false);
}
};

fetchMovies();
}, []);

// 🔹 Filtrar películas por término de búsqueda
const filteredMovies = movies.filter((movie) =>
(movie.title || "").toLowerCase().includes((searchTerm || "").toLowerCase())
);

// 🔹 Estado de carga
if (loading) {
return (
<div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
<Loader2 className="animate-spin text-blue-400 h-10 w-10" />
<p className="ml-4 text-lg">Cargando películas...</p>
</div>
);
}

// 🔹 Estado de error
if (error) {
return (
<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4">
<AlertCircle className="text-blue-400 mb-4" size={48} />
<p className="text-2xl text-blue-400 font-bold mb-2">Error de conexión</p>
<p className="text-gray-300 text-lg text-center">{error}</p>
</div>
);
}

// 🔹 Manejar click en póster con animación de rebote
const handleMovieClick = (id) => {
const poster = document.getElementById(`poster-${id}`);
if (poster) {
poster.classList.add("scale-90");
setTimeout(() => {
poster.classList.remove("scale-90");
navigate(`/movie/${id}`);
}, 200);
}
};

return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-blue-900 to-black text-white pt-24">
<div className="container mx-auto flex-grow p-4">
{/* Título */}
<h1 className="text-4xl font-extrabold text-white mb-6 flex items-center drop-shadow-lg">
<BrigidCross className="mr-4" size={48} />
Películas Disponibles
</h1>

{/* Grid de Películas */}
<AnimatePresence>
{filteredMovies.length > 0 ? (
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
{filteredMovies.map((movie) => (
<motion.div
key={movie.id}
id={`poster-${movie.id}`}
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
transition={{ duration: 0.3 }}
onClick={() => handleMovieClick(movie.id)}
className="group relative cursor-pointer transform transition-all duration-300
hover:scale-105 active:scale-95 rounded-xl overflow-hidden
shadow-lg border border-gray-700 hover:border-blue-400
backdrop-blur-md hover:shadow-[0_0_30px_rgba(59,130,246,0.9)]
animate-neon"
>
{/* Póster */}
{movie.cover_image_url ? (
<img
src={movie.cover_image_url}
alt={movie.title}
className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
/>
) : (
<div className="w-full h-full bg-black/30 flex items-center justify-center p-4">
<p className="text-center text-gray-300">Sin póster</p>
</div>
)}

{/* Overlay con título */}
<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent
opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
<p className="text-white font-semibold text-sm truncate drop-shadow-md">
{movie.title}
</p>
</div>
</motion.div>
))}
</div>
) : (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-xl flex flex-col items-center justify-center text-center mt-16 shadow-xl"
>
<AlertCircle className="text-blue-400 mb-4" size={48} />
<p className="text-white text-2xl font-bold mb-2">
¡No hay películas disponibles!
</p>
<p className="text-gray-300 text-lg">
Por favor, agrega películas a la tabla <code>movies</code> en Supabase.
</p>
</motion.div>
)}
</AnimatePresence>
</div>

{/* Footer */}
<footer className="bg-black/70 backdrop-blur-md border-t border-white/20 text-center py-6 mt-8">
<p className="text-blue-300 italic text-lg">
@2025 Cine Brigitte — “Historias que iluminan la pantalla”
</p>
</footer>
</div>
);
};

export default HomePage;

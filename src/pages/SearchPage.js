// src/pages/SearchPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { Search, X, Keyboard, ArrowLeft } from 'lucide-react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const numbers = '1234567890'.split('');
const keyboardLayout = 'QWERTYUIOPASDFGHJKLÑZXCVBNM'.split('');


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

const SearchPage = () => {
const [searchTerm, setSearchTerm] = useState('');
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);
const [genres, setGenres] = useState([]);
const [showKeyboard, setShowKeyboard] = useState(false);
const navigate = useNavigate();

// Fetch genres on component mount
useEffect(() => {
const fetchGenres = async () => {
try {
const { data, error } = await supabase
.from('movies')
.select('genre');

if (error) throw error;

// Get unique genres
const uniqueGenres = [...new Set(data.map(item => item.genre))];
setGenres(uniqueGenres);
} catch (error) {
console.error('Error fetching genres:', error.message);
}
};
fetchGenres();
}, []);

const fetchMovies = useCallback(async (query, filterType = 'title') => {
if (!query) {
setResults([]);
return;
}
setLoading(true);
try {
let request;
if (filterType === 'genre') {
request = supabase.from('movies').select('*').eq('genre', query);
} else { // Default to title search
request = supabase.from('movies').select('*').ilike('title', `%${query}%`);
}

const { data, error } = await request;

if (error) throw error;
setResults(data);
} catch (error) {
console.error('Error fetching movies:', error.message);
setResults([]);
} finally {
setLoading(false);
}
}, []);

useEffect(() => {
const handler = setTimeout(() => {
fetchMovies(searchTerm);
}, 500);

return () => clearTimeout(handler);
}, [searchTerm, fetchMovies]);

const handleFilterClick = (filter, type) => {
setSearchTerm(filter);
fetchMovies(filter, type);
};

const handleKeyClick = (key) => {
if (key === '⌫') {
setSearchTerm(prev => prev.slice(0, -1));
} else if (key === 'Espacio') {
setSearchTerm(prev => prev + ' ');
} else {
setSearchTerm(prev => prev + key);
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4 pt-8 md:pt-12">
<div className="container mx-auto">
{/* Header simétrico */}
<div className="flex items-center justify-between mb-8 gap-8">
{/* Lado Izquierdo: Botón Volver */}
<div className="flex-1 flex justify-start">
<motion.button
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.97 }}
onClick={() => navigate(-1)}
className="flex items-center px-4 py-3 rounded-full font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] whitespace-nowrap"
>
<ArrowLeft className="mr-2" /> Volver
</motion.button>
</div>

{/* Centro: Barra de Búsqueda */}
<div className="relative flex-grow max-w-2xl">
<Search className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300/70 z-10" size={20} />
<input
type="text"
placeholder="Buscar por título..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="w-full pl-14 pr-24 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80 transition-all text-lg"
/>
<div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
{searchTerm && (
<button onClick={() => setSearchTerm('')} className="p-2 rounded-full hover:bg-white/10 transition-colors">
<X size={20} className="text-gray-400" />
</button>
)}
<button onClick={() => setShowKeyboard(!showKeyboard)} className={`p-2 rounded-full transition-colors ${showKeyboard ? 'bg-blue-600/50' : 'hover:bg-white/10'}`}>
<Keyboard size={20} className="text-blue-300" />
</button>
</div>
</div>

{/* Lado Derecho: Logo y Título */}
<div className="flex-1 flex justify-end">
<div className="flex items-center space-x-3 opacity-90">
<span className="text-2xl font-extrabold text-white hidden sm:block">
Cine Brigitte
</span>
<BrigidCross size={32} className="bg-white/10 border border-white/20 shadow-lg p-1.5" />
</div>
</div>
</div>

{/* Contenido principal de dos columnas */}
<div className="flex flex-col md:flex-row gap-8">
{/* Columna Izquierda: Filtros */}
<aside className="w-full md:w-1/4 lg:w-1/5">
<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
<h2 className="text-lg font-bold mb-4 text-blue-300">Búsqueda Rápida</h2>
<div className="flex flex-wrap gap-2 mb-6">
{alphabet.map(letter => (
<button key={letter} onClick={() => handleFilterClick(letter, 'title')} className="w-8 h-8 rounded-md bg-white/10 text-white font-bold hover:bg-blue-600/50 transition-colors text-sm">{letter}</button>
))}
{numbers.map(num => (
<button key={num} onClick={() => handleFilterClick(num, 'title')} className="w-8 h-8 rounded-md bg-white/10 text-white font-bold hover:bg-blue-600/50 transition-colors text-sm">{num}</button>
))}
</div>
<h2 className="text-lg font-bold mb-4 text-blue-300">Géneros</h2>
<div className="flex flex-col space-y-2">
{genres.map(genre => (
<button key={genre} onClick={() => handleFilterClick(genre, 'genre')} className="text-left text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-md transition-colors">
{genre}
</button>
))}
</div>
</div>
</aside>

{/* Columna Derecha: Resultados */}
<main className="w-full md:w-3/4 lg:w-4/5">
<h2 className="text-2xl font-bold mb-6">
{searchTerm ? `Resultados para "${searchTerm}"` : "Recomendaciones"}
</h2>
{loading ? (
<p className="text-center">Buscando...</p>
) : (
<motion.div
layout
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-6"
>
{results.map(movie => (
<motion.div
layout
key={movie.id}
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={() => navigate(`/movie/${movie.id}`)}
className="bg-white/5 rounded-lg overflow-hidden group cursor-pointer shadow-lg"
>
<div className="aspect-[2/3] overflow-hidden">
<img src={movie.cover_image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
</div>
<div className="p-3 bg-black/20">
<h3 className="font-bold truncate text-white">{movie.title}</h3>
</div>
</motion.div>
))}
</motion.div>
)}
{!loading && searchTerm && results.length === 0 && (
<p className="text-center text-gray-400 mt-8">No se encontraron resultados.</p>
)}
</main>
</div>
</div>

{/* Teclado Virtual */}
<AnimatePresence>
{showKeyboard && (
<motion.div
initial={{ y: "100%", opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
exit={{ y: "100%", opacity: 0 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg p-4 rounded-t-2xl z-50"
>
<div className="grid grid-cols-10 gap-2 max-w-3xl mx-auto">
{keyboardLayout.map(key => (
<button key={key} onClick={() => handleKeyClick(key)} className="h-12 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-blue-600/50 transition-colors">
{key}
</button>
))}
<button onClick={() => handleKeyClick('⌫')} className="col-span-2 h-12 rounded-lg bg-white/20 border border-white/20 text-white font-bold text-lg hover:bg-red-600/50 transition-colors">⌫</button>
<button onClick={() => handleKeyClick('Espacio')} className="col-span-8 h-12 rounded-lg bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-blue-600/50 transition-colors">Espacio</button>
</div>
</motion.div>
)}
</AnimatePresence>
</div>
);
};

export default SearchPage;

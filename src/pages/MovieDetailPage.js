 // src/pages/MovieDetailPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
User, Compass, Star, ArrowLeft, Loader2, AlertCircle, Play, Pause,
Maximize, Minimize, Volume2, VolumeX, X, Repeat
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';


// 🔷 Icono: Cruz de Santa Brígida (en línea, con “cristal líquido”)
const BrigidCross = ({ size = 18, className = "" }) => (
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

const MovieDetailPage = () => {
const { id } = useParams();
const navigate = useNavigate();

// Estado UI / Player
const [movie, setMovie] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showPlayerUI, setShowPlayerUI] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [currentTime, setCurrentTime] = useState(0);
const [duration, setDuration] = useState(0);
const [isControlsVisible, setIsControlsVisible] = useState(true);
const [controlsTimeout, setControlsTimeout] = useState(null);
const [volume, setVolume] = useState(1);
const [lastVolume, setLastVolume] = useState(1);
const [videoEnded, setVideoEnded] = useState(false);
const [isTransitioningToFullscreen, setIsTransitioningToFullscreen] = useState(false);
const [isFullscreen, setIsFullscreen] = useState(false);

// Refs
const youtubePlayerRef = useRef(null);
const playerContainerRef = useRef(null);
const playerInstance = useRef(null);

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

// Cargar API de YouTube
useEffect(() => {
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
if (firstScriptTag) {
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
} else {
document.head.appendChild(tag);
}
window.onYouTubeIframeAPIReady = () => {
// listo
};
return () => {
if (playerInstance.current) {
playerInstance.current.destroy();
playerInstance.current = null;
}
};
}, []);

// Listener para el estado de pantalla completa
useEffect(() => {
const handleFullscreenChange = () => {
setIsFullscreen(!!document.fullscreenElement);
};
document.addEventListener('fullscreenchange', handleFullscreenChange);
return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
}, []);

// Actualizar progreso
useEffect(() => {
let interval;
if (isPlaying) {
interval = setInterval(() => {
if (playerInstance.current?.getCurrentTime) {
const t = playerInstance.current.getCurrentTime();
setCurrentTime(t);
if (duration === 0) setDuration(playerInstance.current.getDuration());
}
}, 100);
}
return () => clearInterval(interval);
}, [isPlaying, duration]);

// Util: obtener ID de YouTube
const getYouTubeVideoId = (url) => {
if (!url) return null;
try {
const u = new URL(url);
if (u.hostname.includes('youtube.com')) {
return new URLSearchParams(u.search).get('v');
} else if (u.hostname === 'youtu.be') {
return u.pathname.substring(1);
}
} catch (e) {
console.error("Invalid YouTube URL:", url);
}
return null;
};

// Función para ocultar controles
const hideControls = () => {
clearTimeout(controlsTimeout);
const t = setTimeout(() => setIsControlsVisible(false), 4000);
setControlsTimeout(t);
};

// Inicializar reproductor
const initializePlayer = (videoId, autoplay = 0) => {
if (!videoId || !youtubePlayerRef.current || playerInstance.current) return;
setVideoEnded(false);
playerInstance.current = new window.YT.Player(youtubePlayerRef.current, {
videoId,
playerVars: {
autoplay,
controls: 0,
modestbranding: 1,
rel: 0,
showinfo: 0,
},
events: {
onReady: onPlayerReady,
onStateChange: onPlayerStateChange,
},
});
};

const onPlayerReady = (event) => {
event.target.playVideo();
setDuration(event.target.getDuration());
setIsPlaying(true);
event.target.setVolume(volume * 100);
};

const onPlayerStateChange = (event) => {
const YT = window.YT;
if (!YT) return;
if (event.data === YT.PlayerState.PLAYING) {
setIsPlaying(true);
setVideoEnded(false);
hideControls(); // Ocultar controles al empezar a reproducir
} else if (event.data === YT.PlayerState.PAUSED) {
setIsPlaying(false);
clearTimeout(controlsTimeout); // Cancelar el temporizador si se pausa
setIsControlsVisible(true); // Mostrar controles en pausa
} else if (event.data === YT.PlayerState.ENDED) {
setIsPlaying(false);
setVideoEnded(true);
clearTimeout(controlsTimeout);
setIsControlsVisible(true);
}
};

const handlePlayClick = () => {
if (!movie?.youtube_url) return;
const videoId = getYouTubeVideoId(movie.youtube_url);
if (!videoId) return;
setShowPlayerUI(true);
if (window.YT?.Player && !playerInstance.current) {
initializePlayer(videoId, 1);
} else if (playerInstance.current) {
playerInstance.current.playVideo();
}
};

const handlePauseClick = () => playerInstance.current?.pauseVideo();

const handleSeek = (e) => {
const progressBar = e.currentTarget;
const clickPosition = e.nativeEvent.offsetX;
const newTime = (clickPosition / progressBar.offsetWidth) * duration;
if (playerInstance.current) {
playerInstance.current.seekTo(newTime, true);
setCurrentTime(newTime);
}
};

const handleVolumeChange = (e) => {
const v = parseFloat(e.target.value);
setVolume(v);
if (playerInstance.current) playerInstance.current.setVolume(v * 100);
if (v > 0) {
setIsMuted(false);
setLastVolume(v);
} else {
setIsMuted(true);
}
};

const handleMuteToggle = () => {
if (isMuted) {
setVolume(lastVolume);
playerInstance.current?.setVolume(lastVolume * 100);
setIsMuted(false);
} else {
setLastVolume(volume);
setVolume(0);
playerInstance.current?.setVolume(0);
setIsMuted(true);
}
};

const handleFullscreenClick = () => {
if (!playerContainerRef.current) return;

if (isFullscreen) {
document.exitFullscreen();
return;
}

setIsTransitioningToFullscreen(true);

setTimeout(() => {
if (playerContainerRef.current.requestFullscreen) {
playerContainerRef.current.requestFullscreen();
} else if (playerContainerRef.current.webkitRequestFullscreen) {
playerContainerRef.current.webkitRequestFullscreen();
} else if (playerContainerRef.current.msRequestFullscreen) {
playerContainerRef.current.msRequestFullscreen();
}

setTimeout(() => {
setIsTransitioningToFullscreen(false);
}, 500);
}, 1200);
};

const formatTime = (time) => {
const m = Math.floor(time / 60);
const s = Math.floor(time % 60);
return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const handleMouseMove = () => {
setIsControlsVisible(true);
if (isPlaying) {
hideControls();
}
};

const handleMouseLeave = () => {
if (isPlaying) {
setIsControlsVisible(false);
}
};

const handleCloseVideo = () => {
if (playerInstance.current) {
playerInstance.current.pauseVideo();
playerInstance.current.destroy();
playerInstance.current = null;
}
setShowPlayerUI(false);
setIsPlaying(false);
setDuration(0);
setCurrentTime(0);
setIsControlsVisible(true);
setVideoEnded(false);
};

const handleReplayClick = () => {
if (!movie?.youtube_url) return;
const videoId = getYouTubeVideoId(movie.youtube_url);
if (!videoId) return;
if (playerInstance.current) {
playerInstance.current.seekTo(0, true);
playerInstance.current.playVideo();
setVideoEnded(false);
} else {
initializePlayer(videoId, 1);
}
};

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
<div className="mb-8 flex items-center justify-between">
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
onClick={handlePlayClick}
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
) : (
<motion.div
key="player-layout"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.4 }}
className="flex flex-col items-center md:items-start gap-8 w-full"
>
{/* Contenedor del reproductor */}
<div
className="w-full relative aspect-video overflow-hidden rounded-2xl
bg-black border border-white/20"
ref={playerContainerRef}
onMouseMove={handleMouseMove}
onMouseLeave={handleMouseLeave}
>
{/* YouTube */}
<div
id="youtube-player"
ref={youtubePlayerRef}
className="absolute w-full h-full z-0"
/>

{/* UI personalizada */}
<div
className={`absolute w-full h-full top-0 left-0 flex flex-col justify-between items-center rounded-2xl overflow-hidden transition-colors`}
>
<AnimatePresence>
{/* Transición a pantalla completa */}
{isTransitioningToFullscreen && (
<motion.div
key="fullscreen-transition"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3 }}
className="absolute inset-0 flex items-center justify-center bg-black z-50"
>
<motion.h2
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2, duration: 0.5 }}
className="text-white text-3xl font-bold drop-shadow-lg"
>
{movie?.title}
</motion.h2>
</motion.div>
)}

{/* Overlay de Pausa con Desenfoque Fuerte */}
{!isPlaying && !videoEnded && (
<motion.div
key="pause-overlay"
initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
transition={{ duration: 0.5, ease: 'easeInOut' }}
className="absolute inset-0 z-10 flex flex-col items-start justify-start p-4 bg-black/40 pointer-events-none"
>
<h2 className="text-white text-2xl font-bold drop-shadow-lg">
{movie.title}
</h2>
</motion.div>
)}

{/* Pantalla de fin de video con desenfoque */}
{videoEnded && (
<motion.div
key="ended-overlay"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}
className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl"
>
{isFullscreen && (
<div className="absolute top-4 right-4">
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={handleFullscreenClick}
className="p-2 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
>
<Minimize size={22} />
</motion.button>
</div>
)}
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={handleReplayClick}
className="p-4 rounded-full text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
>
<Repeat size={44} className="text-blue-300" />
</motion.button>
<p className="mt-4 text-xl font-bold text-white drop-shadow-lg">Ver de nuevo</p>
</motion.div>
)}

{/* Contenedor de controles (solo visible si el video no ha terminado) */}
<AnimatePresence>
{isControlsVisible && !videoEnded && (
<motion.div
key="controls-container"
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.3 }}
className="absolute inset-0 z-20 flex flex-col justify-between pointer-events-none"
>
{/* Botón de cerrar */}
<div className="flex justify-end items-start w-full p-4 pointer-events-auto">
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={handleCloseVideo}
className="p-2 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
>
<X size={22} />
</motion.button>
</div>

{/* Botón central */}
<div className="absolute inset-0 flex flex-col items-center justify-center">
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={isPlaying ? handlePauseClick : handlePlayClick}
className="p-4 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition pointer-events-auto"
>
{isPlaying ? <Pause size={48} className="text-blue-300" /> : <Play size={48} className="text-blue-300" />}
</motion.button>
</div>

{/* Barra de controles inferior */}
<div className="w-full bg-[#0d253f] rounded-b-2xl px-4 pb-2 pointer-events-auto">
<div className="flex justify-end items-center mb-1 pt-1">
<div className="flex items-center space-x-2 opacity-90">
<BrigidCross size={18} />
<span className="text-xs font-semibold text-blue-200/90">Cine Brigitte</span>
</div>
</div>
<div
className="w-full h-2 bg-white/20 rounded-full cursor-pointer group"
onClick={handleSeek}
>
<div
className="h-full rounded-full transition-all duration-150 ease-linear bg-gradient-to-r from-blue-400 to-blue-600"
style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
/>
</div>
<div className="flex items-center justify-between mt-2">
<div className="flex items-center space-x-2">
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={isPlaying ? handlePauseClick : handlePlayClick}
className="p-1 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
>
{isPlaying ? <Pause size={18} /> : <Play size={18} />}
</motion.button>
<div className="flex items-center space-x-2 text-xs font-semibold">
<span>{formatTime(currentTime)}</span>
<span>/</span>
<span>{formatTime(duration)}</span>
</div>
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={handleMuteToggle}
className="p-1 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
>
{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
</motion.button>
<input
type="range"
min="0"
max="1"
step="0.01"
value={volume}
onChange={handleVolumeChange}
className="w-16 cursor-pointer accent-blue-500"
/>
</div>
<div className="flex items-center space-x-2">
<motion.button
whileHover={{ scale: 1.08 }}
whileTap={{ scale: 0.94 }}
onClick={handleFullscreenClick}
className="p-1 rounded-full text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
>
{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
</motion.button>
</div>
</div>
</div>
</motion.div>
)}
</AnimatePresence>
</AnimatePresence>
</div>
</div>

{/* Detalles debajo del player */}
<div className="w-full mt-4">
<h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow">
{movie.title}
</h1>
<p className="text-gray-200/90 mb-6 text-lg">{movie.description}</p>
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

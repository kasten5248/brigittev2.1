// src/pages/MoviePlayer.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { Play, Pause, Maximize, Minimize, Volume2, VolumeX, X, Repeat } from 'lucide-react';
import { BrigidCross } from '../components/Navbar';


const MoviePlayer = ({ movie, onClose }) => {
    // Estado UI / Player
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
            if (movie?.youtube_url) {
                const videoId = getYouTubeVideoId(movie.youtube_url);
                if (videoId) {
                    initializePlayer(videoId, 0); // La reproducción automática está desactivada por defecto
                }
            }
        };
        return () => {
            if (playerInstance.current) {
                playerInstance.current.destroy();
                playerInstance.current = null;
            }
        };
    }, [movie]);

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
        // No se reproduce de forma automática, el usuario debe hacer clic
        // event.target.playVideo();
        setDuration(event.target.getDuration());
        setIsPlaying(false);
        event.target.setVolume(volume * 100);
    };

    const onPlayerStateChange = (event) => {
        const YT = window.YT;
        if (!YT) return;
        if (event.data === YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setVideoEnded(false);
            hideControls(); 
        } else if (event.data === YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            clearTimeout(controlsTimeout);
            setIsControlsVisible(true);
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
        // Inicia el video solo si el reproductor existe
        if (playerInstance.current) {
            playerInstance.current.playVideo();
        } else if (window.YT?.Player && !playerInstance.current) {
             // Si el reproductor no existe, lo inicializa y lo reproduce
            initializePlayer(videoId, 1);
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
        } else {
            if (playerContainerRef.current.requestFullscreen) {
                playerContainerRef.current.requestFullscreen();
            } else if (playerContainerRef.current.webkitRequestFullscreen) {
                playerContainerRef.current.webkitRequestFullscreen();
            } else if (playerContainerRef.current.msRequestFullscreen) {
                playerContainerRef.current.msRequestFullscreen();
            }
        }
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
        onClose();
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

    return (
        <AnimatePresence>
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
                    bg-black border border-black"
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
                                                onClick={onClose}
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
            </motion.div>
        </AnimatePresence>
    );
};

export default MoviePlayer;


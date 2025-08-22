// src/components/MoviePlayerModal.js
import React from 'react';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import { X } from 'lucide-react';

const MoviePlayerModal = ({ isOpen, onClose, videoUrl, title }) => {
  if (!isOpen || !videoUrl) return null;

  const getYouTubeVideoId = (url) => {
    try {
      const urlObject = new URL(url);
      if (urlObject.hostname === 'www.youtube.com' || urlObject.hostname === 'youtube.com') {
        return urlObject.searchParams.get('v');
      } else if (urlObject.hostname === 'youtu.be') {
        return urlObject.pathname.substring(1);
      }
      return null;
    } catch (e) {
      console.error("URL de YouTube inválida:", e);
      return null;
    }
  };

  const videoId = getYouTubeVideoId(videoUrl);

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-lg shadow-2xl p-4 sm:p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition"
          aria-label="Cerrar reproductor"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-10">{title}</h2>
        
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
          {videoId ? (
            <YouTube videoId={videoId} opts={opts} />
          ) : (
            <div className="flex items-center justify-center h-full text-white text-lg">
              No se pudo cargar el video. URL inválida.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MoviePlayerModal;

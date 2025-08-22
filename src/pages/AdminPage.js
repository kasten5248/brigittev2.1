// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Plus, X, Pencil, Trash2, Film, Loader2, ArrowLeft } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMovie, setCurrentMovie] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        year: '',
        director: '',
        cover_image_url: '',
        youtube_url: '',
        genre: '',
        rating: ''
    });

    const isAdmin = user && user.email === 'admin@admin.com';

    useEffect(() => {
        if (isAdmin) {
            fetchMovies();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

    const fetchMovies = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('movies').select('*');
        if (error) {
            toast.error('Error al cargar las películas.');
        } else {
            setMovies(data);
        }
        setLoading(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (isEditing) {
            const { error } = await supabase.from('movies').update(form).eq('id', currentMovie.id);
            if (error) {
                toast.error('Error al actualizar la película.');
            } else {
                toast.success('Película actualizada con éxito.');
                fetchMovies();
                closeModal();
            }
        } else {
            const { error } = await supabase.from('movies').insert([form]);
            if (error) {
                toast.error('Error al agregar la película.');
            } else {
                toast.success('Película agregada con éxito.');
                fetchMovies();
                closeModal();
            }
        }
        setLoading(false);
    };

    const handleEdit = (movie) => {
        setForm(movie);
        setCurrentMovie(movie);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        // Usaremos un modal de confirmación en el futuro, por ahora un simple confirm
        if (window.confirm('¿Estás seguro de que quieres eliminar esta película?')) {
            setLoading(true);
            const { error } = await supabase.from('movies').delete().eq('id', id);
            if (error) {
                toast.error('Error al eliminar la película.');
            } else {
                toast.success('Película eliminada con éxito.');
                fetchMovies();
            }
            setLoading(false);
        }
    };

    const openModal = () => {
        setForm({ title: '', description: '', year: '', director: '', cover_image_url: '', youtube_url: '', genre: '', rating: '' });
        setIsEditing(false);
        setCurrentMovie(null);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    if (loading && !showModal) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
                <Loader2 className="animate-spin text-blue-400 h-10 w-10" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white">
                <p className="text-2xl text-red-500 font-bold mb-4">Acceso Denegado</p>
                <motion.button onClick={() => navigate('/home')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center px-4 py-2 rounded-full font-semibold transition-all bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20">
                    <ArrowLeft className="mr-2" /> Volver al inicio
                </motion.button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black text-white p-4 pt-24">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-extrabold flex items-center drop-shadow-lg">
                        <Film className="text-blue-400 mr-4" size={32} />
                        Panel de Administración
                    </h1>
                    <motion.button onClick={openModal} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all">
                        <Plus className="mr-2" size={20} />
                        Agregar Película
                    </motion.button>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Título</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Año</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">Director</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-blue-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            <AnimatePresence>
                                {movies.map((movie) => (
                                    <motion.tr key={movie.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="hover:bg-black/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{movie.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{movie.director}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(movie)} className="text-blue-400 hover:text-blue-300 mr-4 transition-colors" aria-label="Editar"><Pencil size={20} /></button>
                                            <button onClick={() => handleDelete(movie.id)} className="text-red-500 hover:text-red-400 transition-colors" aria-label="Eliminar"><Trash2 size={20} /></button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <AnimatePresence>
                    {showModal && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }} className="bg-white/10 border border-white/20 rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
                                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Editar Película' : 'Agregar Nueva Película'}</h2>
                                <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <input type="text" name="title" value={form.title} onChange={handleFormChange} placeholder="Título" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                    <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Descripción" className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input type="text" name="year" value={form.year} onChange={handleFormChange} placeholder="Año" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                        <input type="text" name="director" value={form.director} onChange={handleFormChange} placeholder="Director" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                        <input type="text" name="genre" value={form.genre} onChange={handleFormChange} placeholder="Género" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                        <input type="text" name="rating" value={form.rating} onChange={handleFormChange} placeholder="Clasificación" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                    </div>
                                    <input type="url" name="cover_image_url" value={form.cover_image_url} onChange={handleFormChange} placeholder="URL del Póster" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                    <input type="url" name="youtube_url" value={form.youtube_url} onChange={handleFormChange} placeholder="URL del Trailer (YouTube)" className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/80" required />
                                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all duration-300">
                                        {loading ? <Loader2 className="animate-spin"/> : (isEditing ? 'Guardar Cambios' : 'Agregar Película')}
                                    </button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPage;

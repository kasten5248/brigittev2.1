// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';

/**
 * Un hook de React personalizado para manejar el estado de autenticación del usuario.
 * @returns {{currentUser: Object|null, loading: boolean, signOut: Function}} Un objeto con el usuario actual, el estado de carga y una función para cerrar la sesión.
 */
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Establece un observador para escuchar los cambios en el estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // Limpia el observador cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    // Función para cerrar la sesión del usuario
    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    return { currentUser, loading, signOut };
};

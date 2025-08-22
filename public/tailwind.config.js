/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configura las rutas de los archivos donde Tailwind buscará clases
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Define tus colores personalizados para un uso consistente
      colors: {
        'primary-bg': '#1a202c',
        'secondary-bg': '#2d3748',
        'accent-teal': '#38b2ac',
        'accent-indigo': '#4c51bf', // Nuevo color para botones y acentos
        'text-light': '#f7fafc',
        'text-muted': '#a0aec0',
        'error-red': '#e53e3e',
        'gradient-start': '#1a202c',
        'gradient-end': '#4c51bf',
      },
    },
  },
  // Habilita los plugins de Tailwind
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};


/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'spark': 'spark 1.5s linear infinite',
                'wire-pulse': 'wire-pulse 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-glow': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                    },
                    '50%': {
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
                    }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'spark': {
                    '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
                    '50%': { transform: 'scale(1) rotate(180deg)', opacity: '0.8' },
                    '100%': { transform: 'scale(0) rotate(360deg)', opacity: '0' }
                },
                'wire-pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                }
            },
            blur: {
                '3xl': '64px',
            },
            borderWidth: {
                '3': '3px',
            }
        },
    },
    plugins: [],
}

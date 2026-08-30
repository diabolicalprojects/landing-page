import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
    { ignores: ['dist/**', 'node_modules/**', 'data/**'] },

    // Cliente: React sobre el navegador, módulos ES.
    {
        files: ['src/**/*.{js,jsx}', 'vite.config.js'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        settings: { react: { version: 'detect' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.flat.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            // Con el runtime automático de JSX no hace falta importar React.
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            // Las comillas del copy son intencionales; escaparlas a &quot; solo
            // ensucia el texto de marketing sin aportar nada.
            'react/no-unescaped-entities': 'off',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },

    // Servidor y scripts: CommonJS sobre Node.
    {
        files: ['server.js', 'server/**/*.js', 'scripts/**/*.js', 'tests/**/*.js'],
        ...js.configs.recommended,
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'commonjs',
            globals: globals.node,
        },
        rules: {
            ...js.configs.recommended.rules,
            'no-unused-vars': ['error', { argsIgnorePattern: '^_|^next$' }],
        },
    },
];

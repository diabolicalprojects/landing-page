import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// TypeScript estricto y las reglas de hooks de React.
export default tseslint.config(
    { ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: { 'react-hooks': reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    }
);

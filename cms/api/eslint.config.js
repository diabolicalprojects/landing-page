import tseslint from 'typescript-eslint';

// TypeScript estricto: nada de `any`, y los errores de tipos los da `tsc`.
export default tseslint.config(
    { ignores: ['dist/**', 'node_modules/**', '.datos/**'] },
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    }
);

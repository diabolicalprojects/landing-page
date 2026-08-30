#!/usr/bin/env node
/**
 * Genera el hash bcrypt para ADMIN_PASSWORD_HASH.
 *
 *   npm run hash-password -- "mi contraseña"
 *
 * Sin argumento, la pide por stdin para que no quede en el historial del shell.
 */
const bcrypt = require('bcryptjs');
const readline = require('readline');

const ROUNDS = 12;

function ask() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('Contraseña: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

(async () => {
    const password = process.argv[2] || (await ask());

    if (!password || password.length < 12) {
        console.error('\nLa contraseña debe tener al menos 12 caracteres.');
        process.exit(1);
    }

    const hash = await bcrypt.hash(password, ROUNDS);
    console.log('\nAñade esta línea a tu .env (entre comillas simples):\n');
    console.log(`ADMIN_PASSWORD_HASH='${hash}'\n`);
})();

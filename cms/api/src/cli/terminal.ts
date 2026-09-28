import readline from 'node:readline';

/*
 * Preguntas por terminal. La contraseña se lee sin eco: no aparece en pantalla
 * ni en el historial del shell. Si la entrada no es una terminal (una tubería),
 * se lee la primera línea.
 */

export async function preguntar(texto: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const respuesta = await new Promise<string>((ok) => rl.question(texto, ok));
    rl.close();
    return respuesta.trim();
}

export async function preguntarOculto(texto: string): Promise<string> {
    const entrada = process.stdin;
    if (!entrada.isTTY) {
        const rl = readline.createInterface({ input: entrada });
        const linea = await new Promise<string>((ok) => rl.once('line', ok));
        rl.close();
        return linea;
    }

    process.stdout.write(texto);
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding('utf8');

    return new Promise<string>((ok, mal) => {
        let valor = '';
        const alTeclear = (tecla: string) => {
            for (const c of tecla) {
                if (c === '\r' || c === '\n' || c === '\u0004') {
                    entrada.setRawMode(false);
                    entrada.pause();
                    entrada.off('data', alTeclear);
                    process.stdout.write('\n');
                    ok(valor);
                    return;
                }
                if (c === '\u0003') {
                    entrada.setRawMode(false);
                    entrada.off('data', alTeclear);
                    process.stdout.write('\n');
                    mal(new Error('Cancelado.'));
                    return;
                }
                if (c === '\u007f' || c === '\b') {
                    valor = valor.slice(0, -1);
                } else {
                    valor += c;
                }
            }
        };
        entrada.on('data', alTeclear);
    });
}

export function argumento(nombre: string): string | undefined {
    const i = process.argv.indexOf(`--${nombre}`);
    if (i === -1) return undefined;
    const valor = process.argv[i + 1];
    return valor && !valor.startsWith('--') ? valor : '';
}

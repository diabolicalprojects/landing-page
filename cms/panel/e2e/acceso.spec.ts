import { expect, test, type Page } from '@playwright/test';

/*
 * Flujos clave de la Fase 1: entrar, equivocarse, gestionar un usuario y
 * salir. En escritorio y en teléfono.
 */

const CORREO = process.env.CMS_E2E_CORREO!;
const CONTRASENA = process.env.CMS_E2E_CONTRASENA!;

async function entrar(page: Page) {
    await page.goto('/admin/');
    await page.getByLabel('Correo').fill(CORREO);
    await page.getByLabel('Contraseña').fill(CONTRASENA);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Inicio', level: 1 })).toBeVisible();
}

test('sin sesión, el panel manda a la pantalla de acceso', async ({ page }) => {
    await page.goto('/admin/usuarios');
    await expect(page).toHaveURL(/\/admin\/acceso$/);
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('una contraseña equivocada muestra el error genérico y no entra', async ({ page }) => {
    await page.goto('/admin/acceso');
    await page.getByLabel('Correo').fill(CORREO);
    await page.getByLabel('Contraseña').fill('esta-no-es-la-contrasena');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toHaveText(/Correo o contraseña incorrectos/);
    await expect(page).toHaveURL(/\/admin\/acceso$/);
});

test('entrar, crear un editor, verlo en la auditoría y salir', async ({ page }, info) => {
    await entrar(page);

    const correoNuevo = `editor-${info.project.name}-${Date.now()}@prueba.local`;
    await page.goto('/admin/usuarios');
    await page.getByRole('button', { name: 'Nuevo usuario' }).click();
    const dialogo = page.getByRole('dialog', { name: 'Nuevo usuario' });
    await dialogo.getByLabel('Nombre').fill(`Editor ${info.project.name}`);
    await dialogo.getByLabel('Correo').fill(correoNuevo);
    await dialogo.getByRole('radio', { name: 'Editor' }).click();
    await dialogo.getByLabel('Contraseña inicial').fill('frase-larga-para-el-editor');
    await dialogo.getByRole('button', { name: 'Crear usuario' }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Usuario creado' })).toBeVisible();
    await expect(page.getByText(correoNuevo)).toBeVisible();

    await page.goto('/admin/auditoria');
    // La primera coincidencia sería la opción del filtro: se busca en la lista.
    await expect(page.locator('.lista__nombre', { hasText: 'Creó un usuario' }).first()).toBeVisible();

    await page.goto('/admin/mas');
    await page.getByRole('main').getByRole('button', { name: 'Salir' }).click();
    await expect(page).toHaveURL(/\/admin\/acceso$/);

    // La sesión se cerró en el servidor: volver atrás no deja entrar.
    await page.goto('/admin/usuarios');
    await expect(page).toHaveURL(/\/admin\/acceso$/);
});

test('en el teléfono manda la barra inferior; en escritorio, la barra lateral', async ({ page }, info) => {
    await entrar(page);
    const inferior = page.getByRole('navigation', { name: 'Principal en el teléfono' });
    const lateral = page.getByRole('navigation', { name: 'Principal', exact: true });
    if (info.project.name === 'telefono') {
        await expect(inferior).toBeVisible();
        await expect(lateral).toBeHidden();
        const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(ancho).toBeLessThanOrEqual(0);
    } else {
        await expect(lateral).toBeVisible();
        await expect(inferior).toBeHidden();
    }
});

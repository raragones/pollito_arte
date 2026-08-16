# NatyArte Pro

Galería personal y segura para organizar y publicar los dibujos de Naty. El sitio público se concentra únicamente en el arte; la administración vive en una ruta privada sin enlaces visibles desde la navegación.

## Arquitectura

- `apps/web`: React 19, TypeScript, Vite y React Router. Contiene sitio público y panel `/admin`.
- `apps/api`: Hono sobre Node, módulos por dominio, Drizzle ORM, Neon PostgreSQL y Google Identity Services.
- `packages/shared`: contratos, esquemas Zod y tipos compartidos.

La API valida todos los datos. Las rutas `/api/admin/*` exigen una sesión válida guardada en cookie HttpOnly. El email autorizado se decide exclusivamente con `ADMIN_EMAILS` en el backend. Neon almacena la metadata en `drawings` y los bytes de cada imagen en `drawing_images.data` mediante `BYTEA`.

## Requisitos

- Node.js 22 o superior
- pnpm 10
- Base PostgreSQL en Neon
- Cliente OAuth 2.0 web de Google

## Instalación y ejecución

```bash
pnpm install
cp .env.example apps/api/.env
# crea apps/web/.env con VITE_API_URL y VITE_GOOGLE_CLIENT_ID
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web: `http://localhost:5173`. API: `http://localhost:8787`. Panel: `http://localhost:5173/admin/login`.

## Variables de entorno

Consulta `.env.example`. Ningún secreto debe comenzar con `VITE_`. En el frontend solo se exponen la URL pública de la API y el Client ID público de Google.

`SESSION_SECRET` debe contener al menos 32 caracteres aleatorios. `ADMIN_EMAILS` admite correos separados por comas. En producción usa HTTPS para que la cookie se marque `Secure`.

## Neon y migraciones

1. Crea un proyecto en Neon y copia su connection string con SSL a `DATABASE_URL`.
2. Ejecuta `pnpm db:migrate` para aplicar las migraciones.
3. Ejecuta `pnpm db:seed` para insertar las colecciones de desarrollo. No están hardcodeadas en React.
4. Si cambias el esquema, ejecuta `pnpm db:generate` y luego `pnpm db:migrate`.

## Imágenes en PostgreSQL

No se utiliza R2, Cloudinary ni otro servicio externo de imágenes. El formulario envía `multipart/form-data` al backend y Hono guarda los bytes directamente en una columna PostgreSQL `BYTEA`; nunca se convierten a Base64.

Se aceptan JPEG, PNG y WebP de hasta 5 MB. Existe un límite backend de 10 dibujos nuevos por administrador y día. Los listados consultan solo metadata y generan una URL virtual; los bytes se leen exclusivamente mediante `GET /api/drawings/:id/image`. Al eliminar un dibujo, `ON DELETE CASCADE` elimina su imagen. Crear y reemplazar imágenes se ejecuta dentro de una transacción.

Esta alternativa no requiere tarjeta de crédito ni una cuenta adicional de almacenamiento. Considera el tamaño disponible y los costos de transferencia de tu plan de Neon al proyectar crecimiento.

## Google OAuth

1. En Google Cloud crea credenciales OAuth de tipo “Aplicación web”.
2. Agrega `http://localhost:5173` y el dominio de producción a los orígenes JavaScript autorizados.
3. Usa el mismo Client ID en `GOOGLE_CLIENT_ID` (API) y `VITE_GOOGLE_CLIENT_ID` (web).
4. Añade únicamente las cuentas autorizadas a `ADMIN_EMAILS` en la API.

El frontend obtiene una credencial de Google, la API verifica firma, audiencia y email con Google, crea una sesión aleatoria en PostgreSQL y entrega una cookie HttpOnly. El token de Google no se guarda en `localStorage`.

## Scripts

- `pnpm dev`: web y API en desarrollo.
- `pnpm build`: build completo del monorepo.
- `pnpm typecheck`: comprobación TypeScript.
- `pnpm lint`: análisis estático con ESLint.
- `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`: ciclo de base de datos.

## Privacidad

No hay comentarios, chat, mensajes, seguidores ni datos personales públicos. La sección “Sobre mí” está redactada deliberadamente sin apellido, colegio, ubicación, contacto o información identificable.

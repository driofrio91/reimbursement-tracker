# Engineering Guidelines

## Objetivo

Estas reglas fijan las buenas practicas tecnicas que seguiremos durante toda la implementacion con `Next.js`, `React` y `TypeScript`.

Solo se incluyen criterios que afectan decisiones reales del repositorio.

## Next.js

- Usar `App Router` como modelo unico de rutas.
- Tratar `Next.js` como framework de entrega, no como lugar para la logica de negocio.
- Mantener componentes de lectura como `Server Components` por defecto cuando no necesiten interactividad.
- Usar `Client Components` solo cuando hagan falta eventos, estado local del navegador o APIs del cliente.
- Usar `Server Actions` y `Route Handlers` solo como adaptadores de entrada; deben delegar rapido en casos de uso.
- No colocar reglas de negocio en `page.tsx`, `layout.tsx`, acciones de servidor ni handlers.
- Mantener `src/app` enfocado en rutas, composicion de pantalla y wiring.

## React

- Mantener componentes pequenos y orientados a presentacion o interaccion concreta.
- No mezclar logica de dominio con logica de UI.
- Preferir props explicitas y nombres orientados al negocio.
- Derivar estado cuando sea posible en lugar de duplicarlo.
- Evitar `useEffect` para logica que puede resolverse durante el render o en servidor.
- Reservar hooks personalizados para logica reutilizable real, no para envolver una sola vez codigo trivial.
- Mantener formularios y tablas simples en la primera iteracion; no introducir abstracciones prematuras.

## TypeScript

- Activar y respetar el tipado estricto.
- Modelar el dominio con tipos y enums explicitos del negocio.
- Evitar `any`; si algo no esta claro, usar tipos mas pequenos o `unknown` con validacion.
- Separar tipos de entrada UI, DTOs de aplicacion y modelos de dominio cuando representen niveles distintos.
- Preferir funciones pequenas con tipos de entrada y salida claros.
- Mantener alias y utilidades tipadas solo cuando reduzcan complejidad real.

## Validacion y datos

- Usar `zod` para validar entradas externas como formularios, acciones y handlers.
- Dejar las validaciones de formato en la entrada y las reglas de negocio en `domain` o `application`.
- No usar modelos Prisma en bruto como si fueran el dominio.

## Regla general de implementacion

- Si una solucion parece util pero no ayuda directamente a la V1 definida en `docs/07-mvp-scope.md`, no entra todavia.

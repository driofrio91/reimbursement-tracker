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

## Responsive y mobile-first

- Toda UI nueva o refactor de UI debe implementarse en enfoque mobile-first.
- Definir primero la experiencia base sin breakpoints (`sm:`, `md:`, `lg:`).
- Usar breakpoints solo para mejoras progresivas en pantallas mayores.
- No usar breakpoints para corregir una base pensada primero para desktop.
- Validar navegacion y acciones principales en viewport movil antes de pulir desktop.
- Evitar scroll horizontal accidental en movil; si aparece, corregir antes de cerrar la tarea.

## TypeScript

- Activar y respetar el tipado estricto.
- Modelar el dominio con tipos y enums explicitos del negocio.
- Evitar `any`; si algo no esta claro, usar tipos mas pequenos o `unknown` con validacion.
- Separar tipos de entrada UI, DTOs de aplicacion y modelos de dominio cuando representen niveles distintos.
- Preferir funciones pequenas con tipos de entrada y salida claros.
- Mantener alias y utilidades tipadas solo cuando reduzcan complejidad real.

## Convencion de nombres

- Usar `PascalCase` en los ficheros propios del modulo de negocio bajo `src/modules/`.
- Nombrar componentes React con el mismo nombre principal que exportan, por ejemplo `CreateServiceForm.tsx` o `ServiceDetailView.tsx`.
- Nombrar casos de uso con verbo + entidad + intencion, por ejemplo `CreateServiceUseCase.ts`, `GetServiceDetailUseCase.ts` o `ListServicesUseCase.ts`.
- Evitar nombres genericos como `ServiceUseCase.ts` o ambiguos como `CreateReimbursableUseCase.ts`.
- Dentro del modulo `reimbursement`, usar `Service`, `Invoice` y `Request` como nombres cortos cuando el contexto ya deja claro el dominio.
- Mantener los archivos reservados por `Next.js` con su convencion propia (`page.tsx`, `layout.tsx`, `actions.ts`).

## Validacion y datos

- Usar `zod` para validar entradas externas como formularios, acciones y handlers.
- Dejar las validaciones de formato en la entrada y las reglas de negocio en `domain` o `application`.
- No usar modelos Prisma en bruto como si fueran el dominio.

## Credenciales de desarrollo

- Las credenciales y cuentas `@local.test` son solo para uso local.
- No exponer credenciales de desarrollo en UI fuera de entorno local (`development`).
- El bloqueo real debe vivir en backend (`auth`), no solo en frontend.
- En `production`, las cuentas `@local.test` deben quedar siempre bloqueadas aunque una variable de entorno este mal configurada.
- Las variables de control de login de desarrollo deben ser server-only (sin prefijo `NEXT_PUBLIC_`).

## Regla general de implementacion

- Si una solucion parece util pero no ayuda directamente a la V1 definida en `docs/07-mvp-scope.md`, no entra todavia.

## Testing

- La carpeta oficial de tests es `test/` en la raiz del repositorio.
- Organizar los tests por modulo y por capa, por ejemplo `test/reimbursement/application/` o `test/reimbursement/entrypoints/`.
- Usar `vitest` como runner y `vi` para mocks, stubs y spies.
- En `application`, mockear contratos como `ServiceRepository` y no `Prisma` directamente.
- En la primera iteracion priorizar tests unitarios de casos de uso y de validacion de entrada.
- Dejar fuera por ahora los tests de `ui`, `app`, `Server Actions`, `Prisma` real y `e2e`.
- Mantener helpers compartidos de testing en `test/<modulo>/support/`.

## Navegacion privada y UX

- Tratar `src/app/(private)/layout.tsx` como shell compartida para navegacion global del area autenticada.
- Mantener la navegacion global en sidebar y la navegacion contextual dentro de cada pantalla.
- En menus jerarquicos, diferenciar visualmente el estado de pagina activa (`aria-current="page"`) del estado de seccion activa.
- En movil, evitar sidebar expandida permanente; usar menu colapsable para no tapar el contenido principal.
- Cualquier mejora de navegacion debe priorizar claridad en pantallas pequenas sin duplicar todas las acciones globales en cada vista.
- Si una US anade o cambia rutas privadas, la integracion de sidebar y estado activo forma parte de la Definition of Done de esa US.

## Continuidad documental obligatoria

- Al cerrar cada US o caso de uso, actualizar `docs/10-use-cases-roadmap.md` en la misma sesion.
- Reflejar el nuevo estado operativo y el siguiente paso en `docs/09-current-status.md`.
- Dejar un handoff corto en `docs/sessions/` con cambios, validaciones y siguiente paso.
- Si el alcance activo cambia, alinear tambien `docs/START-HERE.md` para evitar ambiguedad en sesiones futuras.

## Checklist de seguridad para credenciales dev

Cuando una US toque login, auth, seed o variables de entorno, cerrar este checklist antes de darla por terminada:

1. no hay secretos reales en git ni en docs
2. las credenciales dev no se muestran fuera de local
3. `@local.test` queda bloqueado en backend fuera de local
4. `@local.test` queda bloqueado siempre en `production`
5. el seed de usuarios dev no corre fuera de local
6. `.env.example` queda actualizado sin secretos reales
7. `docs/09-current-status.md` y `docs/sessions/` quedan actualizados

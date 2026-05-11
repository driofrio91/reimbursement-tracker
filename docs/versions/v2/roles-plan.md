# V2 Roles Plan (Draft)

## Objetivo
Introducir control de acceso por roles para gestionar funcionalidades sensibles sin romper el flujo actual V1/V2.

## Estado actual (baseline)
- Autenticacion por credenciales con Auth.js.
- Sesion JWT con `user.id` y `user.name`, sin `role`.
- Layout privado protege por login, no por permisos.
- Server actions de negocio validan reglas funcionales, pero no autorizacion por rol.

## Propuesta de modelo de roles (MVP)
- `ADMIN`
- `USER`

## Matriz de permisos propuesta (MVP)

### Acceso general
- Ver app privada: `ADMIN`, `USER`.

### Operativa de servicios/facturas
- Crear servicio, completar ciclo de factura, correccion final: `ADMIN`, `USER`.

### Gestion de usuarios
- Crear usuarios con contrasena temporal: `ADMIN`.
- Editar datos de otro usuario: `ADMIN`.
- Activar/desactivar usuario: `ADMIN`.
- Forzar reset de contrasena de otro usuario: `ADMIN`.
- Cambiar propia contrasena: `ADMIN`, `USER`.

### Flujo de primer inicio de sesion
- Usuario creado por admin inicia con contrasena temporal.
- Usuario creado por admin inicia con `mustChangePasswordOnFirstLogin = true`.
- En primer login, la app obliga cambio de contrasena antes de operar.
- Hasta completar el cambio, solo se permite `cambio de password` y `logout`.

### Limite anual de reembolso
- Editar propio limite anual: `ADMIN`, `USER`.
- Editar limite anual de otros usuarios: `ADMIN`.
- Ver dashboard global de limites: `ADMIN`, `USER` (segun refinamiento actual).
- Ejecutar `Sync` del ano actual: `ADMIN`.
- Ejecutar `Sync` de anos anteriores: `ADMIN`.

### Gestion de aseguradoras
- Alta/baja/edicion: `ADMIN`.
- Consulta para formularios de servicio: `ADMIN`, `USER`.

### Exportacion de facturas
- Exportar CSV del servicio: `ADMIN`, `USER`.
- Boton deshabilitado si no hay facturas `CREATED` (regla funcional, no de rol).

## UX afectado

### Navegacion y layout privado
- Mostrar/ocultar entradas de menu segun rol.
- "Gestion de usuarios" y "Gestion de aseguradoras" visibles solo para `ADMIN`.
- Mantener feedback claro cuando no hay permiso: estado 403 o accion deshabilitada con mensaje.

### Pantallas nuevas/afectadas
1. Panel de usuario: cambio de contrasena y estado de primer login.
2. Home: bloque principal del ano actual y bloque secundario de historico anual.
3. Gestion de usuarios (admin).
4. Gestion de aseguradoras (admin).
5. Acciones sensibles siempre bloqueadas en backend si el rol no corresponde.

### Mobile-first y feedback de acciones bloqueadas
- En mobile, acciones bloqueadas muestran bottom sheet contextual (sin warnings permanentes visibles).
- Los mensajes de autorizacion deben ser especificos por accion.
- Estados de permiso legibles en pantalla pequena.

## Backend afectado

### Auth y sesion
- Incluir `role` en JWT y en `session.user`.
- Extender tipos de NextAuth (`session.user.role`, `JWT.role`).

### Guards de autorizacion
- Crear helpers reutilizables:
  - `requireAuth()`
  - `requireRole(...roles)`
- Aplicarlos en server actions, route handlers y paginas privadas con restricciones.

### Capa application/domain
- Mantener reglas de negocio en `application/domain`.
- Aplicar autorizacion en entrypoints y reforzar en operaciones criticas para evitar bypass.

### Auditoria minima
- Registrar usuario actor en cambios sensibles cuando aplique (limites, usuarios, aseguradoras).

### Reconciliacion de cache anual
- Exponer accion `Sync` restringida a `ADMIN`.
- `Sync` debe devolver respuesta estructurada:
  - usuarios procesados
  - ajustes aplicados
  - errores detectados

## Base de datos afectada

### Cambios minimos
1. `User`
- Anadir `role` (enum o string controlado), default `USER`.
- Anadir `mustChangePasswordOnFirstLogin` (boolean).

2. Limites anuales (ya definido en refinamiento V2)
- Tabla `UserAnnualReimbursementLimit`:
  - `id`, `userId`, `year`, `annualLimitAmount`, `reimbursedAccumulated`, `currency`, timestamps
  - unique `(userId, year)`

### Indices/restricciones recomendadas
- Indice para `User.role`.
- Unique compuesto `(userId, year)` en limites anuales.

## Seguridad y riesgos
- No fiar permisos solo al frontend.
- Toda accion sensible debe validar rol en servidor.
- Evitar "ocultar boton" como unica barrera.
- Revisar sesion de usuarios desactivados para minimizar ventana de acceso.

## Plan de implementacion propuesto

### Fase 1
- Migracion DB para `role` y `mustChangePasswordOnFirstLogin`.
- Propagar `role` a JWT/sesion.
- Crear `requireAuth` y `requireRole`.
- Proteger acciones admin.

### Fase 2
- UI condicional por rol (menu, botones, paginas).
- Flujo obligatorio de cambio de contrasena en primer login.

### Fase 3
- Tests de autorizacion (permitido/denegado) en server actions y rutas.
- Regresion de flujos existentes.

### Fase 4
- Actualizar documentacion de estado y roadmap V2.

## Criterios de aceptacion
- Un `USER` no puede ejecutar acciones admin ni por UI ni por llamada directa.
- Un `ADMIN` puede crear y gestionar usuarios.
- Usuario nuevo creado por admin debe cambiar contrasena en primer login.
- Todas las rutas/acciones sensibles responden con error de permisos consistente.
- Tests de autorizacion en verde.

# Technical Decisions

## Objetivo

Este documento recoge las decisiones tecnicas ya aprobadas para el arranque del proyecto.

La intencion es dejar por escrito que stack se ha elegido, por que se ha elegido y que compromisos asumimos para mantener el coste lo mas cercano posible a cero.

## Decisiones aprobadas

### Framework

- `Next.js`
- `TypeScript`
- `App Router`

Motivo:

- buen encaje para producto interno de backoffice
- permite combinar UI, rutas y acciones de servidor sin romper la arquitectura limpia
- ecosistema muy compatible con `Auth.js`, `Prisma` y `Vercel`

### UI

- `shadcn/ui`
- interfaz inicial en espanol

Motivo:

- buen encaje para una aplicacion interna de backoffice
- coste cero
- componentes sobrios y suficientemente flexibles para una primera version limpia
- velocidad de implementacion sin imponer un sistema demasiado pesado

### Arquitectura

- arquitectura limpia ligera por modulos
- casos de uso explicitos
- dominio desacoplado de framework y persistencia

Motivo:

- el dominio ya tiene complejidad real
- encaja con un enfoque de casos de uso y separacion por capas
- evita mezclar reglas de negocio con React o Prisma

### Base de datos

- `PostgreSQL`
- proveedor elegido: `Neon`

Motivo:

- modelo claramente relacional
- buen encaje con `Prisma`
- suficiente para historial, auditoria, estados y relaciones complejas
- el volumen de datos historicos actual es muy pequeno para los limites del tier gratuito

## Decision sobre Neon

Se elige `Neon` como proveedor inicial de base de datos.

### Motivos principales

- prioridad alta en coste minimo
- el proyecto necesita sobre todo una base de datos relacional, no una plataforma completa de backend
- el historico actual cabe sobradamente en el plan gratuito
- se evita pagar por servicios no necesarios en la primera fase

### Lo que se asume con esta decision

- se usa `Neon` free tier mientras el uso siga siendo pequeno
- no se da por garantizado el coste cero para siempre
- se acepta dependencia de un tier gratuito sujeto a cambios del proveedor

## Decision sobre autenticacion

- `Auth.js`
- login por `email + password`
- dos usuarios fijos inicialmente
- contrasenas guardadas como hash en base de datos

Motivo:

- la aplicacion sera accesible desde internet
- no es aceptable dejarla sin autenticacion
- una auth minima propia resulta suficiente para el MVP
- evita adoptar una plataforma mas amplia solo para resolver el login

## Decision sobre persistencia de usuarios

Las credenciales no se guardaran en ficheros del servidor.

Se guardaran en base de datos mediante una tabla de usuarios propia con hash de contrasena.

Motivo:

- mejor mantenimiento
- mejor seguridad
- mejor auditoria
- mejor encaje con despliegue cloud y arquitectura limpia

## Decision sobre auditoria

- auditoria basica desde el inicio
- guardar quien crea o actualiza registros cuando aplique
- registrar cambios relevantes directamente en entidades operativas de V1 cuando aplique

Motivo:

- la app tendra dos usuarios desde el inicio
- conviene saber quien ha hecho cada cambio
- forma parte del valor del sistema y no solo de la seguridad

## Decision sobre testing

- tests de casos de uso
- tests de funcionalidad critica
- sin end-to-end en la primera iteracion

Motivo:

- protege la logica de negocio relevante desde el inicio
- mantiene bajo el coste inicial de implementacion
- evita meter una capa de testing mas pesada antes de cerrar el nucleo del dominio

### Funcionalidad critica a cubrir

- creacion de servicio reembolsable
- calculo de importes facturados
- deteccion de sobrefacturacion
- ciclo de factura por etapas (`CREATED` -> `INFORMATION_COMPLETED` -> `CLAIM_REFERENCE_COMPLETED`)
- resolucion de factura (`PAID` o `REJECTED`) y correccion operativa final
- busqueda de facturas y consulta de detalle de factura

## Decision sobre adjuntos

- fuera del MVP inicial

Motivo:

- anade complejidad de storage y despliegue demasiado pronto
- el modelo de datos ya queda preparado para soportarlos mas adelante
- no es necesario para validar el flujo principal del producto

## Decision sobre importacion historica

- fuera de la primera iteracion
- se implementara despues de cerrar el nucleo funcional manual

Motivo:

- primero conviene validar el flujo end-to-end con datos creados desde la aplicacion
- reduce el riesgo de mezclar modelado de negocio con complejidad de migracion demasiado pronto
- permite que la importacion se construya sobre un nucleo ya estable

## Decision sobre proveedor alternativo

Se ha valorado `Supabase`, pero no se elige en la primera fase.

### Motivos para no elegirlo ahora

- el proyecto no necesita todavia `Storage`, `Realtime` ni `Auth` gestionada por plataforma
- el objetivo principal actual es coste minimo
- se quiere evitar depender de una plataforma mas grande de lo necesario

### Lo que si se reconoce

`Supabase` podria aportar valor en el futuro si aparecen estas necesidades:

- adjuntos y almacenamiento gestionado
- auth gestionada por plataforma
- centralizar mas servicios en un unico proveedor

## Coste esperado inicial

### Objetivo

Mantener el proyecto en coste cero usando tiers gratuitos.

### Condiciones para acercarse a ese objetivo

- un unico proyecto
- un unico entorno inicial
- pocos usuarios
- pocos accesos concurrentes
- sin adjuntos pesados en la primera fase
- base de datos pequena

### Realidad asumida

El objetivo es coste cero inicial y, si el uso sigue pequeno, probablemente durante bastante tiempo.

No se documenta como garantia permanente, porque los tiers gratuitos pueden cambiar.

## Estrategia de despliegue aprobada

- frontend y servidor de aplicacion: `Vercel` free tier
- base de datos: `Neon` free tier
- ORM y esquema: `Prisma`
- autenticacion: `Auth.js`

## Primera iteracion aprobada

La primera iteracion funcional del proyecto incluira unicamente:

- login
- creacion de servicio reembolsable
- listado de servicios
- detalle de servicio

Motivo:

- permite validar autenticacion, arquitectura, persistencia y primer caso de uso real
- fija una base pequena y estable antes de ampliar el flujo completo de facturas y resoluciones

## Decision de alcance

Se considera aprobado un recorte explicito del MVP para evitar sobredimensionar la implementacion inicial.

La V1 se centra solo en sustituir el Excel a nivel operativo.

El detalle completo del recorte entre V1 y V2 queda definido en `docs/versions/v1/mvp-scope.md`.

La V1 queda simplificada al modelo `Service + Invoice`, con `claimReference` en la factura y sin entidad `Request` persistida.

## Stack final aprobado

- `Next.js`
- `TypeScript`
- `Auth.js`
- `shadcn/ui`
- `Prisma`
- `PostgreSQL`
- `Neon`
- `Vercel`

## Riesgos aceptados

1. El coste cero depende de que el proyecto se mantenga dentro de los limites gratuitos.
2. Los proveedores pueden cambiar precios, cuotas o condiciones.
3. Si en el futuro se anaden adjuntos, almacenamiento o mayor uso, el coste puede dejar de ser cero.
4. La importacion historica se retrasa a una fase posterior, por lo que el dato inicial se cargara manualmente o mediante seed/control interno en la primera iteracion.

## Decision final

El proyecto se construira inicialmente con `Next.js + Auth.js + Prisma + PostgreSQL en Neon + despliegue en Vercel`, priorizando coste minimo, simplicidad operativa y una arquitectura limpia.

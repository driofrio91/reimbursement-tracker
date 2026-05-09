# Product Vision

> Documento de vision de producto. No usar como fuente operativa para ejecucion de version.
>
> Consulta `docs/PROJECT-HUB.md` para documentacion vigente por version.

## Vision

Construir una herramienta clara, rapida y fiable para gestionar solicitudes de reembolso de aseguradoras, sustituyendo procesos manuales dispersos por un flujo digital trazable.

La vision no es solo guardar facturas, sino controlar el ciclo completo de un gasto reembolsable, incluso cuando dicho gasto requiere varias facturas para su tramitacion o cuando varias facturas se agrupan en una misma solicitud.

## Tipo de producto

En su primera fase, el producto nace como una aplicacion interna de backoffice.

Debe disenarse con una arquitectura suficientemente limpia para evolucionar a:

- herramienta multiaseguradora
- herramienta multiusuario
- herramienta multinegocio o SaaS

## Necesidad principal que cubre

La necesidad principal no es unicamente registrar documentos, sino relacionar correctamente:

- un servicio o gasto real
- una o varias facturas asociadas
- el seguimiento del reembolso de cada una
- el estado global del caso

## Propuesta de valor

La propuesta de valor del producto es:

- convertir un proceso manual en uno controlado
- centralizar toda la informacion de seguimiento
- soportar tanto casos simples como casos con varias facturas por servicio
- soportar solicitudes que agrupan varias facturas
- reducir errores derivados de estructuras implicitas en Excel
- permitir crecimiento posterior sin rehacer la base del sistema

## Principios de diseno del producto

### 1. Generico desde el modelo

La aplicacion no debe acoplarse a ninguna aseguradora concreta.

### 2. Servicio primero

El sistema debe reconocer que un gasto real puede distribuirse en varias facturas.

### 3. Solicitud explicita

La solicitud de reembolso es una entidad propia del negocio y no debe confundirse con la factura.

### 4. Trazabilidad por defecto

Todo cambio importante de estado debe poder consultarse historicamente.

### 5. Datos estructurados primero

Los campos clave no deben depender de comentarios libres.

### 6. Simplicidad operativa

Las acciones habituales deben resolverse en pocos clics.

## Casos de uso principales

### Caso 1. Registrar un servicio reembolsable

El usuario registra el gasto real: fecha, concepto, importe real, persona, titular y aseguradora.

### Caso 2. Asociar una o varias facturas

El usuario crea o vincula una o varias facturas para cubrir el importe del servicio.

### Caso 3. Crear una solicitud de reembolso

El usuario agrupa una o varias facturas dentro de una solicitud y registra la referencia externa devuelta por el portal.

### Caso 4. Crear una nueva factura tras un rechazo

El usuario crea una factura nueva cuando una factura anterior fue rechazada y el servicio sigue necesitando cubrir importe.

### Caso 5. Consultar pendientes

El usuario identifica rapidamente que casos o facturas requieren seguimiento.

### Caso 6. Analizar rendimiento

El usuario consulta metricas de importes facturados, devueltos, pendientes y tasa de exito.

## Criterio de exito del MVP

El MVP sera exitoso si permite:

- operar el proceso diario sin depender del Excel
- representar correctamente servicios con una o varias facturas
- representar solicitudes con una o varias facturas
- conocer el estado de cada factura y del caso completo en segundos
- reducir errores de seguimiento manual
- disponer de una base de datos limpia para seguir creciendo

## Nota de alcance

Aunque la vision del producto contempla trazabilidad mas rica, importacion historica, adjuntos y evolucion futura, la primera version implementada se recorta deliberadamente a un nucleo operativo minimo.

Ese recorte queda definido en `docs/versions/v1/mvp-scope.md`.

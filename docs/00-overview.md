# Overview

## Que es este proyecto

`reimbursement-tracker` es una aplicacion web para gestionar la trazabilidad completa de gastos, facturas y solicitudes de reembolso ante aseguradoras.

El objetivo es sustituir el control manual en Excel por un sistema estructurado que permita registrar un servicio o gasto reembolsable, asociarle una o varias facturas, hacer seguimiento de su carga en el portal de la aseguradora y controlar su resolucion hasta el cierre.

El proyecto se disena desde el inicio para trabajar con cualquier aseguradora, sin depender de reglas o nombres concretos.

## Problema que resuelve

Actualmente el seguimiento se realiza en hojas Excel con informacion mezclada, filas incompletas, comentarios libres y estructuras implicitas dificiles de mantener.

Ademas, no siempre existe una relacion 1:1 entre servicio y factura:

- un servicio puede corresponder a una sola factura
- un servicio puede requerir varias facturas para cubrir el importe total
- varias facturas pueden cargarse dentro de una misma solicitud de reembolso
- una factura rechazada obliga a emitir una factura nueva si aun falta importe por cubrir

Esto dificulta:

- saber que casos estan pendientes de cargar
- identificar cuantas facturas pertenecen al mismo servicio
- conocer el importe real del servicio frente al total facturado
- registrar correctamente pagos, rechazos o incidencias
- obtener metricas fiables del proceso de reembolso

## Objetivo del MVP

El MVP debe permitir operar de forma fiable el flujo principal de reembolsos:

- registrar un servicio o gasto reembolsable
- asociar una o varias facturas a ese servicio
- indicar aseguradora, titular y persona vinculada
- marcar cuando se ha cargado cada factura o grupo de facturas en una solicitud
- guardar referencias externas del portal
- registrar el resultado de cada solicitud y de cada factura incluida
- consultar el historial y trazabilidad de cada caso
- visualizar pendientes y metricas basicas en un dashboard

## Conceptos clave del dominio

El sistema debe diferenciar entre:

- el servicio o gasto real
- la factura individual asociada al servicio
- la solicitud real presentada en el portal

Esto permite cubrir tanto casos 1:1 como casos 1:N y N:1:

- un servicio puede tener varias facturas
- una solicitud puede incluir varias facturas
- una factura solo puede estar en una solicitud
- una factura rechazada no se reutiliza; se crea otra nueva si aun falta importe por cubrir

## Alcance inicial

El alcance inicial incluye:

- gestion de servicios reembolsables
- gestion de una o varias facturas por servicio
- soporte para varias aseguradoras a nivel de modelo de datos
- estados de seguimiento y trazabilidad temporal
- importacion inicial desde Excel historico
- filtros por titular, persona, aseguradora, fecha y estado
- dashboard con indicadores basicos
- comentarios internos por registro

## Fuera de alcance del MVP

En la primera fase quedan fuera:

- automatizacion de carga en portales
- OCR de facturas o extraccion automatica desde PDF
- integracion directa con aseguradoras
- sistema avanzado de permisos
- notificaciones avanzadas
- producto multicliente completo tipo SaaS

## Principios del producto

El sistema debe cumplir estos principios:

- trazabilidad completa de cada servicio, factura y solicitud
- modelo generico, no dependiente de una sola aseguradora
- datos estructurados por encima de comentarios libres
- operacion rapida para uso interno diario
- validacion de datos para reducir errores manuales
- posibilidad de evolucion futura a producto mas amplio

## Resultado esperado

La aplicacion debe convertirse en la fuente de verdad del estado de cada servicio reembolsable, de sus facturas asociadas y de su ciclo de reembolso.

## Nota sobre el alcance inicial

Aunque el producto se diseña con capacidad de crecimiento, la implementacion inicial queda deliberadamente recortada a un nucleo operativo minimo.

La referencia oficial para ese recorte es `docs/07-mvp-scope.md`.

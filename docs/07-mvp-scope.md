# MVP Scope

## Objetivo

Este documento fija el recorte definitivo del alcance para evitar sobredimensionar la primera version del producto.

La meta de la V1 no es construir el sistema mas completo posible, sino sustituir el Excel con una aplicacion sencilla que permita controlar servicios, facturas y reembolsos con mas claridad.

## Criterio de recorte

La V1 debe resolver solo estas necesidades:

- registrar servicios o gastos reembolsables
- asociar facturas a esos servicios
- agrupar facturas dentro de solicitudes de reembolso
- marcar reembolsos o rechazos
- consultar el estado actual y los pendientes

Todo lo que no ayude directamente a ese objetivo pasa a V2.

## V1 aprobada

### Objetivo funcional

Sustituir operativamente el Excel para el seguimiento diario.

### Entidades incluidas

- `User`
- `Insurer`
- `Person`
- `ReimbursableService`
- `Invoice`
- `ReimbursementRequest`

### Entidades excluidas de V1

- `Attachment`
- `Note`
- `PolicyHolder` como entidad separada
- `StatusHistory` como sistema completo de auditoria avanzada

### Estados persistidos en V1

#### `ReimbursableService`

- `registered`
- `submitted`
- `reimbursed`

#### `Invoice`

- `received`
- `submitted`
- `rejected`
- `reimbursed`

#### `ReimbursementRequest`

- `submitted`
- `reimbursed`
- `rejected`

### Estados derivados o calculados en UI

Estos conceptos siguen existiendo, pero no requieren persistencia especifica en V1:

- parcialmente facturado
- sobrefacturado
- parcialmente reembolsado

### Funcionalidad incluida

- login
- crear servicio reembolsable
- listar servicios
- ver detalle de servicio
- crear o vincular factura
- calcular importe pendiente por cubrir
- mostrar aviso de sobrefacturacion
- crear solicitud con una o varias facturas
- registrar referencia externa
- marcar facturas como reembolsadas o rechazadas
- crear una nueva factura para cubrir importe pendiente tras rechazo
- filtros basicos por estado, persona y fecha

### Testing incluido

- tests de casos de uso
- tests de funcionalidad critica

### Arquitectura incluida

- misma arquitectura limpia ligera ya aprobada
- un unico modulo funcional `reimbursement`
- pocos casos de uso iniciales
- pocos repositorios
- mapeo minimo y pragmatico

## V2 aprobada

### Objetivo funcional

Mejorar trazabilidad, comodidad operativa, migracion historica y capacidades de gestion.

La V2 no cambia la regla ya aprobada de negocio:

- una factura solo puede pertenecer a una solicitud
- una factura rechazada no se reutiliza
- si falta importe por cubrir, se crea una factura nueva

### Entidades y modulos que pasan a V2

- `Attachment`
- `Note`
- `PolicyHolder` separado si aporta valor real
- `StatusHistory` completo

### Ampliaciones del modelo que pueden entrar en V2

- separar `policyHolderName` en una entidad `PolicyHolder` real
- enriquecer `Invoice` con mas metadatos fiscales o contables si hace falta
- anadir tablas auxiliares para reporting o read models si el dashboard lo requiere

### Funcionalidad que pasa a V2

- importacion historica desde Excel
- preview de importacion
- limpieza asistida de datos
- adjuntos de facturas y justificantes
- notas internas estructuradas
- dashboard analitico avanzado
- KPIs y tiempos medios
- reporting de actividad por usuario
- gestion de usuarios desde la aplicacion
- recuperacion de contrasena
- permisos mas finos si hacen falta

### Funcionalidad que expresamente no pasa a V2

Estas ideas quedan descartadas tambien para V2 salvo cambio real del negocio:

- reutilizar una factura rechazada en otra solicitud
- reenvios de la misma factura como si fuera el mismo documento
- volver al modelo `InvoiceDocument + ServiceInvoiceRecord + ReimbursementRequestItem` sin necesidad demostrada

### Estados y trazabilidad que pasan a V2

- `partially_invoiced`
- `over_invoiced` persistido
- `partially_reimbursed` persistido
- `closed`
- fases persistidas detalladas
- historico detallado por cambio de estado

## Lo que se elimina del primer build

- adjuntos
- notas como entidad separada
- importacion del Excel
- auditoria completa
- exceso de estados persistidos
- separacion excesiva entre titular y persona si no aporta valor inmediato
- dashboard avanzado
- abstracciones tecnicas no necesarias para los primeros casos de uso

## Orden recomendado de implementacion de V1

1. autenticacion
2. servicios
3. facturas
4. solicitudes
5. resolucion
6. filtros y listados

## Regla de decision para el desarrollo

Si una pieza no ayuda de forma directa a sustituir el Excel en la operativa diaria, no entra en V1.

## Decision final

La V1 queda oficialmente recortada a un nucleo operativo minimo.

La V2 agrupa todas las mejoras de trazabilidad avanzada, importacion historica, adjuntos y capacidades analiticas, pero mantiene el mismo nucleo de negocio simplificado de `Service + Invoice + Request`.

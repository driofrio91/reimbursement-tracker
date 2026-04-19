# User Flows

## Objetivo

Este documento describe los flujos operativos principales del MVP desde la perspectiva del usuario de backoffice.

El objetivo es dejar claro que acciones realiza el usuario, que valida el sistema y que resultado debe producir cada flujo.

## Nota de alcance

En la primera iteracion de implementacion solo entran estos flujos:

- autenticacion
- alta de servicio reembolsable
- listado de servicios
- detalle de servicio

Los flujos de facturas, solicitudes, resolucion e importacion historica forman parte del diseno funcional aprobado, pero se implementaran despues del nucleo inicial.

## Flujo 1. Registrar un servicio reembolsable

### Objetivo

Dar de alta el gasto real antes de disponer necesariamente de las facturas.

### Paso a paso

1. El usuario crea un nuevo servicio reembolsable.
2. Introduce fecha del servicio, concepto, importe real, persona, titular y aseguradora.
3. Guarda el registro.

### Validaciones

- la fecha del servicio es obligatoria
- el concepto es obligatorio
- el importe real debe ser mayor que cero
- la persona es obligatoria
- el titular es obligatorio
- la aseguradora es obligatoria

### Resultado esperado

- se crea un `ReimbursableService`
- el estado inicial queda en `registered`
- la fase inicial queda en `service_registered`
- el sistema muestra que aun no hay facturas asociadas

## Flujo 2. Asociar una factura a un servicio

### Objetivo

Vincular una factura real al servicio mediante un registro operativo.

### Paso a paso

1. El usuario entra en un servicio existente.
2. Crea una nueva factura o selecciona una factura ya existente.
3. El sistema crea un `InvoiceDocument` si el documento no existia.
4. El sistema crea un `ServiceInvoiceRecord` enlazado al servicio y a la factura.
5. El sistema recalcula importes y estado del servicio.

### Validaciones

- la factura debe tener fecha e importe
- el documento de factura debe poder identificarse de forma univoca
- el importe operativo debe ser mayor que cero

### Avisos

- si la factura ya tiene usos anteriores, se muestra aviso
- si la factura fue rechazada anteriormente, se muestra aviso reforzado
- si el total facturado supera el importe real del servicio, se muestra aviso de sobrefacturacion
- si el total aun no cubre el servicio, se informa del importe pendiente

### Resultado esperado

- el servicio puede quedar en `partially_invoiced`, `fully_invoiced` o `over_invoiced`
- el registro operativo queda inicialmente en `received`

## Flujo 3. Crear una solicitud de reembolso

### Objetivo

Agrupar una o varias facturas y registrar su presentacion en el portal.

### Paso a paso

1. El usuario selecciona uno o varios registros operativos de factura.
2. Crea una nueva solicitud de reembolso.
3. Introduce la fecha de presentacion.
4. Introduce la referencia externa del portal cuando este disponible.
5. Confirma el envio.

### Validaciones

- la solicitud no puede enviarse vacia
- todos los registros incluidos deben pertenecer a la misma aseguradora y titular en la primera version
- solo pueden incluirse registros operativos en estado `received`

### Resultado esperado

- se crea un `ReimbursementRequest`
- se crean sus `ReimbursementRequestItem`
- los registros operativos incluidos pasan a `submitted`
- el servicio asociado puede pasar a `submitted` si todas sus facturas ya fueron presentadas

## Flujo 4. Registrar resolucion de una solicitud

### Objetivo

Actualizar el resultado de una solicitud cuando se conoce el abono o rechazo.

### Paso a paso

1. El usuario abre una solicitud enviada.
2. Marca para cada item si fue reembolsado o rechazado.
3. Introduce el importe abonado y fecha de abono cuando aplique.
4. Guarda los cambios.

### Validaciones

- un item reembolsado debe tener importe abonado
- un item rechazado deberia poder guardar un motivo de rechazo

### Resultado esperado

- cada `ReimbursementRequestItem` actualiza su estado
- cada `ServiceInvoiceRecord` actualiza su estado derivado a `reimbursed` o `rejected`
- la solicitud pasa a `partially_reimbursed`, `partially_rejected`, `reimbursed` o `rejected`
- el servicio asociado puede pasar a `partially_reimbursed` o `reimbursed`

## Flujo 5. Reenviar una factura rechazada

### Objetivo

Volver a utilizar una factura original ya rechazada, creando un nuevo intento operativo sin duplicar el documento.

### Paso a paso

1. El usuario localiza un registro operativo rechazado.
2. Elige la opcion de volver a tramitar la factura.
3. El sistema crea un nuevo `ServiceInvoiceRecord` referenciando el mismo `InvoiceDocument`.
4. El nuevo registro queda enlazado al anterior mediante `originalRecordId`.
5. El usuario incluye el nuevo registro en una nueva solicitud.

### Avisos

- la interfaz debe informar de que la factura ya fue utilizada antes
- la interfaz debe mostrar que el intento previo fue rechazado
- la interfaz debe mostrar acceso al historial de intentos anteriores

### Resultado esperado

- el documento original sigue siendo unico
- existe un nuevo registro operativo para el nuevo intento
- se conserva la trazabilidad completa de reenvios

## Flujo 6. Consultar un servicio y su trazabilidad

### Objetivo

Ver en una sola pantalla el estado global del caso y su detalle historico.

### Informacion esperada

- datos del servicio
- importe real
- total facturado
- importe pendiente por facturar
- total reembolsado
- lista de registros operativos asociados
- solicitudes en las que participo cada factura
- avisos activos
- historial de cambios de estado
- notas y adjuntos

## Flujo 7. Importar datos historicos desde Excel

### Objetivo

Migrar el historico a un modelo estructurado sin perder trazabilidad.

### Estado de implementacion

Este flujo queda explicitamente fuera de la primera iteracion tecnica.

### Paso a paso

1. El usuario carga el archivo de origen.
2. El sistema interpreta bloques de filas pertenecientes al mismo servicio.
3. El sistema detecta facturas asociadas a cada servicio.
4. El sistema detecta referencias externas repetidas para agruparlas en una misma solicitud.
5. El usuario revisa incidencias de importacion.
6. El usuario confirma la migracion.

### Validaciones y controles

- deteccion de fechas invalidas
- deteccion de importes inconsistentes
- deteccion de estados contradictorios
- deteccion de filas incompletas
- deteccion de referencias compartidas entre varias filas

### Resultado esperado

- se crean servicios, facturas, registros operativos y solicitudes
- las incidencias quedan registradas para revision manual

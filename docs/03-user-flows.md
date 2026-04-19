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

Vincular una factura real al servicio.

### Paso a paso

1. El usuario entra en un servicio existente.
2. Crea una nueva factura.
3. El sistema vincula la factura al servicio.
4. El sistema recalcula importes y estado del servicio.

### Validaciones

- la factura debe tener fecha e importe
- la factura debe poder identificarse de forma univoca
- el importe debe ser mayor que cero

### Avisos

- si el total facturado supera el importe real del servicio, se muestra aviso de sobrefacturacion
- si el total aun no cubre el servicio, se informa del importe pendiente

### Resultado esperado

- el servicio puede seguir registrado o quedar marcado como enviado segun el progreso posterior
- la factura queda inicialmente en `received`

## Flujo 3. Crear una solicitud de reembolso

### Objetivo

Agrupar una o varias facturas y registrar su presentacion en el portal.

### Paso a paso

1. El usuario selecciona una o varias facturas.
2. Crea una nueva solicitud de reembolso.
3. Introduce la fecha de presentacion.
4. Introduce la referencia externa del portal cuando este disponible.
5. Confirma el envio.

### Validaciones

- la solicitud no puede enviarse vacia
- todas las facturas incluidas deben pertenecer a la misma aseguradora y titular en la primera version
- solo pueden incluirse facturas en estado `received`

### Resultado esperado

- se crea un `ReimbursementRequest`
- las facturas incluidas pasan a `submitted`
- el servicio asociado puede pasar a `submitted` si todas sus facturas ya fueron presentadas

## Flujo 4. Registrar resolucion de una solicitud

### Objetivo

Actualizar el resultado de una solicitud cuando se conoce el abono o rechazo.

### Paso a paso

1. El usuario abre una solicitud enviada.
2. Marca para cada factura incluida si fue reembolsada o rechazada.
3. Introduce el importe abonado y fecha de abono cuando aplique.
4. Guarda los cambios.

### Validaciones

- una factura reembolsada debe tener importe abonado
- una factura rechazada deberia poder guardar un motivo de rechazo

### Resultado esperado

- cada `Invoice` actualiza su estado a `reimbursed` o `rejected`
- la solicitud pasa a `reimbursed` o `rejected` segun el resultado agregado
- el servicio asociado puede seguir abierto o pasar a `reimbursed`

## Flujo 5. Crear una nueva factura tras un rechazo

### Objetivo

Cubrir el importe pendiente de un servicio cuando una factura previa fue rechazada.

### Paso a paso

1. El usuario localiza un servicio con una factura rechazada.
2. El sistema informa de que sigue habiendo importe pendiente por cubrir.
3. El usuario crea una nueva factura.
4. El usuario incluye esa nueva factura en una nueva solicitud cuando corresponda.

### Avisos

- la interfaz debe informar de que el servicio tiene facturas rechazadas
- la interfaz debe mostrar el importe que todavia falta por cubrir
- la interfaz debe dejar claro que la nueva factura es un documento distinto

### Resultado esperado

- la factura rechazada mantiene su estado historico
- la nueva factura sigue su propio ciclo de vida
- el servicio puede continuar hasta quedar completamente cubierto y reembolsado

## Flujo 6. Consultar un servicio y su trazabilidad

### Objetivo

Ver en una sola pantalla el estado global del caso y su detalle historico.

### Informacion esperada

- datos del servicio
- importe real
- total facturado
- importe pendiente por facturar
- total reembolsado
- lista de facturas asociadas
- solicitudes en las que participo cada factura
- avisos activos
- estado actual del caso

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

- se crean servicios, facturas y solicitudes
- las incidencias quedan registradas para revision manual

# Business Rules

## Objetivo del dominio

El sistema debe modelar el ciclo completo de un reembolso de aseguradora en tres fases:

1. Registro del servicio y su coste real.
2. Recepcion de facturas y creacion de solicitudes de reembolso.
3. Registro de abonos o rechazos hasta la resolucion del caso.

## Fases del proceso

### Fase 1. Registro del servicio

Se registra el gasto real con sus datos principales:

- fecha del servicio
- concepto
- importe real
- persona vinculada
- titular usado para tramitar
- aseguradora

En esta fase todavia puede no existir ninguna factura.

### Fase 2. Facturacion y solicitud

Se reciben una o varias facturas y se vinculan al servicio.

Despues se crea una solicitud de reembolso que puede incluir una o varias facturas.

En esta fase se registra tambien la referencia externa devuelta por el portal, si existe.

### Fase 3. Resolucion y abono

Se registra el resultado de la solicitud o de cada factura incluida:

- abonada
- rechazada

Si una factura es rechazada, esa factura no se reutiliza. Si el servicio sigue necesitando cubrir importe, se emite una factura nueva.

## Reglas estructurales

1. Un servicio reembolsable representa el gasto real original.
2. Un servicio puede tener una o varias facturas.
3. Una solicitud puede incluir una o varias facturas.
4. Una factura pertenece a un unico servicio.
5. Una factura puede pertenecer como maximo a una unica solicitud.
6. Una factura rechazada permanece rechazada y no se reenvia.
7. Si el servicio sigue necesitando cubrir importe tras un rechazo, se crea una factura nueva.
8. La referencia externa del portal pertenece a la solicitud, no al servicio.

## Reglas de facturacion por servicio

1. El sistema debe calcular el total facturado por servicio.
2. El sistema debe calcular el importe pendiente por facturar.
3. Si el total facturado es menor que el importe real, el servicio sigue incompleto.
4. Si el total facturado coincide con el importe real, el servicio queda completamente cubierto por facturas.
5. Si el total facturado supera el importe real, se permite continuar, pero debe mostrarse un aviso de sobrefacturacion.

## Reglas de agrupacion en solicitudes

1. Una solicitud no puede enviarse vacia.
2. Una solicitud puede agrupar varias facturas.
3. Cada factura incluida mantiene su trazabilidad individual.
4. El resultado de una solicitud puede ser mixto: unas facturas pueden quedar reembolsadas y otras rechazadas.

## Reglas tras un rechazo

1. Una factura rechazada no puede reutilizarse en otra solicitud.
2. El servicio puede seguir abierto aunque alguna factura haya sido rechazada.
3. Si el servicio sigue necesitando cubrir importe, se debe crear una factura nueva.
4. La nueva factura es un documento distinto y sigue su propio ciclo de vida.

## Reglas de cierre

1. El estado global del servicio se considera resuelto cuando todas las facturas necesarias han sido reembolsadas.
2. Una solicitud puede quedar reembolsada aunque el servicio aun no este completamente resuelto.
3. Un servicio puede seguir abierto aunque una solicitud concreta haya terminado en rechazo.

## Estados aprobados de V1

### `ReimbursableService.status`

- `registered`
- `submitted`
- `reimbursed`

### `Invoice.status`

- `received`
- `submitted`
- `rejected`
- `reimbursed`

### `ReimbursementRequest.status`

- `submitted`
- `reimbursed`
- `rejected`

## Reglas de calculo automatico

### Sobre el servicio

- `totalInvoicedAmount`: suma de los importes de todas las facturas del servicio.
- `pendingToInvoiceAmount`: importe real menos importe total facturado.
- `totalReimbursedAmount`: suma de los importes abonados de las facturas reembolsadas.
- `isOverInvoiced`: indica si el total facturado supera el importe real.

### Sobre avisos

- aviso de sobrefacturacion cuando el total facturado supera el importe real
- aviso de servicio incompleto cuando todavia falta importe por cubrir
- aviso de servicio con facturas rechazadas cuando exista rechazo y siga habiendo importe pendiente

## Reglas de importacion desde Excel

1. Las filas con primeras columnas vacias pueden representar la continuacion del mismo servicio.
2. Un mismo bloque de filas puede corresponder a un solo servicio con varias facturas.
3. La ultima columna puede compartir la misma referencia externa en varias filas, lo que indica una solicitud con varias facturas.
4. Si existe rechazo y luego aparecen nuevas facturas para el mismo servicio, esas facturas deben interpretarse como documentos nuevos, no como reenvios del mismo documento.
5. Las fechas, importes y estados inconsistentes deben revisarse durante la importacion inicial.

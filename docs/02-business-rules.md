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
- titular del seguro
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
- parcialmente abonada a nivel de solicitud

Si una factura fue rechazada, puede volver a utilizarse en una nueva solicitud, siempre manteniendo la referencia al documento original.

## Reglas estructurales

1. Un servicio reembolsable representa el gasto real original.
2. Una factura real se guarda una sola vez como documento original.
3. Un servicio puede tener una o varias facturas asociadas.
4. Una solicitud puede incluir una o varias facturas.
5. Una factura rechazada puede volver a utilizarse en una nueva solicitud.
6. Cuando una factura vuelve a usarse, no se duplica el documento original, sino que se crea un nuevo registro operativo referenciando a la factura original.
7. Cada registro operativo pertenece a un unico servicio.
8. La referencia externa del portal pertenece a la solicitud, no al servicio.

## Reglas de facturacion por servicio

1. El sistema debe calcular el total facturado por servicio.
2. El sistema debe calcular el importe pendiente por facturar.
3. Si el total facturado es menor que el importe real, el servicio sigue incompleto.
4. Si el total facturado coincide con el importe real, el servicio queda completamente facturado.
5. Si el total facturado supera el importe real, se permite continuar, pero debe mostrarse un aviso de sobrefacturacion.

## Reglas de agrupacion en solicitudes

1. Una solicitud no puede enviarse vacia.
2. Una solicitud puede agrupar facturas de un mismo servicio o de varios servicios si el negocio lo permite a futuro.
3. Cada factura incluida en la solicitud debe mantener su trazabilidad individual.
4. El resultado de una solicitud puede ser mixto: algunas facturas reembolsadas y otras rechazadas.

## Reglas de reutilizacion y reenvio

1. Si una factura ya fue utilizada anteriormente, el sistema debe mostrar un aviso antes de crear un nuevo registro operativo.
2. Si una factura fue rechazada anteriormente, el sistema debe mostrar un aviso reforzado indicando que ya existe un rechazo previo.
3. El nuevo uso de una factura debe enlazarse con el registro operativo anterior mediante referencia al registro original.
4. El sistema debe conservar historial de intentos previos para esa factura.

## Reglas de cierre

1. El estado global del servicio se considera resuelto cuando todas sus facturas han sido reembolsadas.
2. Una solicitud puede cerrarse aunque alguna factura deba reaparecer despues en otra solicitud nueva.
3. El cierre de una solicitud no implica necesariamente el cierre del servicio.

## Estados finales aprobados

### ReimbursableService.status

- `registered`
- `partially_invoiced`
- `fully_invoiced`
- `over_invoiced`
- `submitted`
- `partially_reimbursed`
- `reimbursed`
- `cancelled`

### ServiceInvoiceRecord.status

- `draft`
- `received`
- `submitted`
- `rejected`
- `reimbursed`
- `cancelled`

### ReimbursementRequest.status

- `draft`
- `submitted`
- `partially_reimbursed`
- `reimbursed`
- `partially_rejected`
- `rejected`
- `closed`
- `cancelled`

### ReimbursementRequestItem.itemStatus

- `submitted`
- `reimbursed`
- `rejected`
- `cancelled`

## Fases finales aprobadas

### ReimbursableService.phase

- `service_registered`
- `invoicing_and_submission`
- `reimbursement_resolution`
- `completed`

## Reglas de calculo automatico

### Sobre el servicio

- `totalInvoicedAmount`: suma de todos los importes operativos activos asociados al servicio.
- `pendingToInvoiceAmount`: importe real menos importe total facturado.
- `totalReimbursedAmount`: suma de importes abonados asociados al servicio.
- `isOverInvoiced`: indica si el total facturado supera el importe real.

### Sobre avisos

- Aviso de sobrefacturacion cuando el total facturado supera el importe real.
- Aviso de factura previamente usada cuando el documento ya tiene historial.
- Aviso de factura previamente rechazada cuando existio rechazo en un intento anterior.
- Aviso de servicio incompleto cuando todavia falta importe por cubrir.

## Reglas de importacion desde Excel

1. Las filas con primeras columnas vacias pueden representar la continuacion del mismo servicio.
2. Un mismo bloque de filas puede corresponder a un solo servicio con varias facturas.
3. La ultima columna puede compartir la misma referencia externa en varias filas, lo que indica una solicitud con varias facturas.
4. Los comentarios libres deben migrarse como notas, pero separando los datos estructurados siempre que sea posible.
5. Las fechas, importes y estados inconsistentes deben revisarse durante la importacion inicial.

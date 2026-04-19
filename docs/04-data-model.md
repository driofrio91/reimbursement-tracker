# Data Model

## Entidades principales

### `Insurer`

Aseguradora con la que se tramitan las solicitudes de reembolso.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la aseguradora. |
| `name` | string | Nombre comercial de la aseguradora. |
| `code` | string | Codigo interno corto para identificarla en el sistema. |
| `isActive` | boolean | Indica si la aseguradora esta activa para nuevas solicitudes. |
| `notes` | text | Observaciones internas sobre reglas o particularidades operativas. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

### `Person`

Persona vinculada al servicio reembolsable.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la persona. |
| `firstName` | string | Nombre de la persona. |
| `lastName` | string | Apellidos de la persona. |
| `displayName` | string | Nombre mostrado en la interfaz y tablas. |
| `documentNumber` | string | Documento identificativo si se necesita para control interno. |
| `notes` | text | Observaciones internas de la persona. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

### `PolicyHolder`

Titular del seguro asociado a la aseguradora.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del titular. |
| `personId` | uuid | Referencia a la persona que actua como titular. |
| `insurerId` | uuid | Aseguradora a la que pertenece este titular. |
| `policyNumber` | string | Numero de poliza o identificador equivalente. |
| `memberNumber` | string | Numero de asegurado o identificador dentro de la poliza. |
| `isActive` | boolean | Indica si el titular sigue operativo para nuevas solicitudes. |
| `notes` | text | Observaciones internas del titular o de su poliza. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

### `ReimbursableService`

Servicio, tratamiento o gasto real que origina el reembolso.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del servicio reembolsable. |
| `serviceDate` | date | Fecha en la que se recibio el servicio o se produjo el gasto. |
| `description` | string | Concepto del servicio o tratamiento. |
| `actualAmount` | decimal | Importe real total del servicio o gasto. |
| `currency` | string | Moneda del importe, normalmente EUR. |
| `personId` | uuid | Persona a la que corresponde el servicio. |
| `policyHolderId` | uuid | Titular del seguro usado para tramitar el reembolso. |
| `insurerId` | uuid | Aseguradora con la que se tramitara el caso. |
| `attended` | boolean | Indica si la persona acudio o recibio el servicio. |
| `phase` | enum | Fase actual del proceso: registro, facturacion/solicitud o abono. |
| `status` | enum | Estado global del servicio dentro del ciclo de reembolso. |
| `notes` | text | Observaciones internas sobre el servicio. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

Campos derivados:

| Campo | Tipo | Comentario |
|---|---|---|
| `totalInvoicedAmount` | decimal | Suma de los importes de los registros operativos asociados. |
| `pendingToInvoiceAmount` | decimal | Importe del servicio que todavia no esta cubierto por facturas. |
| `totalReimbursedAmount` | decimal | Importe ya abonado para este servicio. |
| `isOverInvoiced` | boolean | Indica si el total facturado supera el importe real del servicio. |

### `InvoiceDocument`

Factura real, unica, emitida por la clinica o proveedor.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del documento de factura. |
| `documentNumber` | string | Numero o referencia de la factura original. |
| `invoiceDate` | date | Fecha de emision de la factura. |
| `amount` | decimal | Importe total de la factura original. |
| `currency` | string | Moneda de la factura. |
| `issuerName` | string | Nombre del emisor de la factura. |
| `issuerTaxId` | string | Identificador fiscal del emisor, si se desea guardar. |
| `fileUrl` | string | Ruta o referencia al PDF o archivo original de la factura. |
| `notes` | text | Observaciones sobre el documento. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

Regla:

- Este registro se crea una sola vez por factura real.

### `ServiceInvoiceRecord`

Registro operativo que relaciona una factura con un servicio concreto.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del registro operativo. |
| `serviceId` | uuid | Servicio reembolsable al que se asocia esta fila operativa. |
| `invoiceDocumentId` | uuid | Factura original referenciada por este registro. |
| `billedAmount` | decimal | Importe que este registro aporta al servicio. |
| `status` | enum | Estado operativo de esta factura dentro del servicio. |
| `isResubmission` | boolean | Indica si este registro es un reenvio o reutilizacion de una factura ya usada antes. |
| `originalRecordId` | uuid nullable | Referencia al registro operativo previo del que nace este reenvio o reutilizacion. |
| `warningFlags` | json/text | Lista de avisos calculados, por ejemplo factura previamente rechazada o sobrefacturacion. |
| `notes` | text | Observaciones internas sobre esta fila operativa. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

Uso:

- Esta entidad representa la fila de trabajo similar a la del Excel.
- Puede haber varios registros operativos apuntando a la misma factura original.

### `ReimbursementRequest`

Solicitud real presentada en el portal de la aseguradora.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la solicitud. |
| `insurerId` | uuid | Aseguradora a la que se presenta la solicitud. |
| `policyHolderId` | uuid | Titular con el que se realiza la solicitud. |
| `submittedAt` | datetime | Fecha en la que se presento en el portal. |
| `externalReference` | string | Referencia o identificador devuelto por el portal. |
| `status` | enum | Estado global de la solicitud. |
| `notes` | text | Observaciones internas de la solicitud. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

### `ReimbursementRequestItem`

Elemento que vincula una solicitud con un registro operativo de factura.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del item de solicitud. |
| `requestId` | uuid | Solicitud de reembolso a la que pertenece este item. |
| `serviceInvoiceRecordId` | uuid | Registro operativo de factura incluido en la solicitud. |
| `submissionOrder` | integer | Orden en que la factura fue incluida dentro de la solicitud, si interesa mantenerlo. |
| `itemStatus` | enum | Estado individual de esta factura dentro de la solicitud. |
| `rejectionReason` | text | Motivo de rechazo, si la aseguradora lo ha comunicado. |
| `reimbursedAmount` | decimal | Importe abonado para esta factura dentro de esta solicitud. |
| `reimbursedAt` | date nullable | Fecha en que se registro el abono de este item. |
| `createdAt` | datetime | Fecha de creacion del item. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del item. |

### `StatusHistory`

Historico de cambios de estado de cualquier entidad principal.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del evento de cambio. |
| `entityType` | enum/string | Tipo de entidad afectada: servicio, registro operativo o solicitud. |
| `entityId` | uuid | Identificador del registro cuyo estado cambio. |
| `fromStatus` | string | Estado anterior. |
| `toStatus` | string | Nuevo estado. |
| `changedAt` | datetime | Fecha y hora del cambio. |
| `changedBy` | uuid/string | Usuario o sistema que realizo el cambio. |
| `reason` | string | Motivo resumido del cambio. |
| `notes` | text | Observaciones adicionales del cambio. |

### `Note`

Comentario interno asociado a una entidad.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la nota. |
| `entityType` | enum/string | Tipo de entidad a la que se vincula la nota. |
| `entityId` | uuid | Identificador del registro relacionado. |
| `content` | text | Contenido de la nota interna. |
| `createdAt` | datetime | Fecha de creacion de la nota. |
| `createdBy` | uuid/string | Usuario autor de la nota. |

### `Attachment`

Adjunto asociado a una entidad del sistema.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del adjunto. |
| `entityType` | enum/string | Tipo de entidad a la que pertenece el archivo. |
| `entityId` | uuid | Identificador del registro relacionado. |
| `fileName` | string | Nombre del archivo subido. |
| `fileUrl` | string | Ruta o referencia donde esta almacenado el archivo. |
| `mimeType` | string | Tipo MIME del archivo. |
| `uploadedAt` | datetime | Fecha de subida del archivo. |

## Relaciones principales

- `Insurer 1 -> N PolicyHolder`
- `Person 1 -> N ReimbursableService`
- `PolicyHolder 1 -> N ReimbursableService`
- `ReimbursableService 1 -> N ServiceInvoiceRecord`
- `InvoiceDocument 1 -> N ServiceInvoiceRecord`
- `ReimbursementRequest 1 -> N ReimbursementRequestItem`
- `ServiceInvoiceRecord 1 -> N ReimbursementRequestItem`
- `ServiceInvoiceRecord -> ServiceInvoiceRecord` mediante `originalRecordId`

## Estados aprobados

### `ReimbursableService.status`

- `registered`
- `partially_invoiced`
- `fully_invoiced`
- `over_invoiced`
- `submitted`
- `partially_reimbursed`
- `reimbursed`
- `cancelled`

### `ServiceInvoiceRecord.status`

- `draft`
- `received`
- `submitted`
- `rejected`
- `reimbursed`
- `cancelled`

### `ReimbursementRequest.status`

- `draft`
- `submitted`
- `partially_reimbursed`
- `reimbursed`
- `partially_rejected`
- `rejected`
- `closed`
- `cancelled`

### `ReimbursementRequestItem.itemStatus`

- `submitted`
- `reimbursed`
- `rejected`
- `cancelled`

### `ReimbursableService.phase`

- `service_registered`
- `invoicing_and_submission`
- `reimbursement_resolution`
- `completed`

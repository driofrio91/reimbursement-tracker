# Data Model

## Objetivo

Definir el modelo de datos minimo de la V1, ya simplificado para reflejar la operativa real del negocio.

La simplificacion clave es esta:

- una factura solo puede pertenecer a una solicitud
- una factura rechazada no se reutiliza
- si falta importe por cubrir, se crea una factura nueva

## Entidades de V1

### `User`

Usuario autenticado de la aplicacion.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico del usuario. |
| `email` | string | Email usado para autenticacion. |
| `name` | string | Nombre visible del usuario en la aplicacion. |
| `passwordHash` | string | Hash de la contrasena, nunca contrasena en claro. |
| `isActive` | boolean | Indica si el usuario puede seguir accediendo. |
| `createdAt` | datetime | Fecha de creacion del usuario. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del usuario. |

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
| `insurerId` | uuid | Aseguradora con la que se tramitara el caso. |
| `policyHolderName` | string | Nombre del titular usado para tramitar el reembolso en V1. |
| `attended` | boolean | Indica si la persona acudio o recibio el servicio. |
| `status` | enum | Estado global del servicio dentro del ciclo de reembolso. |
| `notes` | text | Observaciones internas sobre el servicio. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

Campos derivados:

| Campo | Tipo | Comentario |
|---|---|---|
| `totalInvoicedAmount` | decimal | Suma de los importes de las facturas asociadas. |
| `pendingToInvoiceAmount` | decimal | Importe del servicio que todavia no esta cubierto por facturas. |
| `totalReimbursedAmount` | decimal | Importe ya abonado para este servicio. |
| `isOverInvoiced` | boolean | Indica si el total facturado supera el importe real del servicio. |

### `ReimbursementRequest`

Solicitud real presentada en el portal de la aseguradora.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la solicitud. |
| `insurerId` | uuid | Aseguradora a la que se presenta la solicitud. |
| `policyHolderName` | string | Nombre del titular con el que se realiza la solicitud en V1. |
| `submittedAt` | datetime | Fecha en la que se presento en el portal. |
| `externalReference` | string | Referencia o identificador devuelto por el portal. |
| `status` | enum | Estado global de la solicitud. |
| `notes` | text | Observaciones internas de la solicitud. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

### `Invoice`

Factura individual asociada a un servicio y, como maximo, a una unica solicitud.

| Campo | Tipo | Comentario |
|---|---|---|
| `id` | uuid | Identificador interno unico de la factura. |
| `serviceId` | uuid | Servicio reembolsable al que pertenece la factura. |
| `requestId` | uuid nullable | Solicitud de reembolso a la que pertenece la factura. Puede ser nulo si aun no se ha cargado. |
| `invoiceNumber` | string | Numero o referencia de la factura. |
| `invoiceDate` | date | Fecha de emision de la factura. |
| `amount` | decimal | Importe total de la factura. |
| `currency` | string | Moneda de la factura. |
| `issuerName` | string | Nombre del emisor de la factura. |
| `issuerTaxId` | string | Identificador fiscal del emisor si se desea guardar. |
| `status` | enum | Estado de la factura dentro del flujo de reembolso. |
| `reimbursedAmount` | decimal nullable | Importe abonado finalmente para esta factura. |
| `reimbursedAt` | date nullable | Fecha en que se registro el abono. |
| `rejectionReason` | text | Motivo de rechazo, si la factura fue rechazada. |
| `notes` | text | Observaciones internas sobre la factura. |
| `createdAt` | datetime | Fecha de creacion del registro. |
| `updatedAt` | datetime | Fecha de ultima actualizacion del registro. |

## Relaciones principales

- `Insurer 1 -> N ReimbursableService`
- `Person 1 -> N ReimbursableService`
- `Insurer 1 -> N ReimbursementRequest`
- `ReimbursableService 1 -> N Invoice`
- `ReimbursementRequest 1 -> N Invoice`

## Reglas estructurales reflejadas en el modelo

1. Un servicio puede tener una o varias facturas.
2. Una solicitud puede incluir una o varias facturas.
3. Una factura pertenece a un unico servicio.
4. Una factura puede pertenecer como maximo a una unica solicitud.
5. Una factura rechazada no se reutiliza; si falta importe por cubrir, se crea una factura nueva.

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

## Fuera de V1

Estas piezas siguen formando parte de la vision general, pero no del modelo minimo de la primera implementacion:

- `Attachment`
- `Note`
- `PolicyHolder` como entidad separada
- `StatusHistory` completo
- estados persistidos mas ricos como `partially_invoiced`, `over_invoiced`, `partially_reimbursed` o `closed`

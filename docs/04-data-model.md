# Data Model

## Entidades operativas de V1

- `User`
- `Insurer`
- `Person`
- `ReimbursableService`
- `Invoice`

`ReimbursementRequest` se mantiene temporalmente en persistencia por transicion,
pero no es la entidad principal del flujo operativo actual.

## ReimbursableService

Campos clave:

- `actualAmount`
- `invoiceBilledAmount`
- `invoiceExpectedAmount`
- `status`

## Invoice

Campos clave:

- `serviceId`
- `invoiceNumber` (nullable al crear)
- `invoiceDate` (nullable al crear)
- `issuerName` (nullable al crear)
- `issuerTaxId` (nullable)
- `invoiceBilledAmount`
- `invoiceExpectedAmount`
- `claimReference` (nullable)
- `status`
- `paidAmount` (nullable)
- `paidAt` (nullable)
- `rejectionReason` (nullable)

## Estados de Invoice

- `CREATED`
- `INFORMATION_COMPLETED`
- `CLAIM_REFERENCE_COMPLETED`
- `PAID`
- `REJECTED`

## Relaciones

- `ReimbursableService 1 -> N Invoice`
- varias `Invoice` pueden compartir `claimReference`

## Regla de cantidad de facturas

- `invoiceCount = ceil(actualAmount / invoiceExpectedAmount)`
- siempre igualar o superar

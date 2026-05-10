# Modelo de datos

## Nota de vigencia

- estado actual operativo: V1 cerrada con correccion final guardando ultima correccion en `Invoice`
- objetivo V2: evolucionar a historial completo de correcciones por factura

## Entidades operativas de V1

- `User`
- `Insurer`
- `Person`
- `ReimbursableService`
- `Invoice`

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
- `correctedAt` (nullable, ultima correccion)
- `correctionReason` (nullable, ultima correccion)
- `correctedFromStatus` (nullable)
- `correctedByUserId` (nullable)
- `correctedByUserName` (nullable)

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

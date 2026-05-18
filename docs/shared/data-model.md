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
- `createdManually` (bool, `false` en autogeneradas, `true` en anadidas manualmente)

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

## Origen de facturas

- al crear servicio, las facturas autogeneradas nacen con `createdManually=false`
- al usar `Anadir factura` en detalle de servicio, la factura nace con `createdManually=true`
- la gestion estructural se limita por estado:
  - `Anadir factura` permitido en `REGISTERED` y `SUBMITTED`, bloqueado en `REIMBURSED`
  - `Eliminar factura` permitido solo en estado `CREATED`

## Exportacion CSV del servicio

- exporta unicamente facturas en estado `CREATED`
- formato operativo vigente:
  - separador `;`
  - decimal con coma
  - BOM UTF-8
  - columnas: `TRATAMIENTO`, `IMPORTE DE LA FACTURA`, `TITULAR`, `FECHA FACTURA`, `SOLICITADA`

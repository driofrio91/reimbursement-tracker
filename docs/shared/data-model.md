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

- `personId` (titular del seguro)
- `policyHolderName` (nombre libre de la persona que recibe el servicio)
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
- `personId` (titular del seguro imputado para topes anuales)
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

## Regla funcional de titulares y receptor del servicio

- `Person` representa al titular del seguro a efectos de negocio y consumo anual.
- El nombre libre guardado en `policyHolderName` representa a la persona que recibe el servicio.
- La persona que recibe el servicio puede ser distinta del titular del seguro.
- El consumo anual se sigue calculando sobre el titular del seguro imputado en factura.

## Nota de naming interno

- En la app y el dominio se prioriza naming semantico como `insuranceHolderPersonId`, `insuranceHolderPersonName` y `serviceRecipientName`.
- El schema fisico de Prisma mantiene por ahora nombres legacy como `personId` y `policyHolderName` para evitar migraciones en esta fase.

## Regla de cantidad de facturas

- `invoiceCount = ceil(actualAmount / invoiceExpectedAmount)`
- siempre igualar o superar

## Origen de facturas

- al crear servicio, las facturas autogeneradas nacen con `createdManually=false`
- al usar `Anadir factura` en detalle de servicio, la factura nace con `createdManually=true`
- la gestion estructural se limita por estado:
  - `Anadir factura` permitido en `REGISTERED` y `SUBMITTED`, bloqueado en `REIMBURSED`
  - `Eliminar factura` permitido en `CREATED` y `INFORMATION_COMPLETED` (con confirmacion explicita en `INFORMATION_COMPLETED`)
  - `Eliminar servicio` permitido solo cuando todas sus facturas estan en `CREATED`

## Exportacion CSV del servicio

- exporta unicamente facturas en estado `CREATED`
- formato operativo vigente:
  - separador `;`
  - decimal con coma
  - BOM UTF-8
  - columnas: `TRATAMIENTO`, `IMPORTE DE LA FACTURA`, `TITULAR`, `FECHA FACTURA`, `SOLICITADA`

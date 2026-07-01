# Reglas de negocio

> Baseline funcional de V1 como referencia transversal.
>
> Para prioridades activas, consultar `docs/versions/v2/roadmap.md`.

## Flujo base

1. se registra un servicio con importe real
2. se autogeneran facturas del servicio
3. cada factura completa su informacion
4. cada factura registra `claimReference` cuando se envia al portal
5. cada factura termina en `PAID` o `REJECTED`

## Regla de autogeneracion

Por servicio se definen:

- `invoiceBilledAmount` (default `55`)
- `invoiceExpectedAmount` (default `49.5`)

Numero de facturas:

- `invoiceCount = ceil(actualAmount / invoiceExpectedAmount)`

Siempre igualar o superar el importe real.

## Reglas de solicitud

- la referencia de portal se guarda como `claimReference` en factura
- varias facturas pueden compartir la misma `claimReference`
- `ReimbursementRequest` no es la entidad operativa principal del flujo vigente

## Reglas de titular y receptor del servicio

- `Person` representa al titular del seguro a efectos de topes anuales.
- La persona que recibe el servicio se guarda como nombre libre en el servicio.
- La persona que recibe el servicio puede ser distinta del titular del seguro.
- El consumo anual se imputa siempre al titular del seguro asociado a la factura.

## Reglas de estados de factura

- `CREATED`: factura autogenerada
- `INFORMATION_COMPLETED`: factura con informacion documental completa
- `CLAIM_REFERENCE_COMPLETED`: factura con referencia de solicitud registrada
- `PAID`: estado final positivo
- `REJECTED`: estado final negativo

## Reglas de pago

- al marcar pagada se usa `paidAmount`
- `paidAmount` se propone con el esperado y puede editarse

## Reglas de avisos

- se permite sobrefacturacion
- se permite sobrecobertura esperada
- ambos casos muestran aviso operativo sin bloqueo

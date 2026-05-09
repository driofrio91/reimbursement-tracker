# User Flows

> Baseline de flujos V1 como referencia transversal.
>
> Para evolucion activa, consultar `docs/versions/v2/roadmap.md`.

## Flujo 1. Crear servicio

1. usuario registra fecha, concepto, importe real, persona, titular y aseguradora
2. usuario define `invoiceBilledAmount` e `invoiceExpectedAmount`
3. sistema crea servicio y autogenera facturas

## Flujo 2. Completar informacion de factura

1. usuario abre detalle del servicio
2. completa numero, fecha, emisor y datos opcionales
3. sistema deja factura en `INFORMATION_COMPLETED`

## Flujo 3. Registrar solicitud en portal

1. usuario rellena `claimReference`
2. sistema deja factura en `CLAIM_REFERENCE_COMPLETED`
3. varias facturas pueden usar la misma referencia

## Flujo 4. Resolver factura

1. usuario marca `PAID` o `REJECTED`
2. para `PAID`, `paidAmount` viene con default esperado y es editable
3. para `REJECTED`, puede registrar motivo

## Flujo 5. Consultar trazabilidad del servicio

La pantalla de detalle muestra:

- importe real
- total facturado
- total esperado
- total pagado
- pendiente esperado
- avisos de exceso
- listado de facturas y su estado

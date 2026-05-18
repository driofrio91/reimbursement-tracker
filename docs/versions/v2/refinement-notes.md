# V2 Refinement Notes

## Nuevas funcionalidades propuestas

### 1) Gestion de usuarios y seguridad de acceso
- [ ] Panel de usuario para gestion de cuenta.
- [ ] Cambio de contrasena desde panel.
- [ ] Cambio de contrasena obligatorio en primer inicio de sesion.
- [ ] Bloqueo de app (excepto cambio de password y logout) hasta completar el cambio inicial.

### 2) Tope anual por usuario (aseguradora)
- [ ] Limite anual configurable por cada usuario (cada uno gestiona el suyo).
- [ ] Valor por defecto del limite: 1500 EUR.
- [ ] Calculo por ano natural (enero-diciembre).
- [ ] Solo descuentan facturas en estado `PAID`.
- [ ] Facturas `REJECTED` no descuentan.
- [ ] El descuento se hace con `paidAmount` (reembolso real), no con importe facturado.
- [ ] Avisar al usuario cuando una factura pueda sobrepasar su limite anual.
- [ ] Mostrar claramente a que anualidad descuenta cada factura.
- [ ] Recalcular automaticamente consumo anual ante cambios de `invoiceDate`, `paidAmount` o estado final.
- [ ] Mantener `reimbursedAccumulated` como valor cacheado anual por usuario.
- [ ] Reglas de ajuste del cache por transiciones:
  - `PAID -> REJECTED`: restar el aporte previo de esa factura.
  - `REJECTED -> PAID`: sumar `paidAmount`.
  - `PAID(old) -> PAID(new)`: ajustar por delta (`new - old`).
  - Cambio de `invoiceDate` en factura `PAID`: mover el aporte entre anualidades.
- [ ] Si no existe registro anual para un usuario y ano consultado, mostrar `Sin datos`.

### 3) Visibilidad global en pantalla principal
- [ ] Mostrar en home el resumen de limites anuales de todos los usuarios.
- [ ] Todos los usuarios ven el progreso de todos.
- [ ] Barra horizontal por usuario con formato tipo `900 EUR / 1500 EUR`.
- [ ] Semaforo de consumo:
  - `< 75%`: verde
  - `>= 75%` y `<= 100%`: ambar
  - `> 100%`: rojo
- [ ] Diseno mobile-first: lectura clara en pantalla pequena.
- [ ] El bloque de "nuevas funcionalidades" o backlog informativo se situa al final de la pantalla principal.
- [ ] Incluir boton `Sync` (icono sincronizar) en la esquina superior derecha del bloque de graficos del ano actual.
- [ ] El `Sync` del ano actual es solo para `ADMIN`.
- [ ] Mostrar resultado del `Sync` (usuarios procesados, ajustes aplicados y errores si los hubiera).

#### Jerarquia visual obligatoria (ano actual vs anos anteriores)
- El bloque del ano actual es el bloque principal y debe ser visualmente dominante.
- El bloque de anos anteriores es secundario y debe ser mas compacto.
- Debe identificarse a simple vista cual es el bloque prioritario.
- En desktop, el bloque principal debe tener una presencia aproximada de `1.6x-1.8x` frente al bloque historico.
- En mobile, ambos bloques van en columna, con el bloque principal primero y con mayor altura base.

#### Regla de loading por bloques
- Cada bloque de grafica anual usa su propio `Suspense`; no se permite un `Suspense` global para toda la home.
- `Suspense` del bloque principal (ano actual) y `Suspense` del bloque secundario (anos anteriores) deben ser independientes.
- Cada bloque debe tener fallback tipo skeleton con altura estable para evitar saltos visuales.
- El skeleton del ano actual debe ser mayor que el de anos anteriores para mantener la jerarquia tambien durante la carga.
- Los estados `error` y `Sin datos` deben resolverse por bloque, sin bloquear el otro contenedor.

#### Regla de `Sync` en UX
- `Sync` se gestiona con estado propio de accion (`pending`, `success`, `error`) y no como loading global de pantalla.
- Al ejecutar `Sync`, no se bloquea toda la home; solo se actualizan/revalidan los bloques afectados.

### 4) Gestion de facturas desde el detalle de servicio
- [x] Boton `Anadir factura` a nivel de servicio.
- [x] Icono papelera por cada factura para eliminacion.
- [x] Papelera visible siempre, pero deshabilitada cuando no se pueda eliminar.
- [x] Motivo de bloqueo obligatorio: tooltip en desktop y bottom sheet contextual en mobile.

### 5) Exportacion de facturas por servicio
- [x] Anadir opcion `Extraer facturas` en el detalle de servicio.
- [x] Exportar unicamente facturas en estado `CREATED`.
- [x] Si no hay facturas `CREATED`, boton de exportar deshabilitado.
- [x] Motivo de bloqueo obligatorio: tooltip en desktop y bottom sheet contextual en mobile.
- [x] Generar archivo CSV con BOM UTF-8 para compatibilidad.
- [x] Separador CSV: `;`.
- [x] Formato decimal: coma (ej: `55,00`).
- [x] Nombre archivo: `facturas-{nombre-servicio}-{yyyyMMdd-HHmm}.csv`.
- [x] Orden de columnas igual a la captura:
  1. `TRATAMIENTO`
  2. `IMPORTE DE LA FACTURA`
  3. `TITULAR`
  4. `FECHA FACTURA`
  5. `SOLICITADA`
- [x] Mapeo de columnas:
  - `TRATAMIENTO`: fijo `FISIOTERAPIA - CERVICAL`
  - `IMPORTE DE LA FACTURA`: `invoiceBilledAmount`
  - `TITULAR`: vacio
  - `FECHA FACTURA`: vacio
  - `SOLICITADA`: vacio

### 6) Gestion de aseguradoras
- [ ] Crear gestion de aseguradoras para usuarios.
- [ ] Permitir anadir aseguradoras nuevas.
- [ ] Permitir eliminar aseguradoras existentes.
- [ ] Integrar esta gestion con el flujo de creacion o edicion de servicio.
- [ ] Borrado permitido solo si la aseguradora no esta en uso.
- [ ] Si esta en uso, accion de eliminar deshabilitada con motivo visible (tooltip en desktop y bottom sheet en mobile).

### 7) Historico del tope de reembolso por usuario
- [ ] En pantalla principal mostrar bloque principal del ano actual.
- [ ] Anadir bloque secundario (compacto) para consultar anos anteriores.
- [ ] Permitir navegacion por anos pasados sin limite practico.
- [ ] No permitir consulta de anos futuros.
- [ ] Mantener vista por usuarios con barra de progreso y semaforo por ano.
- [ ] Calculo anual por `invoiceDate`, solo facturas `PAID` con `paidAmount`.
- [ ] Recalcular historico ante cambios de `invoiceDate`, `paidAmount` o estado.
- [ ] Persistir limites anuales en tabla separada de usuarios.
- [ ] Incluir boton `Sync` en la esquina superior derecha del bloque de anos anteriores.
- [ ] El `Sync` de anos anteriores es solo para `ADMIN`.
- [ ] Mantener estado vacio `Sin datos` cuando no exista informacion del ano seleccionado.

#### Modelo funcional recomendado (refinamiento)
- Entidad/tabla dedicada: `UserAnnualReimbursementLimit` (nombre orientativo).
- Campos base:
  - `userId`
  - `year`
  - `annualLimitAmount`
  - `reimbursedAccumulated`
  - `currency`
  - `createdAt`, `updatedAt`
- Restriccion unica: `(userId, year)`.

#### Reglas cerradas de herencia anual
- Cada ano nuevo hereda el limite del ano anterior para cada usuario.
- Si no existe ano anterior, usar default `1500 EUR`.
- El limite de un ano se edita de forma independiente y no altera anos pasados.
- "Ano actual" se determina por fecha del sistema (`year === ano actual`), sin campo `isCurrent`.

## Reglas de negocio cerradas

### Consumo de limite anual
- `saldo_restante = limite_anual_usuario - sum(paidAmount de facturas PAID del ano de invoiceDate)`.
- El importe facturado no impacta el saldo anual.
- La anualidad se determina por `invoiceDate`.
- Si cambia `invoiceDate`, `paidAmount` o estado final, se recalcula automaticamente el consumo.

### Reconciliacion y cache anual
- `reimbursedAccumulated` es un cache de lectura rapida, no la unica fuente de verdad.
- El calculo de referencia se obtiene de facturas `PAID` por ano de `invoiceDate`.
- La accion `Sync` reconcilia cache vs calculo de referencia.
- `Sync` debe ser idempotente y devolver resumen de resultado.

### Estados de factura (definicion funcional)
- Fases iniciales: `CREATED`, `INFORMATION_COMPLETED`.
- Fase tramitada no inicial: `CLAIM_REFERENCE_COMPLETED`.
- Fases finales: `PAID`, `REJECTED`.

### Estado global de servicio
- `REGISTERED`: existe al menos una factura en fase inicial.
- `SUBMITTED`: no hay facturas en fase inicial y no estan todas en estado final.
- `REIMBURSED`: todas las facturas estan en estado final (`PAID` o `REJECTED`).

### Reglas para anadir o eliminar facturas
- `Anadir factura`: habilitado en `REGISTERED` y `SUBMITTED`; deshabilitado en `REIMBURSED`.
- `Eliminar factura`: permitido solo si la factura esta en `CREATED`.
- No eliminar en `INFORMATION_COMPLETED`, `CLAIM_REFERENCE_COMPLETED`, `PAID`, `REJECTED`.
- En `REIMBURSED`, bloqueadas todas las modificaciones de estructura de facturas.

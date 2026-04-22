# Use Cases Roadmap

## Objetivo

Este documento deja listados todos los casos de uso relevantes del proyecto y el orden recomendado para implementarlos sin perder el foco de la V1.

La regla sigue siendo la misma: si una pieza no ayuda de forma directa a sustituir el Excel en la operativa diaria, no entra en V1.

## Estado actual del roadmap

- base tecnica: completada
- autenticacion: completada
- casos de uso de servicios: completados
- casos de uso de facturas: pendientes
- casos de uso de solicitudes: pendientes
- resolucion de solicitudes: pendiente

## Casos de uso de V1

### Ya implementados

- `LoginWithCredentials`
- `CreateReimbursableServiceUseCase`
- `ListReimbursableServicesUseCase`
- `GetReimbursableServiceDetailUseCase`

### Servicios

- `CreateReimbursableServiceUseCase`
- `ListReimbursableServicesUseCase`
- `GetReimbursableServiceDetailUseCase`
- `UpdateReimbursableServiceUseCase` si hace falta durante la primera vuelta funcional

### Facturas

- `CreateInvoiceForServiceUseCase`
- `ListInvoicesByServiceUseCase`
- `GetPendingAmountForServiceUseCase` si se separa como lectura dedicada

### Solicitudes

- `CreateReimbursementRequestUseCase`
- `ListReimbursementRequestsUseCase` si hace falta visibilidad operativa minima
- `GetReimbursementRequestDetailUseCase` si la UI lo necesita para resolucion

### Resolucion

- `RegisterRequestResolutionUseCase`

## Casos de uso fuera de la primera iteracion tecnica

Aunque formen parte de la V1 funcional global, no son el siguiente paso inmediato y no deben adelantarse antes de cerrar servicios:

- creacion de facturas
- agrupacion en solicitudes
- resolucion de solicitudes
- calculo avanzado de avisos operativos en UI

## Casos de uso de V2 o posteriores

- `ImportHistoricalSpreadsheetUseCase`
- `PreviewSpreadsheetImportUseCase`
- gestion de adjuntos
- notas estructuradas
- dashboard analitico avanzado
- gestion de usuarios desde la app

## Orden recomendado de implementacion

### Fase 0. Base tecnica

Ya completada:

1. inicializar `Next.js`
2. montar estructura `src/app`, `src/modules`, `src/lib`
3. configurar `Prisma`
4. conectar `Neon`
5. aplicar migracion inicial
6. crear seed de desarrollo
7. montar `Auth.js`
8. proteger rutas basicas

### Fase 1. Servicios reembolsables

Fase cerrada.

1. crear entidad y contrato de repositorio de servicios
2. implementar `CreateReimbursableServiceUseCase`
3. implementar repositorio Prisma para servicios
4. crear formulario de alta de servicio
5. implementar `ListReimbursableServicesUseCase`
6. construir listado basico de servicios
7. implementar `GetReimbursableServiceDetailUseCase`
8. construir detalle de servicio
9. anadir validaciones de entrada y mensajes de error

### Fase 2. Facturas

Solo despues de cerrar servicios.

1. modelar lectura operativa de importes facturados y pendientes
2. implementar `CreateInvoiceForServiceUseCase`
3. implementar `ListInvoicesByServiceUseCase`
4. mostrar aviso de sobrefacturacion
5. mostrar importe pendiente por cubrir

### Fase 3. Solicitudes

1. implementar `CreateReimbursementRequestUseCase`
2. permitir agrupar una o varias facturas elegibles
3. registrar fecha de envio y referencia externa
4. actualizar estado de facturas a `submitted`
5. actualizar estado del servicio cuando corresponda

### Fase 4. Resolucion

1. implementar `RegisterRequestResolutionUseCase`
2. marcar facturas como `reimbursed` o `rejected`
3. guardar importes abonados y fecha de abono cuando aplique
4. recalcular estado global del servicio
5. permitir crear nueva factura tras rechazo si sigue faltando importe

## Orden minimo recomendado para proximas sesiones

Si el trabajo se reparte entre varias sesiones, seguir este orden:

1. tests de `CreateServiceUseCase`, `GetServiceDetailUseCase` y `ListServicesUseCase`
2. `CreateInvoiceForServiceUseCase`
3. `ListInvoicesByServiceUseCase`
4. visibilidad operativa de importes pendientes y sobrefacturacion
5. solicitudes
6. resolucion

## Checklist obligatorio por cada US con rutas privadas

Cuando una historia de usuario anada una pantalla o cambie el flujo de una ruta privada, debe cerrar este checklist antes de darse por terminada:

1. la ruta queda integrada en la sidebar con jerarquia correcta (item principal o subitem)
2. se resuelve el estado visual de pagina activa y de seccion activa
3. la navegacion movil permite llegar a la ruta desde menu hamburguesa sin tapar el contenido por defecto
4. se mantienen acciones contextuales en pantalla cuando aportan al flujo operativo
5. no se redisenia la navegacion global salvo que exista una US tecnica separada para eso

## Regla para decidir el siguiente paso

Si hay duda entre varias tareas, elegir siempre la que desbloquee antes este flujo:

1. crear factura para un servicio existente
2. ver facturas del servicio
3. calcular importe pendiente y avisos de sobrefacturacion
4. despues continuar con solicitudes y resolucion

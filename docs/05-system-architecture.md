# System Architecture

## Objetivo

Definir una arquitectura limpia adaptada a Next.js que permita trabajar con casos de uso, reglas de negocio explicitamente modeladas y dependencias orientadas hacia el dominio.

La idea no es reproducir de forma literal una arquitectura Java, sino mantener sus principios utiles dentro del ecosistema de Next.js.

## Decision adoptada

El proyecto adopta una arquitectura limpia ligera organizada por modulos funcionales.

La decision concreta es:

- `Next.js` se usa como framework de entrega
- la logica de negocio se modela mediante casos de uso explicitos
- el dominio no depende de React, Next.js ni Prisma
- `Prisma` se usa unicamente como tecnologia de persistencia dentro de infraestructura
- la organizacion principal del codigo se hace por modulo funcional y no por carpeta tecnica global

Esta arquitectura busca equilibrar tres cosas:

- claridad para trabajar con casos de uso
- adaptacion natural al framework
- evitar sobreingenieria innecesaria

Las decisiones de plataforma, despliegue y coste quedan detalladas en `docs/06-technical-decisions.md`.

## Principios de arquitectura

### 1. El dominio no depende del framework

Las reglas de negocio no deben vivir dentro de componentes, paginas o handlers de Next.js.

### 2. Los casos de uso orquestan el negocio

Cada accion relevante del sistema debe representarse como un caso de uso explicito.

### 3. La infraestructura implementa contratos

Base de datos, almacenamiento de archivos, autenticacion y servicios externos deben estar detras de puertos o interfaces.

### 4. La UI solo invoca casos de uso

La capa de presentacion no debe contener reglas de negocio complejas.

### 5. El modelo se organiza por modulo funcional

Es preferible agrupar por dominio o feature antes que por tipo tecnico global.

## Propuesta de capas

### Domain

Contiene el nucleo del negocio:

- entidades
- value objects
- enums
- reglas invariantes
- servicios de dominio cuando hagan falta
- contratos de repositorio

Ejemplos:

- `ReimbursableService`
- `Invoice`
- `ReimbursementRequest`

### Application

Contiene los casos de uso del sistema y la orquestacion del flujo:

- comandos de entrada
- DTOs de salida
- validaciones de aplicacion
- coordinacion de repositorios
- transacciones

Ejemplos:

- `CreateReimbursableServiceUseCase`
- `CreateInvoiceForServiceUseCase`
- `CreateReimbursementRequestUseCase`
- `RegisterRequestResolutionUseCase`

### Infrastructure

Contiene implementaciones concretas de los puertos definidos en `domain` o `application`.

Ejemplos:

- repositorios Prisma
- storage local o cloud para adjuntos
- proveedor de autenticacion
- mapeadores persistencia <-> dominio

Aqui vive toda la integracion con la base de datos y con servicios tecnicos externos.

### UI

Contiene la parte de Next.js:

- App Router
- layouts
- paginas
- componentes
- formularios
- tablas
- actions y route handlers como adaptadores de entrada

## Como encaja esto en Next.js

Next.js no debe ser la arquitectura. Solo debe ser el framework de entrega.

La recomendacion es:

- usar `app/` para rutas y composicion de interfaz
- usar Server Components para lectura cuando sea natural
- usar Server Actions o Route Handlers como punto de entrada
- delegar inmediatamente en casos de uso de `application`

Ejemplo conceptual:

1. un formulario de la UI envia datos
2. una Server Action recibe la peticion
3. la action valida formato basico y llama a un caso de uso
4. el caso de uso aplica reglas, usa repositorios y devuelve resultado
5. la UI solo renderiza el resultado

## Reglas de dependencia

Las dependencias deben apuntar siempre hacia dentro.

- `ui` puede depender de `application`
- `application` puede depender de `domain`
- `infrastructure` puede depender de `application` y `domain`
- `domain` no depende de ninguna otra capa

No debe haber dependencias directas desde `domain` hacia `Next.js`, `React`, `Prisma` o detalles de infraestructura.

## Estructura de carpetas propuesta

```text
src/
  app/
    (dashboard)/
    services/
    invoices/
    requests/
    api/

  modules/
    reimbursement/
      domain/
        entities/
        value-objects/
        enums/
        repositories/
        services/
      application/
        use-cases/
        dto/
        commands/
        queries/
      infrastructure/
        persistence/
        mappers/
        storage/
      ui/
        components/
        forms/
        presenters/

    shared/
      domain/
      application/
      infrastructure/
      ui/

  lib/
    db/
    auth/
    config/
```

## Modulo principal inicial

Para el MVP, un unico modulo `reimbursement` es suficiente.

Dentro de ese modulo conviviran:

- servicios reembolsables
- facturas
- solicitudes de reembolso
- reglas de calculo y avisos

Mas adelante, si crece el producto, podra dividirse en modulos mas pequenos.

## Casos de uso recomendados para el MVP

### Servicios

- `CreateReimbursableServiceUseCase`
- `UpdateReimbursableServiceUseCase`
- `GetReimbursableServiceDetailUseCase`
- `ListReimbursableServicesUseCase`

### Facturas

- `CreateInvoiceForServiceUseCase`
- `ListInvoicesByServiceUseCase`

### Solicitudes

- `CreateReimbursementRequestUseCase`
- `SubmitReimbursementRequestUseCase`
- `RegisterRequestResolutionUseCase`
- `CloseReimbursementRequestUseCase`

### Importacion

- `ImportHistoricalSpreadsheetUseCase`
- `PreviewSpreadsheetImportUseCase`

## Repositorios recomendados

Estos contratos deberian definirse cerca del dominio o de aplicacion, segun el nivel de abstraccion final.

- `ReimbursableServiceRepository`
- `InvoiceRepository`
- `ReimbursementRequestRepository`

## Prisma como infraestructura

Prisma encaja bien si se usa como detalle de infraestructura y no como modelo de dominio.

La recomendacion es:

- definir schema Prisma para persistencia
- mapear entre modelos Prisma y modelos de dominio o DTOs de aplicacion
- evitar que toda la logica de negocio viva sobre objetos Prisma en bruto

### Que representa Prisma en esta arquitectura

Prisma es la tecnologia que implementa el acceso a datos.

Su papel en el sistema es:

- definir el esquema de persistencia
- generar el cliente de acceso a base de datos
- ejecutar consultas, escrituras y transacciones
- implementar los repositorios concretos del sistema

Prisma no representa:

- el dominio del negocio
- los casos de uso
- la logica de validacion de negocio
- la arquitectura del sistema

En terminos practicos:

- `domain` define que necesita guardarse y que reglas existen
- `application` decide cuando y por que se persiste algo
- `infrastructure` usa Prisma para hacerlo realmente

### Ejemplo de uso correcto de Prisma

1. una Server Action recibe la peticion
2. llama a un caso de uso
3. el caso de uso usa una interfaz de repositorio
4. la implementacion concreta del repositorio usa Prisma

### Ejemplo de uso incorrecto de Prisma

- consultas Prisma directamente en componentes
- reglas de negocio dentro de handlers o server actions
- calculo de estados de negocio mezclado con consultas SQL o Prisma
- objetos Prisma usados como si fueran el dominio del sistema

## Validacion

Separaria dos niveles:

### Validacion de entrada

Para formularios y APIs:

- formato de fechas
- campos requeridos
- tipos y rangos basicos

Esto puede hacerse con `zod`.

### Validacion de negocio

Para reglas del dominio:

- no enviar solicitudes vacias
- advertir sobrefacturacion
- impedir estados incoherentes
- detectar reutilizacion de facturas con historial previo

Esto debe vivir en casos de uso y dominio, no en la UI.

## Lecturas y escrituras

Para mantener claridad:

- las escrituras deben pasar por casos de uso
- las lecturas simples pueden resolverse con queries especificas
- las vistas complejas pueden tener read models optimizados

No hace falta introducir CQRS formal desde el primer dia, pero si conviene separar mentalmente lecturas de escrituras.

## Transacciones

Hay operaciones que deberian ser transaccionales:

- crear solicitud con varios items
- registrar resolucion de una solicitud y actualizar sus registros operativos
- reutilizar una factura creando un nuevo registro operativo enlazado al anterior

Estas transacciones deben orquestarse en aplicacion usando la infraestructura de persistencia.

## Historial y auditoria

Cada cambio relevante de estado debe producir un registro en `StatusHistory`.

Debe auditarse al menos:

- cambios de estado de servicio
- cambios de estado de registro operativo
- cambios de estado de solicitud
- resoluciones de items

## Estrategia recomendada para empezar

### Opcion recomendada

Arquitectura limpia ligera por modulos.

Esto significa:

- dominio claro
- casos de uso explicitos
- infraestructura aislada
- sin exceso de abstracciones prematuras

### Lo que evitaria al principio

- demasiados modulos pequenos antes de tiempo
- factories innecesarias
- buses de comandos y eventos sin necesidad real
- jerarquias complejas de adaptadores
- sobreingenieria heredada del mundo enterprise Java

## Recomendacion final

La mejor opcion para este proyecto es una arquitectura limpia, modular y pragmatica:

- `Next.js` como framework de entrega
- `App Router` para la interfaz
- `application/use-cases` para la logica de negocio
- `domain` para reglas e invariantes
- `Prisma` como persistencia en `infrastructure`

Es una forma natural de mantener tu mentalidad de casos de uso y arquitectura hexagonal sin pelearte con el framework.

## Resumen ejecutivo

La arquitectura aprobada para el proyecto es:

- arquitectura limpia ligera
- organizacion por modulo `reimbursement`
- casos de uso explicitos en `application`
- reglas de negocio en `domain`
- Prisma encapsulado en `infrastructure`
- Next.js limitado a UI, rutas y adaptadores de entrada
- despliegue previsto sobre `Vercel`
- base de datos `PostgreSQL` en `Neon`
- autenticacion minima con `Auth.js`

Esta sera la base para la implementacion del proyecto.

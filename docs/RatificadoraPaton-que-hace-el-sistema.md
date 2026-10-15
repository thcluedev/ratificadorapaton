# Rectificaciones Patón — Qué hace el sistema (guía completa)

Documento para quien continúa el proyecto: **qué problema resuelve**, **cómo se usa** y **cómo está armado por dentro** (sin entrar línea por línea en el código).

Repositorio: **https://github.com/thcluedev/ratificadorapaton**

---

## 1. Resumen ejecutivo

**Rectificaciones Patón** es una aplicación web pensada para **tablet en horizontal (1024×768)**. Reemplaza las planillas en papel del taller con un flujo digital:

| Etapa | Quién | Qué hace |
|-------|--------|----------|
| Ingreso | Administrador | Registra cliente, motor, block y piezas → **Orden de trabajo** |
| Medición | Operario | Revisa ficha Patón por pieza, notas, cantidades y **fotos** |
| Presupuesto | Administrador | Arma trabajos con precios, imprime para el cliente |
| Seguimiento | Administrador | Ve historial, estados y detalle de cada orden |

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Prisma, SQLite en local. Server Actions para mutaciones. Subida de archivos vía API route.

---

## 2. Problema de negocio que resuelve

Antes (papel):

- Ingreso de motor/piezas anotado a mano.
- Medición y checklist (ficha Patón) en planillas físicas.
- Fotos sueltas en el celular o sin vincular a la pieza/ítem.
- Presupuesto armado aparte, difícil de rastrear contra una orden.

Ahora (app):

- **Una orden numerada** concentra cliente, motor, block, piezas, medición, archivos y presupuesto.
- **Estados claros** (pendiente → en medición → medida → presupuestada → entregada).
- **Historial** automático (quién hizo qué y cuándo).
- **Separación de roles:** el operario no ve precios.

---

## 3. Roles, login y seguridad

### Roles

| Rol | Código | Acceso |
|-----|--------|--------|
| Administrador | ADMIN | `/admin/*` |
| Operario | OPERARIO | `/operario/*` |

El **middleware** (`middleware.ts`) redirige:

- Sin sesión → pantalla de login `/`.
- Admin que entra a `/operario` → lo manda a `/admin`.
- Operario que entra a `/admin` → lo manda a `/operario`.
- Con sesión, `/` redirige al home del rol.

### Login

- Pantalla inicial: elegir usuario (tarjetas) + **PIN de 4 dígitos** con teclado en pantalla (`NumericKeypad`).
- Sesión en **cookie firmada** (`SESSION_SECRET` en `.env`).
- PIN hasheado en base (`bcrypt` en seed).

### Usuarios de prueba (seed)

| Nombre | Rol | PIN |
|--------|-----|-----|
| Roberto Patón | ADMIN | 1234 |
| Diego Fernández | OPERARIO | 1234 |

El seed también carga **catálogo de trabajos** con precios sugeridos y **no** deja clientes demo en producción limpia (ver `prisma/seed.ts`).

---

## 4. Mapa de pantallas (rutas)

### Público

| Ruta | Descripción |
|------|-------------|
| `/` | Login (roles + PIN) |

### Administrador

| Ruta | Descripción |
|------|-------------|
| `/admin` | Home: accesos Ingresos, Órdenes, Presupuestos + contadores |
| `/admin/ingreso` | Elegir motor completo vs solo piezas |
| `/admin/ingreso/datos` | Cliente, motor, **nº block** (obligatorio) |
| `/admin/ingreso/piezas` | Checklist de piezas a incluir en la orden |
| `/admin/ordenes` | Listado de órdenes |
| `/admin/presupuestos` | Órdenes listas para / con presupuesto |
| `/admin/orden/[numero]` | Detalle orden + historial |
| `/admin/orden/[numero]/creada` | Confirmación post-alta |
| `/admin/orden/[numero]/presupuesto` | Armar presupuesto (trabajos, precios, tildar) |
| `/admin/orden/[numero]/comprobante` | Vista/imprimible del presupuesto |

### Operario

| Ruta | Descripción |
|------|-------------|
| `/operario` | Lista de órdenes a medir (según estado) |
| `/operario/orden/[numero]` | **Medición**: ficha, notas, cantidades, fotos |

---

## 5. La orden y sus estados

### Datos principales de una orden

- **Número** correlativo (único).
- **Cliente** (nombre, teléfono).
- **Motor:** marca, modelo.
- **Número de block** (texto obligatorio al ingresar).
- **Motor completo** (boolean): si el ingreso fue “motor completo” o “solo piezas”.
- **Estado** (ver abajo).
- **Piezas** incluidas (`Pieza`: tipo + etiqueta libre si es OTRA).
- Relacionados: mediciones, archivos, trabajos de presupuesto, ítems de ficha, mensajes de historial.

### Estados y significado en pantalla

| Estado técnico | Texto en app | Significado |
|----------------|--------------|-------------|
| PENDIENTE_MEDICION | Pendiente de medición | Orden creada; operario no empezó o no guardó nada |
| EN_MEDICION | En medición | Hay medición parcial o al menos un archivo |
| MEDIDA | Medida · armar presupuesto | Operario confirmó “Terminé de medir” |
| PRESUPUESTADA | Presupuesto entregado | Se entregó/imprimió presupuesto |
| ENTREGADA | Entregada | Cierre del ciclo |

### Quién cambia cada estado

| Transición | Disparador |
|------------|------------|
| → EN_MEDICION | Primera nota/cantidad/ficha guardada **o** primer archivo subido |
| → MEDIDA | Operario: `terminarMedicion()` |
| → PRESUPUESTADA | Admin: entregar/imprimir presupuesto (`presupuestos.ts`) |
| → ENTREGADA | Flujo de comprobante/entrega |

**Importante:** desde operario **no se revierte** MEDIDA; órdenes PRESUPUESTADA/ENTREGADA no aceptan más medición ni uploads.

---

## 6. Flujo detallado — Ingreso (admin)

### Paso A — Tipo (`/admin/ingreso`)

- **Motor completo:** flujo típico block + conjunto de piezas habituales.
- **Solo piezas:** el cliente trae componentes sueltos.

### Paso B — Datos (`/admin/ingreso/datos`)

- Buscar o crear **cliente**.
- Marca y modelo de motor.
- **Número de block** (validación: no vacío).

Los datos viajan en sesión/borrador (`lib/ingreso.ts`) hasta confirmar piezas.

### Paso C — Piezas (`/admin/ingreso/piezas`)

Checklist con tipos estándar (`lib/labels.ts`):

- Block, Bielas, Pistones, Cigüeñal, Tapa de cilindro, Árbol de levas, Volante, Varios.
- **Otra:** permite texto libre (`etiquetaLibre`).

### Paso D — Creación (`crearOrden` en `app/actions/ordenes.ts`)

Al confirmar:

1. Asigna **siguiente número** de orden.
2. Inserta `Orden` + filas `Pieza`.
3. Ejecuta **`initFichaOrden`**: por cada pieza, copia ítems desde `lib/ficha-piezas.ts` a tabla **`PiezaFichaItem`** (checklist Patón).
4. Registra **historial** “orden creada” con block y tipo de ingreso.
5. Redirige a pantalla **orden creada** con link al detalle.

**Referencia de negocio:** PDF `PATON_FICHA PIEZAS MOTOR.pdf` en la raíz del repo (origen de la lista de ítems).

---

## 7. Ficha Patón — ítems por pieza

Al crear la orden, cada pieza recibe ítems predefinidos. El operario los ve en **“Ficha · ítems a revisar”**.

Resumen (ver código para lista exacta):

| Pieza | Ejemplos de ítems |
|-------|-------------------|
| Block | Pernos, camisas, aros, tapas, bancadas, espárragos, retenes, guías |
| Cigüeñal | Con/sin chavetas, contrapesos |
| Bielas | Bielas, cojinetes, bujetes |
| Pistones | Pistones, aros, pernos, tapas |
| Árbol de levas | Chavetas, levas, botadores, engranajes |
| Tapa de cilindro | Válvulas, resortes, balancines, varillas, espárragos |
| Volante | Volante, embrague, polea, bulones |
| Varios | Alternador, bombas, cadena/correa, carter, filtros, arranque, etc. |
| Otra | Ítem genérico “Revisar pieza” |

Si la pieza es **OTRA**, los ítems pueden personalizarse con etiqueta libre vía `itemsFichaParaPieza()`.

---

## 8. Flujo detallado — Medición (operario)

Pantalla: **`medicion-client.tsx`** + server **`page.tsx`** (carga orden, piezas, ficha, archivos, mediciones).

### Por cada pieza de la orden

1. **Encabezado:** nombre de pieza, contador de fotos, (cámara solo si la pieza no tiene ficha).
2. **Cantidad y notas de la pieza** (nivel general):
   - Guardado en tabla **`Medicion`** (una fila vigente por `piezaTipo`; se actualiza la más reciente).
   - Campos: observación (nota), cantidad unificada en texto.
3. **Ficha · ítems a revisar** (desplegable):
   - Por ítem: check **revisado**, **cámara**, desplegable **nota + cantidad**.
   - Datos en **`PiezaFichaItem`** (marcado, nota, cantidad).
   - Fotos del ítem: **`Archivo`** con `piezaTipo` + **`fichaItemId`**.
4. **Autoguardado:** debounce ~450 ms + guardado al salir / “Terminé de medir”.
5. **Fotos:** solo **cámara** (no galería). POST **`/api/uploads`** (solo rol operario).

### Acciones del operario

| Acción | Efecto |
|--------|--------|
| Marcar ítem ficha | `PiezaFichaItem.marcado` + usuario/fecha |
| Escribir nota/cantidad | Pieza o ítem ficha |
| Sacar foto | Archivo ligado al ítem |
| Borrar foto | Modal visor → borrar (historial) |
| Terminé de medir | Estado → **MEDIDA**; admin puede presupuestar |

### Qué ve el admin hoy de la medición

- Detalle de orden, archivos, historial.
- **Pendiente de mejora:** mostrar en admin el mismo detalle de ficha/notas/cantidad que ve operario (hoy está más completo en operario).

---

## 9. Flujo detallado — Presupuesto (admin)

Ruta: **`/admin/orden/[numero]/presupuesto`**.

### Catálogo

- Tabla **`CatalogoTrabajo`**: trabajos precargados por **categoría** (Block, Cigüeñal, Árbol de levas, Tapa, Varios) con **precio sugerido**.
- El seed carga el catálogo inicial.

### Trabajos de la orden

- Tabla **`Trabajo`**: líneas asociadas a la orden.
- Puede venir del catálogo (tildar = agregar con precio sugerido) o **línea libre** (`esLibre`).
- Cada línea: descripción, precio, **tildado** (incluido en total o no).

### Acciones típicas

- Tildar/des-tildar trabajo del catálogo.
- Agregar trabajo libre con precio.
- Editar precio (queda en historial).
- **Entregar presupuesto** → imprime/comprobante, estado **PRESUPUESTADA**, historial.

### Comprobante

- **`/admin/orden/[numero]/comprobante`**: vista para imprimir / PDF del navegador con trabajos tildados y totales (`lib/money.ts`).

### Regla de negocio

El **operario nunca** recibe datos de precios ni rutas de presupuesto en server actions filtradas por rol.

---

## 10. Historial de la orden (chatter)

Modelo **`MensajeOrden`**: tipo SISTEMA o NOTA, cuerpo legible, metadata JSON opcional.

Eventos registrados (`lib/orden-historial.ts`):

- Orden creada (block, tipo ingreso).
- Cambios de **estado**.
- Notas de medición por pieza.
- Subida / eliminación de **foto o video**.
- Trabajos tildados, precios modificados, trabajos libres.
- Presupuesto entregado.

UI: componente **`OrdenHistorial`** en detalle admin.

---

## 11. Modelo de datos (tablas)

| Tabla | Rol en el sistema |
|-------|-------------------|
| User | Usuarios, rol, PIN |
| Cliente | Clientes del taller |
| Orden | Cabecera del trabajo |
| Pieza | Piezas incluidas en la orden |
| PiezaFichaItem | Ítem de ficha + check + nota + cantidad |
| Medicion | Nota/cantidad a nivel **pieza** |
| Archivo | URL foto/video + pieza + opcional ítem ficha |
| Trabajo | Línea de presupuesto |
| CatalogoTrabajo | Plantilla de trabajos y precios |
| MensajeOrden | Historial |

Migraciones en **`prisma/migrations/`**. Tras clonar: `npx prisma migrate deploy` + `npx prisma generate`.

---

## 12. Archivos y almacenamiento

- **`lib/storage.ts`**: guarda uploads en **`public/uploads/`** (local).
- En **Vercel** el filesystem no persiste: hay que migrar a **Vercel Blob** u otro (solo cambiar `saveFile()`).
- **`Archivo.url`**: ruta pública servida por Next.

Límite práctico: fotos desde cámara de tablet; videos soportados en API pero UI operario prioriza fotos.

---

## 13. Diseño de interfaz (tablet)

- Tokens en **`app/globals.css`**: tinta, fondo, acento, gris.
- Componentes táctiles: **`BigButton`** (~78px), **`CheckRow`**, **`Screen`**, **`Header`**, **`ActionBar`**.
- Objetivo UX: **pocas acciones por pantalla**, texto grande, contraste alto.
- Mock HTML/PDF para mostrar al cliente sin backend: **`mock/Rectificaciones-Paton-prototipo.html`**.

---

## 14. Desarrollo local — paso a paso

```bash
git clone https://github.com/thcluedev/ratificadorapaton.git
cd ratificadorapaton
cp .env.example .env
# Editar SESSION_SECRET y DATABASE_URL=file:./dev.db
npm install
npx prisma migrate deploy
npx prisma db seed    # usuarios + catálogo; limpia datos operativos según seed
npm run dev           # http://localhost:3000
```

### Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| 500 `routes-manifest.json` | `fuser -k 3000/tcp`, `rm -rf .next`, un solo `npm run dev` |
| Error columna Prisma | `npx prisma migrate deploy` |
| Tipos TS desactualizados | `npx prisma generate` |
| Puerto 3000 ocupado | `fuser -k 3000/tcp` |

---

## 15. Git y despliegue

- Rama: **`main`**.
- Push SSH (ejemplo WSL): `git@github.com-cluedev:thcluedev/ratificadorapaton.git` (ver `~/.ssh/config`).
- **Producción sugerida:** Vercel + Postgres (cambiar `provider` en `schema.prisma`), `DATABASE_URL`, Blob para archivos, `SESSION_SECRET` fuerte.

---

## 16. Estructura del código (dónde mirar)

```
app/actions/     → Lógica servidor (ordenes, mediciones, presupuestos, auth, historial)
app/admin/       → Pantallas administrador
app/operario/    → Pantallas operario
app/api/uploads/ → Subida multipart
components/      → UI reutilizable
lib/             → Auth, labels, ficha, historial, storage, prisma
prisma/          → Schema, migraciones, seed
mock/            → Prototipo estático cliente
docs/            → Esta documentación
```

---

## 17. Roadmap / pendientes conocidos

- Admin: vista rica de ficha operario (notas/cantidades por ítem).
- Persistencia de archivos en cloud para producción.
- Posible sync offline (hoy requiere red para guardar).
- Tests automatizados (hoy manual en tablet/desktop).
- i18n: textos en español rioplatense hardcodeados.

---

## 18. Glosario rápido

| Término | Significado |
|---------|-------------|
| Block | Bloque motor |
| Ficha Patón | Checklist de revisión por pieza (PDF taller) |
| Medición | Trabajo del operario sobre una orden |
| Tildar | Incluir un trabajo en el presupuesto |
| Orden | Unidad central del sistema (número único) |

---

*Rectificaciones Patón — guía funcional ampliada, 2026.*

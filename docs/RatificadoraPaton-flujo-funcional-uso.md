# Rectificaciones Patón — Manual de uso funcional (flujo completo)

Guía paso a paso para **Administrador** y **Operario**: qué tocar en la tablet, en qué orden, y qué pasa después. No requiere conocer programación.

Versión: 2026 · App web en tablet horizontal (1024×768 recomendado)

---

## 1. Para quién es este documento

| Lector | Use este manual para… |
|--------|------------------------|
| Administrador (Roberto / dueño) | Ingresar motores, seguir órdenes, armar presupuesto e imprimir para el cliente |
| Operario (Diego / taller) | Medir piezas, completar ficha Patón, notas, cantidades y fotos |
| Quien capacita al equipo | Recorrer el flujo de punta a punta en una orden de prueba |

Documento técnico complementario (código, base de datos): `RatificadoraPaton-que-hace-el-sistema.md` en la carpeta `docs/`.

---

## 2. Antes de empezar

### 2.1 Abrir la aplicación

1. En la tablet, abrir el navegador (Chrome recomendado).
2. Ir a la dirección del servidor (en desarrollo: `http://localhost:3000`; en producción: la URL que indique el instalador).
3. Mantener la tablet en **horizontal** para ver botones grandes y texto legible.

### 2.2 Usuarios de prueba (capacitación)

| Persona en pantalla | Rol | PIN |
|---------------------|-----|-----|
| Roberto Patón | Administrador | 1234 |
| Diego Fernández | Operario | 1234 |

En producción el PIN de cada usuario lo define el administrador del sistema (no compartirlo por WhatsApp).

### 2.3 Regla de oro

**Una orden = un motor (o conjunto de piezas) del cliente**, identificado por **número de block**, con todo lo que pasa después (medición, fotos, presupuesto) colgado de ese número.

---

## 3. Vista general del ciclo de vida

Recorrido típico desde que entra el motor hasta que el cliente se lleva el presupuesto impreso:

```
  ADMIN: Ingreso (cliente + block + piezas)
              |
              v
  Estado: PENDIENTE DE MEDICIÓN
              |
              v
  OPERARIO: Medición (ficha, notas, fotos)
              |
              |  (al guardar algo) --> EN MEDICIÓN
              |
              v
  OPERARIO: "Terminé de medir" (confirmación)
              |
              v
  Estado: MEDIDA · armar presupuesto
              |
              v
  ADMIN: Armar presupuesto (tildar trabajos, precios)
              |
              v
  ADMIN: Ver presupuesto --> Imprimir
              |
              v
  Estado: PRESUPUESTO ENTREGADO
```

**Quién hace qué**

| Etapa | Administrador | Operario |
|-------|---------------|----------|
| Alta de orden | Sí | No |
| Medición y fotos | No (solo ve resumen en detalle) | Sí |
| Precios y presupuesto | Sí | No ve precios |
| Imprimir comprobante | Sí | No |

El operario **no puede** volver atrás una orden ya marcada como **Medida** desde su pantalla. El administrador **no puede** medir en la pantalla del operario (rutas separadas por rol).

---

## 4. Inicio de sesión (todos los roles)

Pantalla inicial: **Rectificaciones Patón**

### Paso 1 — Elegir rol

- Tocar **Administrador** → ingresos y presupuestos.
- Tocar **Operario** → medición y fotos.

Si ya tenés sesión abierta, el sistema te manda directo al inicio de tu rol.

### Paso 2 — Elegir persona

Aparecen solo los usuarios activos de ese rol (tarjetas con nombre).

### Paso 3 — PIN de 4 dígitos

- Usar el **teclado numérico en pantalla** (pensado para dedos).
- Al completar 4 dígitos, el ingreso es automático.
- Si el PIN es incorrecto, se borra y muestra error; volver a intentar.

### Paso 4 — Salir

En la esquina superior (Administrador u Operario): botón **Salir** → vuelve al login.

---

## 5. Flujo completo — Administrador

### 5.1 Pantalla principal (`/admin`)

Tres accesos grandes:

| Botón | Para qué |
|-------|----------|
| **Ingresos** | Crear una orden nueva |
| **Órdenes en proceso** | Ver órdenes no entregadas y abrir detalle |
| **Presupuestos** | Ver órdenes que ya tienen presupuesto generado |

Contadores orientativos: cuántas abiertas, cuántas ya medidas, cuántos presupuestos generados.

---

### 5.2 Crear una orden — Escenario A: Motor completo

**Objetivo:** El cliente trae el motor desarmado o completo; el taller va a trabajar block, bielas, etc.

#### A1 — Tipo de ingreso

Ruta: **Ingresos** → pantalla con dos opciones:

- **Motor completo** → siguiente paso con checklist pre-marcado de piezas habituales.
- **Piezas sueltas** → checklist vacío (ver escenario B).

Tocar **Motor completo**.

#### A2 — Datos del ingreso

Completar en este orden (todos importantes):

1. **Nº de block (número de serie)** — obligatorio. Es la identificación del motor en el taller (ej. grabado en el block).
2. **¿Quién trae el motor?** — nombre; puede buscar cliente existente escribiendo (sugerencias) o cargar uno nuevo con teléfono.
3. **Marca y modelo del motor** — texto libre (ej. "Ford 221").

Botones:

- **Cancelar** → vuelve a elegir tipo.
- **Siguiente** → guarda borrador y va al checklist de piezas.

Si falta block, nombre/motor o block vacío, la app muestra error y no avanza.

#### A3 — Checklist de piezas

Pregunta: **¿Qué piezas trajo?**

- En motor completo, vienen **todas las piezas estándar ya tildadas**: Block, Bielas, Pistones, Cigüeñal, Tapa de cilindro, Árbol de levas, Volante, Varios.
- Desmarcar lo que **no** entró al taller.
- **+ Otra** → texto libre (ej. "Tapa de balancines") si hace falta una pieza fuera de la lista.

Arriba se repite: Block · cliente · motor (control visual).

Botones:

- **Atrás** → corregir datos.
- **Confirmar ingreso** → crea la orden en el sistema.

**Qué hace el sistema al confirmar (sin que el usuario vea código):**

- Asigna el **próximo número de orden** (correlativo).
- Guarda cliente, motor, block y piezas elegidas.
- Genera la **ficha Patón** (ítems de revisión) por cada pieza.
- Registra en el **historial** quién creó la orden.
- Muestra pantalla **Orden creada** con link al detalle.

#### A4 — Orden creada

Muestra número de orden y estado **Pendiente de medición**.

- Ir al **detalle** o volver al inicio.
- Desde acá el **operario** ya debería ver la orden en **Pendientes de medir**.

---

### 5.3 Crear una orden — Escenario B: Solo piezas sueltas

Igual que A, pero en A1 elegir **Piezas sueltas**.

- En A3 el checklist **empieza vacío**: marcar **solo** lo que el cliente dejó (ej. solo Cigüeñal + Bielas).
- Block y número de block siguen siendo obligatorios en A2 (identifican el motor de referencia aunque no entre el block físico).

Resto idéntico: confirmar → orden pendiente de medición.

---

### 5.4 Seguir órdenes en proceso

Ruta: **Órdenes en proceso**

Lista de órdenes **que no están en estado Entregada** (hoy el cierre operativo habitual es **Presupuesto entregado**).

Al tocar una fila:

| Estado en lista | Al tocar abre… |
|-----------------|----------------|
| Pendiente / En medición | **Detalle** de la orden |
| Medida · armar presupuesto | **Armar presupuesto** directo |
| Presupuesto entregado | **Comprobante** (imprimible) |

#### Detalle de orden

Información visible:

- Cliente, teléfono, nº block, motor, fecha de ingreso.
- Lista de piezas incluidas.
- Cantidad de fotos/videos subidos (total).
- **Historial** (línea de tiempo): creación, cambios de estado, fotos, trabajos tildados, etc.

Botones:

- **Volver** → listado.
- **Armar presupuesto** → solo si la orden ya está **Medida** (o ver presupuesto si ya fue entregado).

**Nota de uso:** El detalle admin resume material e historial; el detalle fino de ficha (cada ítem tildado, nota por aro, etc.) hoy se ve completo en la pantalla del **operario**. Al presupuestar, el admin ve **fotos y notas agrupadas por categoría** en la columna lateral del presupuesto.

---

### 5.5 Armar presupuesto (orden ya medida)

Ruta típica: **Órdenes en proceso** → orden **Medida** → **Armar presupuesto**  
(o desde detalle → **Armar presupuesto**)

Pantalla: **Presupuesto · Orden N**

#### Layout

- **Izquierda:** pestañas por categoría de trabajo — Block, Cigüeñal, Árbol de levas, Tapa de cilindro, Varios.
- **Debajo de pestañas:** miniaturas de **fotos** que el operario sacó para piezas de esa categoría, y **notas** de medición resumidas.
- **Centro/derecha:** lista de **trabajos del catálogo** (descripción + precio sugerido) y trabajos **libres** ya agregados.

#### Acciones del administrador

| Acción | Cómo |
|--------|------|
| Incluir trabajo del catálogo | Tildar la fila → se agrega a la orden con precio sugerido |
| Quitar del presupuesto | Destildar |
| Cambiar precio | Editar monto en la fila (queda tildado e impacta el total) |
| Agregar trabajo no listado | Botón agregar → descripción + precio (**trabajo libre**) |
| Ver total | **Total parcial** abajo a la izquierda |
| Pasar a imprimir | **Ver presupuesto** (abre comprobante) |

Los trabajos se agrupan por categoría; Bielas, Pistones, Volante, etc. del ingreso se presupuestan bajo **Varios** según reglas del sistema.

#### Reglas útiles

- Solo tiene sentido presupuestar cuando el operario marcó **Terminé de medir** (estado **Medida**).
- El operario **nunca** ve esta pantalla ni los precios.

---

### 5.6 Entregar presupuesto al cliente (imprimir)

Ruta: **Ver presupuesto** desde la pantalla de presupuesto, o listado de **Presupuestos**.

Pantalla: **Presupuesto · Orden N** (vista comprobante)

Contenido para el cliente:

- Encabezado Rectificaciones Patón, orden, cliente, motor, fecha.
- Trabajos **tildados** agrupados por categoría con precio cada uno.
- **Total** al pie.

Botones:

- **Volver** / **Editar** → regresa a armar presupuesto (si aún no se entregó, o para corregir si ya se entregó).
- **Imprimir** → acción importante:
  1. Marca la orden como **Presupuesto entregado** (si no lo estaba).
  2. Abre el diálogo de impresión del navegador (PDF o impresora).

Después de imprimir, la orden aparece en **Presupuestos** y ya **no** acepta más medición ni fotos del operario.

**Estado Entregada:** existe en el sistema para cierre futuro; hoy el flujo diario termina en **Presupuesto entregado** tras **Imprimir**.

---

## 6. Flujo completo — Operario

### 6.1 Pantalla principal

Ruta: `/operario` — título **Pendientes de medir**

Lista solo órdenes en:

- **Pendiente de medición**, o
- **En medición**

Cada fila muestra: número implícito al entrar, **Block N · marca modelo**, y conteo **X fotos · Y videos**.

Tocar una fila → pantalla de **medición** de esa orden.

---

### 6.2 Pantalla de medición — estructura

Una **sección por cada pieza** que el administrador incluyó en el ingreso (ej. Block, Cigüeñal…).

Por pieza, de arriba hacia abajo:

1. **Encabezado oscuro** con nombre de la pieza y cantidad de fotos de esa pieza.
2. **Cantidad y notas a nivel pieza** (toda la pieza en general):
   - Campo **Cantidad** (texto libre: "4", "1 juego", "STD", etc.).
   - Campo **Nota** (observaciones generales de esa pieza).
3. **Ficha · ítems a revisar** (checklist Patón):
   - Lista de ítems según tipo de pieza (ver sección 7).
   - Por ítem: casilla **revisado**, botón **cámara**, desplegable **Ver nota y cantidad** (nota y cantidad solo de ese ítem).
   - Miniaturas de fotos **de ese ítem** debajo.

**Autoguardado:** al escribir o tildar, los cambios se guardan solos (espera breve ~medio segundo). No hace falta un botón "Guardar" por campo.

**Al salir de la pantalla** también se intenta guardar lo pendiente.

---

### 6.3 Medición paso a paso (recomendado)

Para cada pieza de la orden:

1. Leer qué pieza es (encabezado).
2. Si aplica anotación global → completar **Cantidad** y **Nota** de la pieza.
3. Abrir **Ficha · ítems a revisar**.
4. Por cada ítem que inspeccionaste:
   - Tildar **revisado** cuando lo hayas visto/medido.
   - Si hace falta detalle → **Ver nota y cantidad** → escribir (ej. aros: "3º", "STD", "faltante").
   - Si hace falta evidencia → **Cámara** (solo cámara, no galería) → sacar foto → aparece miniatura bajo el ítem.
5. Repetir para la siguiente pieza hacia abajo (scroll).

**Fotos:**

- Una foto queda ligada al **ítem de ficha** donde tocaste cámara (y a la pieza correspondiente).
- Tocar miniatura → visor grande → **Cerrar** o **Borrar** (borrar queda en historial).

**Videos:** la infraestructura los admite; la interfaz del operario está orientada a **fotos**.

---

### 6.4 Cambios de estado desde operario

| Situación | Estado en sistema |
|-----------|-------------------|
| Orden recién creada, operario aún no tocó nada | Pendiente de medición |
| Primera nota, cantidad, ítem tildado o foto subida | **En medición** |
| Operario confirma fin | **Medida · armar presupuesto** |

---

### 6.5 Terminar la medición (paso crítico)

Botón fijo abajo: **Terminé de medir**

1. Tocar **Terminé de medir**.
2. Diálogo: **¿Terminaste de medir?** — explica que el administrador podrá presupuestar y que **no se deshace desde operario**.
3. Confirmar **Sí, terminé**.

Antes de cerrar, el sistema **guarda todas las notas/cantidades pendientes**. Si falla el guardado, no cambia el estado.

Tras confirmar:

- Vuelve a **Pendientes de medir** (la orden ya no aparece ahí).
- La orden aparece para el admin como **Medida**.

Si el operario vuelve a entrar por URL a una orden ya **Medida**, verá aviso de que ya está medida (sin editar).

**Órdenes con presupuesto ya entregado:** no permiten medición ni subir archivos.

---

## 7. Ficha Patón — qué revisa el operario por pieza

Lista generada automáticamente al crear la orden (referencia taller: PDF `PATON_FICHA PIEZAS MOTOR.pdf`).

### Block

Pernos · Camisas · Aros · Tapas · Bancadas c/ bulones · Espárragos · Block porta reten distribución · Porta reten bancada trasera · Guías

### Cigüeñal

Con chavetas · Sin chavetas · Contrapesos

### Bielas

Bielas · Coj. bancadas · Coj. bielas axiales · Bujetes

### Pistones

Pistones · Aros · Pernos · Tapas

### Árbol de levas

Con chaveta · Sin chaveta · Levas · Botadores · Eje comando · Engranaje comando · Engranaje distribución

### Tapa de cilindro

Guías varias · Válvulas · Resortes · Arandelas resortes · Seguro válvulas · Balancines · Torres balancines · Eje balancín · Tapa válvulas · Varillas levantaválvulas · Espárragos tapa cil.

### Volante

Volante · Placa embrague · Disco embrague · Polea / trinquete · Bulones antivibrador · Carcaza embrague

### Varios

Alternador · Bomba aceite · Bomba agua · Bomba combustible · Cadena distribución · Correa dentada · Carter · Filtros aceite / gasoil / nafta · Motor de arranque · Termostato · Ventilador

### Otra (pieza custom)

Revisar pieza (una fila; el nombre visible es el texto que puso el admin en ingreso)

**Buenas prácticas:** tildar ítem solo cuando lo revisaste; usar nota/cantidad en ítems críticos (aros, cojinetes, válvulas); foto cuando el desgaste o daño deba verse en presupuesto.

---

## 8. Tabla de estados (lenguaje de la app)

| Lo que leés en pantalla | Significado para el taller |
|-------------------------|----------------------------|
| Pendiente de medición | Orden creada; operario no empezó o no hay datos guardados aún |
| En medición | Hay trabajo parcial (notas, ficha o fotos) |
| Medida · armar presupuesto | Operario dio por cerrada la medición; admin debe presupuestar |
| Presupuesto entregado | Se imprimió / entregó presupuesto al cliente |
| Entregada | Reservado para cierre administrativo futuro |

---

## 9. Historial — qué queda registrado

En **Detalle de orden** (admin), bloque **Historial**:

- Orden creada (block, tipo motor completo o piezas).
- Cambios de estado (quién y cuándo).
- Notas de medición por pieza (resumen).
- Fotos/videos subidos o borrados.
- Trabajos tildados, precios modificados, trabajos libres.
- Presupuesto entregado.

Sirve para auditoría interna: "¿quién subió esta foto?" / "¿cuándo pasó a medida?".

---

## 10. Ejemplo narrativo — día tipo (motor completo)

1. **09:00 — Admin (Roberto)**  
   Ingresos → Motor completo → Block `887766` · Cliente "Taller Sur" · Motor "Chevrolet 250" → Confirmar con todas las piezas → **Orden 42 creada**.

2. **09:15 — Operario (Diego)**  
   Pendientes de medir → Orden 42 → Block: revisa ítems (aros, camisas…), anota cantidades, fotos de tapa bancada → estado **En medición**.

3. **11:00 — Diego**  
   Termina Cigüeñal y Varios → **Terminé de medir** → Orden 42 **Medida**.

4. **11:30 — Roberto**  
   Órdenes en proceso → Orden 42 → Armar presupuesto → pestaña Block: tilda trabajos del catálogo, ajusta un precio → pestaña Varios: agrega trabajo libre "Rectificar bomba" → **Ver presupuesto** → **Imprimir** → entrega papel al cliente → **Presupuesto entregado**.

5. **Diego**  
   Ya no ve la orden 42 en pendientes; no puede agregar fotos.

---

## 11. Errores frecuentes y qué hacer

| Problema | Qué hacer |
|----------|-----------|
| No aparece la orden en operario | Verificar que admin confirmó ingreso; estado debe ser Pendiente o En medición |
| No deja guardar fotos | Orden ya **Presupuesto entregado**; o sesión operario expirada → Salir y entrar de nuevo |
| No puedo presupuestar | Operario debe tocar **Terminé de medir** (estado **Medida**) |
| PIN incorrecto | Reintentar; capacitación usa 1234 |
| Pantalla en blanco / error servidor | Avisar a quien mantiene el servidor (reinicio app, migraciones BD) |
| Impresión cortada | En diálogo de impresión del navegador, elegir "Guardar como PDF" o ajustar márgenes |

---

## 12. Checklist rápido por rol

### Administrador — nueva orden

- [ ] Ingresos → tipo correcto (completo / sueltas)
- [ ] Block y motor cargados
- [ ] Piezas tildadas = lo que físicamente entró
- [ ] Confirmar ingreso y comunicar número de orden al operario si hace falta

### Operario — medición

- [ ] Entrar como Operario
- [ ] Abrir orden correcta (block + motor)
- [ ] Por pieza: nota/cantidad general si aplica
- [ ] Ficha: tildar, detallar y fotografiar ítems importantes
- [ ] **Terminé de medir** solo cuando todo esté revisado

### Administrador — cierre comercial

- [ ] Orden en estado **Medida**
- [ ] Revisar fotos/notas en lateral del presupuesto
- [ ] Tildar trabajos y total coherente
- [ ] Imprimir / PDF al cliente
- [ ] Verificar estado **Presupuesto entregado**

---

## 13. Glosario

| Término | Significado |
|---------|-------------|
| Block | Bloque motor; número de serie identifica el motor |
| Ficha Patón | Checklist de ítems a revisar por pieza |
| Tildar (presupuesto) | Incluir un trabajo en el total a cobrar |
| Orden | Número único del trabajo en el taller |
| Catálogo | Lista de trabajos habituales con precio sugerido |
| Trabajo libre | Línea de presupuesto escrita a mano con precio |

---

*Rectificaciones Patón — Manual de uso funcional. Para soporte técnico del software, ver repositorio GitHub thcluedev/ratificadorapaton y documentación en `docs/`.*

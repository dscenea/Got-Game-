# Auditoría de interfaz y componentes — 22 octubre 2026

## Alcance
Revisión estática de la aplicación y primera consolidación no invasiva. No sustituye pruebas visuales en Safari, escritorio o pruebas de interacción.

## Cambios aplicados
- `assets/shared-headings.css`: estilos reutilizables de cabeceras y flechas de volver.
- `assets/shared-ui.js`: utilidades `window.ggSharedUI.syncNav(section)` y `normalize()` para mantener `active` y `aria-current` en la navegación y marcar cabeceras comunes sin sustituir los manejadores de cada sección.
- Se conservan los manejadores originales de navegación y las vistas existentes; no se alteran los datos de los clubes.

## Hallazgos por sección
| Sección | Hallazgo | Validación pendiente |
|---|---|---|
| Equipos | Coexisten vistas heredadas y componentes nuevos. | Entrada, retorno, plantillas, filtro por deporte y horario. |
| Instalaciones | Comparte el repositorio de horarios, pero hay formularios y vistas diferenciadas. | Pistas, edición, conflictos, sincronización con equipos. |
| Calendario | Extraído a módulo; encabezado y selección de pestaña se gestionan aparte. | Navegación, colores por club, recurrencias y cambios de horario. |
| Personas | Varias rutas y perfiles dentro del espacio de trabajo. | Regreso al listado, filtros y permisos. |
| Comunidad | Tarjetas con buzón de demostración; navegación propia. | Cinco tarjetas, retorno, mensajes y visibilidad por rol. |

## Riesgos
1. `index.html` contiene numerosos bloques de JS y CSS heredados: alto riesgo de efectos colaterales si se reescriben rutas globales.
2. Varios componentes aplican estilos de cabecera con distinta especificidad. Mantener cambios acotados hasta completar pruebas visuales.
3. Los datos de demostración persisten localmente: no asumir sincronización entre cuentas o dispositivos.

## Matriz de aceptación
- **Logrobasket** (un deporte): Inicio → Equipos → ficha → Volver; Inicio → Instalaciones → Volver; Calendario → Volver; Personas → Volver; Comunidad → Buzón → Volver.
- **Ebro Norte** (dos deportes): repetir recorridos en Baloncesto, Fútbol y vista general; comprobar que no se mezclan equipos.
- **Móvil**: cabeceras alineadas, sin duplicar flechas, pestaña activa correcta, ningún botón tapado por barra inferior.
- **Escritorio**: navegación lateral, retorno y espacios de contenido coherentes.
- **Datos**: horarios recurrentes, instalaciones y eventos manuales preservados.

## Próximo trabajo
Realizar pruebas de navegación en navegador real, documentar incidencias concretas y migrar un único renderizador por módulo. Evitar refactorizaciones masivas hasta tener cobertura de pruebas.

## Segunda pasada: cabeceras dinámicas y navegación (22 octubre)

**Hallazgo confirmado por código:** la utilidad `shared-ui.js` normalizaba cabeceras únicamente en `DOMContentLoaded`, pero Equipos, Instalaciones, Personas, Comunidad y Calendario construyen vistas dinámicamente. Esto dejaba cabeceras posteriores sin las clases compartidas.

**Corrección:** `shared-ui.js` ahora observa únicamente nodos añadidos al contenedor `#dashboard`, agrupa las actualizaciones en una microtarea y vuelve a aplicar las clases de cabecera. No intercepta rutas ni modifica los datos. Se ha comprobado la sintaxis del módulo y de los scripts integrados.

**Revisión del calendario:** los días ahora tienen elementos independientes para número e indicador de actividad, con alturas fijas para evitar saltos de alineación en móvil.

**Pendiente de verificar visualmente:** al abrir cada vista, la flecha se alinea con el título, la pestaña inferior seleccionada corresponde a la vista y los retornos mantienen el contexto deportivo. Las capturas y pruebas reales siguen siendo necesarias.

**Precaución:** no se han eliminado renderizadores heredados de Equipos o Instalaciones porque no hay cobertura suficiente para garantizar que el cambio no afecte a los dos clubes de prueba.

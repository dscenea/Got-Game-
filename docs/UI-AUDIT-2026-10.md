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

## Equipos e instalaciones — revisión de arquitectura

- **Datos:** `GGTeamStore` mantiene el catálogo de equipos; `GGScheduleStore` conserva las actividades y conflictos; las instalaciones y pistas se guardan dentro de la configuración del club. Estos son tres ámbitos distintos, pero vinculados mediante ID de equipo, nombre de instalación e ID de pista.
- **Reutilización implementada:** `assets/club-selectors.js` introduce selectores puros para localizar equipo, instalación, pista, deporte y actividades por instalación. El adaptador del calendario, la descripción de pista y la ocupación semanal de instalaciones ya consultan esas funciones compartidas.
- **Riesgo de identidad:** las instalaciones se vinculan por nombre, no por ID estable. Renombrar una instalación podría desvincular eventos anteriores; **no** cambiar este modelo sin migración de datos.
- **Riesgo de almacenamiento:** los equipos y horarios utilizan repositorios propios, pero las instalaciones siguen persistiendo en la configuración del club. No fusionar estos almacenes de forma improvisada.
- **Pruebas pendientes:** comprobar que la ficha de Alevín A muestra los mismos horarios que Lobete y Calendario; repetir para fútbol en Ebro Norte; modificar una actividad, comprobar la pista y el calendario; verificar avisos de conflicto.
- **Siguiente refactor:** separar el editor de horarios y los componentes de instalaciones del HTML principal, conservando sus APIs públicas y añadiendo pruebas automatizadas de identidad y conflictos.

## Extracción del editor de horarios
- Editor y manejadores `ggAddEvent`, `ggEditScheduleEvent` y `ggSaveEvent` trasladados a `assets/schedule-editor.js` mediante inyección explícita de dependencias del espacio de coordinación. Se mantienen los nombres de las funciones públicas y el almacenamiento existente.
- La carga del módulo se realiza antes de la inicialización del espacio de coordinación.
- Pruebas repetibles en `tests/architecture-smoke.js`: separación de deportes, resolución de pista y equipo, consulta compartida de horarios y conflictos de ocupación.
- Pruebas ejecutadas de forma aislada sobre los módulos reales: cuatro equipos de dos deportes, asociación de pista y detección de solapamiento correctas. Falta ejecutar los recorridos completos en Safari.

## Tercera fase: extracción de vistas de Equipos e Instalaciones
- `assets/teams-view.js`: renderizador del listado de equipos extraído con dependencias explícitas. Se conserva `renderTeams()` en el espacio de coordinación y las acciones de plantilla, edición y filtros.
- `assets/facilities-view.js`: detalle de instalación, gestión de pistas y ocupación semanal extraídos. Se conserva la API pública `window.ggOpenFacility(name,onReturn)`.
- Se conservan `GGTeamStore`, `GGScheduleStore`, la configuración actual de instalaciones y los IDs existentes.
- Los tres módulos `teams-view.js`, `facilities-view.js` y `schedule-editor.js` superan análisis sintáctico. **Pendiente**: validar funcionalmente en navegador los diálogos, navegación, formularios y cambios de horario en ambos clubes.
- La extracción no elimina todavía las demás generaciones heredadas de vistas del archivo principal. No hacerlo hasta identificar cuáles están activas en cada ruta.

## Horario integrado en la ficha del equipo — 22 octubre
- Se reutiliza `gg-inline-schedule`, ahora después de la plantilla. No hay un segundo horario ni otro almacén.
- `renderInlineSchedule()` muestra siete días con fechas, inicio/fin, duración, tipo y recurrencia. Permite cambiar de semana y añadir en una fecha concreta con el editor compartido.
- Las acciones usan manejadores con acceso al contexto del equipo; se elimina la referencia a `selectedTeam` desde atributos HTML, donde no estaba disponible por estar dentro de una clausura.
- Las acciones de edición y alta se muestran únicamente cuando `canManageSchedule()` lo permite. El editor conserva su comprobación de permisos.
- Diseño adaptable con colores del club: siete columnas en pantallas grandes, cuatro en tamaños intermedios y dos o una en móvil.
- Validación ejecutada: 46 pruebas Node, 7 comprobaciones de arquitectura y sintaxis de los 27 scripts integrados. La separación por deportes y el repositorio compartido conservan las pruebas existentes.
- `tests/inline-schedule.browser.cjs` prepara la integración del componente real y el editor en Chromium, con clubes de uno/dos deportes y anchos de 375/1440 px. **No ejecutada con éxito en este entorno**: falta Chromium y la descarga no proporciona un archivo válido. No se ha probado Safari ni el recorrido completo de los clubes en un navegador real.
- Los cambios siguen guardándose en este navegador; no implican sincronización entre dispositivos o cuentas.

## Perfil de entrenador — primer recorrido completo
- `assets/coach-view.js` incorpora un espacio propio con Inicio, Mis equipos y Mi agenda. Cabeceras fuera del panel blanco, colores del perfil/club, navegación lateral en escritorio e inferior en móvil.
- Acceso explícito desde «Acceso rápido · Entrenador/a». Se elige Logrobasket o Ebro Norte y un entrenador del directorio. La acción «Asignar equipos de ejemplo sin entrenador» solo rellena asignaciones vacías de equipos demo; no sustituye asignaciones existentes. Las configuraciones demo se comparten en `assets/demo-clubs.js`.
- `assets/coach-access.js` comprueba en cada consulta/escritura club, identidad del directorio, deporte y asignación exacta del equipo. Sus proyecciones de plantilla excluyen documentos, fechas de nacimiento, responsables, teléfonos e información médica. Las rutas de coordinación quedan bloqueadas en la vista de entrenador.
- Se reutilizan el calendario canónico, la expansión de recurrencias y el almacén de plantillas existentes mediante un adaptador mínimo. El entrenador consulta horarios y pistas; su edición se conserva para coordinación.
- Asistencia por actividad y fecha (`tipo:fecha:id`), confirmación conjunta y estados Asiste/Ausencia/Justificada/Sin registrar. En entrenamientos se propone Asiste, conservando excepciones ya registradas; no se persiste hasta guardar. Los partidos no confunden asistencia real con disponibilidad familiar.
- Coordinación consulta los mismos registros. Se conservan las asistencias antiguas por día y se evitan recuentos duplicados al introducir registros por sesión. Los errores de almacenamiento revierten los cambios en memoria. Se comprueban de nuevo actividad y asignación al guardar.
- Es una demo local, sin autenticación real, permisos de servidor ni sincronización entre dispositivos. No usar con datos reales de menores. El alta de cuentas sigue pendiente de aprobación; la demo no convierte códigos de invitación en accesos reales.
- Siguiente fase de entrenador: integrar material y comunicaciones con identidad autorizada, y después autenticación/servicio de datos. No se incluyen botones de funciones aún sin conectar.
- Validación: 54 pruebas Node correctas y análisis sintáctico de los 27 scripts integrados y los módulos nuevos. Integración DOM del código real de la vista y del adaptador: elección de entrenador, preparación explícita de equipos, plantilla, siete días, guardado de asistencia, vuelta y salida en Logrobasket; aislamiento de fútbol frente a baloncesto en Ebro Norte. Se reutiliza también la restauración de instalaciones, pistas y colores guardados por coordinación.
- La comprobación visual en navegador de esta entrega queda pendiente mientras GitHub Pages mantiene sus despliegues en cola. No se ha probado Safari ni un dispositivo móvil real.

## Biblioteca de ejercicios y preparación de entrenamientos
- Nuevos módulos `training-store.js`, `training-ui.js`, `training.css` y `tactical-board.js`. Acceso desde Ejercicios en el perfil de entrenador y Preparar sesión en las actividades de entrenamiento.
- Biblioteca privada por autor y club, etiquetas libres, deporte y uno o varios momentos: calentamiento, parte principal y vuelta a la calma. Búsqueda, duplicado privado, archivo recuperable y opción explícita de compartir con técnicos del mismo club/deporte, dentro de la demo local.
- Cada ocurrencia de entrenamiento tiene su propia sesión y revisión. Admite varios ejercicios por bloque, orden, traslado entre bloques, duplicado, objetivos, notas posteriores y suma de minutos frente al horario reservado. No cambia el calendario.
- Los ejercicios añadidos son copias profundas con identificador de instancia: modificar una copia no modifica la biblioteca, otra instancia ni otra fecha. Guardar una copia en biblioteca es una acción separada. Las revisiones evitan sobrescribir cambios de otras vistas; los errores de almacenamiento no se presentan como guardados.
- Pizarra SVG editable para fútbol, baloncesto y voleibol: superficie completa/media/libre; ataque/defensa distinguibles también por forma; entrenador, balones del deporte, conos, aros, porterías, textos, zonas y cuatro trazados. Colocación por toque, arrastre, selección y desplazamiento con teclado, duplicado, giro de iconos, deshacer/rehacer y descarga PNG. Los demás deportes usan superficie libre hasta añadir sus plantillas específicas.
- Impresión de la sesión con dibujos y texto mediante Imprimir / PDF. No se incorporan bibliotecas de ejercicios de terceros ni imágenes de menores. Animaciones, 3D, edición simultánea y sincronización entre cuentas quedan fuera de esta primera entrega.
- Validación previa a publicación: 66 pruebas Node correctas; integración DOM de biblioteca, formulario, dos elementos de pizarra, dos copias en sesión, edición/traslado/guardado y recarga conservando el original. Sintaxis de módulos y scripts integrados correcta. Pendiente la comprobación visual tras el despliegue; Safari y móvil real no probados.

## Identidad del entrenador y clubes de un solo deporte
- Cabecera persistente con escudo y nombre del club; bienvenida con escudo de mayor tamaño, sin recortes ni recuadro blanco añadido. Se respeta la imagen configurada por coordinación; hay recursos de respaldo para Logrobasket y Ebro Norte, y un identificador por iniciales si una imagen falla.
- El logo original blanco de got GAME! se conserva en la navegación lateral y aparece también sobre una franja oscura de cabecera en móvil. Se eliminan filtros innecesarios y se fijan proporciones con `object-fit: contain`.
- Se elimina la etiqueta superior de deporte en clubes con un único deporte. En clubes multideporte se mantiene el contexto de los equipos autorizados del entrenador.
- Se actualizan las versiones de los recursos de entrenador para que los navegadores soliciten la entrega nueva una vez que Pages publique el índice.
- Publicación verificada en Chrome: la página pública carga `coach-view.js?v=3`, muestra Ejercicios y Preparar sesión, y carga correctamente los escudos de ambos clubes. En Logrobasket no aparece el contexto de deporte redundante; Carlos en Ebro Norte conserva Fútbol y solo recibe sus dos equipos de fútbol.
- Recorrido real verificado en Chrome: crear ejercicio con etiquetas y descripción, abrir pizarra, añadir atacante y pase, incorporar el dibujo, guardar en biblioteca, añadir una copia a la parte principal, duplicarla y guardar la sesión de dos ejercicios (20 minutos). Se corrige también el valor inicial del selector de herramienta para que coincida con el modo de selección activo.
- Revisión visual de escritorio realizada. El diseño incluye cabecera de marca en móvil, pero no se ha probado un dispositivo móvil real ni Safari. La descarga PNG y la impresión no se han verificado con sus diálogos nativos.

## Pizarra y asistencia directa del entrenador
- Trazados editables (desplazamiento, pase, tiro y bote): extremos y puntos intermedios accesibles al seleccionarlos. Al alargar aparecen controles adicionales, hasta 24; se puede elegir Curvo o Zigzag y restablecer. Coordenadas, curvas, puntos, traslado completo, duplicado y deshacer se conservan al guardar, copiar a biblioteca o preparar otra sesión. Exportaciones y miniaturas no incluyen los controles de edición.
- Lápiz a mano alzada con color y tres grosores. El borrador elimina trazos completos de lápiz, conservando los símbolos y trazados tácticos. Cada gesto admite deshacer/rehacer; cancelar restaura el estado anterior.
- Cabecera de entrenador: el foco del título ya no desplaza la página por debajo del escudo y de Volver. La navegación enfoca con `preventScroll` antes de restablecer el inicio, respeta el área segura superior y organiza Preparar sesión y la etiqueta en una fila adaptable. Los campos móviles usan al menos 16 px para evitar el zoom automático al editar.
- Preparación: bloc de notas libre (20.000 caracteres) independiente de objetivos, notas posteriores y los tres bloques. Hasta 8 fotos JPG/PNG/WEBP o PDF de 8 MB por sesión; bytes privados en IndexedDB y referencias en el plan. Solo el entrenador y la ocurrencia autorizados pueden leerlos. Los archivos retirados se limpian después de guardar correctamente la sesión; los errores se muestran sin fingir un guardado.
- Lectura opcional de fotos mediante Tesseract.js 6.0.1 en el dispositivo, con descarga del motor desde jsDelivr al pedirlo. Texto impreso en español; manuscritos poco fiables según la documentación de Tesseract. Revisión y edición antes de añadir al bloc, sin reparto automático entre fases. Los PDF se adjuntan/descargan, no se transcriben en esta entrega. Los adjuntos siguen siendo locales y no se sincronizan entre dispositivos.
- Validación previa a publicación: 71 pruebas Node de datos/permisos/geometría y 11 integraciones DOM/IndexedDB: extremos, curvas, controles crecientes, zigzag, guardado de formas, lápiz, borrador, límites, aislamiento de adjuntos, sesión con bloc/archivo/texto OCR revisado, y cancelación del lector con motor simulado. Pendiente verificar el motor real y el recorrido visual después del despliegue; Safari y móvil físico no probados.
- Arrastre directo de elementos existentes incluso con una herramienta de dibujo activa, suprimiendo el click posterior para que no cree duplicados. La captura del puntero permite soltar fuera del icono; cancelar o perder la captura restaura la posición anterior.
- Papelera superpuesta en la esquina de la cancha únicamente durante el arrastre, con indicación al entrar y borrado al soltar. No desplaza el contenido y queda anclada a la vista aunque la pizarra esté ampliada. Deshacer recupera el objeto y su posición; el botón Eliminar seleccionado sigue disponible para teclado.
- Entrenador representado siempre por un círculo con E, tanto en elementos nuevos como en pizarras antiguas con etiqueta numérica. Se conserva la numeración de jugadores.
- Se añade regresión DOM para arrastre en modo dibujo seguido de click sin duplicado, papelera, recuperación, cancelación y entrenador E. 66 pruebas de datos y 3 de integración DOM correctas; comprobación en Chrome pendiente de publicación. Safari y móvil físico no probados.
- Se corrige la colocación sobre la cancha: `pointerup` solo redibuja cuando finaliza una selección o arrastre. Las herramientas de dibujo conservan el nodo SVG pulsado hasta recibir `click`, también en la secuencia de eventos de un toque.
- Asistencia con tres botones visibles por jugador: Asiste, Ausencia y Justificada. La elección es exclusiva, lleva una marca de verificación y usa el color principal del club con su texto de contraste. En pantallas estrechas las tres opciones quedan debajo del nombre, con áreas táctiles de al menos 44 px.
- Se conserva Marcar todos, el guardado explícito y el contrato de datos compartido con coordinación. Borrar marca recupera Sin registrar; los partidos sin registrar no se convierten en asistentes y una marca pendiente guardada no se sobrescribe al reabrir.
- Validación: 66 pruebas de datos y permisos, más dos integraciones DOM (`GG_DOM_MODULE=/ruta/a/linkedom node --test tests/coach-ui.dom.cjs`) para la secuencia pointerdown/pointerup/click, coordenadas, flechas, arrastre, deshacer/rehacer, selección exclusiva, borrado, marcado masivo y payload guardado. Sin prueba de Safari ni dispositivo móvil físico.

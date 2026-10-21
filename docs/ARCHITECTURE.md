# Arquitectura de got GAME!

## Objetivo
Evolucionar el prototipo actual hacia módulos mantenibles sin alterar el funcionamiento de Logrobasket ni Ebro Norte. Migración incremental, nunca sustitución total del HTML en un único cambio.

## Estado actual
- `index.html`: aplicación principal y múltiples generaciones de vistas; todavía contiene código heredado y estilos embebidos.
- `assets/team-store.js`: almacenamiento y datos de equipos.
- `assets/schedule-store.js`: repositorio compartido de horarios y detección de conflictos. Actualmente usa localStorage.
- `assets/club-calendar.js` y `assets/club-calendar.css`: calendario y miniagenda, extraídos del HTML sin cambios funcionales.
- Módulos de instalaciones, Comunidad y perfiles: todavía mezclan scripts embebidos y archivos externos.

## Principios
1. **Una fuente de datos por entidad**: los entrenamientos y partidos deben leerse del repositorio compartido `GGScheduleStore`. No copiar eventos entre equipos, instalaciones y calendario.
2. **Club como ámbito obligatorio**: datos, equipos, instalaciones y permisos deben pertenecer a un club.
3. **Separación por capas**: `store` (datos), `service` (reglas de negocio), `ui` (pantallas) y `styles`.
4. **Contratos estables**: conservar APIs existentes mientras se migran consumidores; evitar reescribir `window.ggView` en múltiples lugares.
5. **Cambios pequeños y reversibles**: mover un módulo cada vez y validar Logrobasket, Ebro Norte, móvil y escritorio.
6. **Privacidad por diseño**: permisos para coordinadores, entrenadores y familias; no mensajes privados entre menores.

## Modelo de horario compartido
Un registro contiene: `id`, `club`, `team`, `place`, `spaceId`, `date`, `hour`, `duration`, `recurring`, `until`, `type`. La instalación y el equipo no mantienen copias divergentes del mismo horario: consultan el mismo ID. `GGScheduleStore.conflicts` es la base de validación de solapamientos.

## Próximos pasos
1. Verificar en Safari el calendario y la miniagenda tras su extracción.
2. Auditar el origen de los horarios de equipos, pistas e instalaciones y sus distintos formularios de edición.
3. Centralizar altas, modificaciones y bajas mediante `GGScheduleStore`, con validación de conflictos antes de guardar.
4. Mostrar el mismo registro en equipo, instalación, calendario y miniagenda, sin duplicaciones.
5. Añadir pruebas automatizadas para horarios semanales, cambios, borrados, recurrencias y conflictos.
6. Extraer progresivamente los módulos de Comunidad, equipos e instalaciones; consolidar un único enrutador y una única cabecera.
7. Diseñar la transición de localStorage a autenticación y backend con permisos por club.

## Limitaciones actuales
La extracción del calendario es estructural, no supone sincronización en tiempo real entre dispositivos. Las pruebas de sintaxis no sustituyen a las pruebas visuales ni de navegación.

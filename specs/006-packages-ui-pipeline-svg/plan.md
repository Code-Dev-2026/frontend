# Plan — FE-06 Pipeline de SVG

1. Centralizar los cuatro SVG de marca, retirando duplicados idénticos de ambas
   apps.
2. Añadir la condición `react-native`, las subrutas `svg/*` y las dependencias
   peer de `@camino/ui`.
3. Configurar Metro y las declaraciones TypeScript de SVG en cada app.
4. Añadir la configuración de SVGO, el validador, sus pruebas y la guía de
   exportación desde Figma.
5. Ejecutar el chequeo SVG, las pruebas del paquete y los typechecks de ambas
   apps.
6. Documentar como pendiente en tareas la visualización en emulador si el
   dispositivo no está disponible. No guardar capturas dentro de `specs/`.

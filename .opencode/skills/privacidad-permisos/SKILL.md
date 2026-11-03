---
name: Privacidad y permisos
description: Reglas de privacidad por rol, almacenamiento seguro, minimización de datos y protección de imágenes de menores (RNF-01, RNF-02, RNF-09).
---

# Privacidad y permisos

## Aislamiento por rol (RNF-02)

| Rol                                        | Ve                                                     | No ve                                |
| :----------------------------------------- | :----------------------------------------------------- | :----------------------------------- |
| `ACUDIENTE`                                | solo sus hijos y los adultos autorizados de esos hijos | otros menores, flota, cartera global |
| `MONITORA` / `CONDUCTOR`                   | estudiantes de su ruta y el viaje en curso             | datos de otras rutas, cartera        |
| `COORDINADORA_CONVIVENCIA` / `RECTORIA`    | custodia, alertas e incidentes del colegio             | cartera operativa                    |
| `GERENCIA_TRANSPORTE` / `JEFE_OPERACIONES` | flota, rutas y telemetría agregada                     | datos clínicos o financieros         |
| `ADMINISTRADOR_CARTERA`                    | cartera y pagos                                        | custodia, telemetría, imágenes       |

Regla: el cliente **oculta**; el servidor **autoriza**. Nunca se asume que ocultar en la UI es seguridad.

## Almacenamiento

- Prohibido `localStorage` y `sessionStorage` para tokens, credenciales o datos personales.
- Token en memoria o almacenamiento seguro del dispositivo (`expo-secure-store`, cookie `HttpOnly` en portal).
- Al cerrar sesión se limpian cachés, colas y estado en memoria.
- No se guardan imágenes de menores en el almacenamiento local ni en la caché del navegador.
- No se pone PII en la URL, en logs ni en mensajes de error.

## Imágenes y biometría (RNF-09)

- Sin descarga, captura de pantalla ni compartición externa.
- En Android: bloquear captura (`FLAG_SECURE` / `expo-screen-capture`).
- En iOS: **mitigar** (ocultar al perder foco, detectar captura); no se puede garantizar al 100 % (SRS A.7.5).
- El lenguaje de la UI y de la documentación debe decir "mitigado", no "imposible".

## Datos de prueba

- Ficticios, verosímiles y sin relación con personas reales.
- Sin correos, teléfonos, documentos ni direcciones reales.
- Las capturas de evidencia se generan con datos ficticios.

## Checklist

- [ ] ¿Cada consulta filtra por el rol y por el menor autorizado?
- [ ] ¿El token está fuera del almacenamiento web?
- [ ] ¿Los errores no revelan si un recurso existe?
- [ ] ¿Se registra el acceso a datos sensibles en auditoría?
- [ ] ¿La UI no cachea imágenes de menores?

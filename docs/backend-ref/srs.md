> ESPEJO DE SOLO LECTURA — no editar aquí.
> Fuente: `Code-Dev-2026/backend` → `docs/srs.md` @ `916e71b` (árbol de trabajo con cambios sin commit)
> SHA-256 del canónico: `d818c420acc58bde166d3965b76961c53e4d710b3219d7b09d1001154da4c373`
> Se actualiza en el mismo PR que cambie el documento canónico.

---

# ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## Sistema de Control Operativo y Seguridad para Rutas Escolares
### Proyecto "Camino Seguro"

**Colegio San Benito del Otún - Transportes Camino Seguro S.A.S. Pereira, Risaralda**

**Grupo: Los del Código 2026**
* Andrés Botina Valencia
* Camila Arteaga Castillo
* Jhonatan Muchavisoy
* Ana Milena Zúñiga

**2026**
**INSTITUCIÓN UNIVERSITARIA DEL PUTUMAYO - UNIPUTUMAYO**
Metodología de Desarrollo de Software - VI Semestre

---

## Contenido

1. Introducción y Alcance del Sistema
   1.1 Problemática que resuelve el sistema
   1.2 Alcance
2. Requisitos Funcionales (RF)
   2.1 Módulo 1: Gestión Unificada de Estudiantes y Rutas (Única Fuente de Verdad)
   2.2 Módulo 2: Custodia, Entregas y Protocolos de Seguridad
   2.3 Módulo 3: Monitoreo GPS, Telemetría y Mapa en Tiempo Real
   2.4 Módulo 4: Comunicación Institucional, Notificaciones Push y Alertas
   2.5 Módulo 5: Gestión Administrativa y Cartera
3. Requisitos No Funcionales (RNF) y Reglas de Negocio
   3.1 Reglas de Negocio Complementarias
4. Diagrama de Transición de Estados del Estudiante y Modelo Operativo
5. Especificación Detallada de Casos de Uso (RF-01 al RF-20)
6. Historias de Usuario con Criterios de Aceptación, Restricciones y Denegaciones
   6.1 Módulo 1: Gestión Unificada de Estudiantes y Rutas
   6.2 Módulo 2: Custodia, Entregas y Protocolos de Seguridad
   6.3 Módulo 3: Monitoreo GPS, Telemetría y Mapa en Tiempo Real
   6.4 Módulo 4: Comunicación Institucional, Notificaciones Push y Alertas
   6.5 Módulo 5: Gestión Administrativa y Cartera
7. Conclusiones de Adopción Operativa
8. Responsables y Control de Emisión del Documento
Anexo A. Arquitectura y Stack Tecnológico Propuesto

---

## 1. Introducción y Alcance del Sistema

El presente documento define formalmente la Especificación de Requerimientos de Software (SRS) para la plataforma tecnológica integral encargada de gobernar, automatizar y asegurar el transporte escolar del Colegio San Benito del Otún, operado en convenio con Transportes Camino Seguro S.A.S. El sistema mitiga los riesgos operacionales derivados de la asimetría de información, informalidad de canales y vulnerabilidades en la cadena de custodia de menores mediante un ecosistema digital robusto, centralizado y de alta disponibilidad.

### 1.1 Problemática que resuelve el sistema
La operación tradicional se encuentra fragmentada entre hojas de cálculo no sincronizadas del colegio, registros dispersos de la empresa transportadora, bitácoras en papel de las monitoras y grupos abiertos de WhatsApp. Dicho esquema introduce riesgos graves: (1) inconsistencias en cupos y matriculados, (2) entregas accidentales o conflictivas ante disputas legales familiares, (3) resistencia laboral del personal al rastreo continuo desde dispositivos móviles personales, (4) desinformación e histeria durante tramos de sombra celular (puntos ciegos como La Virginia), y (5) bloqueos ilegales del servicio en la puerta del vehículo por deudas de acudientes.

### 1.2 Alcance
La plataforma abarca: administración unificada de matrículas e itinerarios, diseño y trazado de rutas con paradas georreferenciadas, control de abordaje mediante carné institucional con código QR, verificación fotográfica de entrega en custodia, monitoreo GPS satelital vehicular con mapa en vivo diferencial según rol, canal institucional de notificaciones push automáticas transaccionales y desacoplamiento absoluto de la cobranza financiera. Quedan explícitamente fuera del alcance de esta versión la autenticación por hardware biométrico/RFID y la inmovilización remota del automotor por impago.

---

## 2. Requisitos Funcionales (RF)

A continuación se consolidan los requerimientos funcionales del sistema, integrando las nuevas especificaciones de gestión de rutas, mapa en tiempo real y notificaciones automáticas:

### 2.1 Módulo 1: Gestión Unificada de Estudiantes y Rutas (Única Fuente de Verdad)

| Código | Requerimiento | Descripción Técnica y Funcional | Prioridad |
|---|---|---|---|
| RF-01 | Centralización de Matrícula y Cupos | Permite la ingesta digital del registro oficial de matrícula del colegio y mapea los cupos asignados por la empresa, eliminando la duplicidad y contradicción entre planillas. | Alta/Crítica |
| RF-02 | Control de Asistencia Digital mediante QR | La app de la monitora registra el abordaje y descenso escaneando el QR del carné institucional del menor, validándolo contra la lista nominal autorizada. | Alta/Crítica |
| RF-03 | Validación de Capacidad Nominal | Impide el registro de abordaje si el vehículo alcanza su capacidad homologada legal, contabilizando tanto estudiantes regulares como ocasionales. | Alta/Crítica |
| RF-04 | Gestión de Pasajeros Ocasionales | Permite la postulación y aprobación previa de invitados sólo si existe vacante comprobable generada por una inasistencia formalmente registrada. | Media |
| RF-17 | Planificación y Trazado Dinámico de Rutas | Permite modelar trazados viales, georreferenciar paradas oficiales con coordenadas (lat/long), secuenciar el orden lógico de recorrido y vincular estudiantes por parada. | Alta/Crítica |
| RF-18 | Detección Automática de Desvíos de Ruta | Compara la telemetría en tiempo real del vehículo con la polilínea oficial; genera alertas automáticas a coordinación si el bus se desvía más de 300 metros sin justificación operativa. | Media |

### 2.2 Módulo 2: Custodia, Entregas y Protocolos de Seguridad

| Código | Requerimiento | Descripción Técnica y Funcional | Prioridad |
|---|---|---|---|
| RF-05 | Registro Fotográfico de Autorizados | Almacena de forma encriptada el expediente biométrico visual, cédula, nombres y parentesco de los adultos legalmente legitimados para recibir al menor. | Alta/Crítica |
| RF-06 | Verificación Digital de Desembarque | Exige validación visual de la monitora en la pantalla táctil antes de cambiar el estado del menor a "Entregado", ligando el evento al ID del adulto receptor. | Alta/Crítica |
| RF-07 | Alertas de Restricción Legal y Custodia | Despliega un modal rojo de advertencia crítica y bloqueante en la app si existen órdenes judiciales de alejamiento o prohibición expresa de retiro del menor. | Alta/Crítica |
| RF-08 | Novedades de Desembarque Fallido | Dispara el protocolo de contingencia si no se presenta un receptor legal: mantiene al estudiante en ruta, notifica al colegio y ejecuta retorno seguro a la sede escolar. | Alta/Crítica |

### 2.3 Módulo 3: Monitoreo GPS, Telemetría y Mapa en Tiempo Real

| Código | Requerimiento | Descripción Técnica y Funcional | Prioridad |
|---|---|---|---|
| RF-09 | Integración de Telemetría GPS Dedicada | Captura la posición geográfica exclusivamente desde dispositivos GPS fijos homologados de flota, garantizando inmunidad a teléfonos particulares de operarios. | Alta/Crítica |
| RF-10 | Sincronización Asíncrona (Puntos Ciegos) | Persiste eventos y marcas de tiempo en almacenamiento offline seguro al cruzar zonas de sombra (ej. La Virginia); sincroniza automáticamente por cola HTTP al retomar red. | Alta/Crítica |
| RF-11 | Cercas Virtuales y Estimación (ETA) | Calcula en milisegundos la velocidad comercial y tiempo estimado hacia cada parada subsiguiente, alertando a los acudientes en radio de 5 a 10 minutos. | Media |
| RF-19 | Visualización Cartográfica y Mapa en Tiempo Real | Provee un mapa cartográfico interactivo en tiempo real con renderizado vectorial: los padres visualizan solo el bus de su hijo y el paradero asignado; la empresa y el colegio visualizan toda la flota. | Alta/Crítica |

### 2.4 Módulo 4: Comunicación Institucional, Notificaciones Push y Alertas

| Código | Requerimiento | Descripción Técnica y Funcional | Prioridad |
|---|---|---|---|
| RF-12 | Canal Oficial de Notificaciones Push | Reemplaza chats informales por una central institucional de avisos masivos, zonales e individuales autenticados, registrando auditoría de entrega. | Alta/Crítica |
| RF-13 | Matriz de Roles e Intervención Superior | Asigna privilegios de superadministrador a la Coordinadora de Convivencia para inspeccionar rutas activas, transmisiones, chats de emergencia y autorizar transbordos. | Alta/Crítica |
| RF-14 | Aviso Automatizado de Zona Sin Cobertura | Envía alerta preventiva a los acudientes antes de que el automotor entre a un tramo muerto programado, informando la ventana estimada en que se restablecerá el mapa en vivo. | Media |
| RF-20 | Motor de Notificaciones Automáticas por Evento y Estado | Emite notificaciones push transaccionales inmediatas ante transiciones de estado del menor: (1) Abordaje registrado, (2) Aproximación a parada, (3) Entrega a adulto autorizado, (4) Ausencia confirmada, (5) Desembarque fallido y retorno seguro. | Alta/Crítica |

### 2.5 Módulo 5: Gestión Administrativa y Cartera

| Código | Requerimiento | Descripción Técnica y Funcional | Prioridad |
|---|---|---|---|
| RF-15 | Separación de Cobranza Operativa | Garantiza que los estados contables de morosidad se gestionen exclusivamente en oficinas administrativas, desvinculando cualquier bloqueo automático o discriminación en el abordaje físico del vehículo. | Alta/Crítica |
| RF-16 | Reportes de Auditoría e Incidentes | Genera bitácoras cronológicas e inmutables exportables (PDF/Excel) con timestamps exactos, coordenadas de lectura QR, intentos fallidos de desembarque y eventos de alerta legal. | Media |

---

## 3. Requisitos No Funcionales (RNF) y Reglas de Negocio

| Código | Categoría | Especificación Técnica / Métrica de Calidad | Prioridad |
|---|---|---|---|
| RNF-01 | Seguridad y Protección de Datos | Alineación rigurosa con la Ley 1581 de 2012 (Habeas Data Menores). Cifrado en tránsito (TLS 1.3) y en reposo (AES-256). Principio de mínimo privilegio de acceso. | Alta/Crítica |
| RNF-02 | Privacidad Diferencial por Rol | Aislamiento multi-tenant en capas: los padres acceden estrictamente a los datos de sus hijos. Flota global reservada a coordinación y gerencia de transporte. | Alta/Crítica |
| RNF-03 | Disponibilidad Operativa | SLA del 99.9% garantizado en ventanas críticas de transporte (05:00 a.m. a 07:30 p.m. de lunes a viernes en días calendario escolar). | Alta/Crítica |
| RNF-04 | Usabilidad y Accesibilidad Mobile | Interfaz de alto contraste para exteriores con botones mínimos de 48px; soporte para operación táctil con una sola mano en movimiento vehicular. | Alta/Crítica |
| RNF-05 | Rendimiento y Latencia de Notificación | Latencia inferior a 2.5 segundos para la entrega de notificaciones push de eventos de abordaje y entrega bajo redes celulares 4G LTE y 5G. | Media |
| RNF-06 | Resiliencia y Persistencia Offline | Motor de base de datos local embebida capaz de sostener la operación sin señal celular por más de 12 horas continuas con cola transaccional FIFO protegida. | Alta/Crítica |
| RNF-07 | No Intrusión Laboral | Cero software o procesos de seguimiento instalados en terminales móviles particulares de conductores. Toda telemetría nace del hardware fijo del vehículo. | Alta/Crítica |
| RNF-08 | Inmutabilidad y Auditoría Forense | Los registros de desembarque y alertas legales no admiten mutación ni borrado físico (soft-delete auditado con hash de integridad criptográfica). | Media |
| RNF-09 | Protección de Rostros y Biometría | Imágenes de menores y autorizados bloqueadas para descarga, captura de pantalla móvil y compartición externa fuera del visor seguro de la aplicación. | Alta/Crítica |

### 3.1 Reglas de Negocio Complementarias

*   **RN-01. Identificación Exclusiva por QR:** El carné institucional con QR encriptado es el único medio digital homologado para abordar el bus.
*   **RN-02. Cero Sobrecupo Absoluto:** La capacidad homologada de la tarjeta de operación del vehículo representa una restricción dura física y de software que no admite excepciones manuales.
*   **RN-03. Cupo Ocasional por Inasistencia Previa:** Solo se habilitan invitaciones ocasionales cuando un cupo regular haya sido formalmente liberado por inasistencia reportada previamente.
*   **RN-04. Protección Legal de Custodia:** Si existe alerta roja de restricción legal, el estudiante no puede ser entregado a la persona señalada bajo ninguna circunstancia sin presencia de la Policía de Infancia o delegación formal de Rectoría.
*   **RN-05. Principio de Inmunidad Operativa por Mora:** Ningún estudiante puede ser rechazado, bajado o abandonado en vía pública a causa de saldos pendientes de pago de su matrícula o servicio de transporte.
*   **RN-06. Paradas Oficiales Inmutables en Ruta:** Monitoras y conductores no pueden alterar la ruta ni crear paradas improvisadas durante el viaje. Las modificaciones requieren trámite administrativo previo.
*   **RN-07. Privacidad Temporal de Mapa:** El mapa cartográfico en vivo para los padres solo es visible mientras su hijo figure en estado "A Bordo del Vehículo". Se apaga automáticamente tras la entrega.

---

## 4. Diagrama de Transición de Estados del Estudiante y Modelo Operativo

Para garantizar la máxima certeza de custodia, la plataforma modela el ciclo de vida diario de cada estudiante como una máquina de estados finitos inmutable:

| Estado Origen | Evento Disparador / Validación de Sistema | Estado Destino | Acción / Notificación Disparada |
|---|---|---|---|
| En Casa / Espera | Escaneo exitoso de carné QR por la monitora al subir al vehículo. | A Bordo del Vehículo | Push a padres: menor a bordo con hora y parada exacta. |
| En Casa / Espera | Reporte formal de inasistencia antes de la ruta por parte del acudiente. | Ausente Confirmado | Libera cupo temporal; evita detención innecesaria de la ruta. |
| A Bordo del Vehículo | Llegada a paradero oficial y cotejo visual exitoso de adulto autorizado. | Entregado a Adulto Autorizado | Push de desembarque exitoso con nombre de quien recibió al menor. |
| A Bordo del Vehículo | Ausencia absoluta de adulto autorizado en el paradero tras tiempo de espera legal. | Retorno Seguro a Sede Escolar | Alerta crítica a Coordinación; menor permanece en el bus hasta el colegio. |
| Retorno Seguro a Sede Escolar | Llegada al colegio y entrega formal a la Coordinadora de Convivencia. | En Custodia Institucional | Acta digital de custodia en sede escolar para retiro presencial de padres. |

---

## 5. Especificación Detallada de Casos de Uso (RF-01 al RF-20)

### Caso de Uso RF-01: Centralización de Matrícula y Cupos
*   **Actores:** Coordinadora del Colegio, Empresa Transportadora.
*   **Descripción:** Carga y cruza la base de datos institucional de matrícula escolar contra las tablas de cupos autorizados de la empresa transportadora.
*   **Precondición:** Archivo oficial cargado en la plataforma por la rectoría o sincronizado por API.
*   **Flujo Principal:** 1. El actor importa la planilla de matrículas. 2. El motor de homologación valida campos obligatorios y detecta duplicados o cancelaciones. 3. Se asignan cupos nominales en los vehículos. 4. El sistema emite reporte de inconsistencias detectadas.
*   **Flujo Alternativo:** Si un estudiante no posee dirección geográfica válida, se bloquea su asignación hasta la subsanación por bienestar escolar.
*   **Postcondición:** Base de datos unificada como única fuente de verdad operativa.

### Caso de Uso RF-02: Control de Asistencia Digital mediante QR
*   **Actores:** Monitora de Ruta.
*   **Descripción:** Valida el carné del menor mediante cámara móvil al momento de subir o bajar del automotor.
*   **Precondición:** El estudiante posee código QR institucional expedido y la monitora tiene abierta la sesión de ruta.
*   **Flujo Principal:** 1. La monitora apunta la cámara al carné. 2. El sistema decodifica el token en menos de 2 segundos. 3. Actualiza el estado a "A Bordo" registrando hora y coordenadas. 4. Dispara notificación push automática a los acudientes.
*   **Flujo Alternativo:** Si el QR corresponde a un estudiante asignado a otra ruta, la pantalla vibra en rojo, emite alerta sonora y deniega el abordaje.
*   **Postcondición:** Registro de abordaje inmutable almacenado en base de datos local y remota.

### Caso de Uso RF-03: Validación de Capacidad Nominal
*   **Actores:** Monitora, Sistema (Regla de Negocio).
*   **Descripción:** Monitorea en vivo el número de ocupantes e impide el sobrecupo físico y contractual en el bus.
*   **Precondición:** Tarjeta de operación vehicular homologada con capacidad máxima registrada.
*   **Flujo Principal:** Cada escaneo QR suma 1 pasajero al contador. Si el contador < Capacidad, confirma el abordaje con check verde.
*   **Flujo Alternativo (Denegación):** Al intentar registrar el pasajero $N+1$, la aplicación bloquea el botón de confirmación, deshabilita la cámara y emite la alarma bloqueante "CAPACIDAD HOMOLOGADA AGOTADA: PROHIBIDO ABORDAJE".
*   **Postcondición:** El vehículo opera estrictamente bajo las normas de tránsito legales.

### Caso de Uso RF-04: Gestión de Pasajeros Ocasionales
*   **Actores:** Padre de Familia Solicitante, Coordinadora del Colegio.
*   **Descripción:** Tramita autorizaciones para que estudiantes viajen en rutas no habituales acompañando a otros menores.
*   **Precondición:** Existencia de una inasistencia formalmente registrada que libere una vacante en la ruta objetivo.
*   **Flujo Principal:** 1. El padre radica la petición con mínimo 2 horas de anticipación. 2. El sistema valida si hay cupo liberado. 3. Coordinación aprueba. 4. Se genera un QR provisional de un solo uso.
*   **Flujo Alternativo:** Si el bus se encuentra al 100% de ocupación nominal, el sistema rechaza automáticamente la solicitud sin opción de apelación manual.
*   **Postcondición:** Cupo temporal asignado sin riesgo de sobrecupo.

### Caso de Uso RF-05: Registro Fotográfico de Autorizados
*   **Actores:** Coordinación de Convivencia, Acudientes Legales.
*   **Descripción:** Registro de las fichas de custodia que contienen fotografías recientes, documentos de identidad y parentesco de los receptores.
*   **Precondición:** Consentimiento firmado de tratamiento de datos personales de menores (Ley 1581).
*   **Flujo Principal:** 1. El acudiente sube documentos y foto. 2. Coordinación verifica autenticidad. 3. Los datos se encriptan y sincronizan con la app de la monitora asignada a la ruta.
*   **Flujo Alternativo:** Ante revocatoria de patria potestad, coordinación marca el registro como revocatorio y se actualiza instantáneamente en la app.
*   **Postcondición:** Ficha digital de custodia disponible exclusivamente en dispositivos autorizados.

### Caso de Uso RF-06: Verificación Digital de Desembarque
*   **Actores:** Monitora de Ruta, Adulto Receptor.
*   **Descripción:** Validación visual biométrica en parada para formalizar la entrega del estudiante.
*   **Precondición:** Estudiante "A Bordo del Vehículo" y vehículo detenido en la parada asignada.
*   **Flujo Principal:** 1. La monitora abre la ficha del menor en la parada. 2. Compara el rostro y documento del adulto presente con la foto almacenada en la app. 3. Selecciona el nombre del adulto receptor. 4. Confirma la entrega. 5. Estado cambia a "Entregado" y se dispara notificación automática.
*   **Flujo Alternativo (Denegación):** Si el adulto no coincide o carece de documento de identidad, la monitora niega la entrega y activa el protocolo RF-08.
*   **Postcondición:** Registro de entrega con timestamp, geolocalización e identidad del adulto receptor.

### Caso de Uso RF-07: Alertas de Restricción Legal y Custodia
*   **Actores:** Monitora, Coordinadora de Convivencia.
*   **Descripción:** Emite avisos críticos bloqueantes en caso de litigios, custodias exclusivas o prohibiciones de acercamiento.
*   **Precondición:** Medida cautelar o sentencia judicial registrada por Rectoría en el expediente escolar.
*   **Flujo Principal:** Al llegar a la parada del menor, la aplicación despliega un banner de máxima prioridad de color rojo intenso con la foto del individuo no autorizado y la leyenda legal obligatoria de prohibición de entrega.
*   **Flujo Alternativo:** Si la persona restringida intenta retirar al menor o genera disturbios, la monitora presiona el botón de pánico en la app, escala a la Policía Nacional y mantiene las puertas aseguradas.
*   **Postcondición:** Protección física y legal del menor garantizada.

### Caso de Uso RF-08: Novedades de Desembarque Fallido
*   **Actores:** Monitora, Coordinadora del Colegio.
*   **Descripción:** Procedimiento ante la ausencia de un adulto responsable en la parada de destino.
*   **Precondición:** Vehículo detenido en parada durante el tiempo reglamentario de cortesía (3 minutos).
*   **Flujo Principal:** 1. Al no presentarse receptor, la monitora presiona "Adulto Ausente". 2. El sistema envía notificación de emergencia al teléfono de los padres. 3. Cambia el estado a "Retorno Seguro a Sede Escolar". 4. El estudiante continúa a bordo hasta el colegio.
*   **Flujo Alternativo:** Si el padre llama de inmediato y coordina una entrega con otro autorizado registrado previamente en la siguiente parada, coordinación avala la excepción en el panel central.
*   **Postcondición:** Ningún menor desamparado en vía pública; retorno custodiado a instalaciones educativas.

### Caso de Uso RF-09: Integración de Telemetría GPS Dedicada
*   **Actores:** Servidor de Telemetría, Hardware GPS Vehicular, Empresa Transportadora.
*   **Descripción:** Transmisión de coordenadas, velocidad y rumbo desde el módem fijo del automotor hacia el backend en la nube.
*   **Precondición:** Dispositivo GPS fijo conectado al switch de ignición del bus y con enlace M2M activo.
*   **Flujo Principal:** El hardware envía paquetes MQTT/HTTPS cada 5 segundos al servidor. El servidor procesa la coordenada y actualiza la posición global de la unidad en la base de datos.
*   **Flujo Alternativo:** Si se desconecta la alimentación principal del GPS, el módem envía aviso por batería de respaldo y el sistema reporta alarma de sabotaje.
*   **Postcondición:** Ubicación precisa en tiempo real sin involucrar los teléfonos personales de los conductores.

### Caso de Uso RF-10: Sincronización Asíncrona (Puntos Ciegos)
*   **Actores:** App Móvil de la Monitora, Backend Central.
*   **Descripción:** Mantiene la operatividad del sistema en áreas sin cobertura celular (ej. corredor de La Virginia).
*   **Precondición:** Pérdida total de señal de datos celulares en el terminal móvil de la monitora.
*   **Flujo Principal:** 1. La app detecta desconexión. 2. Conmuta automáticamente al modo SQLite local. 3. Registra abordajes y novedades encriptadas con marca de tiempo. 4. Al recuperar enlace celular, un worker en segundo plano vacía la cola FIFO al servidor central sin pérdida de registros.
*   **Flujo Alternativo:** Si la memoria local se satura, el sistema aplica compresión gzip preservando intactos los registros de asistencia.
*   **Postcondición:** Consistencia de datos al 100% tras el restablecimiento de señal.

### Caso de Uso RF-11: Cercas Virtuales y Estimación (ETA)
*   **Actores:** Sistema (Algoritmo Geográfico), Padres de Familia.
*   **Descripción:** Cálculo predictivo de aproximación vehicular y aviso anticipado a paraderos.
*   **Precondición:** Vehículo en recorrido regular transmitiendo telemetría continua.
*   **Flujo Principal:** El sistema evalúa la distancia vectorial y velocidad media hacia las paradas pendientes. Al cruzar el radio de geocerca (5 a 10 minutos de distancia), dispara una notificación push automática al padre para que acuda al punto de encuentro.
*   **Flujo Alternativo:** En caso de embotellamiento severo, recalcula dinámicamente el ETA y refresca la hora proyectada en la interfaz.
*   **Postcondición:** Reducción drástica de tiempos de espera de los menores en la intemperie.

### Caso de Uso RF-12: Canal Oficial de Notificaciones Push
*   **Actores:** Coordinación del Colegio, Padres de Familia.
*   **Descripción:** Transmisión unidireccional o segmentada de novedades operativas (varadas, desvíos, transbordos).
*   **Precondición:** Cuenta de usuario activa en la app móvil con permisos de notificación vigentes.
*   **Flujo Principal:** Coordinación redacta un comunicado clasificado por severidad (Informativo / Urgente). El sistema lo despacha a los acudientes de la ruta afectada en menos de 2 segundos.
*   **Flujo Alternativo:** Si falla el canal de push móvil (FCM/APNS), el sistema conmuta automáticamente a SMS transaccional de respaldo.
*   **Postcondición:** Comunicaciones formales registradas en bitácora de auditoría sin exposición en redes sociales.

### Caso de Uso RF-13: Matriz de Roles e Intervención Superior
*   **Actores:** Coordinadora de Convivencia (Superadministrador).
*   **Descripción:** Control y visibilidad omnicanal en tiempo real sobre la totalidad de unidades vehiculares, personal e incidencias.
*   **Precondición:** Autenticación multifactor (MFA) exitosa en el portal web institucional.
*   **Flujo Principal:** La coordinadora supervisa la consola central, observa las rutas sobre el mapa global, interviene ante alertas rojas y autoriza transbordos o cambios de choferes.
*   **Flujo Alternativo:** En contingencia vial mayor, la coordinadora asume el mando de las alertas y redacta despachos directos a las familias.
*   **Postcondición:** Trazabilidad total de la toma de decisiones institucionales.

### Caso de Uso RF-14: Aviso Automatizado de Zona Sin Cobertura
*   **Actores:** Sistema Autónomo, Padres de Familia.
*   **Descripción:** Alerta preventiva ante la inminencia de pérdida de señal por orografía o deficiencia celular en el tramo.
*   **Precondición:** Polígono de zona sin señal previamente cartografiado en el sistema (ej. La Virginia).
*   **Flujo Principal:** 500 metros antes de entrar al polígono ciego, el sistema despacha la notificación push: "El vehículo entra en zona de sombra celular habitual. El mapa en vivo se pausará aproximadamente 10 minutos. No representa una emergencia".
*   **Flujo Alternativo:** Si el vehículo no recupera señal tras 25 minutos (tiempo de holgura superado), se genera una alarma de retraso anómalo en la consola de Coordinación.
*   **Postcondición:** Mitigación de la histeria e incertidumbre de los padres de familia.

### Caso de Uso RF-15: Separación de Cobranza Operativa
*   **Actores:** Administrador de Cartera de la Empresa Transportadora, Sistema de Abordaje.
*   **Descripción:** Aislamiento de las variables contables y de facturación respecto a los módulos operativos de a bordo.
*   **Precondición:** Estudiante registrado con cuotas vencidas en el módulo contable.
*   **Flujo Principal:** El área de cartera genera extractos y cartas de cobro que se remiten por canales administrativos a los acudientes. En la app de la monitora, el carné del estudiante se lee y valida con normalidad sin exponer su estado financiero.
*   **Flujo Alternativo (Denegación):** El sistema bloquea de forma rígida cualquier intento de programar bloqueos de acceso, mensajes disuasorios o marcas de color en el carné del menor por motivos de cobro.
*   **Postcondición:** Preservación de la dignidad del menor y cumplimiento de la normativa de bienestar infantil.

### Caso de Uso RF-16: Reportes de Auditoría e Incidentes
*   **Actores:** Coordinadora de Convivencia, Gerencia de Transportes Camino Seguro.
*   **Descripción:** Extracción de reportes consolidados en formatos estructurados para fiscalización o procesos judiciales.
*   **Precondición:** Existencia de registros operativos en el periodo consultado.
*   **Flujo Principal:** El usuario filtra por rango de fechas, ruta y placa. El motor compila eventos, tiempos de parada, alertas de custodia y firmas de entrega, generando un reporte PDF firmado digitalmente.
*   **Flujo Alternativo:** Si no hay incidencias en el rango, emite certificado digital de recorrido sin novedades.
*   **Postcondición:** Documento probatorio legal disponible para descargarse.

### Caso de Uso RF-17: Planificación y Trazado Dinámico de Rutas
*   **Actores:** Coordinadora del Colegio, Jefe de Operaciones de Transporte.
*   **Descripción:** Parametrización, creación y ordenamiento secuencial de las rutas escolares (recorridos mañana/tarde), estableciendo paradas oficiales georreferenciadas (latitud/longitud) y vinculando nominalmente a los estudiantes a cada paradero.
*   **Precondición:** Estudiantes debidamente matriculados con dirección validada y vehículos homologados en el sistema.
*   **Flujo Principal:** 1. El actor ingresa al diseñador de rutas del portal administrativo. 2. Fija las paradas en el mapa vectorial asignando orden secuencial y horario previsto. 3. El sistema valida la viabilidad vial y asocia a los estudiantes por proximidad a la parada. 4. Se genera la polilínea oficial del trayecto y se publica en la app de la monitora.
*   **Flujo Alternativo:** Si una parada se sitúa en una vía restringida para vehículos pesados o sin salida técnica, el sistema emite advertencia de transitabilidad y exige reubicar el punto.
*   **Postcondición:** Ruta guardada, georreferenciada y asignada al móvil correspondiente.

### Caso de Uso RF-18: Detección Automática de Desvíos de Ruta
*   **Actores:** Sistema Autónomo, Conductor, Coordinadora del Colegio.
*   **Descripción:** Supervisa que el bus escolar se mantenga sobre el corredor vial previamente autorizado y auditado.
*   **Precondición:** Vehículo en recorrido activo con trazado de polilínea oficial cargado.
*   **Flujo Principal:** El motor geoespacial compara continuamente la coordenada del GPS contra la polilínea oficial. Si el bus se mantiene dentro de una franja de tolerancia de 150 metros, el viaje continúa en estado normal.
*   **Flujo Alternativo:** Si el automotor se aleja más de 300 metros del corredor planificado sin una parada de contingencia reportada, el sistema emite una alerta amarilla a la central de monitoreo y solicita justificación operativa a la tripulación.
*   **Postcondición:** Bitácora de desvíos registrada para auditoría operativa y de seguridad.

### Caso de Uso RF-19: Visualización Cartográfica y Mapa en Tiempo Real
*   **Actores:** Padre de Familia, Monitora, Coordinadora de Convivencia, Empresa Transportadora.
*   **Descripción:** Renderizado gráfico en mapa interactivo de la posición satelital del bus escolar en movimiento, paradas pendientes y tiempos estimados, aplicando privacidad diferencial según rol.
*   **Precondición:** Vehículo despachado en trayecto y transmitiendo telemetría continua por GPS dedicado.
*   **Flujo Principal:** 1. El usuario abre la vista "Mapa en Vivo". 2. El sistema valida el rol: si es padre de familia, muestra únicamente el bus donde viaja su hijo, el trazado de su ruta y la ubicación de su parada asignada; si es colegio o empresa, despliega la flota escolar completa con placas y velocidades. 3. El mapa actualiza el marcador en vivo mediante streaming.
*   **Flujo Alternativo (Denegación):** Si el estudiante ya fue entregado a su acudiente o no abordó el vehículo (Ausente Confirmado), el acceso al mapa se deniega y deshabilita inmediatamente para ese acudiente por estricta protección de la intimidad de los demás pasajeros.
*   **Postcondición:** Seguimiento satelital fluido, transparente y seguro según privilegios.

### Caso de Uso RF-20: Motor de Notificaciones Automáticas por Evento y Estado
*   **Actores:** Sistema (Motor Transaccional), Padre de Familia, Monitora.
*   **Descripción:** Despacho automatizado de notificaciones push a teléfonos móviles ante cada cambio en el estado de custodia del menor durante el recorrido.
*   **Precondición:** Padres de familia con aplicación institucional instalada y token push registrado.
*   **Flujo Principal:** 1. Ocurre una transición en la máquina de estados del menor. 2. El sistema construye la plantilla con variables dinámicas (nombre, hora exacta, paradero). 3. Se envía la notificación push en menos de 2.5 segundos: "Abordaje confirmado", "Bus a 5 minutos de su paradero", o "Entrega exitosa a [Adulto Autorizado]". 4. La app del acudiente emite tono y registra el evento.
*   **Flujo Alternativo:** Si ocurre una entrega fallida o alerta de custodia, el sistema dispara notificación prioritaria con sonido distintivo de urgencia y contacto telefónico directo a coordinación.
*   **Postcondición:** Notificación transaccional entregada y registrada en el historial del acudiente.

---

## 6. Historias de Usuario con Criterios de Aceptación, Restricciones y Denegaciones

A continuación se presentan las Historias de Usuario organizadas por módulo. En cada una se detallan tanto los escenarios estándar de satisfacción como las Restricciones de Negocio y Criterios de Denegación (escenarios donde el sistema debe rechazar, bloquear o denegar la acción):

### 6.1 Módulo 1: Gestión Unificada de Estudiantes y Rutas

**HU-01 (RF-01): Centralización de Matrícula y Cupos**
Como coordinadora del colegio, quiero sincronizar la matrícula con la capacidad de las rutas en un solo sistema, para eliminar discrepancias entre planillas de Excel y hojas físicas.
*   **Criterios de Aceptación:** Permite carga masiva CSV/Excel; unifica registros en menos de 10 segundos; genera reporte automático de inconsistencias.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN POR DUPLICIDAD:** El sistema rechaza y deniega la carga de estudiantes con documento de identidad repetido o con doble asignación simultánea de cupo en la misma franja horaria.
    *   **RESTRICCIÓN DE MODIFICACIÓN:** La empresa transportadora tiene denegado alterar o eliminar estudiantes del registro oficial de matrícula sin aval firmado de la rectoría escolar.

**HU-02 (RF-02): Control de Asistencia Digital mediante QR**
Como monitora de ruta, quiero escanear el carné institucional de cada estudiante al subir y bajar, para tener un registro de abordaje digitalizado e instantáneo.
*   **Criterios de Aceptación:** Escaneo en menos de 2 segundos; retroalimentación táctil/sonora positiva; actualización automática de la lista en pantalla.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN POR RUTA INCORRECTA:** Si se escanea el QR de un alumno matriculado en una ruta diferente, el sistema emite un tono disuasorio, tiñe la pantalla en rojo y deniega el abordaje, obligando a solicitar aval a Coordinación si es un caso fortuito.
    *   **DENEGACIÓN POR QR DUPLICADO:** El sistema deniega y rechaza lecturas dobles del mismo código QR dentro de un intervalo menor a 15 minutos en el mismo viaje para impedir dobles conteos.
    *   **DENEGACIÓN POR ESTADO INASISTENTE:** Si el alumno figura previamente en estado "Ausente Confirmado", el lector bloquea el check automático y exige a la monitora revalidar la cancelación de la inasistencia.

**HU-03 (RF-03): Validación de Capacidad Nominal**
Como monitora, quiero que el sistema me alerte e impida el ingreso cuando el bus alcance su capacidad reglamentaria, para evitar sobrecupos y sanciones de tránsito.
*   **Criterios de Aceptación:** Visualización gráfica de la ocupación en tiempo real; suma automática de pasajeros fijos y ocasionales.
*   **Restricciones y Denegaciones del Sistema:**
    *   **BLOQUEO Y DENEGACIÓN POR SOBRECUPO:** Al llegar al límite homologado (ej. $16/16$), el sistema deshabilita la cámara del escáner y bloquea cualquier registro de abordaje adicional.
    *   **RESTRICCIÓN DE OVERRIDE MANUAL:** La monitora tiene terminantemente denegada la opción de sobrepasar o desactivar el tope de capacidad máxima desde el dispositivo móvil.

**HU-04 (RF-04): Gestión de Pasajeros Ocasionales**
Como padre de familia, quiero solicitar el transporte ocasional de un invitado desde la aplicación, para resolver imprevistos sin depender de grupos de WhatsApp.
*   **Criterios de Aceptación:** Envío de solicitud digital indicando nombre del invitado y fecha; confirmación institucional con código temporal QR.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN POR FALTA DE CUPO:** Si no existe al menos una inasistencia formalmente registrada que libere una vacante, el sistema deniega y no permite remitir la solicitud, mostrando el mensaje: "Ruta sin disponibilidad de cupos ocasionales".
    *   **DENEGACIÓN POR RADICACIÓN TARDÍA:** Se deniegan automáticamente solicitudes tramitadas con menos de 2 horas de anticipación a la partida del vehículo.
    *   **RESTRICCIÓN DE ABORDAJE:** La monitora tiene prohibido registrar a un invitado que no figure en estado "Aprobado por Coordinación" en la app.

**HU-17 (RF-17): Planificación y Trazado Dinámico de Rutas**
Como jefe de operaciones de la empresa transportadora, quiero definir trazados viales óptimos y paradas georreferenciadas con sus horarios estimados, para asegurar un recorrido puntual y eficiente.
*   **Criterios de Aceptación:** Interfaz gráfica de trazado cartográfico; cálculo automático de distancias y tiempos promedio; asociación de paradas a estudiantes.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE ALTERACIÓN EN MARCHA:** Monitoras y conductores tienen estrictamente denegado reconfigurar, añadir o reubicar paradas oficiales desde sus teléfonos durante el trayecto operativo.
    *   **RESTRICCIÓN DE PARADAS NO GEORREFERENCIADAS:** El sistema deniega guardar una ruta si alguna parada carece de coordenadas exactas (lat/long) o se ubica fuera del perímetro municipal homologado.

**HU-18 (RF-18): Detección Automática de Desvíos de Ruta**
Como coordinadora de convivencia, quiero que el sistema me alerte si un bus se aparta del recorrido planificado, para reaccionar ante contingencias o anomalías en la conducción.
*   **Criterios de Aceptación:** Supervisión continua de la polilínea oficial; activación automática de advertencia visual en panel web ante desvíos superiores a 300 metros.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE SILENCIAMIENTO OPERATIVO:** Ni el conductor ni la monitora tienen facultades para desactivar o apagar la supervisión geoespacial de desvíos durante el viaje.

### 6.2 Módulo 2: Custodia, Entregas y Protocolos de Seguridad

**HU-05 (RF-05): Registro Fotográfico de Autorizados**
Como acudiente, quiero registrar las fotografías y documentos de las personas autorizadas para recibir a mi hijo, para que no dependan de listas en papel desactualizadas.
*   **Criterios de Aceptación:** Registro de hasta 3 adultos por menor; carga de fotografía frontal clara y documento de identidad; almacenamiento cifrado.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN POR FALTA DE CONSENTIMIENTO:** Se deniega la activación del registro si el acudiente no firma digitalmente el consentimiento informado de tratamiento de datos personales de menores (Ley 1581).
    *   **RESTRICCIÓN DE ACCESO BIOMÉTRICO:** Conductores y terceros ajenos a la ruta tienen absolutamente denegada la visualización o descarga de las fotografías del expediente de autorizados.

**HU-06 (RF-06): Verificación Digital de Desembarque**
Como monitora, quiero validar visualmente en la aplicación a la persona que recibe al estudiante en la parada, para garantizar una entrega segura y autorizada.
*   **Criterios de Aceptación:** Despliegue de fotos de autorizados al llegar al paradero; selección explícita del adulto presente; registro de hora y posición.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE ENTREGA A DESCONOCIDOS:** El sistema deniega marcar el estado "Entregado" si el adulto presente no coincide con alguno de los autorizados registrados en la ficha oficial.
    *   **DENEGACIÓN DE CIERRE SIN CONFIRMACIÓN:** La interfaz bloquea la continuidad del viaje si un estudiante en parada no ha sido marcado formalmente como "Entregado" o registrado en "Desembarque Fallido".

**HU-07 (RF-07): Alertas de Restricción Legal y Custodia**
Como monitora, quiero ver una advertencia roja inmediata si un estudiante tiene una restricción legal de custodia, para no entregarlo a un progenitor no autorizado por la justicia.
*   **Criterios de Aceptación:** Despliegue de ventana emergente roja de máxima visibilidad; bloqueo de la pantalla de entrega hasta leer el protocolo; instrucciones de llamada de emergencia.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN ABSOLUTA DE ENTREGA:** El sistema bloquea e inhabilita definitivamente cualquier opción de entrega si la persona que acude a la parada es el individuo objeto de la medida cautelar o restricción de custodia.
    *   **RESTRICCIÓN DE EDICIÓN:** Ni monitoras ni acudientes pueden suspender, editar o archivar una orden de restricción. Solo el perfil Superadministrador (Coordinación) tiene privilegios autorizados.

**HU-08 (RF-08): Novedades de Desembarque Fallido**
Como coordinadora, quiero recibir una alarma instantánea si ningún adulto autorizado se presenta a recoger al estudiante, para activar el protocolo de custodia institucional de inmediato.
*   **Criterios de Aceptación:** Registro de novedad tras 3 minutos de espera; notificación simultánea a padres y directivas; instrucción de permanencia en el vehículo.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE ABANDONO DE MENOR:** Queda terminantemente denegada cualquier opción en la aplicación que permita marcar a un menor como "Dejado en Parada" sin la presencia acreditada de un adulto legalmente autorizado.

### 6.3 Módulo 3: Monitoreo GPS, Telemetría y Mapa en Tiempo Real

**HU-09 (RF-09): Integración de Telemetría GPS Dedicada**
Como conductor de ruta, quiero que el sistema tome la geolocalización únicamente del hardware GPS instalado en el vehículo y no de mi teléfono personal, para proteger mi privacidad laboral.
*   **Criterios de Aceptación:** Conexión telemática continua con el módem fijo del automotor; cero software de rastreo instalado en teléfonos privados de transportistas.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE CONSUMO DE DATOS PRIVADOS:** El sistema deniega cualquier solicitud técnica que intente geolocalizar la red personal o dispositivos móviles particulares de los conductores.

**HU-10 (RF-10): Sincronización Asíncrona (Puntos Ciegos)**
Como coordinadora, quiero que las asistencias registradas en tramos sin señal celular no se borren, para tener una trazabilidad fidedigna de toda la ruta.
*   **Criterios de Aceptación:** Almacenamiento local automático de lecturas QR; sincronización sin colisiones al detectar red 4G/LTE en segundo plano.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE DESCARTE DE REGISTROS:** El motor offline deniega la depuración o sobrescritura de paquetes no sincronizados hasta no recibir confirmación HTTP 200/201 del servidor principal.

**HU-11 (RF-11): Cercas Virtuales y Estimación (ETA)**
Como padre de familia, quiero recibir un aviso automático cuando el bus esté a 5 o 10 minutos de la parada de mi hijo, para salir oportunamente a esperarlo.
*   **Criterios de Aceptación:** Detección georreferenciada automática del vehículo al cruzar la geocerca de proximidad; envío inmediato de alerta push preventiva.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE ENVÍO EXTEMPORÁNEO:** El sistema deniega despachar la alerta de proximidad si el vehículo se encuentra detenido por una anomalía mecánica antes del radio de cobertura.

**HU-19 (RF-19): Visualización Cartográfica y Mapa en Tiempo Real**
Como padre de familia, quiero ver en un mapa interactivo el avance del bus donde viaja mi hijo, para verificar su recorrido en vivo con total certeza.
*   **Criterios de Aceptación:** Mapa fluido con refresco continuo; renderizado del marcador del vehículo, trazado de ruta y parada de destino; disponible en web y móvil.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN POR PRIVACIDAD FAMILIAR:** El padre de familia tiene estrictamente denegado visualizar la ubicación de estudiantes ajenos, domicilios de terceros o vehículos en los que su hijo no viaje.
    *   **DENEGACIÓN DE MAPA FUERA DE HORARIO OPERATIVO:** El acceso a la cartografía en vivo se deniega y bloquea automáticamente cuando el estudiante se encuentra en estado "En Casa / Espera" o "Entregado a Adulto Autorizado".
    *   **DENEGACIÓN DE VISUALIZACIÓN GLOBAL:** Se deniega el acceso a la vista integral de la flota a cualquier usuario que no posea rol de Coordinación o Gerencia de Transporte.

### 6.4 Módulo 4: Comunicación Institucional, Notificaciones Push y Alertas

**HU-12 (RF-12): Canal Oficial de Notificaciones Push**
Como directiva escolar, quiero emitir comunicados oficiales estructurados a través de la plataforma, para erradicar los grupos caóticos y vulnerables de WhatsApp.
*   **Criterios de Aceptación:** Envío masivo o segmentado por ruta; registro de entrega en panel de auditoría; historial de comunicados accesible para padres.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE CHATS ABIERTOS BIDIRECCIONALES:** El sistema deniega la creación de salas de mensajería de texto libre o foros abiertos entre acudientes y la tripulación del bus, canalizando toda inquietud mediante avisos formales o la central de coordinación.

**HU-13 (RF-13): Matriz de Roles e Intervención Superior**
Como coordinadora de convivencia, quiero supervisar todas las rutas y autorizar transbordos en emergencias, para gestionar cualquier eventualidad de inmediato.
*   **Criterios de Aceptación:** Consola con perfil superadministrador; mapa global de la flota escolar; auditoría en tiempo real de transiciones de estados.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE ESCALAMIENTO NO AUTORIZADO:** Se deniegan privilegios de reasignación o acceso a la matriz de intervención superior a conductores, monitoras o personal operativo no facultado.

**HU-14 (RF-14): Aviso Automatizado de Zona Sin Cobertura**
Como padre de familia, quiero ser advertido antes de que el bus pase por un tramo sin señal celular, para no angustiarme si el mapa se pausa temporalmente.
*   **Criterios de Aceptación:** Notificación automática al aproximarse al polígono sin cobertura (ej. La Virginia); aviso estimando el tiempo de reconexión.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE ALARMA DE EMERGENCIA EN ZONAS CATALOGADAS:** El sistema deniega catalogar la pérdida de telemetría como un fallo mecánico o secuestro si el bus se encuentra dentro de las coordenadas del polígono de sombra homologado.

**HU-20 (RF-20): Motor de Notificaciones Automáticas por Evento y Estado**
Como acudiente, quiero recibir avisos automáticos en mi móvil ante cada cambio de estado de mi hijo (abordaje, aproximación y desembarque), para mantenerme informado sin tener que consultar a la monitora.
*   **Criterios de Aceptación:** Despacho push en menos de 2.5 segundos ante lecturas QR; mensajes claros y contextualizados con nombre y hora exacta.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE SILENCIAMIENTO DE ALERTAS CRÍTICAS:** La aplicación de los padres restringe y deniega desactivar o silenciar notificaciones clasificadas como críticas (Alertas de Custodia, Desembarque Fallido, Retorno a Sede Escolar).
    *   **DENEGACIÓN DE DISPARO CRUZADO:** El sistema deniega y bloquea el envío de notificaciones de un menor hacia dispositivos de acudientes no legalmente vinculados a su expediente.

### 6.5 Módulo 5: Gestión Administrativa y Cartera

**HU-15 (RF-15): Separación de Cobranza Operativa**
Como rectora del colegio, quiero que las deudas de transporte se tramiten exclusivamente por tesorería, para no vulnerar el derecho al transporte ni exponer a los menores en la puerta del vehículo.
*   **Criterios de Aceptación:** Los datos de mora se restringen al portal web contable; la app de abordaje desconoce el estado de pago del acudiente.
*   **Restricciones y Denegaciones del Sistema:**
    *   **DENEGACIÓN DE BLOQUEO POR MORA:** El sistema tiene terminantemente prohibido y deniega cualquier regla de software que impida el escaneo, abordaje o desembarque de un menor a causa de saldos pendientes de pago de sus tutores.
    *   **RESTRICCIÓN DE VISIBILIDAD DE CARTERA:** Se deniega el acceso a los datos de cartera o morosidad a monitoras, conductores y personal operativo de las rutas.

**HU-16 (RF-16): Reportes de Auditoría e Incidentes**
Como gerencia de transportes, quiero generar reportes históricos descargables de novedades y horarios, para dar respuesta objetiva ante auditorías de padres o entes gubernamentales.
*   **Criterios de Aceptación:** Exportación a formatos PDF y Excel; filtros por vehículo, fecha y conductor; sellado de tiempo inmutable en cada registro.
*   **Restricciones y Denegaciones del Sistema:**
    *   **RESTRICCIÓN DE ALTERACIÓN HISTÓRICA:** Los reportes generados no admiten modificación de contenido en el sistema; todo ajuste queda registrado con firma de auditoría forense.

---

## 7. Conclusiones de Adopción Operativa

La presente especificación de requerimientos de software (SRS Versión 2.0) consolida una solución de ingeniería integral para el Colegio San Benito del Otún y Transportes Camino Seguro S.A.S. Al implementar el motor de notificaciones automáticas por evento, el monitoreo telemático en tiempo real con mapa cartográfico interactivo, la parametrización formal de rutas georreferenciadas y una estricta política de restricciones y denegaciones de software, la plataforma garantiza la erradicación del sobrecupo, elimina la vulnerabilidad en la entrega de menores y profesionaliza la operación sin vulnerar los derechos de los estudiantes ni la privacidad de los trabajadores del transporte escolar.

## 8. Responsables y Control de Emisión del Documento

El presente documento de especificación técnica fue elaborado, revisado y validado en sus dimensiones funcionales, no funcionales, casos de uso e historias de usuario por los estudiantes responsables del proyecto, quienes certifican formalmente su contenido:

| # | Nombres y Apellidos | Fecha de Emisión | Firma/Conformidad |
|---|---|---|---|
| 1 | Andrés Botina Valencia | 15 de Septiembre de 2026 | |
| 2 | Camila Arteaga Castillo | 15 de Septiembre de 2026 | |
| 3 | Jhonatan Muchavisoy | 15 de Septiembre de 2026 | |
| 4 | Ana Milena Zúñiga | 15 de Septiembre de 2026 | |

---

## ANEXO A. ARQUITECTURA Y STACK TECNOLÓGICO PROPUESTO

Recomendaciones de ingeniería para la implementación del Proyecto "Camino Seguro" (SRS Versión 2.0)

### A.1 Decisión arquitectónica
Con 20 requisitos funcionales, 9 no funcionales y un volumen operativo reducido (buses de 16 cupos con envío GPS cada 5 segundos; cien vehículos generan aproximadamente 20 puntos por segundo), no se justifican microservicios ni plataformas de streaming como Kafka. Los requisitos que sí condicionan el diseño son: resiliencia offline (RNF-06), trazabilidad forense (RNF-08), privacidad diferencial por rol (RNF-02) y latencia de notificación inferior a 2.5 segundos (RNF-05).

Se adopta un monolito modular con arquitectura hexagonal y diseño guiado por dominio ligero, con un contexto delimitado por cada módulo del SRS: Estudiantes y Rutas, Custodia, Telemetría, Comunicación y Cartera. Se despliega como tres procesos del mismo repositorio: api, telemetry-ingest y worker. Esta decisión favorece los principios SOLID, reduce la complejidad operativa y permite extraer servicios en el futuro si la carga lo exige.

### A.2 Stack de backend

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | NestJS (TypeScript, Node.js 22 LTS) | Módulos, inyección de dependencias y guards alineados con SOLID y con la separación modular del SRS. Tipos compartidos con el frontend. |
| Base de datos | PostgreSQL 16 + PostGIS | Cercas virtuales (RF-11), zonas sin cobertura (RF-14), paradas georreferenciadas (RF-17) y distancia punto-polilínea para desvíos (RF-18). |
| Acceso a datos | TypeORM + SQL nativo para consultas espaciales | Integración nativa con NestJS y soporte para columnas geography. |
| Telemetría | Tablas particionadas por día en PostgreSQL; Redis para la última posición de cada bus | Suficiente para la escala del proyecto; TimescaleDB solo si el volumen crece. |
| Ingesta GPS | Traccar (open source) o gateway propio que reenvía al API | Los GPS homologados usan protocolos binarios sobre TCP/MQTT. Traccar los decodifica y detecta corte de alimentación (RF-09). |
| Colas y tareas | BullMQ + Redis | Notificaciones (RF-20), reportes PDF (RF-16), reintentos de SMS y vigilancia de los 25 minutos de RF-14. |
| Tiempo real | WebSocket (Socket.IO con Redis adapter) | Mapa en vivo (RF-19) y consola de Coordinación (RF-13), con salas segregadas por rol. |
| Notificaciones | Firebase Cloud Messaging (cubre APNs) + SMS transaccional de respaldo | Implementa el mecanismo de contingencia de RF-12. |
| Autenticación | JWT de vida corta con refresh rotativo, argon2id, TOTP para MFA, autorización con CASL | MFA exigido en RF-13; CASL modela de forma explícita las denegaciones de las historias de usuario. |
| Auditoría inmutable | Tabla append-only con hash encadenado SHA-256; rol de base de datos sin permisos UPDATE/DELETE | Cumple RNF-08 y respalda el valor probatorio de RF-16. |
| Cifrado | TLS 1.3; AES-256-GCM a nivel de campo; S3 con SSE-KMS y URLs prefirmadas de pocos segundos | RNF-01 y RNF-09 (expediente biométrico y fotografías). |
| Reportes | pdfmake o Puppeteer + firma digital; ExcelJS | Exportación PDF/Excel de RF-16. |
| Observabilidad | OpenTelemetry, Prometheus/Grafana, Sentry | Necesaria para demostrar el SLA de RNF-03. |

### A.3 Stack de frontend

Se organiza un monorepo pnpm + Turborepo con tres aplicaciones y paquetes compartidos.

| Aplicación | Tecnología | Decisiones clave |
|---|---|---|
| App Monitora | React Native + Expo (development build) | Escaneo QR con react-native-vision-camera (menos de 2 s). Persistencia offline con op-sqlite + SQLCipher y patrón outbox con identificadores UUID v7 como llave de idempotencia (RF-10, RNF-06). El QR del carné se firma con Ed25519 y la app descarga la lista nominal y la clave pública al abrir la sesión de ruta, de modo que RF-02 se valida sin conexión. Botones de 48 px y alto contraste (RNF-04). Bloqueo de capturas con expo-screen-capture. |
| App Acudiente | React Native + Expo (misma base de código, aplicación separada) | Separarla de la app de monitoras reduce la superficie de ataque. Mapa vectorial con MapLibre (RF-19). Canales de notificación de alta prioridad en Android; en iOS, alertas time-sensitive o Critical Alerts previa aprobación de Apple (RF-20). |
| Portal Web | Next.js + Tailwind CSS + shadcn/ui | TanStack Query y Table, React Hook Form + Zod, Recharts. Diseñador de rutas con MapLibre GL JS + Terra Draw y motor de rutas Valhalla/OSRM (RF-17). Carga CSV con Papaparse y validación definitiva en servidor (RF-01). |
| Paquetes compartidos | contracts, domain, ui | contracts: OpenAPI generado desde NestJS con cliente tipado (Orval). domain: máquina de estados del estudiante (sección 4 del SRS) en TypeScript puro o XState, reutilizada por API y aplicaciones para mantener la regla en un único lugar. |

### A.4 Infraestructura y DevOps
Despliegue objetivo en contenedores Docker sobre AWS ECS Fargate, con Amazon RDS for PostgreSQL (PostGIS, Multi-AZ), ElastiCache (Redis), S3 con cifrado KMS, CloudFront y Secrets Manager. Para la fase académica o piloto es suficiente Docker Compose en un VPS o una plataforma como Railway o Fly.io, manteniendo la arquitectura objetivo documentada. El pipeline de GitHub Actions ejecuta análisis estático, pruebas, escaneo de dependencias, construcción de imágenes y despliegue sin interrupción de servicio.

### A.5 Metodología y aseguramiento de calidad
*   Scrum con sprints de dos semanas, tablero en GitHub Projects, Conventional Commits y flujo trunk-based con solicitudes de cambio pequeñas.
*   ADR (Architecture Decision Records) en el directorio /docs/adr para registrar cada decisión técnica relevante.
*   Pirámide de pruebas: Vitest/Jest (unitarias), Testcontainers con PostgreSQL + PostGIS reales (integración), Playwright (web), Maestro (extremo a extremo móvil) y k6 (carga y verificación de los 2.5 s de RNF-05).
*   Revisión de código obligatoria, cobertura mínima en módulos de Custodia y Telemetría, y análisis de dependencias en cada integración.

### A.6 Matriz de trazabilidad: requisito y decisión técnica

| Requisito | Decisión técnica que lo satisface |
|---|---|
| RF-01 Matrícula y cupos | Carga CSV/Excel (Papaparse + validación en NestJS); restricciones únicas en PostgreSQL para documento y cupo por franja horaria. |
| RF-02/RF-03 QR y capacidad | Vision Camera; QR firmado Ed25519 verificable offline; contador de ocupación en el dominio compartido, sin override desde el dispositivo. |
| RF-04 Pasajeros ocasionales | QR provisional de un solo uso (identificador único y expiración); validación de cupo liberado y de 2 horas de antelación en el servidor. |
| RF-05 Registro fotográfico | S3 con SSE-KMS, cifrado AES-256-GCM de campos sensibles, URLs prefirmadas de corta vida y visor seguro. |
| RF-06/RF-07/RF-08 Custodia | Máquina de estados compartida; alertas bloqueantes definidas en el dominio; cada transición se registra en la auditoría con hash encadenado. |
| RF-09 GPS dedicado | Hardware fijo homologado + Traccar o gateway MQTT/HTTPS; ningún SDK de rastreo en teléfonos de conductores. |
| RF-10 Sincronización asíncrona | op-sqlite + SQLCipher, outbox con UUID v7, borrado solo tras HTTP 200/201 y compresión gzip ante saturación. |
| RF-11 Cercas virtuales y ETA | PostGIS (ST_DWithin) más ETA con Valhalla/OSRM; tarea programada en BullMQ. |
| RF-12/RF-20 Notificaciones | BullMQ + FCM con prioridad alta; SMS transaccional como respaldo; historial en base de datos. |
| RF-13 Roles y MFA | CASL para RBAC; TOTP para la Coordinadora; registro de decisiones en auditoría. |
| RF-14 Zona sin cobertura | Polígonos en PostGIS con aviso a 500 m; temporizador de 25 minutos en BullMQ que genera alarma de retraso anómalo. |
| RF-15 Separación de cobranza | Módulo y esquema de Cartera aislados con permisos propios; la API de abordaje no expone campos de mora. |
| RF-16 Auditoría e incidentes | Tabla append-only con hash encadenado; pdfmake/Puppeteer con firma digital; ExcelJS. |
| RF-17 Rutas | MapLibre GL JS + Terra Draw; Valhalla para ajustar la polilínea a la vía; validación de coordenadas y perímetro en PostGIS. |
| RF-18 Desvíos | ST_Distance sobre geography contra la polilínea oficial; alerta tras N lecturas consecutivas fuera del corredor (histéresis). |
| RF-19 Mapa en tiempo real | MapLibre; WebSocket con salas por rol; autorización por estudiante y estado verificada en el servidor (RN-07). |
| RNF-01 Seguridad de datos | TLS 1.3, AES-256, mínimo privilegio con CASL y roles de base de datos separados. |
| RNF-02 Privacidad por rol | Filtros por acudiente en la capa de aplicación y Row Level Security de PostgreSQL como segunda barrera. |
| RNF-03 Disponibilidad 99.9% | ECS multi-AZ, RDS Multi-AZ, health checks y despliegues rolling; monitoreo con alertas en la ventana 05:00 a 19:30. |
| RNF-04 Usabilidad móvil | Sistema de diseño con objetivos táctiles de 48 px, alto contraste y operación a una mano. |
| RNF-05 Latencia de notificación | FCM de alta prioridad, cola dedicada y pruebas de carga con k6. |
| RNF-06 Persistencia offline | SQLite cifrado con SQLCipher y cola FIFO protegida (outbox). |
| RNF-07 No intrusión laboral | Telemetría exclusivamente desde hardware del vehículo; la app de monitora no recolecta ubicación continua. |
| RNF-08 Inmutabilidad | Hash encadenado, rol de base de datos sin UPDATE/DELETE y soft-delete auditado. |
| RNF-09 Protección de rostros | Visor seguro, URLs efímeras, expo-screen-capture (ver observación A.7.5). |

### A.7 Observaciones y riesgos identificados sobre el SRS

1. **Histéresis en RF-18.** El documento define una tolerancia de 150 m y una alerta a partir de 300 m. Se recomienda especificar cuántas lecturas consecutivas fuera del corredor disparan la alerta para evitar falsos positivos en curvas y cañones urbanos.
2. **Notificaciones con la monitora sin señal.** Si el abordaje se registra durante un tramo sin cobertura (RF-10), el acudiente recibirá el push diferido hasta la sincronización. Debe aclararse que la notificación llevará la hora real del evento y no la hora de envío.
3. **Ley 1581 de 2012 y alojamiento en la nube.** Almacenar datos de menores en un servidor fuera de Colombia constituye transferencia internacional de datos personales. Debe verificarse el requisito aplicable ante la Superintendencia de Industria y Comercio o seleccionar la región con criterio documentado.
4. **Alcance del SLA de RNF-03.** Un 99.9% dentro de la ventana de 05:00 a 19:30 equivale a unos 20 minutos de indisponibilidad tolerable al mes. Exige base de datos Multi-AZ y despliegues sin interrupción.
5. **Captura de pantalla en iOS (RNF-09).** En Android el bloqueo es robusto; en iOS el sistema solo permite detectar la captura y ocultar el contenido, no impedirla por completo. Se sugiere reformular el requisito como "mitigar" y no como "bloquear" para no comprometer un criterio que no puede verificarse al 100%.
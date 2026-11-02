# Seguridad

- No se usan tokens en localStorage.
- No se publican secretos ni claves en el repositorio.
- El acceso al mapa y a telemetría está condicionado por permisos del backend y el estado del estudiante.
- Los datos sensibles del usuario nunca deben persistirse en claro ni registrar en logs.
- Cualquier decisión que dependa del backend se deja documentada como pendiente si no existe contrato formal.

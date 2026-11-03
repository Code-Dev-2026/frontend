# Constitución del frontend

1. **La spec manda.** Sin trazabilidad a `RF/RNF/RN/HU`, no se implementa.
2. **Privacidad por diseño.** Mínimo dato, mínimo privilegio, aislamiento por rol (RNF-01, RNF-02).
3. **Seguridad verificable.** Tokens fuera del navegador, entradas validadas, errores que no filtran datos.
4. **Offline sin mentir.** Cola FIFO y auditable; nunca se descarta un evento de custodia (RNF-06, RNF-08).
5. **Contratos explícitos.** No se inventan endpoints, eventos ni estados: se leen del contrato y del SRS.
6. **Verificación y aprobación humana.** Nada se cierra sin prueba, revisión y aprobación del responsable.

> Una divergencia se resuelve con un ADR, no eligiendo la fuente que convenga (ADR 0005).

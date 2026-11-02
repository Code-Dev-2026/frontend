#!/usr/bin/env bash
set -Eeuo pipefail

fail=0

if grep -RIn "localStorage\|sessionStorage" src . 2>/dev/null; then
  echo "ERROR: no está permitido guardar tokens o datos sensibles en localStorage/sessionStorage." >&2
  fail=1
fi

if grep -RIn "mqtt" src . 2>/dev/null; then
  echo "ERROR: no está permitido usar MQTT en clientes frontend." >&2
  fail=1
fi

if grep -RIn "navigator\.geolocation\|Geolocation" src . 2>/dev/null; then
  echo "ERROR: no se permite geolocalización continua en móviles." >&2
  fail=1
fi

if [ $fail -ne 0 ]; then
  exit 1
fi

echo "OK: invariantes frontend cubiertos."

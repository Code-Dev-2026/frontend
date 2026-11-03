// El espejo del backend (docs/backend-ref/**) y la copia histórica del arnés
// (docs/harness/frontend-bootstrap/**) no se formatean: el primero debe seguir
// siendo byte-idéntico a su fuente y el segundo es histórico.
//
// lint-staged entrega rutas absolutas, así que se normaliza y se busca el
// segmento en cualquier posición (no solo al inicio).
const SKIP = ["docs/backend-ref/", "docs/harness/frontend-bootstrap/"];

const isSkipped = (file) => {
  const normalized = `/${file.replace(/\\/g, "/").replace(/^\/+/, "")}`;
  return SKIP.some((prefix) => normalized.includes(`/${prefix}`));
};

module.exports = {
  "**/*.{ts,tsx,js,jsx,json,md}": (files) => {
    const targets = files.filter((file) => !isSkipped(file));
    if (targets.length === 0) return [];
    return [`prettier --write ${targets.map((file) => `"${file}"`).join(" ")}`];
  },
};

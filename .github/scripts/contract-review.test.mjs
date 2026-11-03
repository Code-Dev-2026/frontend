// Prueba local de .github/scripts/contract-review.mjs con una API GitHub simulada.
import http from "node:http";
import { spawn } from "node:child_process";

const script = process.argv[2];
if (!script) {
  console.error(
    "Uso: node contract-review.test.mjs <ruta-al-script> [ruta-del-contrato]",
  );
  process.exit(2);
}
const contractPath = process.argv[3] ?? "docs/contrato-backend-frontend.md";

const scenarios = {
  "solo-backend": {
    files: [contractPath],
    reviews: [{ user: { login: "Muchavisoy-20" }, state: "APPROVED" }],
    expected: 1,
  },
  "ambos-lados": {
    files: [contractPath, "README.md"],
    reviews: [
      { user: { login: "Muchavisoy-20" }, state: "APPROVED" },
      { user: { login: "Z-83" }, state: "APPROVED" },
    ],
    expected: 0,
  },
  "sin-contrato": {
    files: ["README.md"],
    reviews: [],
    expected: 0,
  },
  "aprobacion-revocada": {
    files: [contractPath],
    reviews: [
      { user: { login: "Muchavisoy-20" }, state: "APPROVED" },
      { user: { login: "Muchavisoy-20" }, state: "CHANGES_REQUESTED" },
      { user: { login: "Z-83" }, state: "APPROVED" },
    ],
    expected: 1,
  },
  "solo-frontend": {
    files: [contractPath],
    reviews: [{ user: { login: "jabv123" }, state: "APPROVED" }],
    expected: 1,
  },
  "login-mayusculas": {
    files: [contractPath],
    reviews: [
      { user: { login: "MUCHAVISOY-20" }, state: "APPROVED" },
      { user: { login: "Z-83" }, state: "APPROVED" },
    ],
    expected: 0,
  },
};

let current = "solo-backend";

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const scenario = scenarios[current];
  let body;
  if (url.pathname.endsWith("/files")) {
    body = scenario.files.map((filename) => ({ filename }));
  } else if (url.pathname.endsWith("/reviews")) {
    body = scenario.reviews;
  } else {
    response.writeHead(404).end("{}");
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;

let failures = 0;
for (const [name, scenario] of Object.entries(scenarios)) {
  current = name;
  const child = spawn(process.execPath, [script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GITHUB_TOKEN: "test-token",
      GITHUB_REPOSITORY: "Code-Dev-2026/backend",
      PR_NUMBER: "7",
      GITHUB_API_URL: `http://127.0.0.1:${port}`,
      GITHUB_STEP_SUMMARY: "",
    },
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const status = await new Promise((resolve) => child.on("close", resolve));
  const ok = status === scenario.expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${name} (esperado ${scenario.expected}, obtenido ${status})`,
  );
  if (!ok) {
    console.log(stdout.trim());
    console.log(stderr.trim());
  }
}

server.close();
process.exit(failures === 0 ? 0 : 1);

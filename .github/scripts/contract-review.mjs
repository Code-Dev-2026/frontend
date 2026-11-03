#!/usr/bin/env node
/**
 * Exige una aprobación de cada lado (backend y frontend) cuando un PR toca rutas
 * del contrato.
 *
 * Limitación que resuelve: en CODEOWNERS, una línea con varios dueños exige la
 * aprobación de UNO de ellos, no de uno por lado. Este check cuenta las
 * aprobaciones vigentes por persona y verifica que al menos un backend y un
 * frontend hayan aprobado.
 *
 * Variables:
 *   GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER, GITHUB_API_URL (opcional)
 *
 * El archivo de política se lee del commit base del PR, nunca del head, para
 * que un PR no pueda relajar sus propias reglas.
 */
import { appendFile, readFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.PR_NUMBER;
const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";

if (!token || !repository || !prNumber) {
  fail("Faltan GITHUB_TOKEN, GITHUB_REPOSITORY o PR_NUMBER.");
}

const POLICY_FILE = ".github/contract-reviewers.json";
const PER_PAGE = 100;

function fail(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

async function request(path) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} en ${path}`);
  }
  return response.json();
}

async function listAll(path) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const batch = await request(`${path}?per_page=${PER_PAGE}&page=${page}`);
    items.push(...batch);
    if (batch.length < PER_PAGE) return items;
  }
}

function globToRegExp(glob) {
  let pattern = "^";
  for (let index = 0; index < glob.length; index += 1) {
    const character = glob[index];
    if (character === "*") {
      if (glob[index + 1] === "*") {
        pattern += ".*";
        index += 1;
        if (glob[index + 1] === "/") index += 1;
      } else {
        pattern += "[^/]*";
      }
    } else if (character === "?") {
      pattern += "[^/]";
    } else {
      pattern += character.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`${pattern}$`);
}

async function loadPolicy() {
  let raw;
  try {
    raw = await readFile(POLICY_FILE, "utf8");
  } catch {
    fail(`No existe ${POLICY_FILE} en el commit base del PR.`);
  }
  const policy = JSON.parse(raw);
  if (!Array.isArray(policy.paths) || policy.paths.length === 0) {
    fail(`${POLICY_FILE} no declara rutas en "paths".`);
  }
  if (!policy.sides || Object.keys(policy.sides).length === 0) {
    fail(`${POLICY_FILE} no declara lados en "sides".`);
  }
  return policy;
}

async function main() {
  const policy = await loadPolicy();
  const matchers = policy.paths.map((glob) => globToRegExp(glob));

  const files = await listAll(`/repos/${repository}/pulls/${prNumber}/files`);
  const touched = files
    .map((file) => file.filename)
    .filter((filename) => matchers.some((matcher) => matcher.test(filename)));

  if (touched.length === 0) {
    await summary(
      `Sin cambios en el contrato (${policy.paths.join(", ")}). No requiere doble aprobación.`,
    );
    return;
  }

  const reviews = await listAll(
    `/repos/${repository}/pulls/${prNumber}/reviews`,
  );
  const latestByUser = new Map();
  for (const review of reviews) {
    if (review.user?.login) latestByUser.set(review.user.login, review.state);
  }
  const approved = new Set(
    [...latestByUser.entries()]
      .filter(([, state]) => state === "APPROVED")
      .map(([login]) => login),
  );

  const missing = [];
  const lines = [
    `Rutas del contrato modificadas:`,
    ...touched.map((file) => `- \`${file}\``),
    "",
  ];

  for (const [side, members] of Object.entries(policy.sides)) {
    const approver = members.find((member) => approved.has(member));
    if (approver) {
      lines.push(`- ${side}: aprobado por @${approver}`);
    } else {
      missing.push(side);
      lines.push(
        `- ${side}: **falta aprobación** (${members.map((member) => `@${member}`).join(", ")})`,
      );
    }
  }

  await summary(lines.join("\n"));

  if (missing.length > 0) {
    fail(
      `Falta la aprobación de: ${missing.join(", ")}. Una aprobación de CODEOWNERS no basta.`,
    );
  }
}

async function summary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
  }
  console.log(text);
}

main().catch((error) => fail(error.message));

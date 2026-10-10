import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDir = path.join(root, "documents/publication-rules");
const tempDir = path.join(root, "tmp/pdfs/publication-rules");
const metadataPath = path.join(root, "lib/publication-rules.json");
const config = JSON.parse(
  await readFile(path.join(sourceDir, "document.json"), "utf8"),
);
const source = await readFile(path.join(sourceDir, "content.md"), "utf8");
const outputPath = path.join(root, "public/documents", config.filename);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const normalize = (value) => value.replace(/\s/gu, "");
const command = process.argv[2] ?? "check";
assert.ok(
  ["build", "check", "preview"].includes(command),
  "Use build, check, or preview.",
);

function run(binary, args) {
  try {
    return execFileSync(binary, args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      env: { ...process.env, LC_ALL: "C" },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        `${binary} is required. See documents/publication-rules/README.md.`,
      );
    }
    throw error;
  }
}

function inspectSource() {
  const blocks = source.trim().split(/\r?\n\s*\r?\n/u);
  assert.match(blocks[0], /^# .+/u, "Document title is missing.");
  const edition = blocks[1];
  const date = edition.match(/(\d{4})年(\d{1,2})月(\d{1,2})日$/u);
  assert.ok(date, "The edition must end with the document date.");
  assert.doesNotMatch(
    edition,
    /\bv\d+(?:\.\d+)+\b/u,
    "Do not display a version number in the publication rules.",
  );
  assert.ok(
    blocks[2] && !blocks[2].startsWith("#"),
    "The preamble is missing.",
  );
  let articles = 0;
  let clauses = 0;
  let nextClause = 1;
  let annex = false;
  for (const block of blocks.slice(3)) {
    const article = block.match(/^## 第(\d+)条 [^\n]+$/u);
    const clause = block.match(/^(\d+)\. [\s\S]+$/u);
    if (article) {
      assert.ok(
        !annex && (articles === 0 || nextClause > 1),
        "Empty or misplaced article.",
      );
      assert.equal(
        Number(article[1]),
        ++articles,
        "Article numbering must be consecutive.",
      );
      nextClause = 1;
    } else if (clause) {
      assert.ok(articles > 0 && !annex, "Clause outside an article.");
      assert.equal(
        Number(clause[1]),
        nextClause++,
        "Clause numbering must be consecutive.",
      );
      clauses++;
    } else {
      assert.ok(
        block.startsWith("附則　") && !annex && block === blocks.at(-1),
        "Unexpected block: retain the simple source format documented in README.md.",
      );
      annex = true;
    }
  }
  assert.equal(
    articles,
    config.expectedArticles,
    "Article count changed; review document.json.",
  );
  assert.equal(
    clauses,
    config.expectedClauses,
    "Clause count changed; review document.json.",
  );
  assert.ok(nextClause > 1, "The final article is empty.");
  assert.equal(
    annex,
    config.expectedSupplementaryProvision,
    "Supplementary provision changed; review document.json.",
  );
  return {
    title: blocks[0].slice(2),
    edition,
    date: `${date[1]}-${date[2].padStart(2, "0")}-${date[3].padStart(2, "0")}`,
    articles,
    clauses,
  };
}

const document = inspectSource();
// All inputs are tracked, including the fonts, so building works offline.
const inputs = [
  "content.md",
  "design-spec.md",
  "layout.typ",
  "document.json",
  "fonts/NotoSansJP.ttf",
  "fonts/NotoSerifJP.ttf",
];
const fingerprint = createHash("sha256");
for (const name of inputs) {
  fingerprint.update(name).update(await readFile(path.join(sourceDir, name)));
}
fingerprint.update(await readFile(fileURLToPath(import.meta.url)));
const inputSha256 = fingerprint.digest("hex");

function verifyPdf(pdf) {
  const info = run("pdfinfo", [pdf]);
  assert.match(
    info,
    /Page size:\s+595\.\d+ x 841\.\d+ pts \(A4\)/u,
    "Use A4 portrait.",
  );
  assert.match(info, /Tagged:\s+yes/u, "Keep the PDF text accessible.");
  const pages = Number(info.match(/^Pages:\s+(\d+)/mu)?.[1]);
  assert.ok(pages > 0);
  const text = run("pdftotext", ["-layout", "-enc", "UTF-8", pdf, "-"]);
  const footer = /オシセン\s*2026\s*県議選版\s*\|\s*A\s*\|\s*(\d+)/gu;
  assert.deepEqual(
    [...text.matchAll(footer)].map((match) => Number(match[1])),
    Array.from({ length: pages }, (_, index) => index + 1),
    "Page numbering is incomplete.",
  );
  // Markdown's list-marker dot is syntax; the supplied PDF uses plain numbers.
  const expected = normalize(
    source.replace(/^#{1,2} /gmu, "").replace(/^(\d+)\. /gmu, "$1 "),
  );
  const actual = normalize(text.replace(footer, ""));
  if (expected !== actual) {
    let at = 0;
    while (
      expected[at] === actual[at] &&
      at < Math.min(expected.length, actual.length)
    )
      at++;
    throw new Error(
      `PDF text differs at character ${at}: source=${expected.slice(at, at + 50)}, PDF=${actual.slice(at, at + 50)}`,
    );
  }
  const fonts = run("pdffonts", [pdf]).trim().split("\n").slice(2);
  assert.ok(
    fonts.length >= 3,
    "Expected regular/bold headings and body fonts.",
  );
  for (const font of fonts) {
    assert.match(
      font,
      /\byes\s+yes\s+yes\s+\d+\s+\d+\s*$/u,
      "Every font must be embedded, subsetted, and have a Unicode map.",
    );
  }
  return { pages, characters: expected.length };
}

async function check() {
  const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
  assert.equal(
    metadata.inputSha256,
    inputSha256,
    "Document inputs changed. Run npm run documents:build.",
  );
  assert.equal(metadata.sourceSha256, sha256(source));
  assert.equal(
    metadata.pdfSha256,
    sha256(await readFile(outputPath)),
    "PDF changed. Run npm run documents:build.",
  );
  for (const [key, value] of Object.entries(document))
    assert.equal(metadata[key], value);
  assert.equal(metadata.href, `/documents/${config.filename}`);
  console.log(
    `Publication rules OK: ${metadata.articles} articles, ${metadata.clauses} clauses, ${metadata.pages} pages.`,
  );
}

if (command === "check") {
  await check();
} else {
  assert.match(
    run("typst", ["--version"]),
    new RegExp(`^typst ${config.typstVersion.replaceAll(".", "\\.")}\\b`),
    `Use Typst ${config.typstVersion} for reproducible layout.`,
  );
  await mkdir(tempDir, { recursive: true });
  const tempPdf = path.join(tempDir, config.filename);
  run("typst", [
    "compile",
    "--root",
    sourceDir,
    "--font-path",
    path.join(sourceDir, "fonts"),
    "--ignore-system-fonts",
    "--ignore-embedded-fonts",
    path.join(sourceDir, "layout.typ"),
    tempPdf,
  ]);
  const { pages, characters } = verifyPdf(tempPdf);
  const pdf = await readFile(tempPdf);
  // Only replace the distributed document after all text and font checks pass.
  await mkdir(path.dirname(outputPath), { recursive: true });
  await copyFile(tempPdf, outputPath);
  await mkdir(path.join(root, "output/pdf"), { recursive: true });
  await copyFile(tempPdf, path.join(root, "output/pdf", config.filename));
  await writeFile(
    metadataPath,
    JSON.stringify(
      {
        ...document,
        href: `/documents/${config.filename}`,
        pages,
        bytes: pdf.length,
        sourceSha256: sha256(source),
        inputSha256,
        pdfSha256: sha256(pdf),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `PDF generated: ${pages} pages, ${characters} characters, no text differences.`,
  );
  await check();
  if (command === "preview") {
    run("pdftoppm", [
      "-r",
      "120",
      "-png",
      outputPath,
      path.join(tempDir, "review"),
    ]);
    console.log(`Page previews: ${tempDir}/review-*.png`);
  }
}

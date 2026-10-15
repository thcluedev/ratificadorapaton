import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const src =
  process.argv[2] ||
  "/mnt/c/Users/matia/Desktop/RatificadoraPaton-logica-sistema.md";
const out =
  process.argv[3] ||
  "/mnt/c/Users/matia/OneDrive/Escritorio/RatificadoraPaton-logica-sistema.pdf";

const font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
const fontBold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const mono = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf";

const text = fs.readFileSync(src, "utf8");
const doc = new PDFDocument({ margin: 50, size: "A4" });
const stream = fs.createWriteStream(out);
doc.pipe(stream);

doc.registerFont("body", font);
doc.registerFont("bold", fontBold);
doc.registerFont("mono", mono);

const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function ensureSpace(h = 14) {
  if (doc.y + h > doc.page.height - doc.page.margins.bottom) doc.addPage();
}

for (const rawLine of text.split("\n")) {
  const line = rawLine.replace(/\*\*/g, "").replace(/`/g, "");
  if (line.startsWith("# ")) {
    ensureSpace(28);
    doc.font("bold").fontSize(16).text(line.slice(2), { width: pageWidth });
    doc.moveDown(0.4);
    continue;
  }
  if (line.startsWith("## ")) {
    ensureSpace(22);
    doc.moveDown(0.3);
    doc.font("bold").fontSize(13).text(line.slice(3), { width: pageWidth });
    doc.moveDown(0.2);
    continue;
  }
  if (line.startsWith("---")) {
    ensureSpace(10);
    doc.moveDown(0.2);
    doc
      .strokeColor("#cccccc")
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(0.4);
    continue;
  }
  if (line.trim() === "") {
    doc.moveDown(0.35);
    continue;
  }
  const isCode = line.startsWith(" ") || line.includes("→") || line.includes("/admin");
  ensureSpace(12);
  doc.font(isCode && line.startsWith(" ") ? "mono" : "body").fontSize(isCode ? 8.5 : 10);
  doc.text(line, { width: pageWidth, lineGap: 2 });
}

doc.end();

stream.on("finish", () => {
  console.log("PDF:", out);
});

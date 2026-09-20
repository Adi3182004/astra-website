import fs from "fs";

const svg = fs.readFileSync("frontend/public/priora-logo.svg", "utf-8");
const base64Svg = Buffer.from(svg).toString("base64");
const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

console.log("Data URI length:", dataUri.length);
fs.writeFileSync("backend/templates/logo-data-uri.txt", dataUri);

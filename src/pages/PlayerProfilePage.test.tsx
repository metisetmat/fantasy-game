import { readFileSync } from "node:fs";
import { join } from "node:path";

const pageSource = readFileSync(join(__dirname, "PlayerProfilePage.tsx"), "utf8");

if (!pageSource.includes("PlayerRoleFitSection") || !pageSource.includes("createMilanPlayerRoleFitProfile")) {
  throw new Error("PlayerProfilePage must render PlayerRoleFitSection from a selector-built player role fit profile.");
}

if (pageSource.includes("computeRoleFit") || pageSource.includes("compareRoleFits")) {
  throw new Error("PlayerProfilePage must not compute role fit directly.");
}

import type { Unit } from "@/lib/domain-types";

export type SweetBoxSourceLine = {
  category?: string | null;
  unit?: Unit | string | null;
  quantity: number;
};

export type SweetBoxLine = {
  name: string;
  inventoryName: string;
  quantity: number;
  unit: Unit;
};

function isSweetKgLine(line: SweetBoxSourceLine) {
  return String(line.category ?? "").toLowerCase().includes("sweet") && String(line.unit ?? "").toUpperCase() === "KG";
}

export function calculateSweetBoxLines(lines: SweetBoxSourceLine[]) {
  let oneKgBoxes = 0;
  let twoKgBoxes = 0;

  for (const line of lines) {
    if (!isSweetKgLine(line)) continue;

    let remainingKg = Math.max(Number(line.quantity) || 0, 0);
    const fullTwoKgBoxes = Math.floor(remainingKg / 2);
    twoKgBoxes += fullTwoKgBoxes;
    remainingKg -= fullTwoKgBoxes * 2;

    if (remainingKg > 0) {
      oneKgBoxes += Math.ceil(remainingKg);
    }
  }

  const boxes: SweetBoxLine[] = [];
  if (twoKgBoxes > 0) {
    boxes.push({
      name: "Sweet Box 2 KG (auto)",
      inventoryName: "Sweet Box 2 KG",
      quantity: twoKgBoxes,
      unit: "PIECE"
    });
  }
  if (oneKgBoxes > 0) {
    boxes.push({
      name: "Sweet Box 1 KG (auto)",
      inventoryName: "Sweet Box 1 KG",
      quantity: oneKgBoxes,
      unit: "PIECE"
    });
  }

  return boxes;
}

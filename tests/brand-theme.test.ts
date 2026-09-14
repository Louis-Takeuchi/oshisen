import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

function luminance(hex: string): number {
  const values = hex.match(/[a-f0-9]{2}/gi)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}

test("POP text and controls retain readable contrast on brand surfaces", async () => {
  const css = await readFile(
    new URL("../app/pop-theme.css", import.meta.url),
    "utf8",
  );
  const colors = new Map(
    Array.from(css.matchAll(/--([\w-]+):\s*(#[a-f0-9]{6})\s*;/gi), (match) => [
      match[1],
      match[2],
    ]),
  );
  colors.set("white", "#ffffff");
  for (const foreground of ["ink", "muted", "blue"]) {
    for (const background of [
      "white",
      "paper",
      "yellow",
      "blue-soft",
      "pink-soft",
      "yellow-soft",
    ]) {
      assert.ok(colors.has(foreground) && colors.has(background));
      const first = luminance(colors.get(foreground)!);
      const second = luminance(colors.get(background)!);
      const ratio =
        (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
      assert.ok(
        ratio >= 4.5,
        `${foreground} on ${background}: ${ratio.toFixed(2)}:1`,
      );
    }
  }
});

test("every route receives the POP theme after the existing base styles", async () => {
  const layout = await readFile(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );
  const base = layout.indexOf('import "./globals.css"');
  const theme = layout.indexOf('import "./pop-theme.css"');
  assert.ok(base >= 0 && theme > base);
  const shell = await readFile(
    new URL("../components/site-shell.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(Array.from(shell.matchAll(/src="\/brand-logo.png"/g)).length, 2);
  assert.doesNotMatch(shell, /logo-period/);
});

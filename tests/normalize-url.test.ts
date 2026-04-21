import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl } from "../src/domain/rules/normalize-url.js";

test("normalizeUrl removes query and hash and lowercases host", () => {
  assert.equal(
    normalizeUrl("HTTPS://Example.COM/path/?a=1#hello"),
    "https://example.com/path"
  );
});

test("normalizeUrl keeps root slash", () => {
  assert.equal(normalizeUrl("https://example.com/?foo=bar"), "https://example.com/");
});

test("normalizeUrl trims surrounding spaces", () => {
  assert.equal(normalizeUrl("  https://example.com/docs/  "), "https://example.com/docs");
});

import test from "node:test";
import assert from "node:assert/strict";
import { installChromeMock, readPinbaseStore, resetChromeMock } from "./helpers/chrome.js";
import { addCategory, DuplicateCategoryError } from "../src/application/use-cases/add-category.js";
import { deleteCategory, ProtectedCategoryError } from "../src/application/use-cases/delete-category.js";
import { renameCategory } from "../src/application/use-cases/rename-category.js";

installChromeMock();

test.beforeEach(() => {
  resetChromeMock({
    pinbase: {
      sites: [
        {
          id: "site-1",
          title: "Figma",
          url: "https://figma.com",
          normalizedUrl: "https://figma.com/",
          categories: ["笔记"],
          note: "",
          createdAt: 1,
          lastOpenedAt: 1
        }
      ],
      categories: [
        { name: "开发", builtIn: true, createdAt: 1 },
        { name: "UI", builtIn: true, createdAt: 2 },
        { name: "笔记", builtIn: true, createdAt: 3 },
        { name: "其他", builtIn: true, createdAt: 4 }
      ],
      ui: {
        lastSelectedCategory: "笔记"
      }
    }
  });
});

test("addCategory rejects duplicate names ignoring case", async () => {
  await assert.rejects(() => addCategory("ui"), DuplicateCategoryError);
});

test("renameCategory updates categories in sites and ui memory", async () => {
  await renameCategory("笔记", "灵感");

  const storage = readPinbaseStore();
  assert.ok(storage);
  assert.equal(storage.ui.lastSelectedCategory, "灵感");
  assert.equal(storage.sites[0].categories[0], "灵感");
  assert.ok(storage.categories.some((item: { name: string }) => item.name === "灵感"));
});

test("deleteCategory moves sites into fallback category", async () => {
  await deleteCategory("笔记");

  const storage = readPinbaseStore();
  assert.ok(storage);
  assert.equal(storage.ui.lastSelectedCategory, "全部");
  assert.equal(storage.sites[0].categories[0], "其他");
  assert.ok(!storage.categories.some((item: { name: string }) => item.name === "笔记"));
});

test("deleteCategory protects fallback category", async () => {
  await assert.rejects(() => deleteCategory("其他"), ProtectedCategoryError);
});

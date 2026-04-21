import test from "node:test";
import assert from "node:assert/strict";
import { installChromeMock, readPinbaseStore, resetChromeMock } from "./helpers/chrome.js";
import { addSite, DuplicateSiteError, InvalidSiteError } from "../src/application/use-cases/add-site.js";
import { updateSite } from "../src/application/use-cases/update-site.js";
import { querySites } from "../src/application/use-cases/query-sites.js";

installChromeMock();

test.beforeEach(() => {
  resetChromeMock({
    pinbase: {
      sites: [],
      categories: [
        { name: "开发", builtIn: true, createdAt: 1 },
        { name: "UI", builtIn: true, createdAt: 2 },
        { name: "笔记", builtIn: true, createdAt: 3 },
        { name: "其他", builtIn: true, createdAt: 4 }
      ],
      ui: {
        lastSelectedCategory: "全部"
      }
    }
  });
});

test("addSite saves normalized url and trimmed values", async () => {
  const site = await addSite({
    title: "  ChatGPT  ",
    url: "https://chat.openai.com/?a=1#hash",
    note: "  daily  ",
    category: "开发"
  });

  assert.equal(site.title, "ChatGPT");
  assert.equal(site.normalizedUrl, "https://chat.openai.com/");
  assert.equal(site.note, "daily");
  assert.deepEqual(site.categories, ["开发"]);

  const storage = readPinbaseStore();
  assert.ok(storage);
  assert.equal(storage.sites.length, 1);
});

test("addSite rejects duplicate normalized urls", async () => {
  await addSite({
    title: "ChatGPT",
    url: "https://chat.openai.com/",
    note: "",
    category: "其他"
  });

  await assert.rejects(
    () =>
      addSite({
        title: "ChatGPT again",
        url: "https://chat.openai.com/?x=1",
        note: "",
        category: "其他"
      }),
    DuplicateSiteError
  );
});

test("updateSite rejects invalid input and duplicate target url", async () => {
  await addSite({
    title: "One",
    url: "https://one.example.com",
    note: "",
    category: "开发"
  });
  await addSite({
    title: "Two",
    url: "https://two.example.com",
    note: "",
    category: "UI"
  });

  const sites = await querySites();
  const one = sites.find((item) => item.title === "One");
  const two = sites.find((item) => item.title === "Two");
  assert.ok(one);
  assert.ok(two);

  await assert.rejects(
    () =>
      updateSite({
        id: one.id,
        title: "",
        url: one.url,
        note: "",
        category: "开发"
      }),
    InvalidSiteError
  );

  await assert.rejects(
    () =>
      updateSite({
        id: one.id,
        title: "One changed",
        url: two.url,
        note: "",
        category: "开发"
      }),
    DuplicateSiteError
  );
});

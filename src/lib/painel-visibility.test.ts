import { describe, it, expect } from "vitest";
import {
  ANALYSIS_TABS,
  hasAgravoSelected,
  shouldRunAgravoQuery,
  shouldShowPlaceholder,
} from "./painel-visibility";

describe("painel visibility gating", () => {
  it("treats empty/all/nullish as no selection", () => {
    expect(hasAgravoSelected("")).toBe(false);
    expect(hasAgravoSelected("all")).toBe(false);
    expect(hasAgravoSelected(null)).toBe(false);
    expect(hasAgravoSelected(undefined)).toBe(false);
    expect(hasAgravoSelected("dengue")).toBe(true);
  });

  it("shows placeholder on every analysis tab when no agravo is chosen", () => {
    for (const tab of ANALYSIS_TABS) {
      expect(shouldShowPlaceholder(tab, "")).toBe(true);
      expect(shouldShowPlaceholder(tab, "all")).toBe(true);
    }
  });

  it("hides placeholder on every analysis tab when an agravo is chosen", () => {
    for (const tab of ANALYSIS_TABS) {
      expect(shouldShowPlaceholder(tab, "dengue")).toBe(false);
    }
  });

  it("only enables the query matching the selected agravo", () => {
    expect(shouldRunAgravoQuery("dengue", "dengue")).toBe(true);
    expect(shouldRunAgravoQuery("dengue", "meningite")).toBe(false);
    expect(shouldRunAgravoQuery("", "dengue")).toBe(false);
    expect(shouldRunAgravoQuery("all", "dengue")).toBe(false);
  });

  it("select -> clear cycle returns every tab to the placeholder", () => {
    // simulate a user session: nothing selected, pick dengue, then clear
    let selected: string = "";
    for (const tab of ANALYSIS_TABS) {
      expect(shouldShowPlaceholder(tab, selected)).toBe(true);
    }

    selected = "dengue";
    for (const tab of ANALYSIS_TABS) {
      expect(shouldShowPlaceholder(tab, selected)).toBe(false);
    }
    // only the matching query runs
    expect(shouldRunAgravoQuery(selected, "dengue")).toBe(true);
    expect(shouldRunAgravoQuery(selected, "coqueluche")).toBe(false);

    selected = ""; // clear button
    for (const tab of ANALYSIS_TABS) {
      expect(shouldShowPlaceholder(tab, selected)).toBe(true);
    }
    // and no queries should run anymore
    expect(shouldRunAgravoQuery(selected, "dengue")).toBe(false);
  });
});

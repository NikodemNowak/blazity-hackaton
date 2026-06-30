import { describe, it, expect } from "vitest";
import { parseRepoUrl } from "../github";

describe("parseRepoUrl", () => {
  describe("valid HTTPS URLs", () => {
    it("extracts owner and repo from a plain HTTPS URL", () => {
      expect(parseRepoUrl("https://github.com/facebook/react")).toEqual({
        owner: "facebook",
        repo: "react",
      });
    });

    it("strips a .git suffix when it is at the end of the URL", () => {
      expect(parseRepoUrl("https://github.com/owner/repo.git")).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("extracts owner+repo and ignores extra path segments after the repo", () => {
      expect(parseRepoUrl("https://github.com/owner/repo/tree/main")).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("accepts names with hyphens, dots, and underscores", () => {
      expect(parseRepoUrl("https://github.com/my-org/my.repo_name")).toEqual({
        owner: "my-org",
        repo: "my.repo_name",
      });
    });

    it("trims leading and trailing whitespace", () => {
      expect(parseRepoUrl("  https://github.com/owner/repo  ")).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });
  });

  describe("valid SSH-style URLs", () => {
    it("extracts owner and repo from git@ SSH URL", () => {
      // The regex matches github.com[/:] so the colon in git@github.com:owner/repo is accepted.
      expect(parseRepoUrl("git@github.com:owner/repo")).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });

    it("strips .git suffix from SSH URL", () => {
      expect(parseRepoUrl("git@github.com:owner/repo.git")).toEqual({
        owner: "owner",
        repo: "repo",
      });
    });
  });

  describe("rejection: non-GitHub hosts", () => {
    it("throws for a GitLab URL", () => {
      expect(() => parseRepoUrl("https://gitlab.com/owner/repo")).toThrow(
        "Not a GitHub repo URL",
      );
    });

    it("throws for a bare non-URL string", () => {
      expect(() => parseRepoUrl("not-a-url")).toThrow("Not a GitHub repo URL");
    });

    it("throws for an empty string", () => {
      expect(() => parseRepoUrl("")).toThrow("Not a GitHub repo URL");
    });
  });

  describe("rejection: path-traversal and invalid segments", () => {
    it("throws when the owner segment is '..'  (traversal)", () => {
      // URL parses as owner=".." → safeSegment rejects ".."
      expect(() => parseRepoUrl("https://github.com/../x")).toThrow(
        "Invalid repo owner/name",
      );
    });

    it("throws when the owner segment is '.' (traversal)", () => {
      // URL parses as owner="." → safeSegment rejects "."
      expect(() => parseRepoUrl("https://github.com/./repo")).toThrow(
        "Invalid repo owner/name",
      );
    });

    it("throws when the repo segment is '..'", () => {
      expect(() => parseRepoUrl("https://github.com/owner/..")).toThrow(
        "Invalid repo owner/name",
      );
    });

    it("throws when the owner contains characters outside [A-Za-z0-9._-]", () => {
      expect(() =>
        parseRepoUrl("https://github.com/own!er/repo"),
      ).toThrow("Invalid repo owner/name");
    });

    it("throws when the repo contains characters outside [A-Za-z0-9._-]", () => {
      expect(() =>
        parseRepoUrl("https://github.com/owner/repo!"),
      ).toThrow("Invalid repo owner/name");
    });

    it("throws when the owner contains a space", () => {
      expect(() =>
        parseRepoUrl("https://github.com/own er/repo"),
      ).toThrow("Invalid repo owner/name");
    });
  });
});

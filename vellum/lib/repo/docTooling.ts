import type { RepoBundle } from "./types";

export interface LanguageProfile {
  language: string;
  files: number;
  tooling: string;
  conventions: string[];
  docTargets: string[];
}

const EXTENSIONS: Record<string, string> = {
  ".py": "Python",
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".kts": "Kotlin",
  ".cs": "C#",
  ".php": "PHP",
  ".rb": "Ruby",
  ".swift": "Swift",
  ".md": "Markdown",
};

const TOOLING: Record<string, Omit<LanguageProfile, "files">> = {
  Python: {
    language: "Python",
    tooling: "pydoc + docstrings",
    conventions: [
      "derive module and class summaries from importable Python modules",
      "treat triple-quoted docstrings as canonical descriptions",
      "document public functions with parameters, return values, and raised exceptions",
    ],
    docTargets: ["module overview", "public classes", "public functions", "CLI entry points"],
  },
  TypeScript: {
    language: "TypeScript",
    tooling: "TypeDoc + TSDoc/JSDoc",
    conventions: [
      "derive API surfaces from exported types, functions, components, and route handlers",
      "prefer explicit TypeScript signatures over inferred prose",
      "document props, request/response contracts, and important generics",
    ],
    docTargets: ["exports", "React components", "API routes", "shared types"],
  },
  JavaScript: {
    language: "JavaScript",
    tooling: "JSDoc",
    conventions: [
      "derive public behavior from module exports and route handlers",
      "use existing JSDoc comments when present",
      "document expected object shapes when types are implicit",
    ],
    docTargets: ["exports", "functions", "API routes", "configuration"],
  },
  Go: {
    language: "Go",
    tooling: "godoc / pkg.go.dev",
    conventions: [
      "organize documentation by package",
      "use exported identifiers as the public API boundary",
      "document command packages separately from libraries",
    ],
    docTargets: ["packages", "exported types", "exported functions", "commands"],
  },
  Rust: {
    language: "Rust",
    tooling: "rustdoc",
    conventions: [
      "organize documentation by crate and module",
      "treat public items and trait implementations as the API boundary",
      "include examples only when supported by visible code",
    ],
    docTargets: ["crates", "modules", "public structs/enums", "traits", "functions"],
  },
  Java: {
    language: "Java",
    tooling: "Javadoc",
    conventions: [
      "organize documentation by package and class",
      "document public classes, methods, parameters, return values, and exceptions",
      "respect annotations and framework conventions visible in code",
    ],
    docTargets: ["packages", "classes", "public methods", "exceptions"],
  },
  Kotlin: {
    language: "Kotlin",
    tooling: "Dokka / KDoc",
    conventions: [
      "organize documentation by package and declaration",
      "document public classes, functions, properties, and coroutine behavior",
      "prefer KDoc-style parameter and return descriptions",
    ],
    docTargets: ["packages", "classes", "functions", "properties"],
  },
  "C#": {
    language: "C#",
    tooling: "XML documentation comments / DocFX",
    conventions: [
      "organize documentation by namespace and public type",
      "document public members, parameters, return values, and exceptions",
      "surface framework attributes that affect behavior",
    ],
    docTargets: ["namespaces", "classes", "interfaces", "public members"],
  },
  PHP: {
    language: "PHP",
    tooling: "phpDocumentor / PHPDoc",
    conventions: [
      "organize documentation by namespace and class",
      "document functions, methods, parameters, return types, and thrown exceptions",
      "respect framework conventions visible in code",
    ],
    docTargets: ["namespaces", "classes", "functions", "methods"],
  },
  Ruby: {
    language: "Ruby",
    tooling: "RDoc / YARD",
    conventions: [
      "organize documentation by module and class",
      "document public methods and DSL entry points",
      "use existing comments as canonical descriptions when present",
    ],
    docTargets: ["modules", "classes", "public methods", "DSLs"],
  },
  Swift: {
    language: "Swift",
    tooling: "DocC",
    conventions: [
      "organize documentation by module and public declaration",
      "document public types, functions, properties, and protocol conformances",
      "include platform/framework context visible in code",
    ],
    docTargets: ["modules", "public types", "functions", "protocols"],
  },
  Markdown: {
    language: "Markdown",
    tooling: "Markdown structure analysis",
    conventions: [
      "treat existing README/docs as source material, not proof of code behavior",
      "preserve accurate headings and remove stale claims when contradicted by code",
      "cross-reference code-backed sections with file citations",
    ],
    docTargets: ["README", "guides", "existing docs"],
  },
};

function ext(path: string): string {
  const match = path.toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] ?? "";
}

export function detectLanguageProfiles(bundle: RepoBundle): LanguageProfile[] {
  const counts = new Map<string, number>();
  for (const file of bundle.files) {
    const language = EXTENSIONS[ext(file.path)];
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([language, files]) => {
      const base = TOOLING[language] ?? {
        language,
        tooling: "language-native documentation conventions",
        conventions: ["derive documentation from public code surfaces and comments"],
        docTargets: ["public API", "configuration", "entry points"],
      };
      return { ...base, files };
    });
}

export function describeLanguageProfiles(profiles: LanguageProfile[]): string {
  if (profiles.length === 0) {
    return [
      "No dominant programming language was detected from loaded files.",
      "Use generic repository documentation conventions and call out uncertainty.",
    ].join("\n");
  }

  return profiles
    .map((profile) =>
      [
        `Language: ${profile.language} (${profile.files} loaded files)`,
        `Documentation tooling: ${profile.tooling}`,
        `Targets: ${profile.docTargets.join(", ")}`,
        `Conventions:\n${profile.conventions.map((c) => `- ${c}`).join("\n")}`,
      ].join("\n"),
    )
    .join("\n\n");
}

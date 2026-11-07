import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: [
      "/apps/web/src/routeTree.gen.ts",
      "/packages/db/drizzle",
      "/.agents/skills",
      "/.claude/skills",
      // We use syncpack to format package.json since it also orders the scripts alphabetically.
      "**/package.json",
    ],
    overrides: [
      {
        files: ["*.json", "*.jsonc"],
        options: {
          // Disable trailing commas in JSON and JSONC files because the oxfmt CLI tool
          // removes trailing commas from these files regardless of configuration.
          trailingComma: "none",
        },
      },
    ],
    sortImports: {},
  },
  lint: {
    options: {
      denyWarnings: true,
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
});

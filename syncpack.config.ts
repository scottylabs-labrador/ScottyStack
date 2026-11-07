export default {
  // https://stackoverflow.com/questions/79470698/with-syncpack-on-a-turborepo-how-to-set-app-version-dependencies-through-a-packa/79477388#79477388
  versionGroups: [
    {
      label: "use workspace protocol for local dependencies",
      packages: ["**"],
      dependencies: ["$LOCAL"],
      dependencyTypes: ["!local"],
      pinVersion: "workspace:*",
    },
  ],
  // https://jamiemason.github.io/syncpack/semver-groups/
  semverGroups: [
    {
      // Vite+ bundles Oxlint. A minor bump can introduce new lint rules.
      // Reference: https://oxc.rs/docs/guide/usage/linter/versioning.html#what-to-expect-from-new-versions
      dependencies: ["vite-plus"],
      dependencyTypes: ["dev"],
      range: "~",
    },
    {
      // https://viteplus.dev/guide/local-cli#manual-installation
      dependencies: ["vite", "vitest"],
      dependencyTypes: ["dev"],
      range: "",
    },
    {
      dependencyTypes: ["prod", "resolutions", "overrides", "pnpmOverrides", "local"],
      range: "^",
    },
    {
      dependencyTypes: ["dev"],
      range: "^",
    },
    {
      dependencyTypes: ["peer"],
      range: "^",
    },
  ],
} satisfies import("syncpack").RcFile;

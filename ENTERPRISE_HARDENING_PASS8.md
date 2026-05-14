# Enterprise hardening pass 8

This pass makes the runtime and CI scripts less shell-fragile by invoking Prisma, TypeScript,
Next.js, and tsx through explicit Node entrypoints. It also adds a postinstall Prisma client
generation step and tightens the prospect service typing to reduce strict TypeScript failures.

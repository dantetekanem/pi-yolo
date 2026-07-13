# pi-yolo

A small [Pi](https://github.com/earendil-works/pi-mono) extension that adds `/yolo`: one command for a verified commit-and-push cycle followed by a complete deployment from `main`, a pull/merge request from any other branch, or a proven repository-defined no-deployment outcome on `main`.

`/yolo` is intentionally provider-neutral. It discovers and follows the current repository's own instructions, scripts, CI/CD configuration, deployment target, health checks, and rollback procedure. Kamal is supported when the project configures it, but is never assumed.

## Install

```sh
pi install git:github.com/dantetekanem/pi-yolo
```

Restart Pi or run `/reload`, then invoke:

```text
/yolo
```

The command accepts no arguments.

## What it does

1. Binds every Git action to the exact root/worktree containing the invocation folder, then validates branch, remote, upstream, status, and applicable nested project instructions.
2. Discovers release conventions and runs change-relevant verification, including every documented or available typecheck command (or records evidence that none exists).
3. Stages the intended diff, creates one commit, pushes without force, and observes required CI checks and gates without rechecking evidence already returned by successful local tools.
4. Only on `main`, completes and verifies the established deployment. On every non-`main` branch, runs no deployment operation and creates or updates exactly one PR/MR to the documented/default target. A push-only `main` outcome requires explicit repository evidence that no deployment target exists.
5. Reports a receipt containing the commit and CI, PR target/URL, deployment evidence, or cited no-deployment evidence.

It stops rather than guessing when repository state, instructions, checks, CI, deployment, observability, or rollback is ambiguous or fails. It runs each check once unless files change and avoids remote commit/archive/raw-file confirmation after a successful push; remote calls are reserved for required CI/CD, PR/MR, deployment, and health operations. Authorization is consumed after one cycle, including a failed cycle.

## Security

Pi extensions run with your full system permissions. `/yolo` deliberately authorizes commit, push, PR/MR creation, and—when the repository documents it—deployment and rollback without the usual review confirmation. Review this extension before installing it and invoke `/yolo` only in a repository and worktree you intend to publish.

The command never authorizes force-pushing, unrelated amendments, merging a PR/MR, inventing deployment commands, or repeating a failed cycle.

## Development

```sh
pnpm install
pnpm run check
```

## License

MIT

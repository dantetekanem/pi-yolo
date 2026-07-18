# pi-yolo

A small [Pi](https://github.com/earendil-works/pi-mono) extension that adds `/yolo`: one command to ship the current intended changes without turning delivery into an audit.

`/yolo` checks the repository once, makes the version decision explicit, runs one normal project check, commits, pushes, and then uses an obvious configured deployment from `main` or opens a PR/MR from another branch.

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

1. Uses the exact repository containing the invocation folder and checks its branch, status, remote, and active Git operation once.
2. Makes the version outcome explicit. Shipped code, configuration, or behavior gets a SemVer bump—patch by default—unless the repository clearly requires something else. A skipped bump must include a reason.
3. Runs one documented project check, or the smallest obvious relevant check when no combined command exists. Successful checks are not repeated.
4. Stages only the intended diff, creates one commit, and pushes without force. On `main`, it uses an obvious configured deploy/release path when present; otherwise the push is delivery. Other branches get one PR/MR and no deployment.
5. Reports the commit, branch, version before and after, check result, and PR/deploy result.

It stops only for a missing repository or push remote, an active Git operation, an unclear diff, or a failed chosen check. Authorization is consumed after one cycle, including a failed cycle.

## Security

Pi extensions run with your full system permissions. `/yolo` deliberately authorizes commit, push, PR/MR creation, and an obvious configured deployment without the usual review confirmation. Review this extension before installing it and invoke `/yolo` only in a repository and worktree you intend to publish.

The command never authorizes force-pushing, unrelated amendments, merging a PR/MR, or inventing deployment commands.

## Development

```sh
pnpm install
pnpm run check
```

## License

MIT

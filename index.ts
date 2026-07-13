import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function buildYoloCommandPrompt(cwd: string): string {
	const boundCwd = JSON.stringify(cwd);

	return `The user invoked /yolo from the bound cwd ${boundCwd}. This is one-use approval to skip review and run one delivery cycle: commit and push, then deploy only from \`main\` or open a PR/MR from any other branch.

Act autonomously, but stop rather than guess:
1. Bind the entire cycle to ${boundCwd}: resolve the exact Git root/worktree containing it (including nested repositories or submodules), verify status, branch, remote, upstream, and absence of an in-progress Git operation, then run every Git action only there. Read and follow all applicable project instructions from that root through the bound cwd. Stop on missing or ambiguous repository, worktree, remote, scope, or instructions; never fall back to another cwd or switch checkouts.
2. Discover the project's own release, verification, CI/CD, deploy, health, and rollback conventions. Run change-relevant prescribed checks, plus every documented or available typecheck command; if none exists, record the evidence and skip. Run applicable tests, lint, build, or package checks. Apply a version bump only when required, update coupled metadata, and re-run affected checks. Never invent a command or target; stop on failure.
3. Stage only the intended files, create one repository-style commit, and push without force. Trust successful output from prescribed local tools and reuse results already gathered: run each check once unless files changed afterward, and do not re-confirm the pushed commit through remote APIs, archive downloads, raw-file fetches, or redundant status queries. Use remote tooling only when required to observe CI/CD gates, create the branch-appropriate PR/MR, or execute and verify deployment. Do not deploy while a required gate is failing, pending, cancelled, unobservable, or awaiting approval.
4. Only when the verified current branch is exactly \`main\`, deliver the complete release through the established path—CI/CD may be that path; Kamal is only an option when configured. Verify rollout completion, deployed revision, service health, endpoint smoke checks, and error signals. If rollout fails, use only a documented safe rollback and verify recovery. Treat a confirmed push as complete without deployment only when repository evidence explicitly says \`main\` has no target, and cite it. On every non-\`main\` branch, run no deployment command or deployment operation: create or update exactly one PR/MR from the verified branch to the documented/default target; stop if its target or existing state is ambiguous, and never deploy or merge it.
5. Report a receipt with commit, branch, checks/CI, and the PR/MR URL and target or deployment target, revision, and health evidence, including justified skips and any proven no-deployment case.

Keep execution and bookkeeping minimal; do not repeat equivalent checks or queries merely to strengthen the receipt. Never amend or force-push unrelated work, broaden the change, claim partial success, or retry after a failure. Consume this authorization after this single cycle; another cycle requires another /yolo.`;
}

export default function yoloCommandExtension(pi: ExtensionAPI) {
	pi.registerCommand("yolo", {
		description: "Verify, commit, push, and deploy or open a PR in one review-free cycle",
		handler: async (args, ctx) => {
			if (args.trim()) {
				ctx.ui.notify("Usage: /yolo", "warning");
				return;
			}

			const prompt = buildYoloCommandPrompt(ctx.cwd);

			if (ctx.isIdle()) {
				pi.sendUserMessage(prompt);
				return;
			}

			pi.sendUserMessage(prompt, { deliverAs: "followUp" });
			ctx.ui.notify("Queued /yolo for when the agent is idle.", "info");
		},
	});
}

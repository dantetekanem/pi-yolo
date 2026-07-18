import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function buildYoloCommandPrompt(cwd: string): string {
	const boundCwd = JSON.stringify(cwd);

	return `The user invoked /yolo from the bound cwd ${boundCwd}. This is one-use approval to skip review and ship the current intended changes: commit and push, then deploy only from \`main\` or open a PR/MR from any other branch.

Move fast. Do not turn /yolo into an audit:
1. Work only in the exact Git repository containing ${boundCwd}. Check its root, current branch, working-tree status, push remote, and active Git operation once. Stop if there is no repository or push remote, a merge/rebase is active, or the intended diff is unclear. Do not switch checkouts.
2. Make the version decision before staging. If the project has an explicit version and the change affects shipped code, configuration, or behavior, bump the appropriate SemVer level—patch by default unless the repository clearly requires something else—and update directly coupled version metadata. If the version is not bumped, say why in the receipt. Never omit the version outcome.
3. Run the project's normal check command once when one is documented; otherwise run the smallest obvious relevant check. Reuse valid results from this session after the last change. Do not hunt for every possible command and do not repeat a successful check. Stop if the chosen check fails.
4. Stage only the intended files, create one repository-style commit, and push without force. On \`main\`, use an obvious configured deploy/release path when one exists; otherwise the push is the delivery. On any other branch, create or update one PR/MR and never deploy or merge it. Do not invent a target or inspect remote state unless the PR/deploy step needs it.
5. Report a short receipt: commit, branch, version before → after (or not bumped + reason), check result, and PR/deploy result.

One repository check. One version decision. One normal check. One commit. One push. No review, no redundant archaeology, no force-push, and no unrelated changes. Consume this authorization after this single cycle; another cycle requires another /yolo.`;
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

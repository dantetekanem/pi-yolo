import assert from "node:assert/strict";
import test from "node:test";

import yoloCommandExtension from "./index.ts";

function setup({ idle = true, cwd = "/workspace/default" } = {}) {
	let command;
	const sent = [];
	const notifications = [];
	const pi = {
		registerCommand(name, definition) {
			assert.equal(name, "yolo");
			command = definition;
		},
		sendUserMessage(...args) {
			sent.push(args);
		},
	};
	const ctx = {
		cwd,
		isIdle: () => idle,
		ui: {
			notify: (...args) => notifications.push(args),
		},
	};

	yoloCommandExtension(pi);
	assert.ok(command);

	return { command, ctx, sent, notifications };
}

test("rejects arguments without dispatching the workflow", async () => {
	const { command, ctx, sent, notifications } = setup();

	await command.handler("unexpected", ctx);

	assert.deepEqual(sent, []);
	assert.deepEqual(notifications, [["Usage: /yolo", "warning"]]);
});

test("dispatches the workflow immediately with its bound cwd when Pi is idle", async () => {
	const cwd = "/workspace/idle project";
	const { command, ctx, sent, notifications } = setup({ cwd });

	await command.handler("", ctx);

	assert.equal(sent.length, 1);
	assert.equal(sent[0].length, 1);
	assert.match(sent[0][0], /one-use approval/);
	assert.match(sent[0][0], /CI\/CD/);
	assert.match(sent[0][0], /typecheck/);
	assert.match(sent[0][0], /do not re-confirm the pushed commit through remote APIs/);
	assert.match(sent[0][0], /On every non-`main` branch, run no deployment command or deployment operation/);
	assert.ok(sent[0][0].includes(JSON.stringify(cwd)));
	assert.deepEqual(notifications, []);
});

test("queues the workflow with its captured cwd when Pi is busy", async () => {
	const cwd = "/workspace/busy-project";
	const { command, ctx, sent, notifications } = setup({ idle: false, cwd });

	await command.handler("", ctx);

	assert.equal(sent.length, 1);
	assert.equal(sent[0].length, 2);
	assert.match(sent[0][0], /exact Git root\/worktree/);
	assert.ok(sent[0][0].includes(JSON.stringify(cwd)));
	assert.deepEqual(sent[0][1], { deliverAs: "followUp" });
	assert.deepEqual(notifications, [["Queued /yolo for when the agent is idle.", "info"]]);
});

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
	assert.match(sent[0][0], /version decision/);
	assert.match(sent[0][0], /patch by default/);
	assert.match(sent[0][0], /version before → after/);
	assert.match(sent[0][0], /Do not turn \/yolo into an audit/);
	assert.match(sent[0][0], /On any other branch, create or update one PR\/MR and never deploy or merge it/);
	assert.doesNotMatch(sent[0][0], /every documented or available typecheck/);
	assert.doesNotMatch(sent[0][0], /service health/);
	assert.ok(sent[0][0].includes(JSON.stringify(cwd)));
	assert.deepEqual(notifications, []);
});

test("queues the workflow with its captured cwd when Pi is busy", async () => {
	const cwd = "/workspace/busy-project";
	const { command, ctx, sent, notifications } = setup({ idle: false, cwd });

	await command.handler("", ctx);

	assert.equal(sent.length, 1);
	assert.equal(sent[0].length, 2);
	assert.match(sent[0][0], /exact Git repository/);
	assert.ok(sent[0][0].includes(JSON.stringify(cwd)));
	assert.deepEqual(sent[0][1], { deliverAs: "followUp" });
	assert.deepEqual(notifications, [["Queued /yolo for when the agent is idle.", "info"]]);
});

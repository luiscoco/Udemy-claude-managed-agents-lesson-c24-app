# C24 · Evaluation, Testing and Offline Replay

Executes a deterministic approval replay. It tests the host consumer without calling the provider. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Replay authored SDK-shaped events
- Confirm once by event ID
- Fixture results are not live evidence

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3024`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3024
```

## How the app was build

### 1. Replay deterministic approval observations

The authored sequence records one confirmation per distinct ask label and tracks requires_action versus end_turn. The small fixture uses labels as IDs to exercise the host contract.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const seen = new Set<string>(),
  confirmations: Input[] = [];

let state = "incomplete";

for (const item of list(input, "events")) {
  const kind = String(item);
  if (seen.has(kind)) continue;
  seen.add(kind);
  if (kind === "ask")
    confirmations.push({
      toolUseId: "sevt_fixture_write",
      decision: text(input, "decision"),
    });
  if (kind === "requires_action") state = "paused";
  if (kind === "end_turn") state = "passed";
}
```

### 2. Label the provenance and terminal evidence

The result remains paused or incomplete unless the authored terminal event appears. fixtureSource is authored, and remoteFileWritten remains not observed; an offline approval test is not a live write test.

Source: [src/lesson.ts](src/lesson.ts#L15)

```typescript
return report(
  state as "passed" | "paused" | "incomplete",
  "Replayed an authored approval scenario",
  {
    fixtureSource: "authored",
    confirmations: confirmations.length,
    decisions: confirmations,
    remoteFileWritten: "not observed",
  },
  [
    "Feed deterministic events",
    "Deduplicate request identifiers",
    "Record exactly one confirmation",
    "Require terminal evidence",
  ],
);
```

### Check your understanding

Run **Replay duplicate approval events** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "events": [
      "ask",
      "ask",
      "requires_action",
      "end_turn"
    ],
    "decision": "allow"
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "confirmations": 1
  }
}
```

Then try **Replay a truncated stream**. Its expected outcome is `incomplete`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.

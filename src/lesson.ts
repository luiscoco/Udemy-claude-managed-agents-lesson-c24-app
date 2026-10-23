import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 24,
  title: "Evaluation, Testing and Offline Replay",
  description: "Agent testing is difficult because model behavior varies, and live requests take time and consume resources. A practical strategy separates two questions.",
  concepts: ["Replay authored SDK-shaped events", "Confirm once by event ID", "Fixture results are not live evidence"],
  scope: "Executes a deterministic approval replay. It tests the host consumer without calling the provider. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Replay duplicate approval events", "input": {"events": ["ask", "ask", "requires_action", "end_turn"], "decision": "allow"}, "expected": "passed", "checks": {"confirmations": 1}}, {"id": "1", "label": "Replay a truncated stream", "input": {"events": ["ask"], "decision": "deny"}, "expected": "incomplete", "checks": {"confirmations": 1}}],
  async run(input) {

const seen=new Set<string>(), confirmations:Input[]=[];let state="incomplete";
for(const item of list(input,"events")){const kind=String(item);if(seen.has(kind))continue;seen.add(kind);if(kind==="ask")confirmations.push({toolUseId:"sevt_fixture_write",decision:text(input,"decision")});if(kind==="requires_action")state="paused";if(kind==="end_turn")state="passed";}
return report(state as "passed"|"paused"|"incomplete","Replayed an authored approval scenario",{fixtureSource:"authored",confirmations:confirmations.length,decisions:confirmations,remoteFileWritten:"not observed"},["Feed deterministic events","Deduplicate request identifiers","Record exactly one confirmation","Require terminal evidence"]);

  }
};

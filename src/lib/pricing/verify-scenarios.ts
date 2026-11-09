import { calculateQuote, pricing, type QuoteResult } from "./calculate";

const keys = Object.keys(pricing.scenarios[0].result) as (keyof QuoteResult)[];

let failed = 0;

for (const scenario of pricing.scenarios) {
  const actual = calculateQuote(scenario.inputs);
  if (!actual) {
    console.log(scenario.id, "no result");
    failed += 1;
    continue;
  }

  const diffs = keys.flatMap((key) => {
    const expected = scenario.result[key];
    const got = actual[key];
    if (typeof expected === "number" && typeof got === "number") {
      return Math.abs(expected - got) > 0.011 ? [`${key}: expected ${expected}, got ${got}`] : [];
    }
    return expected !== got ? [`${key}: expected ${expected}, got ${got}`] : [];
  });

  if (diffs.length > 0) {
    failed += 1;
    console.log(scenario.id, diffs.join("; "));
  }
}

if (failed > 0) {
  console.log(`${failed} scenarios failed`);
  process.exit(1);
}

console.log(`${pricing.scenarios.length} scenarios match`);

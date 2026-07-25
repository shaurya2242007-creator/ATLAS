# ATLAS 1.4.2 — Autonomous Build Loop Prompt

> **How to use this:** Open a terminal in an empty project folder and start Claude Code (`claude`).
> Paste everything below the line as your first message. It is self-contained: it tells the agent
> what to build, how to loop, and — critically — the exact measurable targets that define "done,"
> so it knows when to stop. Re-paste it any time to resume; the agent reads its own `STATE.md` and
> continues where it left off.
>
> **One honest note before you run it:** a loop cannot raise the *raw intelligence* of the model —
> that comes from the base model you call. What this loop builds and measurably improves is Atlas's
> **teaching capability**: grounding, explanation-depth control, truthfulness, and learning outcomes.
> The "target level of intelligence" is therefore defined below as concrete thresholds on an
> evaluation harness. That is the only version of this goal that is real and achievable.

---

You are the lead engineer building **Atlas 1.4.2**, a prototype AI *teaching* agent. You will work
**autonomously in a loop**, building the system and iterating until it reaches the measurable target
defined in "DEFINITION OF DONE" below. Do not stop until either the target is met or you hit a
declared STOP condition. Work in small, tested increments and keep durable notes so you (or a fresh
session) can always resume.

## 0 · MISSION & REFRAME
Atlas's job is not to *answer* — it is to *teach*: ground every claim in real sources, adapt
explanation depth to the learner, tell the truth about uncertainty, and reinforce ideas with
visuals. You are not trying to make the model "smarter"; you are building the orchestration,
retrieval, memory, evaluation, and safety scaffolding that turns a capable base model into a
trustworthy teacher. Success is defined by the eval harness, not by vibes.

## 1 · SCOPE — BUILD THE v0 VERTICAL SLICE ONLY
Resist scope creep. Build exactly this thin, end-to-end, runnable slice and nothing more until it
passes the targets:
1. **Conversational teaching loop** — a CLI (and a minimal local web UI if time allows) where a user
   asks about a concept and Atlas replies as a tutor.
2. **Retrieval-grounded answers** — answers are grounded in a small local corpus (start with ~30–50
   curated documents in ONE subject, e.g. "introductory machine learning"). Every substantive claim
   carries an inline citation to a source chunk. No citation → the claim is removed or marked
   uncertain.
3. **Multi-level explanation ladder** — the same concept explainable at 4 levels (L1 plain-intuition
   → L4 technical), with the learner able to say "simpler" / "deeper" to move between them.
4. **One visual capability** — start with auto-generated 2D (a table or a chart) emitted as a
   declarative spec, validated against a schema, then rendered. (Defer 3D to a later loop; leave a
   clean adapter seam for it.)
5. **Lightweight learner memory** — persist, across turns and sessions, the learner's current depth
   level and the concepts covered (a simple local store is fine).
6. **The evaluation harness** — the scoreboard that decides when you are done (see §4).
7. **Baseline safety** — input/output guardrail check, retrieved content treated as untrusted, no
   secrets in code. (Full stack is in the Security Addendum; implement the minimum here.)

Explicitly OUT of scope for v0: 3D reconstruction, multiple domains, all-language support, habit
mechanics, multi-region infra, accounts/billing. Leave adapter seams, do not build them.

## 2 · TECH CONSTRAINTS
- Language/stack: your choice, but pick boring, well-supported tools and state the choice in
  `STATE.md`. (Python is a reasonable default.)
- All model calls, the retriever, and the visual renderer go behind **versioned adapter interfaces**,
  so any one can be swapped. Never hard-code a provider throughout the codebase.

### 2a · MODEL CONFIGURATION (Atlas's teaching brain)
- **Default teaching model: NVIDIA Nemotron 3 Ultra via OpenRouter** (OpenAI-compatible API,
  base URL `https://openrouter.ai/api/v1`). Key from env var `OPENROUTER_API_KEY` only.
  - Paid endpoint `nvidia/nemotron-3-ultra-550b-a55b` → use for the actual teaching responses
    and any final eval runs (quality passes).
  - Free endpoint `nvidia/nemotron-3-ultra-550b-a55b:free` → use for cheap development-loop eval
    cycles and smoke tests. Expect rate limits: implement retry with backoff, and if the free
    endpoint throttles a full eval run, fall back to the paid endpoint and note the cost in
    `PROGRESS.md`.
- **Do NOT attempt to run any model locally.** This machine has no GPU; Nemotron 3 Ultra is a
  550B-parameter MoE model that cannot run on consumer hardware in any quantization. All
  inference is via hosted APIs. If a library you reach for tries to download model weights,
  you've taken a wrong turn — stop and use the API adapter instead.
- Nemotron 3 Ultra's large context window (up to 1M tokens) is useful for stuffing retrieved
  chunks, but do not lean on it as a substitute for good retrieval — keep prompts lean; measure
  groundedness, not context size.
- The adapter interface must make it a one-line config change to swap or A/B another model
  (e.g., a Claude or GPT-class model) on the same eval scoreboard. Record every model's scores
  separately in `PROGRESS.md` so model choice is decided by numbers, not loyalty.
- Embeddings for retrieval: use a hosted embeddings API **or** a small CPU-friendly local
  sentence-transformers model (this is fine without a GPU at 30–50 docs) — your call; state it
  in `STATE.md`.
- Secrets (API keys) come from environment variables only — never committed. Add a `.env.example`.
- Everything runs locally with one documented command (`make run` or equivalent). No cloud required
  for v0.

## 3 · THE LOOP (repeat every cycle)
Each iteration, do these phases in order and log them to `PROGRESS.md`:
1. **ORIENT** — read `STATE.md`, `PROGRESS.md`, and the current eval scores. State in one line what
   this cycle will improve and why (pick the lowest-scoring target).
2. **PLAN** — write the smallest change that could move that metric. List the files you'll touch.
3. **BUILD** — implement it in small commits.
4. **TEST** — write/run automated tests for the change first (TDD where practical). Never mark a
   task done with failing or skipped tests.
5. **EVALUATE** — run the full eval harness (§4). Record every metric in `PROGRESS.md` with the
   timestamp and the commit hash.
6. **SELF-CRITIQUE** — honestly compare scores to the targets. Did the change help, do nothing, or
   regress? If it regressed, revert. Write down what you learned.
7. **DECIDE** — if all targets in §4 are met → go to "FINISH." Otherwise pick the next lowest metric
   and loop back to ORIENT.

## 4 · DEFINITION OF DONE — THE "TARGET LEVEL" (measurable exit criteria)
Build the eval harness FIRST (it is the scoreboard). Assemble a fixed evaluation set of **25–40
concept questions** in the chosen subject, each with a known-good reference and source. The prototype
has reached target level when **all** of the following hold on that set, verified by an automated run
plus a human spot-check of a 20% sample:

| Metric | What it measures | Target |
|---|---|---|
| Groundedness | % of substantive claims traceable to a cited source chunk | ≥ 95% |
| Citation validity | % of citations that actually support the claim (entailment check + human sample) | ≥ 90% |
| Hallucination rate | % of answers containing an unsupported factual claim (human-graded 20% sample) | < 3% |
| Explanation-level accuracy | % of responses whose depth matches the requested/inferred level | ≥ 85% |
| Level-switch correctness | "simpler"/"deeper" produces a genuinely different, correct level | ≥ 90% |
| Visual appropriateness | when a visual is emitted, it is schema-valid AND helps (human-rated ≥4/5) | ≥ 90% valid, mean ≥ 4/5 |
| Teaching-outcome uplift | on a 5-learner (or simulated) pre/post mini-quiz, measurable gain vs. baseline | positive, > 0 |
| Guardrail block rate | % of a known-attack prompt set (injection/leakage) that is blocked | ≥ 95% |
| Test suite | automated tests green; coverage on core logic | 100% green |

Record the running scoreboard as a table at the top of `PROGRESS.md` so progress is visible at a
glance. Treat these numbers as the contract; do not lower them to "pass."

## 5 · WORKING DISCIPLINE (non-negotiable)
- **Maintain `STATE.md`** — architecture decisions, stack, adapter seams, how to run, current status.
  Update it whenever something structural changes. This is how a fresh session resumes.
- **Maintain `PROGRESS.md`** — the scoreboard + a dated log of each cycle (what you tried, the score
  delta, what you learned). Append every loop.
- **Commit** after each green increment with a clear message. Never commit secrets or broken code.
- **Never fake it** — do not stub the eval to pass, do not hard-code expected answers, do not mark
  tasks done with failing tests, do not claim a metric you didn't measure. If you're stuck, write the
  blocker in `STATE.md` and try a different approach.
- **Prefer boring, verifiable steps** over clever leaps. Small diffs, measured effects.
- **Ask for a real key only when needed** — if you need an API key or a resource I must provide,
  stop and tell me exactly what and why; don't invent credentials.

## 6 · STOP CONDITIONS (halt the loop and report)
Stop and summarize if any occur: (a) all §4 targets met; (b) you need a secret/resource only I can
provide; (c) the same metric fails to improve after 3 consecutive cycles targeting it (report the
plateau and your hypotheses); (d) a change would require going outside v0 scope to progress; (e) a
safety/guardrail test fails and you cannot fix it without weakening a control.

## 7 · FINISH (when targets are met)
Produce a short `REPORT.md`: final scoreboard, what was built, the architecture (with adapter seams
for 3D/multi-domain/languages), known limitations, and the recommended next slice (3D reconstruction
or a second domain). Then stop.

## 8 · FIRST ACTION — DO THIS NOW
1. Create `STATE.md`, `PROGRESS.md`, and the project skeleton.
2. State your stack choice and the chosen subject for the corpus.
3. Build the **evaluation harness and the 25–40-question eval set first** (the scoreboard before the
   game), then run it against an empty/stub system to confirm it produces a baseline of zeros.
4. Begin the loop at §3, targeting groundedness first.

Begin.

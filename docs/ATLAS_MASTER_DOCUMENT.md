# ATLAS
## Company Master Document
*The AI that doesn't just answer — it teaches.*

**Version 1.0 · July 2026 · Internal Use Only**

---

> This document is the single source of truth for the Atlas project. It covers product vision, architecture, learning science principles, brand identity, target audience, roadmap, and development standards. Every team member, contributor, and collaborator should read and understand this document before working on Atlas.

---

## Table of Contents

1. [Who We Are](#1-who-we-are)
2. [The Problem We Exist to Solve](#2-the-problem-we-exist-to-solve)
3. [Our Mission, Vision & Purpose](#3-our-mission-vision--purpose)
4. [What Atlas Is](#4-what-atlas-is)
5. [Product Architecture — The Five Engines](#5-product-architecture--the-five-engines)
6. [The Explanation Ladder](#6-the-explanation-ladder)
7. [The Visualization System](#7-the-visualization-system)
8. [Personalization & Memory](#8-personalization--memory)
9. [Learning Science Foundation](#9-learning-science-foundation)
10. [Target Audience & Segments](#10-target-audience--segments)
11. [Domain Coverage](#11-domain-coverage)
12. [Differentiation — Why Atlas Wins](#12-differentiation--why-atlas-wins)
13. [Build Roadmap](#13-build-roadmap)
14. [Evaluation & Success Metrics](#14-evaluation--success-metrics)
15. [Brand Identity](#15-brand-identity)
16. [Brand Voice & Communication](#16-brand-voice--communication)
17. [Long-Term Vision](#17-long-term-vision)
18. [Glossary](#18-glossary)

---

## 1. Who We Are

Atlas is an AI company building the world's most effective learning agent. We are not building another chatbot, another content library, or another search tool wrapped in AI. We are building a **teaching system** — the software equivalent of a world-class tutor who knows you, adapts to you, and holds the full weight of your domain's knowledge at their fingertips.

Our founding insight is simple but structurally significant: the AI companies that will define education are not those with the biggest models, but those with the best **teaching architecture** around those models. The intelligence Atlas delivers lives in how its components coordinate — not in any single API call.

We exist because the gap between *information retrieval* and *genuine understanding* has never been wider, and the tools available to bridge it have never been more powerful. Atlas is built for this exact moment.

---

## 2. The Problem We Exist to Solve

### The Illusion of Knowing

The most dangerous outcome of current AI education tools is not that they give wrong answers — it is that they give fluent, confident answers that *feel* right, creating what researchers call the **illusion of knowing**: learners consume explanations, feel they understand, and then fail at application.

This is not a model quality problem. It is an architectural and pedagogical problem. Current general-purpose AI tools were built to *respond* — not to *develop understanding*. The result is a structural mismatch between what these tools do and what learning requires.

### The Four Gaps

Every current AI learning product fails along four dimensions. These are Atlas's core design targets:

---

**Gap 1 — Impersonal Interaction**

Answers are transactional and one-shot. There is no rapport, no memory of the learner, and no sense of a real interlocutor. Human tutoring works precisely because of the relationship and accumulated context between tutor and student. Current AI tools have neither.

*Atlas solves this with:* Persistent memory, learner profiling, conversational initiative, and calibrated tone that accumulates across sessions.

---

**Gap 2 — Fixed Explanatory Depth**

AI responses land at a single, often mismatched complexity level. Novices are overwhelmed; experts are bored. The learner has no way to move up or down the abstraction ladder without starting over or rephrasing their query from scratch.

*Atlas solves this with:* A four-level explanation ladder (Intuition → Frontier) where the learner can elevate or simplify depth at any point in the conversation, without losing context or accuracy.

---

**Gap 3 — Ungrounded Expertise**

AI models answer from static parametric memory, producing confident claims that are impossible to cite and occasionally wrong. Advanced learners — the exact users Atlas targets — rightly distrust this. They need provenance, not confidence.

*Atlas solves this with:* Retrieval-Augmented Generation (RAG) that grounds every substantive claim in retrieved, citable sources. Provenance travels with every answer.

---

**Gap 4 — Text-Only Explanation**

Complex, spatial, and quantitative ideas are delivered as walls of prose when a diagram, chart, or interactive model would teach the same concept in a fraction of the time. AI tools consistently default to text even when a visual is the clearly superior medium.

*Atlas solves this with:* A classification-driven Visualization Engine that decides *when* visuals help, generates them from the same grounded data as the prose, and keeps them conversationally addressable — the learner can interrogate the visual directly.

---

## 3. Our Mission, Vision & Purpose

### Mission
To close the gap between information retrieval and genuine understanding — one learner at a time.

### Vision
A world where the quality of your tutor is no longer determined by your wealth, location, or institution. Where every advanced learner has access to a patient, rigorous, adaptive expert who knows them and never stops improving.

### Purpose (Internal)
We build teaching architecture — not model wrappers. Every design decision, every engineering choice, and every product feature should serve one question: *does this help the learner understand, or does it just help them feel like they understand?*

### The Guiding Design Principle
**A hard separation between what Atlas knows and how Atlas explains.**

The knowledge retrieval pipeline and the explanation rendering pipeline are architecturally distinct. This single principle is the root fix for impersonal, one-size-fits-all AI answers, and it is the basis of Atlas's technical moat.

---

## 4. What Atlas Is

Atlas is an **AI learning agent** built on four coordinated promises:

| Promise | What It Means for the Learner |
|---|---|
| **Grounded Depth** | Every substantive claim is retrieved from vetted sources and carries provenance — research you can trust and cite |
| **Adaptive Explanation** | The same concept, explainable from plain-English intuition to research-level formalism, with the learner controlling the altitude |
| **Visual-First Teaching** | Tables, graphs, and interactive models generated on demand and woven into the dialogue — not bolted on |
| **A Real Conversation** | Memory, initiative, calibrated tone, and Socratic questioning — an agent that feels like a person, not a search box |

### What Atlas Is Not

- **Not a chatbot.** Atlas does not optimize for response speed or conversational fluency. It optimizes for learning outcomes.
- **Not a search engine.** Atlas does not surface links. It synthesizes, grounds, and explains.
- **Not a content platform.** Atlas does not serve pre-authored courses or videos. Every lesson is generated, grounded, and personalized in real time.
- **Not a model wrapper.** The intelligence of Atlas is in its architecture, not in any single underlying model.

---

## 5. Product Architecture — The Five Engines

Atlas is architected as five coordinated, decoupled engines controlled by a central Orchestrator. Each engine has a precise, bounded role. No engine does another's job.

This modularity is Atlas's technical moat: when a better base model, retrieval method, or visualization framework becomes available, we swap a module — not the product.

```
┌─────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                         │
│   Intent classification · Task decomposition · Routing      │
└────────┬──────────┬──────────┬──────────┬──────────────────┘
         │          │          │          │
    ┌────▼───┐ ┌────▼────┐ ┌──▼──────┐ ┌▼──────────────┐
    │ RAG    │ │Reasoning│ │Explain. │ │Visualization  │
    │Engine  │ │(SRP)    │ │Engine   │ │Engine         │
    └────────┘ └─────────┘ └─────────┘ └───────────────┘
                           ┌──────────────────────────────┐
                           │   Memory & Personalization   │
                           └──────────────────────────────┘
```

---

### 5.1 The Orchestrator

**Role:** The Orchestrator is the brain of the system. It is the first component that processes every learner input, and it determines everything about how that input is handled.

**Responsibilities:**
- Classify the learner's **intent** (quick fact / structured lesson / Socratic exchange / visual walkthrough / domain-specific deep research)
- Decompose complex queries into sub-tasks
- Select the **response format** before any generation begins
- Route each sub-task to the appropriate engine(s)
- Emit a structured routing decision that all downstream engines operate from

**Key principle:** The Orchestrator decides the *shape* of the answer before any content is generated. A quick fact, a structured lesson, a visual walkthrough, and a Socratic exchange are fundamentally different response types — the Orchestrator's job is to know which one the learner needs before any engine begins work.

**Output:** A structured routing object containing: `{intent_type, learner_level, response_format, engines_to_invoke, depth_target, domain}`

---

### 5.2 The Research Engine (RAG)

**Role:** Grounds every substantive claim in retrieved, citable sources. The Research Engine is Atlas's trust contract with the learner.

**Responsibilities:**
- Query curated domain corpora and live retrieval sources
- Return ranked, relevant chunks with provenance metadata (source, section, retrieval confidence)
- Pass grounded content — with chain-of-custody metadata — to the Explanation Engine
- Never allow a substantive claim to reach the learner without a retrievable source

**Key principle:** Provenance metadata travels with every retrieved chunk all the way to the final response. It is logged for evaluation even when stripped from the user-facing output.

**Why this matters:** Atlas's target users — advanced learners and professionals — rightly distrust confident, unciteable AI claims. Grounding is not a premium feature; it is a trust contract that the entire product depends on.

---

### 5.3 The Reasoning Engine (SRP Loop)

**Role:** Implements Self-Reflective Planning — a plan-before-answer, critique-after-draft reasoning loop that catches errors, depth mismatches, and missed visual opportunities before they reach the learner.

**Responsibilities:**

*Pre-answer planning (before retrieval):*
- Is this query resolvable by RAG, or does it require synthesis?
- What sub-questions need to be answered first?
- What depth level does the learner profile indicate?

*Post-draft critique (after Explanation Engine output):*
- Is every claim grounded? Are there gaps?
- Is the depth appropriate for this learner?
- Would a visual teach this more effectively than additional prose?
- Does the response add cognitive load without adding understanding?

**Key principle:** The SRP loop is Atlas's internal quality gate. It is the mechanism by which Atlas avoids confident errors and depth mismatches before they reach the learner.

---

### 5.4 The Explanation Engine

**Role:** Takes grounded, verified content from the Research Engine and renders it at the learner's chosen depth level. The Explanation Engine is a *reformulator*, not a *generator* — it adds no new claims.

**Responsibilities:**
- Receive grounded content from the RAG pipeline
- Receive the learner's current depth target (L1–L4) from the Orchestrator
- Render the content at the specified level, using only what was retrieved
- Support seamless depth elevation or reduction mid-conversation without re-retrieval

**Critical constraint:** The Explanation Engine must never introduce claims not present in the retrieved content. "Simpler" means simpler language and lower abstraction — it never means simplified or altered facts.

**Key principle:** The hard separation between the RAG Engine (what Atlas knows) and the Explanation Engine (how Atlas explains) is the single architectural fix that makes adaptive depth possible without hallucination risk.

---

### 5.5 The Visualization Engine

**Role:** Decides when a visual would teach better than prose, generates a grounded, auditable visual specification, and renders it as an interactive, conversationally addressable artifact.

**Responsibilities:**
- Classify the visual type based on content: comparison → table; trend → graph; structure/process → diagram; spatial → 3D model
- Default to *no visual* unless the classification is clear
- Generate a declarative spec drawn from the same retrieved data as the prose
- Render interactive visuals (sliders, rotatable 3D models where applicable)
- Maintain a reference to each rendered visual in conversation context so follow-up questions about the visual can be answered

**Key principle:** Visuals in Atlas are **decided, generated, and grounded** — never decorative. A visual that adds cognitive load without accelerating understanding is a failure, not a feature.

**The addressability requirement:** After a visual is rendered, the learner must be able to ask questions *about it* (e.g., "Why does that curve flatten?") and receive answers that reference the specific artifact. The Visualization Engine must maintain artifact context across conversational turns.

---

### 5.6 Memory & Personalization

**Role:** Maintains three distinct layers of learner data across sessions, enabling Atlas to accumulate context and become more effective over time.

**Three memory layers:**

| Layer | What It Tracks | Scope |
|---|---|---|
| **Session State** | Current conversation context, active depth level, concepts introduced this session | Within conversation |
| **Learner Profile** | Proficiency level, context type, stated goals, preferred pace | Across sessions |
| **Concept Exposure History** | Which concepts have been seen, at what depth, and when — used for spacing resurfacing | Long-term |

**Key principle:** These three layers have different storage requirements, different update frequencies, and different read patterns. They must be implemented as separate data models. Collapsing them creates coupling that breaks the spacing and personalization systems.

---

## 6. The Explanation Ladder

The four-level explanation ladder is Atlas's most visible differentiator and the primary mechanism by which it serves learners from first exposure to graduate-level expertise.

Every concept in every supported domain can be rendered at all four levels. The levels are generated from the same grounded knowledge base — depth changes, facts do not.

| Level | Register | Language | For Whom |
|---|---|---|---|
| **L1 — Intuition** | Analogy, zero jargon | Plain English, concrete metaphors | First exposure; cross-domain newcomers |
| **L2 — Structured** | Defined terms, stepwise logic | Domain vocabulary introduced with definitions | Building working understanding |
| **L3 — Technical** | Full formalism | Precise technical language, full notation | Practitioners and majors |
| **L4 — Frontier** | Research-level, open problems | Current literature, open questions | Experts and graduate learners |

### Depth Elevation as a Core Interaction Primitive

Moving between levels must feel **conversational and frictionless**. The learner says "go deeper" or "explain that more simply" — Atlas re-renders from the same grounded content at the new level without re-retrieving and without losing conversational context.

Depth level is a *parameter*, not a separate flow. It is passed to the Explanation Engine by the Orchestrator and can be updated at any point in a session.

### The Non-Negotiable Constraint

**"Simpler never means wrong."**

A L1 explanation of compound interest uses an analogy. A L4 explanation uses continuous compounding notation. Both descriptions are mathematically identical in what they assert — only the register changes. The Explanation Engine enforces this by treating grounded source content as the ceiling of what can be claimed at any level.

---

## 7. The Visualization System

### Classification Taxonomy

| Visual Type | Trigger Condition | Example |
|---|---|---|
| **Table** | Comparison of multiple items across shared attributes | Comparing financial ratios across companies |
| **Graph / Chart** | Trend over time, distribution, or quantitative relationship | Revenue growth, probability distribution |
| **Diagram** | Structure, process, or system with logical flow | Neural network architecture, DCF model flow |
| **3D Model** | Spatial structure or rotatable object that benefits from perspective | Molecular structure, 3D geometry |

### Conservative Trigger Policy

The Visualization Engine defaults to **no visual**. A visual is only generated when:
1. The content maps cleanly to one of the four visual types above
2. The visual would convey the concept faster than equivalent prose
3. The underlying data was retrieved (not synthesized) — visuals are always grounded

The engine must justify a "generate visual" decision in one sentence before emitting the spec. If the justification is weak, no visual is generated.

### The Declarative Spec

Visuals are not generated as raw output — they are generated as a **declarative, auditable spec** derived from retrieved data. This spec is:
- Transparent: every visual element can be traced to a retrieved data point
- Swappable: the rendering layer can change without touching the AI logic
- Loggable: specs are stored for visual-appropriateness evaluation

### Conversational Addressability

Every rendered visual is registered in the conversation's artifact context. When a learner asks a follow-up question about a visual ("Why does that drop off after 2020?"), the question is routed to the Explanation Engine with the visual spec and source data as context. The artifact is the subject of the answer, not background.

---

## 8. Personalization & Memory

### Two-Axis Learner Profiling

Atlas classifies every learner on two independent axes at onboarding, then continuously refines the classification through interaction:

**Axis 1 — Proficiency**
- Beginner
- Intermediate
- Advanced

**Axis 2 — Context**
- Student (sub-classified by academic level: high school / undergraduate / graduate)
- Professional (sub-classified by role: analyst / manager / executive / specialist)
- Independent Learner

### Default Response Shapes by Profile

| Profile | Depth Register | Default Response Shape |
|---|---|---|
| **Beginner** | Solid foundations, plain language | Analogy → definition → one example |
| **Intermediate** | Fill specific gaps | Direct answer → applied example |
| **Advanced** | Nuance and edge cases | Concise answer → sources → frontier |
| **Student** | Curriculum-bounded, age-appropriate | Scaffolded, example-rich, exam-aware |
| **Professional** | Applied, decision-ready | Answer-first → practical implication |

### The Precision Gate

A precision gate filters every response before delivery: only content that serves the learner's stated goal at their proficiency level is surfaced. This is a deliberate constraint, not a limitation — it prevents cognitive overload and ensures that every word in an Atlas response earns its place.

Content that doesn't pass the gate is either deferred ("Want to go deeper on X?") or omitted entirely.

### Profile Seeding and Refinement

- **Initial:** A short onboarding questionnaire seeds the learner profile (proficiency axis + context axis + stated domain goals)
- **Continuous:** Every interaction refines the profile — depth preferences, concept mastery signals, response patterns
- **Behavioral memory:** Atlas tracks concept exposure history for the spacing effect (see Learning Science section), resurfacing concepts at calibrated intervals

---

## 9. Learning Science Foundation

Atlas's design encodes the most robust findings in cognitive science and educational psychology. These are not UX guidelines — they are **system behaviors implemented in prompting logic and session management**.

| Evidence | What Research Shows | How Atlas Implements It |
|---|---|---|
| **Retrieval Practice** | Testing yourself is the single strongest learning lever | Active recall prompts baked into the core interaction loop; Socratic questioning as a core mode |
| **Spacing Effect** | Distributed review beats massed cramming for retention | Concept exposure history tracked in memory layer; intelligent resurfacing schedule |
| **Cognitive Load Theory** | Working memory is tiny; clutter halts learning | Ruthless removal of extraneous content via the precision gate; clean, segmented delivery |
| **'Learning Styles' Myth** | Matching modality to learner preference does not work | Adaptation on *performance and stated goal*, never on a style label |
| **Desirable Difficulties** | Effortful study feels worse but teaches better | Productive difficulty through Socratic questioning and depth elevation |
| **Self-Determination Theory** | Persistence is driven by autonomy, competence, and connection | Learner controls depth; precision gate ensures competence; memory creates connection |

### Why This Matters Strategically

Pedagogy is hard to replicate from the outside. Competitors can copy features — they cannot copy an architecture that encodes decades of learning science at the system level. This is Atlas's durable differentiator, compounding with every product decision.

### The Engagement Thesis

Research on online learning is clear: persistence is driven less by content polish than by:
- **Autonomy** — the learner controls the experience
- **Calibrated competence** — the content meets them where they are
- **Connection** — the system knows them over time

Atlas is engineered around exactly these levers. This is the mechanism by which Atlas expects to outperform passive-video platforms and generic AI tools on retention and return rates.

---

## 10. Target Audience & Segments

### Primary Segments

**Advanced Self-Learners**
- Need: Fast mastery of complex, cross-domain material with trustworthy, citable depth
- Pain: Current AI gives fluent but unciteable answers; can't control explanation depth
- Atlas value: Grounded retrieval + adaptive depth + no wasted context

**University Students**
- Need: Curriculum-aligned, exam-aware tutoring that adapts to their level and academic stage
- Pain: Office hours are scarce; tutors are expensive; AI tools give generic answers
- Atlas value: Student-profile default shapes (scaffolded, example-rich, exam-aware) + Socratic recall

**Upskilling Professionals**
- Need: Applied, time-efficient learning in finance, data, coding, AI, and ML
- Pain: Content platforms are passive and undifferentiated; generic AI lacks domain depth
- Atlas value: Answer-first → practical implication response shape + six specialized domain corpora

### Secondary Segments (Later Phases)

- Graduate students and researchers requiring L4 frontier-level responses
- Institutions and organizations seeking measurable learning outcomes at scale

### Who Atlas Is Not For (Right Now)

- Casual users seeking quick information (Perplexity serves them well)
- K-12 students below high school level (design is calibrated for advanced learners)
- Users wanting passive video or pre-authored content courses

---

## 11. Domain Coverage

Atlas launches with six expert domains, each backed by curated retrieval corpora:

| Domain | Core Subtopics |
|---|---|
| **Finance** | Corporate finance, valuation, markets, derivatives, portfolio theory, financial modeling |
| **Business** | Strategy, operations, marketing, organizational behavior, entrepreneurship |
| **Data Analytics** | Statistics, data wrangling, SQL, visualization, analytical frameworks |
| **Coding** | Python, JavaScript, algorithms, data structures, system design |
| **Artificial Intelligence** | ML theory, deep learning, NLP, computer vision, AI systems design |
| **Machine Learning** | Supervised/unsupervised learning, model evaluation, feature engineering, deployment |

### Domain Architecture

Each domain is implemented as:
- A dedicated retrieval index (curated corpus + live retrieval)
- Domain-specific explanation conventions (e.g., finance explanations prioritize numerical grounding; coding explanations default to runnable examples)
- Domain-adapted response defaults (professionals in finance get answer-first; students in coding get scaffolded build-up)

The Orchestrator detects domain from the query and routes to the appropriate domain index. Domain adapters (Phase 4) layer in conventions on top of the base explanation system.

---

## 12. Differentiation — Why Atlas Wins

### The Competitive Landscape

| Dimension | Generic AI Chat | Content Platforms | Atlas |
|---|---|---|---|
| **Primary goal** | Answer a query | Deliver content | Produce understanding |
| **Explanation depth** | Fixed, one-shot | Author-fixed | 4 adaptive levels, learner-controlled |
| **Grounding** | Parametric, uncited | Static curriculum | Retrieval-grounded with provenance |
| **Visuals** | Mostly text | Pre-made media | Generated, interactive, addressable |
| **Personalization** | Minimal / session-only | Coarse tracks | Two-axis profile + precision gate |
| **Feel** | Transactional | Passive | Human-like, remembers you |

### The Moat — Three Compounding Layers

**Layer 1 — Modular Teaching Architecture**
Atlas upgrades faster than monolithic competitors. When a better base model or retrieval method arrives, we swap a module, not the product. Competitors with monolithic architectures face full rebuilds.

**Layer 2 — Learning-Science-Encoded Product**
Pedagogy is hard to replicate from feature inspection. The decisions encoded in Atlas's architecture — why the Explanation Engine is separated from the RAG Engine, why the precision gate exists, why Socratic questioning is built into the core loop — require understanding the research to replicate.

**Layer 3 — Personalization Data Flywheel**
Every interaction sharpens learner profiles and improves outcomes. Over time, Atlas's model of each learner becomes more accurate, its responses more calibrated, and its switching costs higher. This flywheel does not exist for tools without persistent memory.

---

## 13. Build Roadmap

The build sequence is ordered to maximize learning and de-risk each milestone. Trust first, differentiation next, relationship features last.

### Phase 1 — Foundation
**Focus:** Orchestrator + RAG backbone + provenance

**Milestone:** Grounded, cited answers

**What gets built:**
- Orchestrator intent classification and routing
- RAG pipeline with provenance metadata
- Learner profile data model (seeded from onboarding)
- Logging/evaluation harness (groundedness rate)
- Six domain retrieval indexes (initial corpora)

**Success criteria:** Every substantive claim in an Atlas response is traceable to a retrieved source. Groundedness rate is measurable.

---

### Phase 2 — Explanation
**Focus:** Multi-level ladder + depth elevators

**Milestone:** Visible differentiation vs. generic AI chat

**What gets built:**
- Explanation Engine (reformulation layer, not generation layer)
- Four-level depth rendering for all six domains
- Depth elevation / reduction as a first-class interaction (mid-conversation, no re-retrieval)
- Explanation-level accuracy evaluation

**Success criteria:** Any concept in any domain can be rendered at all four levels, with all levels drawing only from retrieved content.

---

### Phase 3 — Visuals
**Focus:** Spec-based tables and graphs, then 3D

**Milestone:** Visual-first learning experience

**What gets built:**
- Visualization Decision Engine (classification + conservative trigger)
- Declarative spec generation from retrieved data
- 2D rendering (tables, graphs, charts)
- Visual addressability mechanism (artifact context in conversation)
- 3D rendering (spatial structures)
- Visual-appropriateness evaluation

**Success criteria:** Visuals are generated when and only when they would accelerate understanding. Every visual is traceable to retrieved data. Follow-up questions about visuals are answered in context.

---

### Phase 4 — Depth
**Focus:** SRP reflection, Socratic mode, domain adapters

**Milestone:** Deep, expert-grade tutoring

**What gets built:**
- SRP reasoning loop (pre-answer planning + post-draft critique)
- Socratic questioning mode (active recall prompts built into core loop)
- Domain adapters (domain-specific explanation conventions and response shapes)
- L4 frontier-level responses with open-problem framing

**Success criteria:** Atlas-generated responses pass expert review for depth and accuracy at L3 and L4. Socratic prompts demonstrably improve concept retention in test cohorts.

---

### Phase 5 — Relationship
**Focus:** Memory, learner profiles, adaptive pacing

**Milestone:** Tool becomes tutor; retention engine

**What gets built:**
- Full persistent memory across all three layers (session state / learner profile / concept history)
- Adaptive pacing based on profile refinement
- Concept resurfacing scheduler (spacing effect implementation)
- Session-return rate instrumentation and optimization

**Success criteria:** Returning learners experience measurably better calibration on their second session than their first. Session-return rate exceeds comparable AI tools.

---

## 14. Evaluation & Success Metrics

Metrics are defined before each phase ships. We do not build features we cannot evaluate.

### Core Metrics

| Metric | Definition | Measurement Method | Phase |
|---|---|---|---|
| **Groundedness Rate** | % of substantive claims traceable to retrieved sources | Source tag logging + LLM-as-judge | Phase 1 |
| **Explanation-Level Accuracy** | Did the depth and register match the learner's profile? | LLM-as-judge against level rubrics | Phase 2 |
| **Visual Appropriateness** | Was a visual generated when it would help, and not when it wouldn't? | Human review + classification audit | Phase 3 |
| **Session-Return Rate** | Did the learner come back? | Instrumented session logging | Phase 5 (north star) |

### Evaluation Harness (Built in Phase 1)

Before any user-facing feature is shipped, the evaluation harness must be able to:
- Send a query through the full system
- Log the Orchestrator's routing decision
- Log which chunks were retrieved and their provenance
- Log the explanation level used
- Log whether a visual was generated and the decision justification
- Score groundedness against a defined threshold

**Policy:** If groundedness rate drops below the defined threshold at any point, new feature work stops until it is restored.

---

## 15. Brand Identity

### The Logo

The Atlas mark is a **geometric, crossbar-free "A"** rendered in white on black. It is not a logotype — it is a structural mark with independent meaning.

**The A Mark — Visual Description**

The primary mark consists of two diagonal strokes meeting at a sharp apex, with no horizontal crossbar. The strokes are of consistent, confident width. The base legs of the A extend with clean, open terminations. The form reads simultaneously as:
- The letter A (for Atlas)
- A mountain peak (ascent, achievement, the learning ladder)
- A structural arch (architecture, stability, grounded knowledge)

**Full Lockup**
The A mark sits above the wordmark "ATLAS" in widely tracked, geometric sans-serif capitals. The relationship between mark and wordmark is vertical and centered, giving the full lockup a monumental, stable quality.

---

### Color System

| Role | Value | Usage |
|---|---|---|
| **Primary Background** | `#000000` (Pure Black) | All primary surfaces, hero backgrounds |
| **Primary Foreground** | `#FFFFFF` (Pure White) | All text, the A mark, all primary UI elements |
| **Inverted Background** | `#FFFFFF` (Pure White) | Light-mode surfaces, document backgrounds |
| **Inverted Foreground** | `#000000` (Pure Black) | Text and mark on light backgrounds |

**Color Philosophy:** Atlas is intentionally monochromatic. No brand color accent. No gradients. The restraint is the statement — it signals the discipline and rigor that the product delivers. This is not a minimalism aesthetic choice; it is a brand character choice.

**Colors to Never Use:**
- Gradients of any kind
- Bright or saturated accent colors
- Semi-transparent overlays that dilute the black/white contract
- The generic blue-and-white palette that signals "generic AI startup"

---

### Typography

| Role | Style | Usage |
|---|---|---|
| **Display / Wordmark** | Geometric sans-serif, all caps, wide tracking | "ATLAS" wordmark; major headings |
| **Body** | Geometric sans-serif, sentence case, standard tracking | All running text, UI copy |
| **Data / Monospace** | Monospace | Code, citations, provenance references |

**Typography Rules:**
- ATLAS wordmark is always all-caps, always wide-tracked
- No decorative or script typefaces anywhere in the brand system
- Type is set to *communicate*, never to decorate
- The A mark in the wordmark mirrors the standalone mark's structure (crossbar-free)

---

### Logo Versions

| Version | Description | Use Case |
|---|---|---|
| **Primary (Stacked)** | A mark above ATLAS wordmark, white on black | All primary brand surfaces, marketing, presentations |
| **Horizontal Lockup** | A mark left of ATLAS wordmark | Navigation bars, headers, email signatures |
| **Icon Only (A Mark)** | The A mark without wordmark | App icon, favicon, avatar, embossed/embroidered applications |
| **Wordmark Only** | ATLAS text without A mark | Contexts where the mark has already appeared nearby |
| **Inverted** | Black on white | Light backgrounds, document headers, print |

---

### Logo Usage Rules

**Always:**
- Maintain the proportional relationship between mark and wordmark
- Use on a solid background (black primary, white inverted)
- Ensure sufficient clear space around the mark (minimum: the height of the crossbar-gap on each side)
- Use the icon-only A mark for sizes below 40px

**Never:**
- Add gradients, shadows, or glows to the mark
- Stretch, distort, or rotate the mark
- Use on a photographic or complex background without a solid backing
- Add color to individual strokes or letterforms
- Use the full lockup at favicon scale — use the icon-only A mark

---

### Brand Personality (Visual)

| Axis | Atlas Position |
|---|---|
| Friendly vs. Professional | Both — approachable expertise |
| Modern vs. Timeless | Timeless with contemporary precision |
| Minimal vs. Detailed | Minimal — the brand practices what the product preaches |
| Bold vs. Subtle | Bold mark, quiet everything else |
| Playful vs. Serious | Serious with warmth |
| Premium vs. Accessible | Premium — built for learners who demand rigor |

---

### What the Logo Communicates

The Atlas mark, in one sentence: **structured ascent toward rigorous knowledge.**

The mark's mountain-peak geometry embeds the product's core metaphor: the learner starts at the base (L1 Intuition) and climbs toward the apex (L4 Frontier). The white-on-black palette communicates authority and clarity. The absence of the crossbar removes the conventional character to create something that feels both letterform and landmark.

---

## 16. Brand Voice & Communication

### Voice Characteristics

**Rigorous without being cold.** Atlas speaks with precision and confidence, but never condescension. It does not hedge unnecessarily, but it acknowledges the boundaries of what is known.

**Direct without being blunt.** Get to the point. Respect the learner's time and intelligence. Do not use filler language or motivational wrapper.

**Warm without being casual.** Atlas is the expert who genuinely cares about your understanding — not the chatbot that says "Great question!" before every response.

**Grounded without being pedantic.** Atlas cites sources and acknowledges uncertainty. It does not show off citation for its own sake.

### Voice Examples

| Context | Say | Don't Say |
|---|---|---|
| Introducing a concept | "Here's how compound interest works — and then I'll show you the math." | "Great! Let me explain compound interest for you!" |
| Citing a source | "According to the 2024 BIS working paper on credit cycles..." | "Studies show..." |
| Moving depth levels | "Let me go one level deeper — this is where the formalism actually matters." | "Okay, let me try to make this more technical!" |
| Acknowledging a gap | "The research here is genuinely contested. Here's what the leading positions are." | "That's a great question — it's complicated!" |
| Offering a visual | "This is easier to see as a chart — here's the yield curve over the period." | "I've created a visualization for you!" |

---

## 17. Long-Term Vision

### Where Atlas Is Going

Atlas's 3–5 year vision is to become the category-defining AI tutor — the product that serious learners recommend without qualification, that institutions deploy with confidence in measurable outcomes, and that sets the standard for what "AI-assisted learning" means.

**The product will evolve across four vectors:**

**1. Domain expansion:** Six launch domains grow to cover the full spectrum of professional and academic knowledge. Each new domain is not an add-on — it is a fully curated corpus with domain-adapted explanation conventions and evaluation criteria.

**2. Institutional channels:** Individual learners are Phase 1. Institutional deployment (universities, professional training programs, upskilling platforms) is the Phase 3 growth vector. Atlas's measurable learning outcomes and provenance-grounded answers make it defensible in academic and professional credentialing contexts.

**3. Sub-brand system:** The A mark as a standalone icon enables a sub-brand architecture. Atlas Finance. Atlas Code. Atlas ML. Each sub-brand carries the parent mark and shares the core architecture while specializing its corpus and explanation conventions.

**4. Assessment layer:** The natural evolution of Socratic mode is lightweight, adaptive assessment — short retrieval-practice checks that give learners a signal of their actual understanding rather than their felt understanding. This closes the illusion-of-knowing loop at the product level.

### The Enduring Bet

Atlas is a bet that the future of AI in education belongs to the best **teaching architecture**, not the biggest model. Every design decision, every engineering choice, and every brand expression should reflect that conviction.

We are building the agent that finally teaches.

---

## 18. Glossary

| Term | Definition |
|---|---|
| **Explanation Ladder** | Atlas's four-level system (L1–L4) for rendering the same grounded content at different depths of complexity |
| **Grounding** | The practice of tracing every substantive claim to a retrieved, citable source — as opposed to generating from parametric model memory |
| **Illusion of Knowing** | The cognitive phenomenon where fluent, confident AI explanations make learners feel they understand when they do not |
| **Orchestrator** | The central coordinating layer that classifies intent, decomposes tasks, and routes work to the appropriate engine |
| **Parametric Memory** | Knowledge stored in a model's weights during training, as opposed to knowledge retrieved at inference time. Unciteable and static |
| **Precision Gate** | The filter that admits only content serving the learner's stated goal at their level, removing extraneous information |
| **Provenance** | The traceable origin of a retrieved claim: source document, section, and retrieval confidence |
| **RAG (Retrieval-Augmented Generation)** | An architecture in which a model's generation is grounded in content retrieved at inference time from a curated corpus |
| **SRP (Self-Reflective Planning)** | Atlas's reasoning loop: plan before answering, critique after drafting |
| **Spacing Effect** | The cognitive science finding that distributed review over time produces better retention than massed study |
| **Visual Addressability** | The property of Atlas-generated visuals by which a learner can ask follow-up questions about the visual and receive answers that reference it specifically |

---

*ATLAS · Internal Company Document · Version 1.0 · July 2026*
*This document is confidential and intended for internal use only.*
*Every significant product, design, or strategy decision should be traceable back to a principle stated here.*

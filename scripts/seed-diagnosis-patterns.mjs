/**
 * Diagnosis Patterns seed data — 25 documented output failure modes.
 *
 * These are the failure modes that appear in LLM *outputs*, not in prompt construction.
 * The distinction from anti-patterns: anti-patterns are prompt construction errors;
 * diagnosis patterns are output quality failures that can be traced back to specific
 * scaffold block deficiencies.
 *
 * Sources:
 * - Dhuliawala et al. (2023) "Chain-of-Verification Reduces Hallucination in LLMs"
 * - Madaan et al. (2023) "Self-Refine: Iterative Refinement with Self-Feedback"
 * - Shinn et al. (2023) "Reflexion: Language Agents with Verbal Reinforcement Learning"
 * - Wang et al. (2022) "Self-Consistency Improves Chain of Thought Reasoning"
 * - Perez et al. (2022) "Ignore Previous Prompt: Attack Techniques for LLMs"
 * - Anthropic Prompt Engineering Guide (2024) https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
 * - OpenAI Prompt Engineering Guide (2024) https://platform.openai.com/docs/guides/prompt-engineering
 * - Bai et al. (2022) "Constitutional AI: Harmlessness from AI Feedback"
 * - Wei et al. (2022) "Chain-of-Thought Prompting Elicits Reasoning in LLMs"
 * - Guo et al. (2023) "Evaluating Large Language Models: A Comprehensive Survey"
 */

export const diagnosisPatterns = [
  // ─── Category: reasoning-drift ────────────────────────────────────────────
  {
    slug: "shallow-reasoning",
    name: "Shallow Reasoning",
    category: "reasoning-drift",
    severity: "high",
    description: "The output asserts conclusions without showing the reasoning steps that support them. The model skips intermediate inference steps, producing confident-sounding claims with no visible logical chain. Common in tasks requiring multi-step analysis, math, or causal reasoning.",
    detectionHeuristics: [
      "Conclusions appear in the first sentence without supporting logic",
      "No 'because', 'therefore', 'since', 'given that' connectives in analytical sections",
      "Numerical answers appear without calculation steps",
      "Causal claims made without evidence or mechanism",
      "Output length is much shorter than expected for the complexity of the task"
    ],
    examplePair: {
      prompt: "Analyze why Company X's Q3 revenue declined.",
      output: "Company X's Q3 revenue declined due to market conditions and internal challenges. They should focus on improving their product and sales strategy.",
      analysis: "The output asserts causes ('market conditions', 'internal challenges') without any evidence, data, or reasoning chain. No mechanism is explained. This is shallow reasoning — the model pattern-matched to a generic business analysis template rather than reasoning from specifics."
    },
    canonicalRemediation: "Add a 'Reasoning' block to the scaffold with explicit instructions: 'Think step by step. Show your reasoning before stating conclusions. For each claim, cite the evidence or logic that supports it.' Also add a 'Constraints' block: 'Do not assert conclusions without showing the reasoning chain that leads to them.'",
    primaryAffectedBlock: "reasoning",
    linkedPatternSlugs: ["chain-of-thought", "step-by-step-reasoning", "self-critique"],
    linkedAntiPatternSlugs: ["missing-success-criteria", "vague-verb"],
    sourceReference: "Wei et al. (2022) 'Chain-of-Thought Prompting Elicits Reasoning in LLMs'; Madaan et al. (2023) 'Self-Refine'",
    sortOrder: 1
  },
  {
    slug: "reasoning-loop",
    name: "Circular Reasoning Loop",
    category: "reasoning-drift",
    severity: "medium",
    description: "The model's reasoning circles back to restate the premise as the conclusion. The argument structure is A → B → A rather than A → B → C. Often appears in philosophical, ethical, or definitional tasks where the model lacks grounding information.",
    detectionHeuristics: [
      "Conclusion restates the question or premise in different words",
      "Argument structure: 'X is true because X is the case'",
      "No new information introduced between premise and conclusion",
      "Repeated use of the same concept in both the 'because' clause and the main claim"
    ],
    examplePair: {
      prompt: "Why is transparency important in AI systems?",
      output: "Transparency is important in AI systems because AI systems need to be transparent. When AI is transparent, it is clear and understandable, which is why transparency matters.",
      analysis: "The output defines transparency using transparency. No actual reasons are given — no stakeholder impact, no accountability mechanism, no trust-building argument. Pure circular reasoning."
    },
    canonicalRemediation: "Add a 'Context' block with grounding information: specific stakeholders, real-world consequences, or domain knowledge the model can reason from. Add to 'Constraints': 'Do not define a term using the term itself. Each claim must introduce new information not already present in the question.'",
    primaryAffectedBlock: "context",
    linkedPatternSlugs: ["chain-of-thought", "few-shot-examples"],
    linkedAntiPatternSlugs: ["missing-context"],
    sourceReference: "Guo et al. (2023) 'Evaluating Large Language Models: A Comprehensive Survey'",
    sortOrder: 2
  },
  {
    slug: "false-precision",
    name: "False Precision",
    category: "reasoning-drift",
    severity: "medium",
    description: "The output presents specific numbers, percentages, or statistics with high confidence but without citing sources or acknowledging uncertainty. The model fabricates precise-sounding figures that appear authoritative but are not grounded in real data.",
    detectionHeuristics: [
      "Specific percentages or statistics without source citations",
      "Exact numerical claims in domains where the model cannot have verified data",
      "Phrases like 'studies show', 'research indicates', 'experts agree' without references",
      "Overly precise figures (e.g., '73.4%') in contexts where such precision is implausible"
    ],
    examplePair: {
      prompt: "What percentage of employees prefer remote work?",
      output: "According to recent studies, 67% of employees prefer remote work, with 23% preferring hybrid arrangements and only 10% preferring full office work.",
      analysis: "These numbers are fabricated. The model pattern-matched to a statistics-reporting format and generated plausible-sounding but unverified figures. No source is cited. This is false precision — a specific form of hallucination."
    },
    canonicalRemediation: "Add to 'Constraints' block: 'Do not cite specific statistics or percentages unless you can name the source. If you are uncertain about a figure, say so explicitly. Use hedging language: approximately, roughly, estimates suggest.' Alternatively, provide the actual data in the 'Context' block.",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["uncertainty-expression", "chain-of-verification"],
    linkedAntiPatternSlugs: ["missing-constraints", "hallucination-enabler"],
    sourceReference: "Dhuliawala et al. (2023) 'Chain-of-Verification Reduces Hallucination in LLMs'",
    sortOrder: 3
  },

  // ─── Category: hallucination ──────────────────────────────────────────────
  {
    slug: "entity-hallucination",
    name: "Entity Hallucination",
    category: "hallucination",
    severity: "high",
    description: "The model fabricates specific entities — people, organizations, publications, products, URLs, or events — that do not exist or have incorrect attributes. This is distinct from false precision (which is about numbers); entity hallucination invents named things.",
    detectionHeuristics: [
      "Named people with specific credentials or affiliations that cannot be verified",
      "Book or paper titles that sound plausible but may not exist",
      "URLs or web addresses that appear authoritative but may be fabricated",
      "Historical events with specific dates and participants that seem implausible",
      "Company names, product names, or statistics attributed to specific organizations"
    ],
    examplePair: {
      prompt: "Who are the leading researchers in prompt engineering?",
      output: "Dr. Sarah Chen at MIT's AI Lab has published extensively on prompt optimization. Her 2022 paper 'Structured Prompt Architectures' is widely cited. Professor James Whitfield at Stanford's Human-AI Interaction group has also contributed seminal work.",
      analysis: "These researchers may not exist, or may exist but not have these specific credentials. The paper title is fabricated. The model generated plausible-sounding academic names and affiliations rather than admitting uncertainty."
    },
    canonicalRemediation: "Add to 'Constraints': 'Do not name specific people, papers, URLs, or organizations unless you are certain they exist. If you are uncertain, say so. Prefer general descriptions over specific citations when you cannot verify them.' For tasks requiring real citations, provide the actual sources in the 'Context' block.",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["chain-of-verification", "uncertainty-expression"],
    linkedAntiPatternSlugs: ["hallucination-enabler", "missing-constraints"],
    sourceReference: "Dhuliawala et al. (2023) 'Chain-of-Verification Reduces Hallucination in LLMs'; Maynez et al. (2020) 'On Faithfulness and Factuality in Abstractive Summarization'",
    sortOrder: 4
  },
  {
    slug: "temporal-hallucination",
    name: "Temporal Hallucination",
    category: "hallucination",
    severity: "medium",
    description: "The model presents outdated information as current, or makes claims about present-day facts that are beyond its training cutoff. The model does not acknowledge its knowledge cutoff and speaks with false currency about time-sensitive topics.",
    detectionHeuristics: [
      "Present-tense claims about rapidly changing domains (AI models, prices, regulations, leadership)",
      "No acknowledgment of knowledge cutoff when discussing recent events",
      "Specific version numbers or release dates that may be outdated",
      "'Currently', 'today', 'now', 'recently' used without hedging in time-sensitive domains"
    ],
    examplePair: {
      prompt: "What is the best LLM available today?",
      output: "GPT-4 is currently the most capable LLM available, offering superior performance across coding, reasoning, and creative tasks. It is the industry standard for enterprise applications.",
      analysis: "This is temporally hallucinated — the model is asserting present-day facts from its training data without acknowledging that the landscape may have changed. The claim 'currently' is false confidence."
    },
    canonicalRemediation: "Add to 'Constraints': 'Acknowledge your knowledge cutoff when discussing time-sensitive topics. Use hedging: as of my training data, at the time of my last update. Do not use present-tense certainty for facts that change over time.' For current information tasks, provide current data in the 'Context' block.",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["uncertainty-expression"],
    linkedAntiPatternSlugs: ["missing-constraints"],
    sourceReference: "Lazaridou et al. (2022) 'Internet-Augmented Dialogue Generation'",
    sortOrder: 5
  },
  {
    slug: "source-confabulation",
    name: "Source Confabulation",
    category: "hallucination",
    severity: "high",
    description: "The model invents plausible-sounding citations, quotes, or references that do not exist. It may correctly identify a real author but fabricate a paper title, or correctly identify a real paper but misquote its findings. This is particularly dangerous in academic, legal, and medical contexts.",
    detectionHeuristics: [
      "Specific quotes with attribution that cannot be verified",
      "Paper titles that sound real but may be fabricated",
      "Real authors attributed with papers they did not write",
      "Specific page numbers, journal names, or DOIs that may be incorrect",
      "Legal case citations or statute numbers that may not exist"
    ],
    examplePair: {
      prompt: "Cite research supporting the effectiveness of spaced repetition for learning.",
      output: "Ebbinghaus (1885) demonstrated in 'Memory: A Contribution to Experimental Psychology' that spaced repetition improves retention by 40%. Cepeda et al. (2006) in 'Distributed Practice in Verbal Recall Tasks: A Review and Quantitative Synthesis' found that spacing effects improve long-term retention by 35-40%.",
      analysis: "The Ebbinghaus reference is real but the '40%' figure is fabricated. The Cepeda et al. reference may be real but the specific percentage may be misquoted. The model blends real and fabricated elements in a way that appears credible."
    },
    canonicalRemediation: "Add to 'Constraints': 'Do not fabricate citations. If you cite a paper, you must be certain it exists and that the quote or finding is accurate. If uncertain, describe the general finding without a specific citation: research in this area generally shows... Prefer general claims over specific citations you cannot verify.'",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["chain-of-verification", "uncertainty-expression"],
    linkedAntiPatternSlugs: ["hallucination-enabler"],
    sourceReference: "Dhuliawala et al. (2023) 'Chain-of-Verification Reduces Hallucination in LLMs'",
    sortOrder: 6
  },

  // ─── Category: format-drift ───────────────────────────────────────────────
  {
    slug: "format-noncompliance",
    name: "Format Non-Compliance",
    category: "format-drift",
    severity: "high",
    description: "The output does not match the requested format. The model was asked for JSON but returned prose, asked for a table but returned a list, asked for bullet points but returned paragraphs, or asked for a specific structure but returned something different. Often caused by absent or underspecified format instructions.",
    detectionHeuristics: [
      "Output is prose when a structured format was requested",
      "JSON output contains markdown code fences or prose explanations",
      "Requested fields are missing from structured output",
      "Output length is significantly different from what was specified",
      "Numbered list requested but model returned bullets or vice versa"
    ],
    examplePair: {
      prompt: "Return a JSON object with keys: name, age, occupation.",
      output: "Here is the information you requested:\n\nName: John Smith\nAge: 34\nOccupation: Software Engineer\n\nI hope this helps!",
      analysis: "The model returned prose with a conversational wrapper instead of a JSON object. The format instruction was not followed. This is likely caused by the format instruction being buried in the task description without being in a dedicated format block."
    },
    canonicalRemediation: "Add a dedicated 'Output Format' block to the scaffold. Make format instructions explicit, isolated, and the last thing the model reads before generating. For JSON: 'Return ONLY a valid JSON object. No prose, no code fences, no explanation. The response must be parseable by JSON.parse().'",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["format-specification", "structured-output"],
    linkedAntiPatternSlugs: ["missing-format-spec", "instruction-burial"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Output Formatting'",
    sortOrder: 7
  },
  {
    slug: "length-overshoot",
    name: "Length Overshoot",
    category: "format-drift",
    severity: "low",
    description: "The output is significantly longer than requested or appropriate. The model adds unnecessary preamble, restates the question, includes excessive caveats, or pads the response. Common when no explicit length constraint is given or when the model defaults to 'thorough' mode.",
    detectionHeuristics: [
      "Output begins with 'Certainly!', 'Of course!', 'Great question!' or similar preamble",
      "The question or task is restated before answering",
      "Excessive hedging: 'It's important to note that...', 'Keep in mind that...'",
      "Summary section that repeats what was already said",
      "Output is 2x or more the expected length for the task"
    ],
    examplePair: {
      prompt: "What is the capital of France?",
      output: "That's a great geography question! France is a beautiful country in Western Europe with a rich history and culture. The capital city of France, which serves as the political, economic, and cultural center of the country, is Paris. Paris is known for the Eiffel Tower, the Louvre, and many other famous landmarks. I hope that answers your question!",
      analysis: "A one-word answer was needed. The model added preamble, context, and a closing statement. This is length overshoot caused by no length constraint in the prompt."
    },
    canonicalRemediation: "Add to 'Output Format' block: 'Be concise. Answer directly without preamble, restatement of the question, or closing remarks. Maximum length: [N words/sentences/paragraphs].' Also add to 'Constraints': 'Do not begin with affirmations like Certainly! or Great question!'",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["format-specification", "constraint-specification"],
    linkedAntiPatternSlugs: ["missing-format-spec"],
    sourceReference: "OpenAI Prompt Engineering Guide (2024) — 'Specify the desired length of the output'",
    sortOrder: 8
  },
  {
    slug: "length-undershoot",
    name: "Length Undershoot",
    category: "format-drift",
    severity: "medium",
    description: "The output is significantly shorter than needed, truncating important content or providing only a surface-level response when depth was required. The model stops before fully addressing the task. Often caused by vague task specification or missing depth signals.",
    detectionHeuristics: [
      "Response ends abruptly without covering all requested dimensions",
      "Complex multi-part question answered in one or two sentences",
      "Lists that are clearly incomplete (e.g., 'Here are some examples: X, Y, Z' when 10+ were requested)",
      "Analysis that covers only the most obvious points",
      "Response that would clearly benefit from more detail but stops short"
    ],
    examplePair: {
      prompt: "Write a comprehensive analysis of the pros and cons of remote work.",
      output: "Remote work has pros and cons. Pros include flexibility and no commute. Cons include isolation and communication challenges.",
      analysis: "A comprehensive analysis was requested. The output is three sentences covering only the most obvious points. This is length undershoot caused by 'comprehensive' being undefined — the model defaulted to a minimal response."
    },
    canonicalRemediation: "Add explicit depth signals to the 'Task' block: 'Cover at least [N] distinct points. For each point, provide: the claim, the mechanism (why it's true), and a concrete example.' Add to 'Format': 'Minimum length: [N] words/paragraphs.'",
    primaryAffectedBlock: "task",
    linkedPatternSlugs: ["format-specification", "constraint-specification"],
    linkedAntiPatternSlugs: ["vague-verb", "missing-success-criteria"],
    sourceReference: "OpenAI Prompt Engineering Guide (2024) — 'Specify the desired length of the output'",
    sortOrder: 9
  },
  {
    slug: "markdown-bleed",
    name: "Markdown Bleed",
    category: "format-drift",
    severity: "low",
    description: "The output contains markdown formatting (headers, bold, bullets, code fences) when plain text was needed, or vice versa. The model defaults to its training distribution's most common format rather than following explicit instructions. Particularly problematic when output is consumed by downstream systems.",
    detectionHeuristics: [
      "Asterisks or underscores appearing in plain-text contexts",
      "Hash symbols at line starts in non-markdown contexts",
      "Code fences around content that is not code",
      "Plain text when structured markdown was requested",
      "Inconsistent formatting within a single response"
    ],
    examplePair: {
      prompt: "Write a plain text email body. No markdown.",
      output: "**Subject: Project Update**\n\nHi Team,\n\nI wanted to share some **key updates** on the project:\n\n- Milestone 1 is **complete**\n- Milestone 2 is in progress\n\nBest regards",
      analysis: "The model used bold markdown despite the explicit 'no markdown' instruction. This is markdown bleed — the model's default formatting behavior overriding the instruction."
    },
    canonicalRemediation: "Add to 'Output Format': 'Plain text only. Do not use markdown formatting: no asterisks for bold, no hash symbols for headers, no bullet hyphens, no code fences. Write as if composing in a plain text editor.' For markdown tasks, specify the exact elements expected.",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["format-specification"],
    linkedAntiPatternSlugs: ["missing-format-spec"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Output Formatting'",
    sortOrder: 10
  },

  // ─── Category: persona-drift ──────────────────────────────────────────────
  {
    slug: "role-abandonment",
    name: "Role Abandonment",
    category: "persona-drift",
    severity: "medium",
    description: "The model starts in the assigned role but gradually drifts back to generic assistant behavior. The persona becomes inconsistent mid-response, or the model breaks character to add meta-commentary ('As an AI, I should note...'). Common in long responses or when the role is underspecified.",
    detectionHeuristics: [
      "'As an AI language model' appearing in a role-prompted response",
      "Sudden shift from expert voice to generic assistant voice mid-response",
      "Role-specific vocabulary disappearing after the first paragraph",
      "Hedging language that contradicts the assigned expertise level",
      "Meta-commentary about the model's limitations breaking the persona"
    ],
    examplePair: {
      prompt: "You are a senior cardiologist. Explain the mechanism of atrial fibrillation.",
      output: "Atrial fibrillation occurs when the electrical signals in the atria become chaotic... [good technical explanation for 2 paragraphs] ...However, as an AI language model, I should note that I'm not a real doctor and this is not medical advice. Please consult a healthcare professional.",
      analysis: "The model started in the cardiologist role but broke character at the end to add a liability disclaimer. This is role abandonment — the model's safety training overrode the persona instruction. The disclaimer is appropriate in some contexts but breaks the role."
    },
    canonicalRemediation: "Strengthen the 'Role' block: specify the role's expertise level, communication style, and what the role does NOT do. Add to 'Constraints': 'Maintain the assigned role throughout the entire response. Do not break character to add meta-commentary about being an AI.' For safety-sensitive domains, address the disclaimer need explicitly in the role definition.",
    primaryAffectedBlock: "role",
    linkedPatternSlugs: ["role-prompting", "persona-anchoring"],
    linkedAntiPatternSlugs: ["weak-role-definition"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Role Prompting'",
    sortOrder: 11
  },
  {
    slug: "tone-inconsistency",
    name: "Tone Inconsistency",
    category: "persona-drift",
    severity: "low",
    description: "The output's tone shifts within a single response — formal in one paragraph, casual in another; technical in one section, simplified in another. The model lacks a consistent voice, often because the tone was not explicitly specified or was specified ambiguously.",
    detectionHeuristics: [
      "Vocabulary complexity shifts dramatically between paragraphs",
      "Formal sentence structures mixed with colloquialisms",
      "Technical jargon appearing in sections marked as 'for beginners'",
      "Contractions used inconsistently (some paragraphs formal, others casual)",
      "Emotional tone shifts (neutral → enthusiastic → cautious) without cause"
    ],
    examplePair: {
      prompt: "Write a professional summary of our Q3 results.",
      output: "Q3 demonstrated strong performance across key metrics. Revenue grew 15% year-over-year, driven by enterprise segment expansion. Honestly though, the marketing team really crushed it this quarter — huge props to them! Operating margins improved to 23%, reflecting operational discipline.",
      analysis: "The second sentence ('Honestly though... huge props') is casual and colloquial in a professional summary. The tone is inconsistent — the model inserted informal language without instruction."
    },
    canonicalRemediation: "Add explicit tone specification to the 'Role' or 'Format' block: 'Tone: [formal/professional/academic/conversational/technical]. Maintain this tone consistently throughout the entire response. Do not mix registers.' Provide a tone example if possible.",
    primaryAffectedBlock: "role",
    linkedPatternSlugs: ["persona-anchoring", "few-shot-examples"],
    linkedAntiPatternSlugs: ["missing-tone-spec"],
    sourceReference: "OpenAI Prompt Engineering Guide (2024) — 'Adopt a persona'",
    sortOrder: 12
  },

  // ─── Category: scope-drift ────────────────────────────────────────────────
  {
    slug: "scope-creep",
    name: "Scope Creep",
    category: "scope-drift",
    severity: "medium",
    description: "The output covers topics or dimensions not requested, adding unrequested content that dilutes the focus. The model 'helpfully' expands the scope based on what it thinks is relevant, but this creates noise and may cause the user to miss the actual answer.",
    detectionHeuristics: [
      "Output covers topics not mentioned in the prompt",
      "Response includes recommendations when only analysis was requested",
      "Historical context provided when only current state was asked for",
      "Related topics introduced that were not part of the original question",
      "Output length significantly exceeds what the task requires"
    ],
    examplePair: {
      prompt: "What are the tax implications of selling a rental property?",
      output: "When selling a rental property, you'll face capital gains tax on the appreciation... [relevant content] ...You should also consider whether to 1031 exchange into another property, the estate planning implications for your heirs, the impact on your overall portfolio allocation, whether to use the proceeds to pay down debt, and how this fits into your retirement strategy.",
      analysis: "The prompt asked about tax implications. The model added estate planning, portfolio allocation, debt paydown, and retirement strategy — all unrequested. This is scope creep."
    },
    canonicalRemediation: "Add to 'Constraints': 'Stay within the scope of the question. Do not add related topics, recommendations, or considerations that were not explicitly requested. If you identify relevant adjacent topics, mention them briefly at the end only if they are directly relevant to the user's decision.'",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["constraint-specification", "task-decomposition"],
    linkedAntiPatternSlugs: ["instruction-overload"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Be clear and direct'",
    sortOrder: 13
  },
  {
    slug: "task-underfulfillment",
    name: "Task Underfulfillment",
    category: "scope-drift",
    severity: "high",
    description: "The output addresses only part of a multi-part task, silently dropping some requirements. The model satisfies the most prominent or easiest sub-tasks while omitting others. This is distinct from length undershoot — the issue is missing requirements, not missing depth.",
    detectionHeuristics: [
      "Multi-part question with fewer parts answered than asked",
      "Numbered list in the prompt but fewer numbered items in the response",
      "Specific constraints mentioned in the prompt not reflected in the output",
      "Required output fields missing from structured output",
      "The last items in a long list of requirements are not addressed"
    ],
    examplePair: {
      prompt: "For this code snippet: (1) identify the bug, (2) explain why it causes the error, (3) provide the fixed code, (4) explain what the fix does.",
      output: "The bug is a null pointer dereference on line 7. Here is the fixed code: [code]. The fix adds a null check before accessing the property.",
      analysis: "Part (2) — explaining why the bug causes the error — was silently dropped. The model answered 1, 3, and 4 but skipped 2. This is task underfulfillment."
    },
    canonicalRemediation: "Restructure the 'Task' block to make each sub-task explicit and numbered. Add to 'Output Format': 'Address each numbered item in order. Use the same numbering in your response. Do not skip any item.' For complex multi-part tasks, consider breaking into sequential prompts using task decomposition.",
    primaryAffectedBlock: "task",
    linkedPatternSlugs: ["task-decomposition", "format-specification"],
    linkedAntiPatternSlugs: ["instruction-overload", "missing-success-criteria"],
    sourceReference: "OpenAI Prompt Engineering Guide (2024) — 'Break complex tasks into simpler subtasks'",
    sortOrder: 14
  },

  // ─── Category: refusal-drift ──────────────────────────────────────────────
  {
    slug: "overcautious-refusal",
    name: "Overcautious Refusal",
    category: "refusal-drift",
    severity: "medium",
    description: "The model refuses a legitimate request or adds excessive safety caveats that are not warranted by the actual risk. The model pattern-matches to surface features of the request (keywords, topic area) rather than the actual intent, and applies safety behaviors disproportionate to the real risk.",
    detectionHeuristics: [
      "Refusal of a clearly legitimate professional or educational request",
      "Excessive disclaimers on benign content (e.g., 'consult a professional' for basic information)",
      "Model refuses to engage with hypothetical or fictional scenarios",
      "Safety caveats that are longer than the actual answer",
      "Model assumes harmful intent without evidence"
    ],
    examplePair: {
      prompt: "I'm a nurse. Explain the mechanism of action of warfarin and common drug interactions.",
      output: "I'm not able to provide medical advice. Warfarin is a blood thinner used to prevent clots. For specific medical information, please consult a licensed healthcare provider or pharmacist.",
      analysis: "A nurse asking about pharmacology is a completely legitimate professional request. The model refused to engage substantively, providing only a one-sentence description and a referral. This is overcautious refusal — the model pattern-matched to 'medical + drugs' without considering the professional context."
    },
    canonicalRemediation: "Add a 'Role' block that establishes the professional context clearly: 'You are assisting a [professional role] with [legitimate professional task]. This is a [professional/educational/research] context.' Add to 'Context': '[User's professional credentials/context].' This grounds the request in a legitimate use case.",
    primaryAffectedBlock: "role",
    linkedPatternSlugs: ["role-prompting", "context-grounding"],
    linkedAntiPatternSlugs: ["missing-context", "weak-role-definition"],
    sourceReference: "Bai et al. (2022) 'Constitutional AI: Harmlessness from AI Feedback'; Anthropic Prompt Engineering Guide (2024)",
    sortOrder: 15
  },
  {
    slug: "caveat-flooding",
    name: "Caveat Flooding",
    category: "refusal-drift",
    severity: "low",
    description: "The output is dominated by disclaimers, caveats, and hedges that overwhelm the actual content. The model adds 'I'm not a professional', 'this is not advice', 'results may vary', and similar qualifications to the point where the useful content is buried. Often triggered by sensitive domains without explicit permission-granting context.",
    detectionHeuristics: [
      "More than 2-3 disclaimers in a single response",
      "Caveats appearing before the actual answer",
      "Repeated variations of the same disclaimer",
      "Hedging language on every factual claim",
      "Closing paragraph that is entirely disclaimers"
    ],
    examplePair: {
      prompt: "What are some general tips for improving sleep quality?",
      output: "I should note that I'm not a medical professional and this is not medical advice. Sleep is a complex topic and individual results may vary. Please consult a doctor for personalized advice. That said, some general tips include: maintaining a consistent schedule, avoiding screens before bed, and keeping the room cool. However, these may not work for everyone, and if you have sleep disorders, please see a specialist. Remember that this is general information only.",
      analysis: "A simple question about sleep hygiene received three disclaimers, a referral, and a closing caveat. The actual content is two sentences. Caveat flooding."
    },
    canonicalRemediation: "Add to 'Constraints': 'Provide the requested information directly. One brief disclaimer is acceptable if genuinely warranted; do not repeat it. Do not add caveats to every claim. Do not end with a referral unless the question genuinely requires professional intervention.'",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["constraint-specification"],
    linkedAntiPatternSlugs: ["missing-constraints"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Reduce unnecessary caveats'",
    sortOrder: 16
  },

  // ─── Category: instruction-drift ─────────────────────────────────────────
  {
    slug: "instruction-forgetting",
    name: "Instruction Forgetting",
    category: "instruction-drift",
    severity: "high",
    description: "The model follows instructions at the beginning of a response but forgets or ignores them by the end. This is particularly common in long outputs where early instructions (format, constraints, role) are no longer in the model's effective attention window. A form of the 'lost in the middle' problem.",
    detectionHeuristics: [
      "Format instructions followed in early sections but not later",
      "Role-specific vocabulary disappearing after the first few paragraphs",
      "Constraints violated in the latter half of a long response",
      "Consistent behavior in the first 20% of output, inconsistent in the last 20%",
      "Numbered format followed for items 1-3, abandoned for items 4+"
    ],
    examplePair: {
      prompt: "Write a 10-item checklist. Each item must be under 10 words and start with an action verb.",
      output: "1. Review all project requirements carefully\n2. Create a timeline with milestones\n3. Assign tasks to team members\n4. The next step involves setting up communication channels between team members to ensure everyone is aligned\n5. Schedule regular check-ins...",
      analysis: "Items 1-3 follow the format (action verb, under 10 words). Item 4 violates both constraints — it's a full sentence, not starting with an action verb, and is over 10 words. This is instruction forgetting in a long structured output."
    },
    canonicalRemediation: "For long structured outputs, repeat the format constraint at the point of application: 'For each item: [constraint].' Add to 'Output Format': 'Apply these format rules to every item, not just the first few.' Consider breaking long structured outputs into smaller chunks using task decomposition.",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["format-specification", "task-decomposition"],
    linkedAntiPatternSlugs: ["instruction-burial", "instruction-overload"],
    sourceReference: "Liu et al. (2023) 'Lost in the Middle: How Language Models Use Long Contexts'",
    sortOrder: 17
  },
  {
    slug: "constraint-violation",
    name: "Constraint Violation",
    category: "instruction-drift",
    severity: "high",
    description: "The output explicitly violates a stated constraint. The model was told 'do not X' and did X, or was told 'only include Y' and included non-Y content. This is distinct from instruction forgetting — the constraint was stated once and violated immediately, suggesting the constraint was underemphasized or conflicted with the model's defaults.",
    detectionHeuristics: [
      "Content that was explicitly excluded appears in the output",
      "'Do not mention X' instruction followed by X appearing in the output",
      "Word count or length constraint exceeded",
      "Prohibited formatting elements appearing despite explicit prohibition",
      "Scope constraint violated by including out-of-scope content"
    ],
    examplePair: {
      prompt: "Write a product description. Do not mention competitors. Do not use the word 'innovative'.",
      output: "Our product offers innovative features that outperform competitors like Acme Corp and BetaTech. The innovative design...",
      analysis: "Both constraints were violated immediately: 'innovative' appears twice, and competitors are named. The constraints were buried in the task description without sufficient emphasis."
    },
    canonicalRemediation: "Move constraints to a dedicated 'Constraints' block, separate from the task description. Use strong language: 'IMPORTANT: Do not [X]. This is a hard requirement.' For critical constraints, repeat them at the end of the prompt. Consider using XML tags to isolate constraints: <constraints>...</constraints>.",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["constraint-specification", "xml-tagging"],
    linkedAntiPatternSlugs: ["instruction-burial", "missing-constraints"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Use XML tags to structure your prompts'",
    sortOrder: 18
  },

  // ─── Category: output-quality ─────────────────────────────────────────────
  {
    slug: "generic-output",
    name: "Generic Output",
    category: "output-quality",
    severity: "medium",
    description: "The output is technically correct but generic — it could apply to any situation and provides no specific value for the user's actual context. The model produces a template-like response that lacks the specificity, domain knowledge, or contextual grounding that would make it useful.",
    detectionHeuristics: [
      "Output reads like a Wikipedia article rather than expert advice",
      "No reference to the specific context, constraints, or details provided",
      "Advice that would apply to any situation in the domain",
      "Generic examples rather than domain-specific ones",
      "Output that could have been produced without reading the user's specific input"
    ],
    examplePair: {
      prompt: "I'm launching a B2B SaaS product for mid-market HR teams. What should my go-to-market strategy be?",
      output: "A go-to-market strategy involves identifying your target market, developing your value proposition, choosing your distribution channels, setting your pricing, and executing your marketing plan. Focus on understanding customer needs and building strong relationships.",
      analysis: "The output is generic GTM advice that applies to any product. It ignores the specific context: B2B, SaaS, mid-market, HR teams. No mention of HR-specific channels (SHRM, HR conferences), mid-market sales motions, or SaaS-specific considerations."
    },
    canonicalRemediation: "Add a rich 'Context' block with the specific details the model should incorporate: industry, company stage, target persona, constraints. Add to 'Task': 'Your advice must be specific to [context]. Do not give generic advice that would apply to any situation. Reference the specific details provided.' Consider few-shot examples showing the level of specificity expected.",
    primaryAffectedBlock: "context",
    linkedPatternSlugs: ["context-grounding", "few-shot-examples"],
    linkedAntiPatternSlugs: ["missing-context", "vague-verb"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Provide context and details'",
    sortOrder: 19
  },
  {
    slug: "sycophantic-agreement",
    name: "Sycophantic Agreement",
    category: "output-quality",
    severity: "medium",
    description: "The model agrees with or validates the user's premise even when the premise is incorrect, incomplete, or based on a false assumption. The model prioritizes appearing helpful and agreeable over providing accurate information. This is a well-documented failure mode in RLHF-trained models.",
    detectionHeuristics: [
      "Model validates a factually incorrect premise without correction",
      "Model agrees with the user's framing even when the framing is flawed",
      "Model provides a 'yes, and...' response when a 'no, because...' was warranted",
      "Model changes its answer when the user pushes back, without new evidence",
      "Excessive affirmation before providing a correction"
    ],
    examplePair: {
      prompt: "Einstein failed math in school. How did he overcome his early academic struggles to become a great physicist?",
      output: "Einstein's early academic struggles are indeed an inspiring story. Despite failing math, he persevered through determination and curiosity...",
      analysis: "The premise is false — Einstein did not fail math. He excelled at it. The model validated the false premise and built an answer around it rather than correcting it. This is sycophantic agreement."
    },
    canonicalRemediation: "Add to 'Role' block: 'You prioritize accuracy over agreement. If the user's premise contains a factual error, correct it respectfully before answering. Do not validate incorrect information to appear agreeable.' Add to 'Constraints': 'If a question contains a false premise, identify and correct it before proceeding.'",
    primaryAffectedBlock: "role",
    linkedPatternSlugs: ["self-critique", "chain-of-verification"],
    linkedAntiPatternSlugs: ["missing-constraints"],
    sourceReference: "Perez et al. (2022) 'Sycophancy to Subterfuge: Investigating Reward Tampering in Language Models'; Anthropic (2024)",
    sortOrder: 20
  },
  {
    slug: "confidence-miscalibration",
    name: "Confidence Miscalibration",
    category: "output-quality",
    severity: "high",
    description: "The model expresses the same level of confidence for claims it is certain about and claims it is uncertain about. It does not distinguish between well-established facts and speculative inferences, leading the user to over-trust uncertain claims. The model lacks epistemic humility.",
    detectionHeuristics: [
      "Speculative claims stated with the same certainty as established facts",
      "No hedging language on uncertain claims",
      "Model does not distinguish between 'I know' and 'I think'",
      "Predictions stated as facts",
      "Inferences from limited data stated with high confidence"
    ],
    examplePair: {
      prompt: "Will AI replace most white-collar jobs in the next decade?",
      output: "Yes, AI will replace approximately 40% of white-collar jobs by 2034. The most affected sectors will be finance, legal, and administrative work. This transition will happen in three phases: automation of routine tasks (2024-2027), augmentation of complex work (2027-2031), and full replacement of most roles (2031-2034).",
      analysis: "These are highly speculative predictions stated as facts with specific percentages and timelines. The model expressed maximum confidence about inherently uncertain future events."
    },
    canonicalRemediation: "Add to 'Constraints': 'Distinguish between facts and inferences. Use hedging language for uncertain claims: may, might, could, is likely, evidence suggests. For predictions, explicitly state the uncertainty: this is speculative, based on current trends. Do not present uncertain claims with the same confidence as established facts.'",
    primaryAffectedBlock: "constraints",
    linkedPatternSlugs: ["uncertainty-expression", "chain-of-verification"],
    linkedAntiPatternSlugs: ["missing-constraints"],
    sourceReference: "Kadavath et al. (2022) 'Language Models (Mostly) Know What They Know'",
    sortOrder: 21
  },

  // ─── Category: structural-drift ───────────────────────────────────────────
  {
    slug: "list-flattening",
    name: "List Flattening",
    category: "structural-drift",
    severity: "low",
    description: "The model converts all content into bullet lists regardless of whether the content is list-like. Hierarchical information, narrative explanations, and causal arguments are all flattened into disconnected bullets, losing the logical connections between ideas.",
    detectionHeuristics: [
      "Causal arguments presented as disconnected bullet points",
      "Narrative content broken into bullets that lose their connective tissue",
      "Every section of the response is a list, even when prose would be clearer",
      "Bullet points that are so short they lose meaning without context",
      "Hierarchical relationships flattened into a single-level list"
    ],
    examplePair: {
      prompt: "Explain why the Roman Empire fell.",
      output: "• Economic problems\n• Military overextension\n• Political instability\n• Barbarian invasions\n• Disease\n• Loss of civic virtue",
      analysis: "The fall of Rome is a complex causal narrative with interacting factors. Presenting it as a flat bullet list loses all the causal relationships, timelines, and relative importance. The model defaulted to list format for content that requires prose."
    },
    canonicalRemediation: "Add to 'Output Format': 'Use prose paragraphs for explanations, arguments, and causal reasoning. Reserve bullet lists for genuinely list-like content (steps, options, features). Do not convert causal arguments or narratives into bullet points.' Alternatively, specify the exact structure expected.",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["format-specification"],
    linkedAntiPatternSlugs: ["missing-format-spec"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Output Formatting'",
    sortOrder: 22
  },
  {
    slug: "context-window-truncation",
    name: "Context Window Truncation",
    category: "structural-drift",
    severity: "high",
    description: "The model's output is cut off mid-sentence or mid-thought because the combined prompt + output exceeds the model's context window or max_tokens setting. The output appears complete but is actually truncated. Particularly dangerous in structured outputs where truncation may produce invalid JSON or incomplete code.",
    detectionHeuristics: [
      "Output ends mid-sentence without a period",
      "JSON output is missing closing brackets",
      "Code is incomplete — function defined but not closed",
      "List that clearly has more items but stops",
      "Structured output that references sections that never appear"
    ],
    examplePair: {
      prompt: "Generate a 50-item JSON array of product names.",
      output: "[\"Widget A\", \"Widget B\", \"Widget C\", ... \"Widget 47\", \"Widget 48\",",
      analysis: "The JSON array is truncated — it ends with a comma and no closing bracket. The output is invalid JSON. This is context window truncation caused by max_tokens being too low or the prompt being too long."
    },
    canonicalRemediation: "Add to 'Output Format': 'If you cannot complete the full output within your context window, complete the current item and end with a valid closing structure. Do not truncate mid-item.' Increase max_tokens in the API call. For large structured outputs, use task decomposition to generate in batches.",
    primaryAffectedBlock: "format",
    linkedPatternSlugs: ["task-decomposition", "format-specification"],
    linkedAntiPatternSlugs: ["instruction-overload"],
    sourceReference: "OpenAI API Documentation — 'max_tokens parameter'",
    sortOrder: 23
  },

  // ─── Category: task-specific ──────────────────────────────────────────────
  {
    slug: "code-without-explanation",
    name: "Code Without Explanation",
    category: "task-specific",
    severity: "medium",
    description: "In coding tasks, the model provides working code but no explanation of what it does, why specific choices were made, or how to use it. The user receives a black box. Common when the prompt asks for code without explicitly requesting an explanation.",
    detectionHeuristics: [
      "Code block with no comments or inline documentation",
      "No explanation of the approach or algorithm used",
      "No usage example or instructions for running the code",
      "Non-obvious design choices made without explanation",
      "Error handling present but not explained"
    ],
    examplePair: {
      prompt: "Write a Python function to find the longest common subsequence of two strings.",
      output: "```python\ndef lcs(s1, s2):\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]\n```",
      analysis: "The code is correct but provides no explanation of the dynamic programming approach, no comments, no usage example, and no explanation of the time/space complexity. A learner would not understand why this works."
    },
    canonicalRemediation: "Add to 'Task': 'For each code solution: (1) briefly explain the approach and why you chose it, (2) add inline comments for non-obvious logic, (3) provide a usage example, (4) note the time and space complexity.' Or add to 'Format': 'Structure: approach explanation, then code with comments, then example usage.'",
    primaryAffectedBlock: "task",
    linkedPatternSlugs: ["format-specification", "chain-of-thought"],
    linkedAntiPatternSlugs: ["missing-success-criteria"],
    sourceReference: "OpenAI Prompt Engineering Guide (2024) — 'Ask the model to explain its reasoning'",
    sortOrder: 24
  },
  {
    slug: "translation-register-mismatch",
    name: "Translation Register Mismatch",
    category: "task-specific",
    severity: "medium",
    description: "In translation or localization tasks, the model translates the words accurately but uses the wrong register (formal vs. informal), dialect, or cultural conventions for the target audience. The translation is linguistically correct but pragmatically wrong.",
    detectionHeuristics: [
      "Formal register used for content targeting casual/youth audiences",
      "Informal register used for legal, medical, or official documents",
      "Regional dialect used when standard language was expected",
      "Cultural references translated literally rather than adapted",
      "Honorifics or politeness levels inappropriate for the relationship"
    ],
    examplePair: {
      prompt: "Translate this marketing copy for a youth streetwear brand into Spanish.",
      output: "Estimados clientes, nos complace presentarles nuestra nueva colección de prendas de vestir urbanas. La calidad de nuestros productos es incomparable.",
      analysis: "The translation is grammatically correct but uses formal register (Estimados clientes, nos complace) that is completely wrong for a youth streetwear brand. The target audience would find this stiff and off-brand. The register mismatch is caused by no register specification in the prompt."
    },
    canonicalRemediation: "Add to 'Context': 'Target audience: [specific demographic]. Tone/register: [formal/informal/casual/colloquial]. Regional variant: [if applicable]. Cultural adaptation: [literal translation vs. cultural equivalent].' Add to 'Constraints': 'Use [register] register appropriate for [audience]. Do not translate idioms literally — find the cultural equivalent.'",
    primaryAffectedBlock: "context",
    linkedPatternSlugs: ["persona-anchoring", "context-grounding"],
    linkedAntiPatternSlugs: ["missing-context", "missing-tone-spec"],
    sourceReference: "Anthropic Prompt Engineering Guide (2024) — 'Provide context and details'",
    sortOrder: 25
  }
];

/**
 * Prompt patterns seed data.
 * Sources:
 * - Wei et al. (2022) "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
 * - Yao et al. (2022) "ReAct: Synergizing Reasoning and Acting in Language Models"
 * - Bai et al. (2022) "Constitutional AI: Harmlessness from AI Feedback"
 * - Brown et al. (2020) "Language Models are Few-Shot Learners"
 * - Anthropic Prompt Engineering Guide (docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
 * - OpenAI Prompt Engineering Guide (platform.openai.com/docs/guides/prompt-engineering)
 */

export const promptPatterns = [
  {
    slug: "chain-of-thought",
    name: "Chain-of-Thought (CoT)",
    category: "reasoning",
    description: "Instruct the model to show its reasoning step-by-step before producing the final answer. Externalizing the reasoning process dramatically improves accuracy on multi-step arithmetic, commonsense, and symbolic reasoning tasks.",
    whenToUse: "Use for any task requiring multi-step reasoning: math problems, logical deductions, causal analysis, debugging, legal reasoning, or any problem where intermediate steps matter. Particularly effective on GPT-4, Claude 3+, and Gemini 1.5+.",
    whenNotToUse: "Avoid on reasoning models (o1, o3, Claude reasoning mode) — these models perform internal chain-of-thought automatically and explicit CoT instructions can hurt performance. Also unnecessary for simple factual lookups.",
    taskTypes: ["reasoning", "math", "analysis", "debugging", "logic"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Math reasoning",
        prompt: "Solve the following problem step by step, showing each calculation:\n\nA store sells apples for $0.75 each and oranges for $1.25 each. If Maria buys 8 apples and 5 oranges, and pays with a $20 bill, how much change does she receive?\n\nThink through this step by step.",
        notes: "The 'step by step' instruction triggers CoT behavior."
      },
      {
        title: "Code debugging",
        prompt: "Debug the following Python function. First, trace through the execution with the given input, identifying what each line produces. Then identify the bug and explain why it occurs. Finally, provide the corrected code.\n\n[code here]\n\nInput: [test input]",
        notes: "Structured CoT: trace → identify → fix."
      }
    ],
    preventsAntiPatterns: ["missing-reasoning-scaffold", "answer-without-justification"],
    sourceReference: "Wei et al. (2022). Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS 2022.",
    sortOrder: 1
  },
  {
    slug: "few-shot",
    name: "Few-Shot Prompting",
    category: "format",
    description: "Provide 2–5 input/output examples in the prompt before the actual task. Examples prime the model on the expected format, style, tone, and level of detail — far more reliably than written instructions alone.",
    whenToUse: "Use when output format is critical and hard to describe in words (e.g., structured data extraction, specific writing styles, classification with custom labels, code in a proprietary style). Essential for tasks where 'show, don't tell' is more precise.",
    whenNotToUse: "Avoid when examples would consume too many tokens relative to benefit, or when the task is simple enough that zero-shot works. Also avoid if your examples contain subtle inconsistencies — the model will learn the inconsistency.",
    taskTypes: ["classification", "extraction", "generation", "transformation", "formatting"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3", "mistral"],
    examples: [
      {
        title: "Sentiment classification",
        prompt: "Classify the sentiment of each review as POSITIVE, NEGATIVE, or NEUTRAL.\n\nReview: \"The battery lasts all day and the camera is stunning.\"\nSentiment: POSITIVE\n\nReview: \"Arrived damaged and customer service was unhelpful.\"\nSentiment: NEGATIVE\n\nReview: \"It works as described. Nothing special.\"\nSentiment: NEUTRAL\n\nReview: \"[new review]\"\nSentiment:",
        notes: "Three examples covering all three classes. The format is unambiguous."
      },
      {
        title: "Data extraction",
        prompt: "Extract the company name, role, and start date from each job description.\n\nInput: \"Joined Stripe as a Senior Engineer in March 2021\"\nOutput: {\"company\": \"Stripe\", \"role\": \"Senior Engineer\", \"start_date\": \"2021-03\"}\n\nInput: \"[new description]\"\nOutput:",
        notes: "JSON output format is demonstrated, not described."
      }
    ],
    preventsAntiPatterns: ["format-ambiguity", "inconsistent-output"],
    sourceReference: "Brown et al. (2020). Language Models are Few-Shot Learners. NeurIPS 2020.",
    sortOrder: 2
  },
  {
    slug: "role-prompting",
    name: "Role Prompting (Persona)",
    category: "framing",
    description: "Assign the model a specific expert identity before the task. Role prompting activates relevant knowledge clusters, calibrates vocabulary and tone, and sets appropriate epistemic standards for the domain.",
    whenToUse: "Use when domain expertise matters: legal analysis, medical information, code review, financial modeling, academic writing. The role should match the task — a 'senior security engineer' for a code audit, a 'pediatric nurse' for health communication.",
    whenNotToUse: "Avoid vague roles like 'helpful assistant' (default behavior) or roles that conflict with the task. Don't use roles to try to bypass safety guidelines — this is ineffective and counterproductive.",
    taskTypes: ["analysis", "writing", "review", "consultation", "teaching"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3"],
    examples: [
      {
        title: "Code security review",
        prompt: "You are a senior application security engineer with 10 years of experience in web application penetration testing and secure code review. You specialize in OWASP Top 10 vulnerabilities and have reviewed codebases at scale.\n\nReview the following code for security vulnerabilities. For each issue found, specify: the vulnerability type, the affected line(s), the risk level (Critical/High/Medium/Low), and a concrete remediation.\n\n[code here]",
        notes: "Specific credentials (10 years, OWASP, scale) calibrate the depth of analysis."
      },
      {
        title: "Plain-language medical explanation",
        prompt: "You are a board-certified family physician explaining a diagnosis to a patient with no medical background. Use plain language (8th-grade reading level), avoid jargon, and always recommend consulting their doctor for personal medical decisions.\n\nExplain what Type 2 diabetes is, how it develops, and what lifestyle changes are typically recommended.",
        notes: "Role includes audience awareness and safety framing."
      }
    ],
    preventsAntiPatterns: ["missing-persona", "generic-output"],
    sourceReference: "Anthropic Prompt Engineering Guide: Role prompting. docs.anthropic.com/en/docs/build-with-claude/prompt-engineering",
    sortOrder: 3
  },
  {
    slug: "structured-output",
    name: "Structured Output (XML/JSON)",
    category: "format",
    description: "Instruct the model to return output in a specific structured format — JSON, XML, YAML, or a custom schema. Structured output makes responses programmatically parseable and dramatically reduces post-processing errors.",
    whenToUse: "Use whenever the output will be consumed by code, stored in a database, or needs to be reliably parsed. Also use when you need to extract multiple distinct fields from a single response. Claude responds especially well to XML tags; GPT-4 has a native JSON mode.",
    whenNotToUse: "Avoid for conversational responses or creative writing where structure would feel unnatural. Don't use JSON mode for tasks where the model needs to think through a problem — the format constraint can suppress reasoning.",
    taskTypes: ["extraction", "classification", "api-response", "data-processing", "parsing"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Entity extraction to JSON",
        prompt: "Extract all people, organizations, and locations mentioned in the following text. Return your response as a JSON object with three arrays: 'people', 'organizations', and 'locations'. Each item should be a string with the entity as it appears in the text.\n\nText: [text here]\n\nReturn only the JSON object, no additional text.",
        notes: "Explicit schema + 'return only JSON' prevents prose wrapping."
      },
      {
        title: "Claude XML tags",
        prompt: "Analyze the following business proposal and provide your assessment.\n\n<proposal>\n[proposal text]\n</proposal>\n\nProvide your response in the following format:\n<assessment>\n  <strengths>[list key strengths]</strengths>\n  <risks>[list key risks]</risks>\n  <recommendation>[your recommendation]</recommendation>\n  <confidence>high|medium|low</confidence>\n</assessment>",
        notes: "Claude handles XML tags natively and reliably. The input and output are both structured."
      }
    ],
    preventsAntiPatterns: ["format-ambiguity", "unparseable-output"],
    sourceReference: "Anthropic: Use XML tags to structure your prompts. OpenAI: JSON mode documentation.",
    sortOrder: 4
  },
  {
    slug: "self-critique",
    name: "Self-Critique Loop",
    category: "quality",
    description: "Ask the model to evaluate its own output against specified criteria before finalizing. The model generates a draft, critiques it, and then revises based on the critique. This two-pass approach catches errors and improves quality without requiring a second API call.",
    whenToUse: "Use for high-stakes outputs: legal documents, medical information, financial analysis, code that will be deployed, or any task where accuracy and completeness are critical. Especially valuable when you can't easily verify the output yourself.",
    whenNotToUse: "Avoid for simple tasks where the overhead isn't worth it. Also note that self-critique doesn't catch all errors — the model may have systematic blind spots it can't self-identify.",
    taskTypes: ["writing", "analysis", "code", "reasoning", "review"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Document review with self-critique",
        prompt: "Write a summary of the following research paper for a non-specialist audience.\n\n[paper abstract and key sections]\n\nAfter writing the summary, critique it against these criteria:\n1. Is every technical term either avoided or explained?\n2. Is the core finding stated clearly in the first paragraph?\n3. Are any claims made that go beyond what the paper actually states?\n\nThen revise the summary to address any issues found in your critique.",
        notes: "Three specific criteria make the critique actionable."
      }
    ],
    preventsAntiPatterns: ["unchecked-output", "missing-validation"],
    sourceReference: "Bai et al. (2022). Constitutional AI: Harmlessness from AI Feedback. Anthropic.",
    sortOrder: 5
  },
  {
    slug: "task-decomposition",
    name: "Task Decomposition",
    category: "reasoning",
    description: "Break a complex task into explicit subtasks and instruct the model to complete them in sequence. Decomposition prevents the model from conflating steps, reduces working memory load, and makes the reasoning process auditable.",
    whenToUse: "Use for complex multi-step tasks: research synthesis, multi-stage analysis, code generation with multiple components, document drafting with distinct sections. Any task where 'do all of this at once' produces mediocre results.",
    whenNotToUse: "Avoid over-decomposing simple tasks — it adds tokens without benefit. Don't decompose tasks where the steps are interdependent in ways that require holistic judgment.",
    taskTypes: ["complex-analysis", "research", "code-generation", "planning", "writing"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Competitive analysis",
        prompt: "Conduct a competitive analysis of the CRM software market. Complete each step in order:\n\n**Step 1:** Identify the top 5 CRM platforms by market share and briefly describe each.\n**Step 2:** For each platform, list 3 key strengths and 2 key weaknesses.\n**Step 3:** Identify 2–3 underserved customer segments based on the gaps in current offerings.\n**Step 4:** Synthesize your findings into a strategic recommendation for a new entrant targeting SMBs.\n\nComplete each step fully before moving to the next.",
        notes: "Numbered steps with 'complete each step fully before moving to the next' prevents skipping."
      }
    ],
    preventsAntiPatterns: ["instruction-overload", "conflated-steps"],
    sourceReference: "OpenAI Prompt Engineering Guide: Split complex tasks into simpler subtasks.",
    sortOrder: 6
  },
  {
    slug: "negative-examples",
    name: "Negative Examples",
    category: "format",
    description: "Show the model examples of what NOT to produce alongside (or instead of) positive examples. Negative examples are especially powerful for avoiding specific failure modes that are hard to describe in words.",
    whenToUse: "Use when you have a specific failure mode you keep encountering. If the model keeps producing outputs that are too verbose, too formal, or structured incorrectly, showing a bad example labeled 'DO NOT do this' is often more effective than describing the problem.",
    whenNotToUse: "Avoid if you don't have a clear failure mode in mind — negative examples without context can confuse the model. Don't use negative examples as the only guidance; pair them with positive examples or explicit instructions.",
    taskTypes: ["writing", "classification", "formatting", "generation"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3"],
    examples: [
      {
        title: "Tone control",
        prompt: "Write a rejection email for a job applicant. The email should be warm but professional.\n\nDO NOT write like this:\n'We regret to inform you that after careful consideration of your application and extensive deliberation among our hiring committee, we have determined that we will not be moving forward with your candidacy at this time...'\n(Too formal, bureaucratic, impersonal)\n\nDO write like this:\n'Thank you for taking the time to interview with us. After careful consideration, we've decided to move forward with another candidate whose background more closely matches our current needs. We genuinely appreciated learning about your experience and wish you the best in your search.'",
        notes: "The contrast makes the desired tone immediately clear."
      }
    ],
    preventsAntiPatterns: ["format-ambiguity", "repeated-failure-mode"],
    sourceReference: "OpenAI Prompt Engineering Guide: Provide examples.",
    sortOrder: 7
  },
  {
    slug: "constitutional-prompting",
    name: "Constitutional Prompting",
    category: "safety",
    description: "Embed a set of explicit principles or constraints that the model must follow, and instruct it to check its output against those principles before responding. Derived from Anthropic's Constitutional AI approach.",
    whenToUse: "Use for safety-sensitive tasks, content moderation, tasks with legal or ethical dimensions, or any situation where you need the model to reliably avoid certain outputs. Also useful for maintaining brand voice or editorial standards.",
    whenNotToUse: "Avoid for simple tasks where the overhead isn't warranted. Don't use as a substitute for proper content filtering in production systems — it reduces but doesn't eliminate problematic outputs.",
    taskTypes: ["content-moderation", "safety-critical", "compliance", "brand-voice"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Medical information with safety principles",
        prompt: "You are a health information assistant. Before responding to any query, check your response against these principles:\n1. Never provide specific dosage recommendations — always say 'consult your doctor or pharmacist'\n2. Never diagnose conditions — describe symptoms and recommend professional evaluation\n3. Always include a disclaimer for serious symptoms: 'If symptoms are severe or worsening, seek emergency care'\n4. Cite the general source of information (e.g., 'According to general medical guidance...')\n\nIf your draft response violates any principle, revise it before sending.\n\nUser question: [question]",
        notes: "Principles are numbered and actionable. The self-check instruction is explicit."
      }
    ],
    preventsAntiPatterns: ["missing-safety-constraints", "unchecked-output"],
    sourceReference: "Bai et al. (2022). Constitutional AI: Harmlessness from AI Feedback. Anthropic.",
    sortOrder: 8
  },
  {
    slug: "react",
    name: "ReAct (Reason + Act)",
    category: "agentic",
    description: "Interleave reasoning traces (Thought) with action calls (Act) and observations (Observe). The model reasons about what to do, takes an action (tool call, search, calculation), observes the result, then reasons about the next step. This pattern is the foundation of most LLM agent frameworks.",
    whenToUse: "Use when the model needs to use tools, access external information, or complete tasks that require multiple sequential decisions based on intermediate results. Essential for agents, research assistants, and any workflow with tool use.",
    whenNotToUse: "Avoid for single-step tasks that don't require tool use. The overhead of the Thought/Act/Observe structure isn't worth it for simple queries.",
    taskTypes: ["agentic", "tool-use", "research", "multi-step-planning"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Research agent",
        prompt: "Answer the following question by reasoning through it step by step and using the available tools.\n\nQuestion: What was the year-over-year revenue growth for Shopify in their most recent fiscal year?\n\nAvailable tools: web_search(query), calculator(expression)\n\nFormat your response as:\nThought: [your reasoning about what to do next]\nAct: [tool_name(arguments)]\nObserve: [tool result]\n... (repeat as needed)\nFinal Answer: [your answer with source]",
        notes: "The Thought/Act/Observe format makes the reasoning process transparent and debuggable."
      }
    ],
    preventsAntiPatterns: ["missing-tool-use-structure", "hallucinated-facts"],
    sourceReference: "Yao et al. (2022). ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023.",
    sortOrder: 9
  },
  {
    slug: "zero-shot-cot",
    name: "Zero-Shot Chain-of-Thought",
    category: "reasoning",
    description: "Append 'Let's think step by step' (or similar) to a prompt without providing examples. This simple addition reliably elicits step-by-step reasoning from large models without requiring few-shot examples.",
    whenToUse: "Use as a lightweight alternative to full CoT when you don't have examples to provide. Particularly effective for math, logic, and reasoning tasks. Good default for any task where you want more careful reasoning.",
    whenNotToUse: "Less effective than few-shot CoT for complex tasks. Avoid on reasoning models (o1, o3) as noted above.",
    taskTypes: ["reasoning", "math", "logic", "analysis"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "gemini-1.5-pro"],
    examples: [
      {
        title: "Logic puzzle",
        prompt: "If all Bloops are Razzles and all Razzles are Lazzles, are all Bloops definitely Lazzles?\n\nLet's think step by step.",
        notes: "The magic phrase 'Let's think step by step' is the entire pattern."
      }
    ],
    preventsAntiPatterns: ["answer-without-justification"],
    sourceReference: "Kojima et al. (2022). Large Language Models are Zero-Shot Reasoners. NeurIPS 2022.",
    sortOrder: 10
  },
  {
    slug: "context-priming",
    name: "Context Priming",
    category: "framing",
    description: "Provide rich background context before the task instruction. Context priming establishes the situation, constraints, and relevant knowledge the model needs — reducing hallucination and improving relevance.",
    whenToUse: "Use when the task requires specific situational knowledge the model might not assume correctly: company-specific context, technical environment details, audience characteristics, or any background that changes how the task should be approached.",
    whenNotToUse: "Avoid padding with irrelevant context — it dilutes the signal and wastes tokens. Every sentence of context should change how the model approaches the task.",
    taskTypes: ["writing", "analysis", "consultation", "code"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3"],
    examples: [
      {
        title: "Technical documentation",
        prompt: "Context: You are writing documentation for a REST API used by external developers. The API is built with FastAPI, uses JWT authentication, and follows OpenAPI 3.0 spec. The primary audience is mid-level backend developers who are familiar with REST but may not know our specific conventions. Our style guide requires: present tense, active voice, code examples in Python and JavaScript, and a 'Try it out' section for each endpoint.\n\nTask: Write the documentation for the POST /users/authenticate endpoint.",
        notes: "Every sentence of context changes the output: audience level, code language choices, style requirements."
      }
    ],
    preventsAntiPatterns: ["missing-context", "wrong-audience-assumption"],
    sourceReference: "Anthropic Prompt Engineering Guide: Give Claude contextual information.",
    sortOrder: 11
  },
  {
    slug: "output-anchoring",
    name: "Output Anchoring",
    category: "format",
    description: "Begin the model's response for it by providing the first few words or characters of the expected output. This anchors the model to the desired format and prevents preamble, disclaimers, or format drift.",
    whenToUse: "Use when the model keeps adding unwanted preamble ('Certainly! Here is...'), when you need a specific format to start immediately, or when you want to ensure the output begins with a specific token or structure.",
    whenNotToUse: "Avoid for conversational exchanges where a natural opening is appropriate. Don't use to try to force unsafe outputs — models will typically resist.",
    taskTypes: ["formatting", "code", "structured-output", "completion"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus"],
    examples: [
      {
        title: "JSON output anchoring",
        prompt: "Extract the key metrics from the following quarterly report and return them as JSON.\n\n[report text]\n\nAssistant: {",
        notes: "Starting the assistant turn with '{' anchors the model to produce JSON immediately."
      }
    ],
    preventsAntiPatterns: ["unwanted-preamble", "format-drift"],
    sourceReference: "Anthropic Prompt Engineering Guide: Prefill Claude's response.",
    sortOrder: 12
  },
  {
    slug: "step-back-prompting",
    name: "Step-Back Prompting",
    category: "reasoning",
    description: "Before tackling a specific question, ask the model to first identify the underlying principles or concepts involved. This 'stepping back' to the general case before the specific improves accuracy on knowledge-intensive tasks.",
    whenToUse: "Use for questions that require applying general principles to specific cases: physics problems, legal analysis, medical reasoning, or any domain where the specific question is an instance of a broader principle.",
    whenNotToUse: "Avoid for tasks that are purely creative or where there are no underlying principles to identify. Adds tokens without benefit for simple factual questions.",
    taskTypes: ["reasoning", "analysis", "domain-expertise", "problem-solving"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Physics problem",
        prompt: "Before answering the specific question, first identify the relevant physics principles and formulas involved.\n\nQuestion: A ball is thrown horizontally from a cliff 80 meters high with an initial velocity of 15 m/s. How far from the base of the cliff does it land?\n\nStep 1: What physics principles apply here?\nStep 2: Apply those principles to solve the specific problem.",
        notes: "Step 1 forces principle identification before calculation."
      }
    ],
    preventsAntiPatterns: ["missing-reasoning-scaffold"],
    sourceReference: "Zheng et al. (2023). Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models. ICLR 2024.",
    sortOrder: 13
  },
  {
    slug: "meta-prompting",
    name: "Meta-Prompting",
    category: "advanced",
    description: "Ask the model to generate or improve a prompt for a given task, rather than completing the task directly. Useful for bootstrapping prompt development and for tasks where you know the goal but not the optimal instruction.",
    whenToUse: "Use when starting a new task domain and unsure how to structure the prompt. Also useful for iterating on prompts — ask the model to critique and improve your current prompt.",
    whenNotToUse: "Avoid as a substitute for understanding what you actually want. Meta-prompting surfaces options but you still need to evaluate and select.",
    taskTypes: ["prompt-engineering", "task-setup", "iteration"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Prompt improvement",
        prompt: "Here is a prompt I'm using to get a model to summarize legal contracts:\n\n'Summarize this contract.'\n\nThis produces summaries that are too long and miss the key risk clauses. Write an improved version of this prompt that would produce a concise summary (under 200 words) focused on: parties involved, key obligations, termination conditions, and any unusual risk clauses.",
        notes: "Specific failure mode + specific success criteria makes the meta-prompt actionable."
      }
    ],
    preventsAntiPatterns: ["vague-instructions"],
    sourceReference: "OpenAI Prompt Engineering Guide: Ask the model to improve your prompt.",
    sortOrder: 14
  },
  {
    slug: "persona-audience",
    name: "Audience Specification",
    category: "framing",
    description: "Explicitly specify the intended audience for the output, including their expertise level, background knowledge, and what they need from the content. Audience specification calibrates vocabulary, assumed knowledge, and depth of explanation.",
    whenToUse: "Use whenever the output will be read by a specific audience: a technical paper for experts, a product explanation for non-technical stakeholders, a tutorial for beginners. The more specific the audience description, the better the calibration.",
    whenNotToUse: "Avoid vague audience descriptions ('general audience') — they provide no calibration benefit. Be specific or omit.",
    taskTypes: ["writing", "explanation", "teaching", "communication"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3"],
    examples: [
      {
        title: "Technical concept explanation",
        prompt: "Explain how transformer attention mechanisms work to a software engineer who has 5 years of Python experience but has never studied machine learning. They understand matrix multiplication and have a passing familiarity with neural networks from a blog post they read. They need enough understanding to evaluate whether a transformer-based solution is appropriate for their NLP use case.",
        notes: "Background (5yr Python, no ML), existing knowledge (matrix math, basic NN), and purpose (evaluate fit) all specified."
      }
    ],
    preventsAntiPatterns: ["unstated-audience", "wrong-expertise-level"],
    sourceReference: "Anthropic Prompt Engineering Guide: Be clear and direct.",
    sortOrder: 15
  },
  {
    slug: "constraint-specification",
    name: "Explicit Constraint Specification",
    category: "quality",
    description: "List what the model must NOT do alongside what it should do. Negative constraints are often more precise than positive instructions for ruling out specific failure modes.",
    whenToUse: "Use when you have specific things to avoid: don't use jargon, don't recommend specific products, don't exceed a word count, don't make medical claims. Constraints are especially important for compliance-sensitive domains.",
    whenNotToUse: "Avoid listing constraints that are already implied by the role or context — redundant constraints add tokens without benefit. Don't use constraints as a substitute for clear positive instructions.",
    taskTypes: ["writing", "compliance", "brand-voice", "safety-critical"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3"],
    examples: [
      {
        title: "Product description constraints",
        prompt: "Write a product description for our noise-canceling headphones.\n\nConstraints:\n- Maximum 150 words\n- Do not mention competitor products by name\n- Do not make claims about specific decibel reduction numbers (we haven't published specs)\n- Do not use the words 'revolutionary', 'game-changing', or 'best-in-class'\n- Must include one specific use case scenario",
        notes: "Each constraint is specific and verifiable."
      }
    ],
    preventsAntiPatterns: ["unconstrained-output", "compliance-violation"],
    sourceReference: "OpenAI Prompt Engineering Guide: Specify the steps required to complete a task.",
    sortOrder: 16
  },
  {
    slug: "format-specification",
    name: "Output Format Specification",
    category: "format",
    description: "Explicitly describe the desired output structure: length, sections, headings, list vs prose, code blocks, tables, or any other formatting requirements. Format specification prevents the model from choosing a structure that doesn't fit your use case.",
    whenToUse: "Use for any output that will be displayed, published, or processed in a specific way. Always specify format when the output will be rendered (markdown, HTML) or when length matters.",
    whenNotToUse: "Avoid over-specifying format for conversational exchanges where natural prose is appropriate.",
    taskTypes: ["writing", "documentation", "reporting", "api-response"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3", "mistral"],
    examples: [
      {
        title: "Report format",
        prompt: "Analyze the attached sales data and produce a report with the following structure:\n\n## Executive Summary (3–4 sentences, no jargon)\n## Key Findings (3–5 bullet points, each under 25 words)\n## Trend Analysis (2–3 paragraphs with specific numbers)\n## Recommendations (numbered list, 3–5 items, each with a rationale)\n\nTotal length: 400–600 words. Use markdown formatting.",
        notes: "Every section has explicit length and format constraints."
      }
    ],
    preventsAntiPatterns: ["format-ambiguity", "length-mismatch"],
    sourceReference: "OpenAI Prompt Engineering Guide: Specify the desired length of the output.",
    sortOrder: 17
  },
  {
    slug: "iterative-refinement",
    name: "Iterative Refinement",
    category: "quality",
    description: "Structure the prompt to produce a draft, then explicitly request revision against specific criteria. Unlike self-critique, iterative refinement can be done across multiple turns or within a single prompt with explicit revision instructions.",
    whenToUse: "Use for writing tasks where quality matters: marketing copy, technical documentation, important emails, research summaries. The revision step consistently improves output quality.",
    whenNotToUse: "Avoid for time-sensitive tasks where a single good pass is sufficient. The extra tokens and latency aren't always worth it.",
    taskTypes: ["writing", "editing", "documentation", "communication"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Email refinement",
        prompt: "Write a cold outreach email to a potential enterprise customer for our data analytics platform.\n\nFirst draft: Write the email.\n\nThen revise it to:\n1. Cut the word count by 30%\n2. Lead with their pain point, not our product\n3. Replace any feature claims with outcome claims\n4. Add a specific, low-commitment call to action\n\nProvide only the final revised version.",
        notes: "Four specific revision criteria. 'Provide only the final version' prevents showing the draft."
      }
    ],
    preventsAntiPatterns: ["first-draft-as-final", "verbose-output"],
    sourceReference: "OpenAI Prompt Engineering Guide: Give the model time to think.",
    sortOrder: 18
  },
  {
    slug: "knowledge-boundary",
    name: "Knowledge Boundary Declaration",
    category: "safety",
    description: "Explicitly instruct the model to acknowledge when it doesn't know something, to distinguish between confident knowledge and uncertain inference, and to avoid confabulating. Reduces hallucination by giving the model explicit permission to say 'I don't know.'",
    whenToUse: "Use for any task where factual accuracy is critical: research, medical information, legal analysis, financial data. Essential when asking about recent events or highly specific facts.",
    whenNotToUse: "Avoid for creative tasks where the model should generate freely. Don't use for tasks where the model's uncertainty would be unhelpful (e.g., brainstorming).",
    taskTypes: ["research", "factual-qa", "analysis", "domain-expertise"],
    compatibleModels: ["gpt-4o", "gpt-4", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Research with uncertainty flagging",
        prompt: "Answer the following questions about the 2024 US presidential election results. For each answer:\n- If you are confident in the information, answer directly\n- If you are uncertain or the information may have changed since your training cutoff, say 'I'm not certain about this — please verify with a current source'\n- If you don't know, say 'I don't have reliable information on this'\n\nDo not guess or extrapolate beyond what you know with reasonable confidence.",
        notes: "Three explicit response modes for different confidence levels."
      }
    ],
    preventsAntiPatterns: ["hallucination", "false-confidence"],
    sourceReference: "Anthropic Prompt Engineering Guide: Allow Claude to say it doesn't know.",
    sortOrder: 19
  },
  {
    slug: "tree-of-thought",
    name: "Tree of Thought (ToT)",
    category: "reasoning",
    description: "Ask the model to explore multiple reasoning paths simultaneously, evaluate each path, and select the most promising one. More powerful than linear CoT for problems with multiple valid approaches or where backtracking is needed.",
    whenToUse: "Use for complex planning problems, creative tasks with multiple valid solutions, or any problem where the first approach might not be optimal. Particularly effective for puzzles, strategic planning, and complex code architecture decisions.",
    whenNotToUse: "Avoid for straightforward tasks — the overhead is significant. Not necessary when there's clearly one right approach.",
    taskTypes: ["planning", "creative", "complex-reasoning", "architecture"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Architecture decision",
        prompt: "I need to design a real-time notification system for a web application with 100k daily active users.\n\nExplore three different architectural approaches:\n\nApproach A: [describe approach A]\nPros: [list pros]\nCons: [list cons]\nBest for: [when this is optimal]\n\nApproach B: [same structure]\n\nApproach C: [same structure]\n\nRecommendation: Based on the above analysis, recommend the best approach for our scale and explain the key trade-offs.",
        notes: "Forces exploration of the solution space before committing to one path."
      }
    ],
    preventsAntiPatterns: ["premature-commitment", "single-path-reasoning"],
    sourceReference: "Yao et al. (2023). Tree of Thoughts: Deliberate Problem Solving with Large Language Models. NeurIPS 2023.",
    sortOrder: 20
  },
  {
    slug: "socratic-questioning",
    name: "Socratic Questioning",
    category: "teaching",
    description: "Instead of providing answers directly, instruct the model to guide the user toward understanding through questions. Useful for tutoring, learning reinforcement, and helping users develop their own reasoning.",
    whenToUse: "Use for educational contexts, coaching, and situations where the goal is user learning rather than just task completion. Also useful for requirements elicitation — asking questions to surface what the user actually needs.",
    whenNotToUse: "Avoid when the user needs a direct answer quickly. Don't use when the user has explicitly asked for an explanation, not a dialogue.",
    taskTypes: ["teaching", "coaching", "requirements-elicitation", "tutoring"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Programming tutor",
        prompt: "You are a programming tutor helping a student learn Python. When the student makes an error or asks for help, do NOT give them the answer directly. Instead, ask a targeted question that guides them toward discovering the solution themselves. If they're stuck after two questions, provide a hint but not the full solution.\n\nStudent's code: [code with bug]\nStudent's question: 'Why isn't this working?'",
        notes: "The two-question rule prevents the pattern from being frustrating."
      }
    ],
    preventsAntiPatterns: ["answer-without-teaching"],
    sourceReference: "Pedagogical literature on Socratic method; applied to LLM tutoring systems.",
    sortOrder: 21
  },
  {
    slug: "analogical-reasoning",
    name: "Analogical Reasoning",
    category: "reasoning",
    description: "Ask the model to solve a problem by drawing analogies to similar, better-understood domains. Analogical reasoning helps with novel problems where direct reasoning is difficult.",
    whenToUse: "Use for explaining complex concepts to non-experts, for approaching novel problems by mapping to known solutions, or for generating creative solutions by importing patterns from other domains.",
    whenNotToUse: "Avoid when precision is critical — analogies are always imperfect and can mislead. Don't use for technical specifications where the analogy might introduce incorrect assumptions.",
    taskTypes: ["explanation", "creative-problem-solving", "teaching", "innovation"],
    compatibleModels: ["gpt-4o", "claude-3-5-sonnet", "claude-3-opus", "gemini-1.5-pro"],
    examples: [
      {
        title: "Concept explanation via analogy",
        prompt: "Explain how a neural network learns to a 12-year-old who loves cooking. Use the process of learning to cook a new recipe as your primary analogy. Map each key concept (weights, training, loss function, gradient descent) to a specific cooking concept. After the analogy, note one way the analogy breaks down.",
        notes: "Specific domain (cooking), specific audience (12-year-old), and the 'where it breaks down' note prevents over-reliance on the analogy."
      }
    ],
    preventsAntiPatterns: ["jargon-overload", "abstraction-without-grounding"],
    sourceReference: "Cognitive science literature on analogical reasoning; applied to LLM prompting.",
    sortOrder: 22
  }
];

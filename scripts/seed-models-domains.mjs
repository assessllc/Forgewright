/**
 * Model quirks and domain elicitation scripts seed data.
 * Sources: Official API documentation for each provider, current as of Q1 2025.
 */

export const modelQuirks = [
  {
    modelId: "claude-3-5-sonnet-20241022",
    modelFamily: "claude-3-5",
    modelDisplayName: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    strengths: [
      "Excellent at following complex multi-part instructions",
      "Strong XML tag handling for structured I/O",
      "Nuanced writing with consistent voice",
      "Reliable refusal of harmful requests with helpful alternatives",
      "Strong at long-context tasks (200k context window)"
    ],
    weaknesses: [
      "Can be verbose — may need explicit length constraints",
      "Sometimes over-hedges on sensitive topics",
      "Less aggressive at tool use than GPT-4o in some benchmarks"
    ],
    optimizationTips: [
      {
        title: "Use XML tags for structure",
        description: "Claude responds exceptionally well to XML tags for both input structure and output format. Use <context>, <task>, <constraints> to organize input; request <answer>, <reasoning>, <recommendation> for structured output.",
        example: "<context>You are reviewing a contract for a SaaS company.</context>\n<task>Identify all clauses that create unlimited liability.</task>"
      },
      {
        title: "Explicit role with credentials",
        description: "Claude responds well to specific role definitions with credentials. 'You are a senior tax attorney with 15 years of experience in international corporate tax' outperforms 'You are a tax expert'.",
        example: "You are a board-certified emergency physician with 10 years of experience in trauma care."
      },
      {
        title: "Prefill the response",
        description: "Start Claude's response with the first token of the desired format to prevent preamble and anchor the output structure.",
        example: "Assistant: {\n  \"entities\":"
      },
      {
        title: "Avoid explicit CoT for reasoning mode",
        description: "When using Claude's extended thinking mode, do not add 'think step by step' — the model handles this internally and explicit instructions interfere.",
        example: "Use extended_thinking: true in the API call instead of prompt instructions."
      }
    ],
    recommendedPatterns: ["role-prompting", "structured-output", "few-shot", "self-critique", "constitutional-prompting"],
    avoidPatterns: ["cot-on-reasoning-model", "xml-in-gpt"],
    contextWindowTokens: 200000,
    pricing: { inputPer1k: 0.003, outputPer1k: 0.015, currency: "USD" },
    knowledgeCutoff: "2024-04",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: false,
    supportsVision: true,
    sortOrder: 1
  },
  {
    modelId: "claude-3-opus-20240229",
    modelFamily: "claude-3",
    modelDisplayName: "Claude 3 Opus",
    provider: "Anthropic",
    strengths: [
      "Highest reasoning capability in Claude 3 family",
      "Exceptional at nuanced analysis and complex writing",
      "Strong at following subtle stylistic instructions",
      "Best for tasks requiring deep domain expertise"
    ],
    weaknesses: [
      "Significantly slower than Sonnet",
      "Higher cost — 5x Sonnet pricing",
      "Overkill for most routine tasks"
    ],
    optimizationTips: [
      {
        title: "Reserve for high-stakes tasks",
        description: "Use Opus only when the task genuinely requires its reasoning depth: complex legal analysis, nuanced research synthesis, or tasks where Sonnet's output is consistently insufficient.",
        example: "Use Sonnet for drafting, Opus for final review of high-stakes documents."
      },
      {
        title: "Same XML structure as Sonnet",
        description: "All Claude 3 models respond to the same XML tag structure. Prompts that work on Sonnet will work on Opus.",
        example: "See Claude 3.5 Sonnet tips."
      }
    ],
    recommendedPatterns: ["role-prompting", "structured-output", "self-critique", "chain-of-thought"],
    avoidPatterns: ["cot-on-reasoning-model"],
    contextWindowTokens: 200000,
    pricing: { inputPer1k: 0.015, outputPer1k: 0.075, currency: "USD" },
    knowledgeCutoff: "2023-08",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: false,
    supportsVision: true,
    sortOrder: 2
  },
  {
    modelId: "gpt-4o",
    modelFamily: "gpt-4",
    modelDisplayName: "GPT-4o",
    provider: "OpenAI",
    strengths: [
      "Excellent instruction following across diverse task types",
      "Strong JSON mode for structured output",
      "Fast for its capability level",
      "Reliable tool/function calling",
      "Strong at code generation and debugging"
    ],
    weaknesses: [
      "System prompt has less 'weight' than in earlier GPT-4 versions",
      "Can be less nuanced in long creative writing tasks",
      "JSON mode can suppress reasoning — use carefully"
    ],
    optimizationTips: [
      {
        title: "Use system prompt for persistent instructions",
        description: "GPT-4 family models give higher authority to the system prompt. Put role definitions, behavioral constraints, and output format requirements there, not in the user turn.",
        example: "System: You are a senior software engineer specializing in Python. Always include type hints and docstrings. Never use global variables."
      },
      {
        title: "Use JSON mode for structured output",
        description: "GPT-4o has a native JSON mode (response_format: {type: 'json_object'}) that reliably produces valid JSON. Use it instead of prompting for JSON.",
        example: "Set response_format to json_object in the API call. Include 'JSON' in the prompt to activate it."
      },
      {
        title: "Markdown over XML for structure",
        description: "GPT-4 responds better to markdown headers (## Section) than XML tags for organizing prompt sections.",
        example: "## Role\nYou are a...\n\n## Task\nAnalyze the following..."
      },
      {
        title: "Specify 'do not add commentary'",
        description: "GPT-4o tends to add preamble and closing commentary. If you want clean output, explicitly say 'Return only [format], no additional text.'",
        example: "Return only the JSON object. Do not include any explanation or commentary."
      }
    ],
    recommendedPatterns: ["role-prompting", "structured-output", "few-shot", "chain-of-thought", "task-decomposition"],
    avoidPatterns: ["xml-in-gpt"],
    contextWindowTokens: 128000,
    pricing: { inputPer1k: 0.0025, outputPer1k: 0.01, currency: "USD" },
    knowledgeCutoff: "2023-10",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: true,
    supportsVision: true,
    sortOrder: 3
  },
  {
    modelId: "o1",
    modelFamily: "o1",
    modelDisplayName: "OpenAI o1",
    provider: "OpenAI",
    strengths: [
      "State-of-the-art on complex reasoning, math, and coding",
      "Internal chain-of-thought produces more reliable multi-step reasoning",
      "Excellent at PhD-level science and math problems",
      "Strong at complex code architecture"
    ],
    weaknesses: [
      "No system prompt support (as of early 2025)",
      "Significantly higher latency — internal reasoning takes time",
      "Higher cost than GPT-4o",
      "Explicit CoT instructions hurt performance",
      "Less suitable for simple or creative tasks"
    ],
    optimizationTips: [
      {
        title: "Do NOT use explicit CoT",
        description: "o1 performs internal chain-of-thought automatically. Adding 'think step by step' or similar instructions interferes with this process and degrades performance.",
        example: "Just state the problem clearly. The model will reason through it internally."
      },
      {
        title: "Be concise and direct",
        description: "o1 works best with clear, concise problem statements. Avoid lengthy preamble or over-specification — the model's internal reasoning handles complexity.",
        example: "State the problem, provide necessary context, specify the desired output format. That's it."
      },
      {
        title: "Use for genuinely hard problems",
        description: "Reserve o1 for tasks that genuinely require deep reasoning: complex algorithm design, mathematical proofs, multi-step logical deductions. For simpler tasks, GPT-4o is faster and cheaper.",
        example: "o1 is appropriate for: competitive programming problems, complex mathematical derivations, multi-step security analysis."
      },
      {
        title: "Specify output format explicitly",
        description: "Since o1 lacks a system prompt, put all formatting requirements in the user turn. Be explicit about what format you want the final answer in.",
        example: "Provide your answer as: 1) The solution, 2) Time complexity analysis, 3) Space complexity analysis."
      }
    ],
    recommendedPatterns: ["format-specification", "constraint-specification", "knowledge-boundary"],
    avoidPatterns: ["cot-on-reasoning-model", "zero-shot-cot", "chain-of-thought"],
    contextWindowTokens: 128000,
    pricing: { inputPer1k: 0.015, outputPer1k: 0.06, currency: "USD" },
    knowledgeCutoff: "2023-10",
    supportsStreaming: false,
    supportsSystemPrompt: false,
    supportsJsonMode: false,
    supportsVision: true,
    sortOrder: 4
  },
  {
    modelId: "gemini-1.5-pro",
    modelFamily: "gemini-1.5",
    modelDisplayName: "Gemini 1.5 Pro",
    provider: "Google",
    strengths: [
      "Largest context window (1M tokens) of any major model",
      "Strong multimodal capabilities (text, image, video, audio)",
      "Excellent at long-document analysis",
      "Competitive reasoning performance",
      "Good at following structured output instructions"
    ],
    weaknesses: [
      "Safety filters can be more aggressive than other models",
      "Can be verbose in responses",
      "Slightly less reliable at complex instruction following than Claude"
    ],
    optimizationTips: [
      {
        title: "Leverage the 1M context window",
        description: "Gemini 1.5 Pro's 1M token context window is its key differentiator. Use it for tasks that require analyzing entire codebases, long documents, or multiple documents simultaneously.",
        example: "Provide the entire codebase as context for architecture analysis or cross-file refactoring."
      },
      {
        title: "Safety filter awareness",
        description: "Gemini's safety filters are more aggressive than other models. For legitimate use cases involving sensitive topics (medical, legal, security), frame the request with professional context and purpose.",
        example: "You are a cybersecurity researcher analyzing malware behavior for defensive purposes. [task]"
      },
      {
        title: "Multimodal prompting",
        description: "Gemini handles multiple modalities natively. You can combine text instructions with images, video, and audio in a single prompt.",
        example: "Analyze this video recording of the user interface and identify usability issues."
      },
      {
        title: "System instruction vs user turn",
        description: "Gemini uses 'system instruction' (equivalent to system prompt) for persistent role and behavioral constraints. Use it the same way as GPT-4's system prompt.",
        example: "System instruction: You are a financial analyst. Always include a disclaimer that this is not investment advice."
      }
    ],
    recommendedPatterns: ["role-prompting", "structured-output", "few-shot", "context-priming"],
    avoidPatterns: ["missing-domain-priors"],
    contextWindowTokens: 1000000,
    pricing: { inputPer1k: 0.00125, outputPer1k: 0.005, currency: "USD" },
    knowledgeCutoff: "2024-05",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: true,
    supportsVision: true,
    sortOrder: 5
  },
  {
    modelId: "llama-3-70b",
    modelFamily: "llama-3",
    modelDisplayName: "Llama 3 70B",
    provider: "Meta (open-source)",
    strengths: [
      "Open weights — can be self-hosted for privacy and cost",
      "Strong performance for its size",
      "No content filtering (for self-hosted deployments)",
      "Good at instruction following with proper formatting"
    ],
    weaknesses: [
      "Less world knowledge than frontier models",
      "More sensitive to prompt format — requires more explicit instructions",
      "Smaller context window than frontier models",
      "Less reliable at complex multi-step reasoning"
    ],
    optimizationTips: [
      {
        title: "Be more explicit than with frontier models",
        description: "Open-source models require more explicit instructions and fewer implicit assumptions. State everything you want explicitly — don't rely on the model to infer context.",
        example: "Instead of 'Write a professional email', write 'Write a professional email using formal business language, no contractions, and a clear subject line. The email should be 3 paragraphs: introduction, main point, call to action.'"
      },
      {
        title: "Use the correct chat template",
        description: "Llama 3 uses a specific chat template format. When using the API, ensure your provider is applying the correct template. Incorrect formatting significantly degrades performance.",
        example: "Use the provider's chat completion API rather than raw text completion to ensure correct template application."
      },
      {
        title: "Fewer assumptions about world knowledge",
        description: "Llama 3 has less world knowledge than GPT-4 or Claude. Provide more context about domain-specific facts, recent events, or specialized knowledge.",
        example: "Provide background context that you might omit for frontier models: company descriptions, domain terminology, relevant facts."
      }
    ],
    recommendedPatterns: ["context-priming", "few-shot", "format-specification", "constraint-specification"],
    avoidPatterns: ["implicit-assumptions", "hallucination-invitation"],
    contextWindowTokens: 8192,
    pricing: { inputPer1k: 0.0009, outputPer1k: 0.0009, currency: "USD" },
    knowledgeCutoff: "2023-12",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: false,
    supportsVision: false,
    sortOrder: 6
  },
  {
    modelId: "mistral-large",
    modelFamily: "mistral",
    modelDisplayName: "Mistral Large",
    provider: "Mistral AI",
    strengths: [
      "Strong multilingual performance (especially European languages)",
      "Efficient — good performance per token",
      "Good at code generation",
      "Strong structured output following"
    ],
    weaknesses: [
      "Less capable than frontier models on complex reasoning",
      "Smaller knowledge base than GPT-4 or Claude",
      "Less reliable at very long context tasks"
    ],
    optimizationTips: [
      {
        title: "Leverage multilingual strength",
        description: "Mistral Large is particularly strong at French, German, Spanish, Italian, and other European languages. Use it for multilingual tasks where Claude or GPT-4 may be overkill.",
        example: "For translation tasks between European languages, Mistral Large offers strong quality at lower cost."
      },
      {
        title: "Use function calling for structured tasks",
        description: "Mistral supports function calling (tool use) which is more reliable than prompting for JSON output.",
        example: "Define a function schema for your structured output and use function calling instead of JSON prompting."
      }
    ],
    recommendedPatterns: ["few-shot", "structured-output", "format-specification"],
    avoidPatterns: ["hallucination-invitation", "implicit-assumptions"],
    contextWindowTokens: 32000,
    pricing: { inputPer1k: 0.002, outputPer1k: 0.006, currency: "USD" },
    knowledgeCutoff: "2023-12",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: true,
    supportsVision: false,
    sortOrder: 7
  },
  {
    modelId: "gpt-4o-mini",
    modelFamily: "gpt-4",
    modelDisplayName: "GPT-4o mini",
    provider: "OpenAI",
    strengths: [
      "Very low cost — 15x cheaper than GPT-4o",
      "Fast response times",
      "Sufficient for many routine tasks",
      "Good at classification and extraction tasks"
    ],
    weaknesses: [
      "Significantly less capable than GPT-4o on complex reasoning",
      "Less reliable at following complex multi-part instructions",
      "Not suitable for nuanced writing or analysis"
    ],
    optimizationTips: [
      {
        title: "Use for high-volume simple tasks",
        description: "GPT-4o mini is ideal for tasks that run at high volume and don't require deep reasoning: classification, extraction, simple summarization, format conversion.",
        example: "Use for: sentiment classification, entity extraction, FAQ matching, simple translation, format conversion."
      },
      {
        title: "Simpler prompts work better",
        description: "Complex prompt structures are less effective on smaller models. Keep prompts simple and direct. Use few-shot examples instead of complex instructions.",
        example: "For GPT-4o mini, prefer 3 clear examples over a complex instruction paragraph."
      }
    ],
    recommendedPatterns: ["few-shot", "structured-output", "format-specification"],
    avoidPatterns: ["instruction-overload", "single-pass-complex"],
    contextWindowTokens: 128000,
    pricing: { inputPer1k: 0.00015, outputPer1k: 0.0006, currency: "USD" },
    knowledgeCutoff: "2023-10",
    supportsStreaming: true,
    supportsSystemPrompt: true,
    supportsJsonMode: true,
    supportsVision: true,
    sortOrder: 8
  }
];

export const domainScripts = [
  {
    slug: "code",
    name: "Code & Software Development",
    description: "Elicitation script for code generation, debugging, review, and architecture tasks.",
    triggerKeywords: ["code", "function", "script", "debug", "implement", "build", "program", "API", "class", "algorithm", "refactor", "test", "deploy"],
    questions: [
      { id: "language", question: "What programming language and version?", type: "text", defaultValue: "Python 3.11", rationale: "Language choice affects syntax, idioms, and available libraries." },
      { id: "framework", question: "Any framework or library constraints?", type: "text", rationale: "Framework choice affects patterns, conventions, and available tools." },
      { id: "task_type", question: "What type of task?", type: "select", options: ["Generate new code", "Debug existing code", "Code review", "Refactor", "Write tests", "Architecture design"], rationale: "Task type determines the appropriate output structure." },
      { id: "style_guide", question: "Any style guide or conventions to follow?", type: "text", rationale: "Style guides affect naming, formatting, and code organization." },
      { id: "test_requirements", question: "Should tests be included?", type: "boolean", defaultValue: false, rationale: "Test requirements significantly change the output scope." },
      { id: "error_handling", question: "What error handling approach?", type: "select", options: ["Exceptions", "Return codes", "Result types", "Minimal (prototype)"], defaultValue: "Exceptions", rationale: "Error handling approach affects code structure and reliability." },
      { id: "performance", question: "Any performance constraints?", type: "text", rationale: "Performance requirements affect algorithm choice and implementation." }
    ],
    smartDefaults: { language: "Python 3.11", error_handling: "Exceptions", test_requirements: false },
    domainPriors: ["Specify language version and dependency constraints", "Include error handling expectations", "State whether tests are required"],
    sortOrder: 1
  },
  {
    slug: "creative-writing",
    name: "Creative Writing",
    description: "Elicitation script for fiction, poetry, screenwriting, and other creative content.",
    triggerKeywords: ["story", "poem", "fiction", "creative", "write", "narrative", "screenplay", "character", "plot", "scene", "dialogue", "novel", "short story"],
    questions: [
      { id: "genre", question: "What genre or form?", type: "select", options: ["Literary fiction", "Genre fiction (thriller/mystery/sci-fi/fantasy/romance)", "Short story", "Flash fiction", "Poetry", "Screenplay", "Personal essay", "Other"], rationale: "Genre establishes conventions, reader expectations, and structural norms." },
      { id: "length", question: "Approximate length?", type: "text", defaultValue: "500–800 words", rationale: "Length determines scope and pacing." },
      { id: "pov", question: "Point of view?", type: "select", options: ["First person", "Third person limited", "Third person omniscient", "Second person", "Multiple POV"], defaultValue: "Third person limited", rationale: "POV affects narrative distance and reader intimacy." },
      { id: "tone", question: "Tone and mood?", type: "text", defaultValue: "Thoughtful, slightly melancholic", rationale: "Tone calibrates emotional register." },
      { id: "audience", question: "Target audience?", type: "text", defaultValue: "Adult general readers", rationale: "Audience affects vocabulary, themes, and content appropriateness." },
      { id: "style_influence", question: "Any stylistic influences or comparisons?", type: "text", rationale: "Stylistic references are the most efficient way to communicate aesthetic goals." }
    ],
    smartDefaults: { pov: "Third person limited", tone: "Thoughtful, slightly melancholic", audience: "Adult general readers" },
    domainPriors: ["Specify genre conventions", "State POV and narrative voice", "Clarify audience and content level"],
    sortOrder: 2
  },
  {
    slug: "data-analysis",
    name: "Data Analysis",
    description: "Elicitation script for data analysis, visualization, and reporting tasks.",
    triggerKeywords: ["data", "analysis", "analyze", "dataset", "statistics", "chart", "visualization", "report", "metrics", "trends", "SQL", "pandas", "Excel"],
    questions: [
      { id: "data_type", question: "What type of data?", type: "text", rationale: "Data type determines appropriate analysis methods." },
      { id: "output_format", question: "What output format?", type: "select", options: ["Narrative report", "Bullet-point summary", "Data table", "Code (Python/R/SQL)", "Visualization description", "Dashboard spec"], rationale: "Output format determines the structure of the analysis." },
      { id: "aggregation", question: "What level of aggregation?", type: "select", options: ["Individual records", "Summary statistics", "Trends over time", "Comparisons between groups", "Anomaly detection"], rationale: "Aggregation level determines what the analysis should surface." },
      { id: "schema", question: "Describe the data schema (columns, types, relationships)?", type: "text", rationale: "Schema knowledge prevents incorrect assumptions about data structure." },
      { id: "null_handling", question: "How should missing data be handled?", type: "select", options: ["Exclude from analysis", "Flag and include", "Impute with mean/median", "Treat as zero"], defaultValue: "Exclude from analysis", rationale: "Missing data handling significantly affects results." },
      { id: "audience", question: "Who will read this analysis?", type: "select", options: ["Technical (data scientists)", "Business stakeholders", "Executive summary", "General public"], defaultValue: "Business stakeholders", rationale: "Audience determines vocabulary and depth of statistical explanation." }
    ],
    smartDefaults: { null_handling: "Exclude from analysis", audience: "Business stakeholders" },
    domainPriors: ["Declare schema and data types", "Specify null handling", "State output format and aggregation level"],
    sortOrder: 3
  },
  {
    slug: "legal",
    name: "Legal",
    description: "Elicitation script for legal document analysis, drafting, and research.",
    triggerKeywords: ["legal", "contract", "law", "clause", "agreement", "liability", "compliance", "regulation", "statute", "case law", "jurisdiction", "attorney", "counsel"],
    questions: [
      { id: "jurisdiction", question: "What jurisdiction(s) apply?", type: "text", rationale: "Legal requirements vary dramatically by jurisdiction." },
      { id: "document_type", question: "What type of legal document or task?", type: "select", options: ["Contract drafting", "Contract review", "Legal research", "Compliance analysis", "Policy drafting", "Legal memo", "Plain-language explanation"], rationale: "Document type determines structure and required elements." },
      { id: "audience", question: "Who is the audience?", type: "select", options: ["Legal professionals", "Business executives", "General public / non-lawyers", "Regulatory body"], defaultValue: "Legal professionals", rationale: "Audience determines appropriate legal vocabulary and disclaimer requirements." },
      { id: "non_advice", question: "Should the output include a non-legal-advice disclaimer?", type: "boolean", defaultValue: true, rationale: "Non-advice framing is required for most non-attorney contexts." }
    ],
    smartDefaults: { audience: "Legal professionals", non_advice: true },
    domainPriors: ["Jurisdiction conditioning", "Non-advice framing for non-attorney contexts", "Scope limitations"],
    sortOrder: 4
  },
  {
    slug: "medical",
    name: "Medical & Health",
    description: "Elicitation script for medical information, health content, and clinical documentation.",
    triggerKeywords: ["medical", "health", "diagnosis", "treatment", "medication", "symptom", "clinical", "patient", "doctor", "nurse", "hospital", "disease", "condition"],
    questions: [
      { id: "audience_expertise", question: "What is the audience's medical expertise?", type: "select", options: ["General public (no medical background)", "Healthcare professionals", "Medical students", "Patients with the condition"], defaultValue: "General public (no medical background)", rationale: "Expertise level determines vocabulary and assumed knowledge." },
      { id: "disclaimer", question: "Include 'consult a doctor' disclaimer?", type: "boolean", defaultValue: true, rationale: "Medical disclaimers are required for consumer-facing health content." },
      { id: "scope", question: "What is the scope?", type: "select", options: ["General information only", "Specific condition overview", "Treatment options (informational)", "Clinical documentation", "Patient education material"], rationale: "Scope determines appropriate depth and disclaimer requirements." }
    ],
    smartDefaults: { audience_expertise: "General public (no medical background)", disclaimer: true },
    domainPriors: ["Disclaimer scaffolding", "Scope limitations", "Recommend professional consultation"],
    sortOrder: 5
  },
  {
    slug: "marketing",
    name: "Marketing & Copywriting",
    description: "Elicitation script for marketing copy, advertising, content marketing, and brand communications.",
    triggerKeywords: ["marketing", "copy", "ad", "campaign", "brand", "content", "email", "social media", "landing page", "CTA", "conversion", "audience", "messaging"],
    questions: [
      { id: "channel", question: "What channel or format?", type: "select", options: ["Email", "Social media (LinkedIn/Twitter/Instagram/Facebook)", "Landing page", "Blog post", "Ad copy (Google/Meta)", "Video script", "Press release", "Product description"], rationale: "Channel determines length, format, and tone conventions." },
      { id: "audience_segment", question: "Who is the target audience?", type: "text", rationale: "Audience segment determines messaging, vocabulary, and pain points to address." },
      { id: "brand_voice", question: "Describe the brand voice?", type: "text", defaultValue: "Professional, slightly warm, direct", rationale: "Brand voice calibrates tone and vocabulary." },
      { id: "cta", question: "What is the call to action?", type: "text", rationale: "CTA determines the goal and shapes the entire copy structure." },
      { id: "key_message", question: "What is the single most important message?", type: "text", rationale: "Single key message prevents dilution across multiple competing claims." }
    ],
    smartDefaults: { brand_voice: "Professional, slightly warm, direct" },
    domainPriors: ["Channel-specific format conventions", "CTA clarity", "Audience segment specificity"],
    sortOrder: 6
  },
  {
    slug: "academic",
    name: "Academic Writing",
    description: "Elicitation script for academic papers, research summaries, literature reviews, and scholarly content.",
    triggerKeywords: ["academic", "research", "paper", "essay", "thesis", "dissertation", "literature review", "citation", "scholarly", "journal", "peer-reviewed", "bibliography"],
    questions: [
      { id: "citation_style", question: "What citation style?", type: "select", options: ["APA 7th", "MLA 9th", "Chicago/Turabian", "IEEE", "Vancouver", "Harvard", "None required"], defaultValue: "APA 7th", rationale: "Citation style is a hard requirement in academic contexts." },
      { id: "field", question: "What academic field or discipline?", type: "text", rationale: "Field conventions affect structure, vocabulary, and what counts as evidence." },
      { id: "audience_level", question: "What audience level?", type: "select", options: ["Undergraduate", "Graduate", "Peer researchers", "General educated public"], defaultValue: "Graduate", rationale: "Audience level determines assumed knowledge and vocabulary." },
      { id: "document_type", question: "What type of document?", type: "select", options: ["Research paper", "Literature review", "Abstract", "Thesis section", "Book review", "Essay"], rationale: "Document type determines structure and required sections." }
    ],
    smartDefaults: { citation_style: "APA 7th", audience_level: "Graduate" },
    domainPriors: ["Citation style conventions", "Field-specific terminology", "Audience expertise level"],
    sortOrder: 7
  },
  {
    slug: "translation",
    name: "Translation & Localization",
    description: "Elicitation script for translation, localization, and cross-cultural communication tasks.",
    triggerKeywords: ["translate", "translation", "localize", "localization", "language", "French", "Spanish", "German", "Chinese", "Japanese", "Arabic", "multilingual"],
    questions: [
      { id: "source_language", question: "Source language?", type: "text", defaultValue: "English", rationale: "Source language is required for accurate translation." },
      { id: "target_language", question: "Target language and variant?", type: "text", rationale: "Language variant matters: Brazilian vs European Portuguese, Simplified vs Traditional Chinese, etc." },
      { id: "register", question: "What register (formality level)?", type: "select", options: ["Formal", "Semi-formal", "Informal/Colloquial", "Technical", "Literary"], defaultValue: "Semi-formal", rationale: "Register affects vocabulary, grammar forms, and honorifics." },
      { id: "dialect", question: "Any specific dialect or regional variant?", type: "text", rationale: "Regional variants can differ significantly in vocabulary and idiom." },
      { id: "preserve_formatting", question: "Preserve original formatting?", type: "boolean", defaultValue: true, rationale: "Formatting preservation affects how the translation is structured." }
    ],
    smartDefaults: { source_language: "English", register: "Semi-formal", preserve_formatting: true },
    domainPriors: ["Register specification", "Dialect and regional variant", "Formality level"],
    sortOrder: 8
  },
  {
    slug: "financial",
    name: "Financial Analysis",
    description: "Elicitation script for financial analysis, modeling, and reporting tasks.",
    triggerKeywords: ["financial", "finance", "investment", "stock", "revenue", "profit", "budget", "forecast", "valuation", "ROI", "P&L", "balance sheet", "cash flow"],
    questions: [
      { id: "analysis_type", question: "What type of financial analysis?", type: "select", options: ["Company valuation", "Financial modeling", "Budget analysis", "Investment thesis", "Risk assessment", "Financial reporting", "Market analysis"], rationale: "Analysis type determines methodology and output structure." },
      { id: "audience", question: "Who is the audience?", type: "select", options: ["CFO/Finance team", "Board/Investors", "General public", "Regulatory body"], defaultValue: "CFO/Finance team", rationale: "Audience determines depth and vocabulary." },
      { id: "disclaimer", question: "Include not-investment-advice disclaimer?", type: "boolean", defaultValue: true, rationale: "Financial disclaimers are required for consumer-facing financial content." },
      { id: "time_horizon", question: "What time horizon?", type: "select", options: ["Short-term (< 1 year)", "Medium-term (1–5 years)", "Long-term (5+ years)"], rationale: "Time horizon affects analysis methodology and assumptions." }
    ],
    smartDefaults: { audience: "CFO/Finance team", disclaimer: true },
    domainPriors: ["Not-investment-advice disclaimer", "Jurisdiction conditioning", "Scope limitations"],
    sortOrder: 9
  },
  {
    slug: "education",
    name: "Education & Teaching",
    description: "Elicitation script for educational content, lesson plans, explanations, and tutoring.",
    triggerKeywords: ["teach", "explain", "lesson", "tutorial", "course", "curriculum", "student", "learning", "education", "training", "workshop", "quiz", "exercise"],
    questions: [
      { id: "subject", question: "What subject or topic?", type: "text", rationale: "Subject determines appropriate depth and prerequisite knowledge." },
      { id: "student_level", question: "What is the student's level?", type: "select", options: ["Elementary (K-5)", "Middle school (6-8)", "High school (9-12)", "Undergraduate", "Graduate", "Professional/Adult learner", "Expert"], defaultValue: "Undergraduate", rationale: "Level determines vocabulary, assumed knowledge, and pedagogical approach." },
      { id: "learning_objective", question: "What should the student be able to do after this?", type: "text", rationale: "Learning objective determines what to include and what to omit." },
      { id: "format", question: "What format?", type: "select", options: ["Explanation/lecture", "Lesson plan", "Exercise/practice problems", "Quiz", "Project brief", "Study guide"], rationale: "Format determines structure and required components." }
    ],
    smartDefaults: { student_level: "Undergraduate" },
    domainPriors: ["Age-appropriate vocabulary", "Learning objective clarity", "Prerequisite knowledge statement"],
    sortOrder: 10
  },
  {
    slug: "email",
    name: "Email & Business Communication",
    description: "Elicitation script for professional emails, memos, and business communications.",
    triggerKeywords: ["email", "memo", "message", "write to", "respond to", "reply", "follow up", "outreach", "cold email", "business communication"],
    questions: [
      { id: "email_type", question: "What type of email?", type: "select", options: ["Cold outreach", "Follow-up", "Request", "Complaint/escalation", "Announcement", "Rejection", "Negotiation", "Thank you"], rationale: "Email type determines structure and tone conventions." },
      { id: "relationship", question: "What is your relationship with the recipient?", type: "select", options: ["No prior relationship", "Acquaintance", "Colleague", "Manager/Direct report", "Client/Customer", "Vendor/Partner"], defaultValue: "No prior relationship", rationale: "Relationship determines formality and assumed context." },
      { id: "goal", question: "What is the single goal of this email?", type: "text", rationale: "Single clear goal prevents dilution and improves response rates." },
      { id: "tone", question: "Desired tone?", type: "select", options: ["Formal", "Professional", "Warm/Friendly", "Urgent", "Apologetic", "Assertive"], defaultValue: "Professional", rationale: "Tone calibrates language and structure." }
    ],
    smartDefaults: { relationship: "No prior relationship", tone: "Professional" },
    domainPriors: ["Relationship context", "Single clear CTA", "Appropriate formality level"],
    sortOrder: 11
  },
  {
    slug: "summarization",
    name: "Summarization & Synthesis",
    description: "Elicitation script for summarizing documents, articles, meetings, and research.",
    triggerKeywords: ["summarize", "summary", "tldr", "synthesize", "condense", "brief", "overview", "key points", "main points", "abstract"],
    questions: [
      { id: "summary_type", question: "What type of summary?", type: "select", options: ["Executive summary (decision-focused)", "Key takeaways (bullet points)", "Abstract (academic)", "Meeting notes", "Research synthesis", "Précis (faithful condensation)"], rationale: "Summary type determines what to include and what to omit." },
      { id: "length", question: "Target length?", type: "text", defaultValue: "3–5 sentences or 150 words", rationale: "Length constraint is the most important parameter for summaries." },
      { id: "audience", question: "Who will read this summary?", type: "text", defaultValue: "Non-specialist decision-maker", rationale: "Audience determines vocabulary and assumed knowledge." },
      { id: "focus", question: "What should the summary focus on?", type: "text", rationale: "Focus prevents the summary from being a generic précis when specific insights are needed." }
    ],
    smartDefaults: { length: "3–5 sentences or 150 words", audience: "Non-specialist decision-maker" },
    domainPriors: ["Length constraint", "Audience expertise", "Focus area specification"],
    sortOrder: 12
  },
  {
    slug: "product-management",
    name: "Product Management",
    description: "Elicitation script for PRDs, user stories, feature specs, and product strategy documents.",
    triggerKeywords: ["PRD", "product", "feature", "user story", "roadmap", "spec", "requirements", "acceptance criteria", "product manager", "backlog"],
    questions: [
      { id: "doc_type", question: "What type of document?", type: "select", options: ["PRD (Product Requirements Document)", "User story", "Feature spec", "Roadmap", "OKRs", "Competitive analysis", "User research synthesis"], rationale: "Document type determines structure and required sections." },
      { id: "audience", question: "Primary audience?", type: "select", options: ["Engineering team", "Stakeholders/Leadership", "Design team", "Sales/Marketing", "All of the above"], defaultValue: "Engineering team", rationale: "Audience determines level of technical detail and assumed context." },
      { id: "scope", question: "What is the scope?", type: "text", rationale: "Scope prevents feature creep in the document itself." }
    ],
    smartDefaults: { audience: "Engineering team" },
    domainPriors: ["Audience-appropriate technical depth", "Scope definition", "Acceptance criteria clarity"],
    sortOrder: 13
  },
  {
    slug: "research",
    name: "Research & Information Synthesis",
    description: "Elicitation script for research tasks, literature reviews, and information gathering.",
    triggerKeywords: ["research", "find", "investigate", "explore", "gather information", "what is", "how does", "explain", "overview of", "background on"],
    questions: [
      { id: "depth", question: "What depth of research?", type: "select", options: ["Quick overview (5 min read)", "Intermediate (comprehensive but accessible)", "Deep dive (expert-level)"], defaultValue: "Intermediate (comprehensive but accessible)", rationale: "Depth determines scope and vocabulary." },
      { id: "output_format", question: "How should findings be presented?", type: "select", options: ["Narrative report", "Structured outline", "Bullet-point summary", "Annotated bibliography", "FAQ format"], defaultValue: "Narrative report", rationale: "Output format determines structure." },
      { id: "recency", question: "How recent must the information be?", type: "select", options: ["Any (historical is fine)", "Last 5 years", "Last 2 years", "Last year", "Current (note: model has knowledge cutoff)"], defaultValue: "Last 5 years", rationale: "Recency requirements affect what sources are appropriate and whether to flag uncertainty." },
      { id: "uncertainty", question: "How should uncertainty be handled?", type: "select", options: ["Flag uncertain claims explicitly", "Provide confidence levels", "Omit uncertain information", "Include with caveats"], defaultValue: "Flag uncertain claims explicitly", rationale: "Uncertainty handling prevents hallucination and false confidence." }
    ],
    smartDefaults: { depth: "Intermediate (comprehensive but accessible)", output_format: "Narrative report", uncertainty: "Flag uncertain claims explicitly" },
    domainPriors: ["Knowledge cutoff awareness", "Uncertainty flagging", "Source quality specification"],
    sortOrder: 14
  },
  {
    slug: "content-moderation",
    name: "Content Moderation & Safety",
    description: "Elicitation script for content moderation, safety review, and policy compliance tasks.",
    triggerKeywords: ["moderate", "moderation", "review", "flag", "safety", "policy", "compliance", "harmful", "inappropriate", "violates"],
    questions: [
      { id: "policy_framework", question: "What policy framework applies?", type: "text", rationale: "Policy framework defines what counts as a violation." },
      { id: "severity_levels", question: "What severity levels should be used?", type: "text", defaultValue: "Safe / Review / Remove", rationale: "Severity levels determine the output structure." },
      { id: "false_positive_tolerance", question: "What is the tolerance for false positives?", type: "select", options: ["Low (prefer false positives — safety-first)", "Medium (balanced)", "High (prefer false negatives — avoid over-removal)"], defaultValue: "Low (prefer false positives — safety-first)", rationale: "False positive tolerance calibrates the decision threshold." }
    ],
    smartDefaults: { severity_levels: "Safe / Review / Remove", false_positive_tolerance: "Low (prefer false positives — safety-first)" },
    domainPriors: ["Policy framework specification", "Severity level definition", "Edge case handling"],
    sortOrder: 15
  }
];

export const quickStartTemplates = [
  {
    slug: "code-review",
    title: "Code Review",
    description: "Review code for bugs, security issues, and style",
    icon: "Code2",
    domain: "code",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a senior software engineer with expertise in code review, security analysis, and software architecture.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Review the following code for a production application.", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Review this code and identify: (1) bugs or logic errors, (2) security vulnerabilities, (3) performance issues, (4) style/convention violations.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Focus on actionable issues. For each issue: specify the line number, severity (Critical/High/Medium/Low), and a concrete fix.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Structure your response as:\n## Critical Issues\n## High Priority\n## Medium Priority\n## Style Notes\n\nFor each item: [Line X] Issue description → Recommended fix", enabled: true, source: "template" }
    ],
    sortOrder: 1
  },
  {
    slug: "email-draft",
    title: "Professional Email",
    description: "Draft a professional email for any purpose",
    icon: "Mail",
    domain: "email",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are an expert business communicator who writes clear, concise, and effective professional emails.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Write a professional email for the following situation:", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Draft a professional email that achieves the stated goal.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Keep it under 200 words. One clear call to action. No jargon. Active voice.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Provide: Subject line, Email body. Do not include any commentary outside the email itself.", enabled: true, source: "template" }
    ],
    sortOrder: 2
  },
  {
    slug: "data-analysis",
    title: "Data Analysis",
    description: "Analyze data and surface insights",
    icon: "BarChart2",
    domain: "data-analysis",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a senior data analyst with expertise in statistical analysis and business intelligence.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Analyze the following data:", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Analyze this data and identify key patterns, trends, and anomalies.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Focus on actionable insights. Flag any data quality issues. Do not extrapolate beyond what the data supports.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Structure: Executive Summary (3 sentences) → Key Findings (3–5 bullets) → Recommendations (numbered list)", enabled: true, source: "template" }
    ],
    sortOrder: 3
  },
  {
    slug: "creative-writing",
    title: "Creative Writing",
    description: "Generate fiction, poetry, or creative content",
    icon: "PenLine",
    domain: "creative-writing",
    targetModel: "claude-3-5-sonnet-20241022",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a skilled creative writer with a strong sense of voice, pacing, and character.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Write the following creative piece:", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Write a compelling piece that achieves the stated creative goal.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Show, don't tell. Avoid clichés. Every sentence should earn its place.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Provide the creative piece directly, without preamble or commentary.", enabled: true, source: "template" }
    ],
    sortOrder: 4
  },
  {
    slug: "research-summary",
    title: "Research Summary",
    description: "Summarize and synthesize research or documents",
    icon: "BookOpen",
    domain: "research",
    targetModel: "claude-3-5-sonnet-20241022",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a research analyst skilled at synthesizing complex information into clear, actionable summaries.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Summarize the following material:", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Produce a clear, accurate summary that captures the key findings and their implications.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Do not add information not present in the source. Flag any uncertainty. Target a non-specialist reader.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Format: 3-sentence executive summary → Key points (bullets) → Implications (1 paragraph)", enabled: true, source: "template" }
    ],
    sortOrder: 5
  },
  {
    slug: "sql-query",
    title: "SQL Query",
    description: "Write or debug SQL queries",
    icon: "Database",
    domain: "code",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a senior database engineer with expertise in SQL query optimization and data modeling.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Database schema: [describe your schema here]", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Write a SQL query that achieves the stated goal.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Optimize for readability first, performance second. Use CTEs for complex queries. Include comments for non-obvious logic.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Provide: The SQL query (formatted) → Brief explanation of the approach → Any performance considerations", enabled: true, source: "template" }
    ],
    sortOrder: 6
  },
  {
    slug: "product-spec",
    title: "Product Spec",
    description: "Write a product requirements document or user story",
    icon: "FileText",
    domain: "product-management",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a senior product manager with experience writing clear, actionable product specifications.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Product context: [describe your product and the feature]", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Write a product specification for the described feature.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Be specific and testable. Avoid ambiguous language. Include acceptance criteria for each requirement.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Structure: Overview → User Stories → Requirements → Acceptance Criteria → Out of Scope", enabled: true, source: "template" }
    ],
    sortOrder: 7
  },
  {
    slug: "marketing-copy",
    title: "Marketing Copy",
    description: "Write compelling marketing and advertising copy",
    icon: "Megaphone",
    domain: "marketing",
    targetModel: "gpt-4o",
    scaffoldBlocks: [
      { id: "role", label: "Role", content: "You are a senior copywriter with expertise in conversion-focused marketing copy.", enabled: true, source: "template" },
      { id: "context", label: "Context", content: "Product/service: [describe what you're marketing]\nTarget audience: [describe your audience]\nChannel: [email/social/landing page/ad]", enabled: true, source: "template" },
      { id: "task", label: "Task", content: "Write compelling marketing copy that drives the stated action.", enabled: true, source: "template" },
      { id: "constraints", label: "Constraints", content: "Lead with the customer's pain point, not the product. Use outcome language, not feature language. One clear CTA.", enabled: true, source: "template" },
      { id: "format", label: "Format", content: "Provide the copy directly, formatted for the specified channel.", enabled: true, source: "template" }
    ],
    sortOrder: 8
  }
];

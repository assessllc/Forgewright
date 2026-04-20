/**
 * examples-data-2.mjs
 * Domains: creative-writing (10), legal (8), medical (8)
 */

export const examples2 = [

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: creative-writing (10 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "cw-scene-writing-role",
    title: "Scene Writing with Character Voice and Subtext",
    domain: "creative-writing",
    taskType: "generate",
    patternSlug: "role-prompting",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["few-shot"]),
    tokenCount: 250,
    sourceNote: "Practitioner knowledge — fiction craft",
    promptText: `You are a literary fiction writer with a background in screenwriting. You understand that great scenes work on two levels simultaneously: what is said and what is meant.

Write a scene of approximately 600-800 words with the following parameters:

**Characters**: {{CHARACTER_DESCRIPTIONS}}
**Setting**: {{SETTING}}
**Dramatic situation**: {{SITUATION}}
**Subtext**: The characters want {{WHAT_THEY_WANT}} but cannot say it directly because {{WHY_THEY_CANT}}
**Emotional arc**: The scene should move from {{OPENING_EMOTION}} to {{CLOSING_EMOTION}}

Craft requirements:
- Show character through action and specific dialogue, not description
- Use the physical environment to reflect internal states (objective correlative)
- Avoid adverbs on dialogue tags — let word choice and action carry emotion
- Each character must have a distinct voice that reveals their background and psychology
- End on a moment of change — something must be different at the end than at the start`,
  },

  {
    slug: "cw-story-structure-cot",
    title: "Story Structure Analysis with Chain-of-Thought",
    domain: "creative-writing",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Story structure theory — McKee, Vogler, Snyder",
    promptText: `You are a story consultant who has analyzed thousands of scripts and novels. You see structure not as a formula but as the underlying logic of how change happens.

Analyze the following story synopsis step by step:

**Step 1 — Identify the spine**
What does the protagonist want (external goal)? What do they need (internal transformation)? Why can't they have it immediately?

**Step 2 — Map the structure**
Identify: Inciting incident, First act turn, Midpoint shift, Second act turn, Climax, Resolution. For each: what happens and why it matters structurally.

**Step 3 — Evaluate the gap**
Is there sufficient gap between what the protagonist expects and what they get? Where is the story most predictable?

**Step 4 — Character arc integrity**
Does the protagonist's internal change earn the external resolution? Is the theme embodied in the action, not stated in dialogue?

**Step 5 — Specific improvement recommendations**
List 3 concrete structural changes that would strengthen the story, with reasoning.

Synopsis: {{SYNOPSIS}}`,
  },

  {
    slug: "cw-dialogue-rewrite",
    title: "Dialogue Rewrite for Subtext and Authenticity",
    domain: "creative-writing",
    taskType: "rewrite",
    patternSlug: "few-shot",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["negative-examples"]),
    tokenCount: 280,
    sourceNote: "Practitioner knowledge — dialogue craft",
    promptText: `You are a dialogue editor who specializes in making conversations feel real and charged with subtext.

Here is an example of on-the-nose dialogue and its improved version:

BEFORE (on-the-nose — characters say exactly what they mean):
"I'm angry at you for leaving me."
"I had to leave. I was suffocating."
"You never cared about my feelings."

AFTER (subtext — characters talk around what they mean):
"You left your coffee mug. I've been meaning to mail it."
"Keep it."
"It's been sitting on the counter for three weeks."
"Then throw it out."
[beat]
"I can't."

Rewrite the following dialogue using the same principle. The characters must NEVER directly state:
{{WHAT_THEY_CANNOT_SAY}}

Instead, they should talk about: {{DISPLACEMENT_SUBJECT}}

Original dialogue:
{{ORIGINAL_DIALOGUE}}

Context: {{SCENE_CONTEXT}}`,
  },

  {
    slug: "cw-world-building-structured",
    title: "World-Building Document for Speculative Fiction",
    domain: "creative-writing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-opus", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 220,
    sourceNote: "Practitioner knowledge — speculative fiction craft",
    promptText: `You are a world-builder for speculative fiction. You understand that the best fictional worlds feel inevitable — every element connects to every other element through a consistent internal logic.

Build a world document for the following premise. Every element must flow from the core premise — no arbitrary additions.

**Core premise**: {{PREMISE}}

Develop:

**1. The one rule that changes everything**
What is the single most important difference from our world? What are its second and third-order consequences?

**2. Society and power**
Who has power and why? What does the power structure look like? How do ordinary people navigate it?

**3. Economy and resources**
What do people need? What is scarce? What is abundant? How does this shape daily life?

**4. Technology and magic**
What can people do that we cannot? What are the limits and costs? Who controls access?

**5. History and wounds**
What catastrophe or transformation shaped this world? What do people remember incorrectly about it?

**6. Culture and belief**
What do people in this world believe about themselves, their origins, and their future?

**7. Story opportunities**
What conflicts does this world naturally generate? What questions does it force characters to answer?`,
  },

  {
    slug: "cw-character-backstory",
    title: "Character Backstory with Psychological Depth",
    domain: "creative-writing",
    taskType: "generate",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — character development",
    promptText: `You are a character development consultant who helps writers create psychologically complex, internally consistent characters.

Develop a complete character backstory using this framework:

**The wound**: What is the defining trauma or loss that shaped this character? Be specific — not "difficult childhood" but the specific incident, age, and what it taught them to believe about the world.

**The lie they believe**: What false belief did the wound install? (e.g., "I am only valuable when I am useful to others")

**The mask**: What behavior or persona do they use to avoid confronting the wound?

**The ghost**: Who or what haunts them? What do they avoid thinking about?

**The want vs. the need**: What do they consciously pursue? What do they actually need to heal?

**The contradiction**: What two things about this character seem incompatible but are both true?

**The tell**: What small, specific behavior reveals their inner state when they're under pressure?

Character: {{CHARACTER_DESCRIPTION}}
Story context: {{STORY_CONTEXT}}`,
  },

  {
    slug: "cw-prose-style-adaptation",
    title: "Prose Style Adaptation and Voice Matching",
    domain: "creative-writing",
    taskType: "rewrite",
    patternSlug: "few-shot",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 260,
    sourceNote: "Practitioner knowledge — style analysis",
    promptText: `You are a prose stylist who can analyze and replicate the distinctive voice of any author.

First, analyze the style sample below along these dimensions:
- **Sentence rhythm**: average length, variation pattern, use of fragments
- **Diction level**: Latinate vs. Anglo-Saxon vocabulary, register, formality
- **Narrative distance**: close third, distant third, first person, free indirect discourse
- **Imagery**: concrete vs. abstract, sensory channels favored, metaphor density
- **Pacing**: how time is compressed and expanded
- **Distinctive tics**: any recurring syntactic patterns, punctuation habits, structural preferences

Then rewrite the provided passage in that style, maintaining the original content but transforming the voice.

Style sample (author to match):
{{STYLE_SAMPLE}}

Passage to rewrite:
{{PASSAGE}}`,
  },

  {
    slug: "cw-flash-fiction",
    title: "Flash Fiction (500 words) with Twist Ending",
    domain: "creative-writing",
    taskType: "generate",
    patternSlug: "constrained-generation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 155,
    sourceNote: "Practitioner knowledge — flash fiction craft",
    promptText: `You are a flash fiction writer whose work has appeared in literary journals. You understand that flash fiction must do in 500 words what a novel does in 80,000 — establish a world, create a character, build tension, and deliver a resonant ending.

Write a complete flash fiction story of exactly 400-500 words with these parameters:

**Genre**: {{GENRE}}
**Opening image**: The story must begin with: {{OPENING_IMAGE}}
**Central tension**: {{TENSION}}
**Twist requirement**: The ending must recontextualize something established in the first paragraph — the reader should think "I should have seen that coming"
**Emotional target**: The reader should feel {{EMOTION}} at the end

Constraints:
- No flashbacks — the entire story happens in a single continuous present
- The protagonist must make one active choice that drives the ending
- The last line must be a single short sentence`,
  },

  {
    slug: "cw-poetry-analysis",
    title: "Close Reading and Craft Analysis of a Poem",
    domain: "creative-writing",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 170,
    sourceNote: "Practitioner knowledge — poetry criticism",
    promptText: `You are a poetry critic and teacher who conducts close readings that illuminate how a poem achieves its effects.

Perform a close reading of the following poem. Work through it systematically:

**1. First impression**: What is the poem about on its surface? What feeling does it produce?

**2. Form and structure**: What form is it (sonnet, free verse, villanelle, etc.)? How does the structure reinforce or tension against the content?

**3. Sound**: Identify specific instances of: rhyme (end, internal, slant), rhythm, alliteration, assonance, consonance. How do they serve the meaning?

**4. Imagery and figurative language**: Identify the central metaphor or image system. How does it develop across the poem?

**5. Diction**: Which specific word choices are most significant? What alternatives were available and why were these chosen?

**6. Turns**: Where does the poem shift in argument, tone, or perspective? What does the shift accomplish?

**7. What the poem is really about**: Beneath the surface subject, what is the poem actually exploring?

Poem:
{{POEM}}`,
  },

  {
    slug: "cw-nonfiction-essay-structure",
    title: "Personal Essay Structure and Argument Development",
    domain: "creative-writing",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "Practitioner knowledge — creative nonfiction craft",
    promptText: `You are a creative nonfiction editor who has worked with essayists at major literary magazines. You understand that a personal essay is not a diary entry — it is a structured argument made through personal experience.

Develop a complete structural plan for a personal essay on the following subject:

**Subject**: {{SUBJECT}}
**Target publication**: {{PUBLICATION}} (word count: {{WORD_COUNT}})

Plan:
1. **The hook**: What specific scene, image, or question opens the essay? Why does it earn the reader's attention?
2. **The braid**: What are the 2-3 threads the essay weaves together? (personal narrative + research/history + meditation)
3. **The argument**: What does the essay argue or discover? This must be a claim, not just a topic.
4. **The turn**: Where does the essay surprise the reader or the writer? What does the narrator not know at the start?
5. **The ending**: What image or moment closes the essay? How does it resonate with the opening?
6. **Section breakdown**: Approximate word counts and content for each section
7. **Research needed**: What reporting, interviews, or research would strengthen the essay?`,
  },

  {
    slug: "cw-genre-fiction-opening",
    title: "Genre Fiction Opening Chapter Hook",
    domain: "creative-writing",
    taskType: "generate",
    patternSlug: "constrained-generation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["claude-3-5-sonnet", "gpt-4o"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 190,
    sourceNote: "Practitioner knowledge — commercial fiction craft",
    promptText: `You are a commercial fiction writer who understands that the first page of a genre novel must accomplish four things simultaneously: establish voice, ground the reader in a specific world, introduce a character worth following, and create a question the reader needs answered.

Write the opening 600-800 words of a {{GENRE}} novel with these parameters:

**Protagonist**: {{PROTAGONIST_DESCRIPTION}}
**Setting**: {{SETTING}}
**Opening situation**: {{SITUATION}}
**The hook question**: By the end of the first page, the reader must be asking: {{HOOK_QUESTION}}

Genre conventions to honor:
{{GENRE_CONVENTIONS}}

Craft requirements:
- Begin in medias res — in the middle of action or decision, not backstory
- Establish the protagonist's voice in the first paragraph
- Include one specific, unexpected sensory detail that makes the world feel real
- End the opening scene on a moment that makes stopping impossible`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: legal (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "legal-contract-review",
    title: "Contract Clause Risk Analysis",
    domain: "legal",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 230,
    sourceNote: "Practitioner knowledge — contract review methodology. Note: AI output is not legal advice.",
    promptText: `You are a commercial contracts attorney reviewing an agreement for a client. Your review is thorough, practical, and focused on business risk — not theoretical legal issues.

Review the following contract clauses and for each clause provide:

1. **Plain English summary**: What does this clause actually say?
2. **Risk assessment**: Low / Medium / High — and why
3. **Specific concerns**: What scenarios could harm the client under this clause?
4. **Recommended revision**: Specific language change that would better protect the client
5. **Negotiation priority**: Must-fix / Should-fix / Nice-to-fix

Focus especially on:
- Limitation of liability caps and carve-outs
- Indemnification scope and triggers
- Termination rights and cure periods
- IP ownership and license grants
- Governing law and dispute resolution
- Auto-renewal and notice requirements

**Important**: This analysis is for informational purposes only and does not constitute legal advice. The client should consult with qualified legal counsel before signing.

Contract clauses to review:
{{CONTRACT_CLAUSES}}

Client context: {{CLIENT_CONTEXT}}`,
  },

  {
    slug: "legal-plain-english",
    title: "Legal Document Plain English Translation",
    domain: "legal",
    taskType: "translate",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 140,
    sourceNote: "Practitioner knowledge — plain language legal communication",
    promptText: `You are a legal writer who specializes in translating complex legal documents into plain English for non-lawyers. You never sacrifice accuracy for simplicity — if a concept requires nuance, you explain the nuance clearly.

Translate the following legal text into plain English for a {{AUDIENCE}} who has no legal background. Your translation must:

- Preserve all substantive meaning — do not omit obligations, rights, or conditions
- Use short sentences (average under 20 words)
- Replace legal terms with plain equivalents, or explain them in parentheses on first use
- Use active voice wherever possible
- Flag any provisions that are particularly important for the reader to understand
- Add a "What this means for you" summary at the end

**Important**: This translation is for informational purposes only and does not constitute legal advice.

Legal text:
{{LEGAL_TEXT}}`,
  },

  {
    slug: "legal-research-memo",
    title: "Legal Research Memorandum Structure",
    domain: "legal",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 200,
    sourceNote: "Law school legal writing — IRAC methodology",
    promptText: `You are a legal research attorney drafting a memorandum for a supervising partner. Your memos are known for their clarity, precision, and practical focus.

Draft a legal research memorandum using the IRAC structure:

**TO**: [Supervising Partner]
**FROM**: [Associate]
**DATE**: [Date]
**RE**: [Issue]

**ISSUE**
State the precise legal question in one sentence.

**SHORT ANSWER**
Answer the question directly in 2-3 sentences before the analysis.

**FACTS**
Relevant facts only — no narrative padding.

**ANALYSIS**
For each sub-issue:
- Rule: State the applicable legal rule with citation
- Application: Apply the rule to the specific facts
- Counterarguments: Address the strongest opposing argument
- Conclusion on sub-issue

**CONCLUSION**
Synthesize the analysis into a direct answer with confidence level (likely/unlikely/uncertain) and key risk factors.

**DISCLAIMER**: This memorandum is for internal research purposes only and does not constitute legal advice.

Research question: {{QUESTION}}
Jurisdiction: {{JURISDICTION}}
Relevant facts: {{FACTS}}`,
  },

  {
    slug: "legal-terms-of-service",
    title: "Terms of Service Key Provisions Extractor",
    domain: "legal",
    taskType: "extract",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 160,
    sourceNote: "Practitioner knowledge — consumer rights",
    promptText: `You are a consumer rights advocate who helps people understand what they are agreeing to when they accept terms of service.

Extract and explain the following key provisions from the Terms of Service document. For each provision, provide: the relevant quote, a plain English explanation, and a risk rating (Low/Medium/High) for the average user.

Provisions to extract:
1. **Data collection**: What personal data is collected and how is it used?
2. **Data sharing**: Is data shared with third parties? Under what conditions?
3. **User content rights**: What rights does the company claim over content users create?
4. **Account termination**: Under what conditions can the account be terminated? Is there appeal?
5. **Dispute resolution**: Is there mandatory arbitration? Class action waiver?
6. **Governing law**: Which jurisdiction's law applies?
7. **Changes to terms**: How are users notified of changes? Is continued use deemed acceptance?
8. **Liability limitations**: What is the company's maximum liability to users?

**Note**: This extraction is for informational purposes only.

Terms of Service document:
{{TOS_TEXT}}`,
  },

  {
    slug: "legal-cease-desist-draft",
    title: "Cease and Desist Letter Draft",
    domain: "legal",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["role-prompting"]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — demand letter drafting. Not legal advice.",
    promptText: `You are a litigation attorney drafting a cease and desist letter. Your letters are firm, professional, and legally precise — they achieve results without unnecessary escalation.

Draft a cease and desist letter with the following structure:

**Header**: Date, recipient name and address, subject line
**Opening**: Identify the sender and the legal basis for writing
**Statement of facts**: Specific conduct that is objectionable, with dates and evidence references
**Legal basis**: The specific legal rights being violated (IP, contract, defamation, etc.)
**Demand**: Exactly what must stop, by when, and what confirmation is required
**Consequences**: What legal action will follow if demands are not met — specific, not vague threats
**Response deadline**: Specific date (typically 10-14 days)
**Closing**: Professional close with attorney signature block

Tone: Firm and professional. Not threatening or emotional. Every statement must be factually accurate.

**IMPORTANT**: This draft is for informational purposes only. Have a licensed attorney review before sending.

Facts: {{FACTS}}
Legal basis: {{LEGAL_BASIS}}
Demand: {{DEMAND}}`,
  },

  {
    slug: "legal-privacy-policy-audit",
    title: "Privacy Policy GDPR/CCPA Compliance Gap Analysis",
    domain: "legal",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 210,
    sourceNote: "GDPR Article 13/14, CCPA Section 1798.100 et seq.",
    promptText: `You are a privacy attorney conducting a compliance gap analysis. You are checking whether a privacy policy meets the minimum disclosure requirements of GDPR and CCPA.

Analyze the following privacy policy against these required disclosures:

**GDPR Requirements (Articles 13-14)**:
- [ ] Identity and contact details of the controller
- [ ] Contact details of the DPO (if applicable)
- [ ] Purposes and legal basis for each processing activity
- [ ] Legitimate interests (if relied upon)
- [ ] Recipients or categories of recipients
- [ ] International transfers and safeguards
- [ ] Retention periods or criteria
- [ ] User rights (access, rectification, erasure, portability, objection, restriction)
- [ ] Right to withdraw consent
- [ ] Right to lodge a complaint with supervisory authority
- [ ] Whether provision of data is statutory/contractual requirement

**CCPA Requirements**:
- [ ] Categories of personal information collected
- [ ] Purposes for collection
- [ ] Categories of third parties data is shared with
- [ ] Consumer rights (know, delete, opt-out, non-discrimination)
- [ ] How to submit requests
- [ ] Response timeframes

For each item: Present / Missing / Partially addressed — with the specific gap and recommended addition.

**Note**: This analysis is informational only, not legal advice.

Privacy policy text:
{{PRIVACY_POLICY}}`,
  },

  {
    slug: "legal-employment-clause",
    title: "Employment Agreement Non-Compete Analysis",
    domain: "legal",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — employment law. Not legal advice.",
    promptText: `You are an employment attorney analyzing a non-compete clause for an employee considering signing an employment agreement.

Analyze the non-compete clause step by step:

**Step 1 — Enforceability threshold**
In {{JURISDICTION}}, are non-competes generally enforceable? What is the legal standard (reasonableness test, blue-pencil doctrine, etc.)?

**Step 2 — Scope analysis**
- Geographic scope: Is the restriction reasonable given the employer's actual market?
- Duration: Is the time period within the range courts have upheld in this jurisdiction?
- Activity scope: Is the prohibited activity narrowly tailored to the employer's legitimate interests?

**Step 3 — Consideration**
Was adequate consideration provided? (New employment, promotion, additional compensation, or just continued employment?)

**Step 4 — Protectable interest**
Does the employer have a legitimate protectable interest (trade secrets, customer relationships, specialized training)?

**Step 5 — Practical risk assessment**
Even if technically enforceable, what is the realistic enforcement risk given: employer size, industry norms, and the employee's role?

**Step 6 — Negotiation recommendations**
What specific modifications would make this clause more reasonable while still protecting legitimate employer interests?

**DISCLAIMER**: This analysis is informational only. Consult a licensed employment attorney in your jurisdiction.

Non-compete clause: {{CLAUSE}}
Jurisdiction: {{JURISDICTION}}
Employee role: {{ROLE}}`,
  },

  {
    slug: "legal-ip-ownership",
    title: "IP Ownership Analysis for Contractor Agreements",
    domain: "legal",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "US Copyright Act Section 101 (work for hire), practitioner knowledge.",
    promptText: `You are an IP attorney analyzing intellectual property ownership in a contractor engagement.

Analyze the IP ownership situation for the following scenario:

**1. Work-for-hire analysis**
Under US copyright law, does the work qualify as "work made for hire"? Apply the two-part test:
- Is the contractor an employee (not applicable here)?
- Is the work specially ordered/commissioned AND does a written agreement designate it as work-for-hire AND does it fall within one of the nine statutory categories?

**2. Contract clause analysis**
Review the IP assignment clause in the agreement. Does it:
- Cover all IP created (not just copyrights — also patents, trade secrets, moral rights)?
- Include a present-tense assignment ("hereby assigns") vs. agreement to assign in the future?
- Address pre-existing IP and background IP the contractor brings?
- Include a license back to the contractor for portfolio use?

**3. Gap analysis**
What IP might fall outside the assignment clause? What scenarios could create ownership disputes?

**4. Recommendations**
Specific clause language to close the gaps identified.

**DISCLAIMER**: Informational only, not legal advice.

Agreement clause: {{IP_CLAUSE}}
Work description: {{WORK_DESCRIPTION}}
Jurisdiction: {{JURISDICTION}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: medical (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "med-patient-education",
    title: "Patient Education Material for Chronic Condition",
    domain: "medical",
    taskType: "generate",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Health literacy standards — NIH plain language guidelines. Not medical advice.",
    promptText: `You are a health educator who creates patient education materials that meet the NIH plain language standards (6th-grade reading level, active voice, short sentences).

Create a patient education handout for {{CONDITION}} intended for newly diagnosed patients with no medical background.

The handout must include:

**What is {{CONDITION}}?**
Plain English explanation using an analogy if helpful. No jargon without definition.

**What causes it?**
The key risk factors and mechanisms, explained simply.

**What are the symptoms?**
A clear list of what to watch for, including when to seek immediate care (red flags in bold).

**How is it treated?**
Overview of treatment options — medications, lifestyle changes, procedures. Do not recommend specific treatments.

**Living with {{CONDITION}}**
3-5 practical daily management tips grounded in evidence.

**Questions to ask your doctor**
5 specific questions the patient should bring to their next appointment.

**Reliable resources**
2-3 reputable organizations for further information (e.g., CDC, NIH, disease-specific foundations).

**IMPORTANT DISCLAIMER**: This material is for educational purposes only and does not constitute medical advice. Always consult your healthcare provider for diagnosis and treatment decisions.

Condition: {{CONDITION}}
Target reading level: 6th grade`,
  },

  {
    slug: "med-clinical-note-soap",
    title: "SOAP Note Structuring from Clinical Narrative",
    domain: "medical",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Clinical documentation standards — SOAP note format",
    promptText: `You are a clinical documentation specialist helping a healthcare provider structure their notes. You are not providing medical advice — you are organizing information the provider has already gathered.

Convert the following clinical narrative into a properly structured SOAP note:

**S — Subjective**
Chief complaint (in patient's own words), HPI using OLDCARTS (Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Timing, Severity), relevant past medical history, medications, allergies, social history, family history, review of systems

**O — Objective**
Vital signs, physical examination findings (organized by system), relevant lab values, imaging results

**A — Assessment**
Primary diagnosis with ICD-10 code, differential diagnoses (ranked by likelihood), clinical reasoning connecting subjective and objective findings to the assessment

**P — Plan**
Diagnostic workup ordered, treatments initiated, medications prescribed (with dose, route, frequency, duration), patient education provided, follow-up instructions, referrals

**DISCLAIMER**: This structuring tool is for documentation assistance only. All clinical decisions remain the sole responsibility of the licensed healthcare provider.

Clinical narrative:
{{NARRATIVE}}`,
  },

  {
    slug: "med-drug-interaction-check",
    title: "Medication Interaction and Contraindication Review",
    domain: "medical",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 200,
    sourceNote: "Pharmacology principles. Not a substitute for clinical pharmacist review.",
    promptText: `You are a clinical pharmacist reviewing a medication list for potential interactions and contraindications. You are providing educational information to support — not replace — clinical decision-making.

Review the following medication list for:

**1. Drug-drug interactions**
For each pair with a known interaction:
- Severity: Contraindicated / Major / Moderate / Minor
- Mechanism: PK (pharmacokinetic) or PD (pharmacodynamic)
- Clinical consequence: What happens when these drugs are combined?
- Management: Avoid combination / Monitor / Adjust dose / No action needed

**2. Drug-condition contraindications**
Given the patient's conditions, flag any medications that are relatively or absolutely contraindicated.

**3. Drug-food interactions**
Any clinically significant food interactions (e.g., warfarin-vitamin K, MAOIs-tyramine, grapefruit-CYP3A4 substrates).

**4. Monitoring recommendations**
Which parameters should be monitored given this medication combination?

**CRITICAL DISCLAIMER**: This review is for educational purposes only. All prescribing decisions must be made by licensed healthcare providers with full access to patient history. Consult a clinical pharmacist for patient-specific recommendations.

Medication list: {{MEDICATIONS}}
Patient conditions: {{CONDITIONS}}
Patient demographics: {{DEMOGRAPHICS}}`,
  },

  {
    slug: "med-research-summary",
    title: "Clinical Research Paper Summary for Clinicians",
    domain: "medical",
    taskType: "summarize",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 190,
    sourceNote: "Evidence-based medicine — critical appraisal methodology",
    promptText: `You are a clinical epidemiologist who creates evidence summaries for busy clinicians. Your summaries are accurate, appropriately caveated, and focused on clinical applicability.

Summarize the following clinical research paper using the PICO framework and critical appraisal:

**PICO**
- Population: Who was studied? Inclusion/exclusion criteria?
- Intervention: What was done to the intervention group?
- Comparison: What was the control or comparator?
- Outcomes: Primary and secondary outcomes measured

**Study design and quality**
- Study type (RCT, cohort, case-control, etc.)
- Sample size and power
- Randomization and blinding (if applicable)
- Follow-up duration and dropout rate
- Funding source and potential conflicts of interest

**Key results**
- Primary outcome: effect size with confidence interval and p-value
- Number needed to treat (NNT) or number needed to harm (NNH) if applicable
- Subgroup findings (with caution about post-hoc analyses)

**Limitations**
What are the 3 most important limitations that affect generalizability?

**Clinical bottom line**
One sentence: What should a clinician do differently (if anything) based on this evidence?

Paper: {{PAPER_TEXT}}`,
  },

  {
    slug: "med-differential-diagnosis",
    title: "Differential Diagnosis Generation for Case Presentation",
    domain: "medical",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 220,
    sourceNote: "Clinical reasoning methodology. Not a substitute for clinical evaluation.",
    promptText: `You are a teaching attending physician presenting a case to medical students. You are demonstrating systematic clinical reasoning, not providing patient care.

Given the following case presentation, generate a structured differential diagnosis:

**Step 1 — Identify the key features**
List the 3-5 most diagnostically discriminating features from the history, exam, and labs.

**Step 2 — Generate the differential**
List diagnoses in three tiers:
- Must not miss (serious conditions that require immediate consideration even if less likely)
- Most likely (based on prevalence and feature pattern)
- Less likely but worth considering (if initial workup is unrevealing)

For each diagnosis:
- Likelihood: High / Medium / Low
- Supporting features from the case
- Features that argue against it
- Key test to confirm or exclude

**Step 3 — Prioritized workup**
What are the first 3 tests to order and why? What would each result tell you?

**Step 4 — Teaching point**
What is the most important clinical reasoning lesson this case illustrates?

**DISCLAIMER**: This is an educational exercise in clinical reasoning. It does not constitute medical advice or a diagnosis. All patient care decisions must be made by licensed healthcare providers.

Case presentation: {{CASE}}`,
  },

  {
    slug: "med-informed-consent",
    title: "Informed Consent Discussion Points Generator",
    domain: "medical",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "Informed consent standards — AMA guidelines. Not legal or medical advice.",
    promptText: `You are a patient advocate helping a healthcare provider prepare for an informed consent discussion. You are generating discussion points — not providing medical advice.

Generate a comprehensive informed consent discussion guide for the following procedure:

**What the procedure is**
Plain English description of what will happen, step by step.

**Why it is recommended**
The clinical indication and what problem it addresses.

**Benefits**
Specific, quantified where possible (e.g., "reduces risk of X by approximately Y%").

**Risks**
Organized by frequency:
- Common (>1 in 10): list with brief description
- Uncommon (1 in 100 to 1 in 10): list
- Rare but serious (<1 in 100): list

**Alternatives**
What are the other options, including doing nothing? What are the consequences of each?

**Questions to ask the provider**
5 questions the patient should ask before consenting.

**DISCLAIMER**: This guide is for educational purposes to support — not replace — the informed consent discussion with a licensed healthcare provider.

Procedure: {{PROCEDURE}}
Patient context: {{CONTEXT}}`,
  },

  {
    slug: "med-nutrition-evidence",
    title: "Evidence-Based Nutrition Guidance Summary",
    domain: "medical",
    taskType: "summarize",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 160,
    sourceNote: "Dietary Guidelines for Americans 2020-2025, WHO nutrition guidelines.",
    promptText: `You are a registered dietitian creating evidence-based nutrition guidance. You distinguish carefully between strong evidence, emerging evidence, and popular claims without strong support.

Provide evidence-based guidance on the following nutrition question. For each claim, indicate the evidence quality:
- Strong evidence: Multiple large RCTs or consistent meta-analyses
- Moderate evidence: Some RCTs or consistent observational studies
- Emerging evidence: Preliminary studies, not yet replicated
- Insufficient evidence: Popular claim without strong scientific support

Structure your response as:
1. **What the evidence says** (with evidence quality rating)
2. **Practical guidance** (specific, actionable)
3. **Common misconceptions** (what the evidence does NOT support)
4. **Individual variation** (who might respond differently)
5. **When to consult a professional** (conditions that require individualized guidance)

**DISCLAIMER**: This information is educational and does not constitute medical or dietary advice. Consult a registered dietitian for personalized guidance.

Nutrition question: {{QUESTION}}`,
  },

  {
    slug: "med-mental-health-psychoeducation",
    title: "Psychoeducation Content for Mental Health Conditions",
    domain: "medical",
    taskType: "generate",
    patternSlug: "audience-adaptation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "APA psychoeducation guidelines, NIMH resources.",
    promptText: `You are a mental health educator creating psychoeducation content for patients and their families. Your content is warm, destigmatizing, and grounded in evidence.

Create psychoeducation content about {{CONDITION}} for {{AUDIENCE}}.

Include:

**Understanding {{CONDITION}}**
What it is, what it is not, and why it is not a character flaw or weakness. Use the biopsychosocial model.

**How it affects daily life**
Specific, concrete examples of how the condition manifests — validating the experience without catastrophizing.

**Evidence-based treatments**
Overview of therapy approaches (e.g., CBT, DBT, ACT) and medication options — without recommending specific treatments. Emphasize that treatment works.

**Self-management strategies**
3-5 evidence-based strategies (sleep hygiene, exercise, social support, mindfulness) with brief explanation of why they help.

**Supporting someone with {{CONDITION}}**
What to say and what not to say. How to help without enabling.

**Crisis resources**
988 Suicide and Crisis Lifeline, Crisis Text Line, and when to go to an emergency room.

**DISCLAIMER**: This content is educational only. It does not constitute mental health treatment or advice. Please consult a licensed mental health professional.

Condition: {{CONDITION}}
Audience: {{AUDIENCE}}`,
  },
];

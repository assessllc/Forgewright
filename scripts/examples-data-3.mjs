/**
 * examples-data-3.mjs
 * Domains: marketing (10), education (10), research (8), customer-support (8)
 */

export const examples3 = [

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: marketing (10 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "mkt-positioning-statement",
    title: "Product Positioning Statement Development",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["few-shot"]),
    tokenCount: 230,
    sourceNote: "April Dunford — Obviously Awesome positioning framework",
    promptText: `You are a product positioning strategist who has positioned B2B SaaS products for companies from seed stage to public. You use April Dunford's positioning framework.

Develop a complete positioning statement for the following product using this structure:

**For** [target customer segment]
**Who** [statement of the need or opportunity]
**[Product name]** is a [product category]
**That** [statement of key benefit — the compelling reason to buy]
**Unlike** [primary competitive alternative]
**Our product** [statement of primary differentiation]

Then expand each element with:

1. **Target customer**: Who specifically? What job title, company size, industry? What makes them the ideal customer vs. a bad-fit customer?
2. **The problem**: What is the painful status quo? What are they doing today that is inadequate?
3. **Category**: What mental model should customers use to understand this product? (Choosing the wrong category is the most common positioning mistake)
4. **Key benefit**: What is the single most important outcome the customer gets? Not a feature — a result.
5. **Competitive alternatives**: What would the customer do if this product didn't exist?
6. **Differentiation**: What unique capability delivers the key benefit in a way alternatives cannot?

Product description: {{PRODUCT_DESCRIPTION}}
Target market: {{TARGET_MARKET}}
Key differentiators: {{DIFFERENTIATORS}}`,
  },

  {
    slug: "mkt-email-sequence",
    title: "Email Nurture Sequence for B2B SaaS Trial Users",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 215,
    sourceNote: "Practitioner knowledge — SaaS onboarding email best practices",
    promptText: `You are a growth marketer who specializes in SaaS trial-to-paid conversion. You understand that onboarding emails fail when they talk about features instead of outcomes.

Write a 5-email nurture sequence for trial users of {{PRODUCT_NAME}}. Each email must:
- Have a subject line with <50 characters and no clickbait
- Open with a single, specific value statement (not "Welcome to X!")
- Focus on ONE outcome per email, not a feature list
- Include a single, clear CTA
- Be under 200 words

Email 1 (Day 0 — Immediate): Welcome + single most important first action
Email 2 (Day 2): The "aha moment" — the specific action that predicts conversion
Email 3 (Day 5): Social proof — specific customer story with quantified outcome
Email 4 (Day 9): Overcome the #1 objection to converting
Email 5 (Day 13): Trial ending + urgency + what they'll lose

For each email provide:
- Subject line (with A/B variant)
- Preview text (90 characters)
- Full email body
- CTA button text
- Send condition (all users vs. segment)

Product: {{PRODUCT_NAME}}
Core value proposition: {{VALUE_PROP}}
Primary conversion blocker: {{MAIN_OBJECTION}}`,
  },

  {
    slug: "mkt-ad-copy-variants",
    title: "Paid Ad Copy Variants Across Awareness Stages",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "constrained-generation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 200,
    sourceNote: "Eugene Schwartz — Breakthrough Advertising awareness stages",
    promptText: `You are a direct response copywriter who understands Eugene Schwartz's five stages of customer awareness. You write copy that meets customers where they are — not where you want them to be.

Write ad copy for {{PRODUCT}} targeting each of the three most relevant awareness stages:

**Stage 1 — Problem-aware** (knows the problem, doesn't know your solution)
Headline: Lead with the problem, not the product
Body: Agitate the problem, hint at a solution category
CTA: Curiosity-driven

**Stage 2 — Solution-aware** (knows solutions exist, evaluating options)
Headline: Lead with your category + key differentiator
Body: Why your approach is better than alternatives
CTA: Comparison or demo-driven

**Stage 3 — Product-aware** (knows your product, hasn't bought yet)
Headline: Lead with the specific outcome or offer
Body: Remove the last objection, add urgency
CTA: Direct conversion

For each stage:
- Headline (under 10 words)
- Body copy (under 50 words for display, 150 for search)
- CTA (under 5 words)
- Targeting signal (what behavior/search term indicates this stage)

Product: {{PRODUCT}}
Key benefit: {{KEY_BENEFIT}}
Primary objection: {{OBJECTION}}`,
  },

  {
    slug: "mkt-content-brief",
    title: "SEO Content Brief with Search Intent Mapping",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — SEO content strategy",
    promptText: `You are an SEO content strategist who creates briefs that writers can execute without guesswork. Your briefs produce content that ranks and converts.

Create a complete content brief for the following target keyword:

**Target keyword**: {{KEYWORD}}
**Secondary keywords**: {{SECONDARY_KEYWORDS}}

Brief:

**1. Search intent analysis**
What is the searcher trying to accomplish? (Informational / Navigational / Commercial / Transactional)
What stage of the buyer journey are they in?

**2. SERP analysis summary**
Based on the keyword, what content types are ranking? (Listicles, how-tos, comparisons, tools)
What is the implied content format?

**3. Content specification**
- Recommended title (include primary keyword, under 60 characters)
- Meta description (include keyword, under 155 characters, include CTA)
- Target word count range
- Recommended H2 structure (with the specific question each section answers)
- Internal linking opportunities

**4. Unique angle**
What perspective or information would make this piece genuinely better than what currently ranks?

**5. E-E-A-T signals to include**
What expertise, experience, authoritativeness, or trustworthiness signals should the content demonstrate?

**6. Conversion integration**
Where and how should the product/service be mentioned without disrupting the informational value?`,
  },

  {
    slug: "mkt-customer-persona",
    title: "B2B Buyer Persona with Jobs-to-be-Done",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 210,
    sourceNote: "Clayton Christensen — Jobs-to-be-Done theory; practitioner knowledge",
    promptText: `You are a market researcher who builds buyer personas grounded in Jobs-to-be-Done theory. You understand that demographics describe who buys; JTBD explains why they buy.

Build a complete B2B buyer persona for {{ROLE}} at {{COMPANY_TYPE}} companies.

**Demographic and firmographic profile**
- Job title and typical career path
- Company size, industry, and growth stage
- Team size and reporting structure

**Jobs-to-be-Done**
- Functional job: What task are they trying to accomplish?
- Emotional job: How do they want to feel while doing it?
- Social job: How do they want to be perceived by others?

**Pains** (ranked by intensity)
What are the top 3 frustrations with their current approach? Be specific — not "it's slow" but "it takes 3 hours to compile the weekly report that the VP asks for every Monday morning."

**Gains** (ranked by importance)
What outcomes would make them look like a hero to their boss?

**Buying process**
- How do they discover new solutions? (Search, peer recommendation, events, LinkedIn)
- Who else is involved in the decision?
- What does their evaluation process look like?
- What objections do they raise before buying?

**Message that resonates**
One sentence that would make this persona stop scrolling.

Company context: {{COMPANY_CONTEXT}}`,
  },

  {
    slug: "mkt-launch-plan",
    title: "Product Launch Go-to-Market Plan",
    domain: "marketing",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 225,
    sourceNote: "Practitioner knowledge — product launch methodology",
    promptText: `You are a product marketing manager planning a go-to-market launch. You understand that most launches fail not from bad products but from poor sequencing and unclear ownership.

Create a 90-day GTM launch plan for {{PRODUCT}} targeting {{TARGET_MARKET}}.

**Pre-launch (Days 1-30)**
- Positioning and messaging finalization
- Sales enablement materials (battlecard, objection handling, demo script)
- Beta customer recruitment and feedback loop
- PR and analyst briefings
- Content pipeline (what gets published when)

**Launch week (Days 31-37)**
- Day-by-day activity calendar
- Channel activation sequence (email, social, PR, paid, community)
- Internal announcement and sales kickoff
- Launch metrics dashboard

**Post-launch (Days 38-90)**
- Conversion optimization based on early data
- Customer success onboarding for first cohort
- Case study development
- Iteration on messaging based on sales feedback

For each phase:
- Key activities with owner (Marketing / Sales / Product / CS)
- Success metrics
- Dependencies and risks

Product: {{PRODUCT}}
Launch date: {{LAUNCH_DATE}}
Budget: {{BUDGET}}`,
  },

  {
    slug: "mkt-case-study",
    title: "Customer Case Study Interview and Story Structure",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "Practitioner knowledge — B2B case study methodology",
    promptText: `You are a content marketer who writes case studies that actually drive sales — not corporate fluff pieces.

Write a case study using the Before/After/Bridge structure:

**Headline**: [Company] [achieved specific outcome] with [Product] — quantified result in the headline

**The challenge** (Before)
What was the specific, painful situation before? Use the customer's own language. Include: the business impact of the problem, what they tried before, why those attempts failed.

**The solution** (Bridge)
How did they implement {{PRODUCT}}? What was the onboarding experience? What specific features did they use and why?

**The results** (After)
Lead with the most impressive quantified outcome. Then: 3-5 specific metrics with before/after comparison. Include a quote that speaks to the emotional transformation, not just the numbers.

**Why it worked**
One paragraph explaining the underlying reason for the success — this builds credibility.

**Customer quote** (pull quote for the PDF)
A single sentence that captures the transformation. Attribute to name, title, company.

Interview data to use:
{{INTERVIEW_DATA}}

Product used: {{PRODUCT}}`,
  },

  {
    slug: "mkt-competitive-analysis",
    title: "Competitive Landscape Analysis and Differentiation Map",
    domain: "marketing",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — competitive intelligence",
    promptText: `You are a competitive intelligence analyst who helps product and marketing teams understand their competitive position clearly and honestly.

Analyze the competitive landscape for {{PRODUCT}} in the {{MARKET}} market.

**Competitive map**
Organize competitors into tiers:
- Tier 1 (direct): Same ICP, same use case, same price range
- Tier 2 (adjacent): Overlapping use cases or customer segments
- Tier 3 (indirect): Different approach to the same underlying problem

**Feature comparison matrix**
For the top 3 direct competitors, compare on the dimensions that matter most to buyers. Be honest — note where competitors are stronger.

**Positioning analysis**
How does each competitor position itself? What narrative are they telling? Where are the gaps in the market narrative?

**Win/loss patterns**
Based on the information provided, in what scenarios does each competitor typically win? When do they lose?

**Differentiation opportunities**
Where is there genuine white space — a positioning or capability that no competitor owns?

**Battlecard summary**
For the #1 competitor: how to win against them in a head-to-head evaluation.

Competitor information: {{COMPETITOR_DATA}}
Our product: {{OUR_PRODUCT}}`,
  },

  {
    slug: "mkt-social-media-calendar",
    title: "30-Day Social Media Content Calendar",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — social media content strategy",
    promptText: `You are a social media strategist who builds content calendars that balance brand building with community engagement.

Create a 30-day content calendar for {{BRAND}} on {{PLATFORM}}. Use the 4-1-1 rule: for every 6 posts, 4 are educational/entertaining, 1 is soft sell, 1 is hard sell.

Content mix (30 posts total):
- 20 educational/entertaining posts
- 6 soft sell (thought leadership that mentions the product naturally)
- 4 hard sell (direct offer or CTA)

For each post provide:
- Day and time (based on platform best practices)
- Content type (text, image, video, carousel, poll, etc.)
- Hook (first line — must stop the scroll)
- Full post copy
- Hashtags (3-5 relevant ones, not generic)
- CTA
- Content pillar (which brand theme it serves)

Content pillars for this brand: {{CONTENT_PILLARS}}
Brand voice: {{BRAND_VOICE}}
Key product/service to promote: {{PRODUCT}}`,
  },

  {
    slug: "mkt-brand-voice-guide",
    title: "Brand Voice and Tone Guidelines",
    domain: "marketing",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["few-shot"]),
    tokenCount: 205,
    sourceNote: "Practitioner knowledge — brand voice development",
    promptText: `You are a brand strategist developing a voice and tone guide that writers can actually use. You understand that "professional but approachable" is not a voice — it's a cliché.

Develop a brand voice guide for {{BRAND}} with the following structure:

**Brand personality** (3 adjectives with definitions)
For each: what it means, what it does NOT mean, and a one-sentence example.

**Voice characteristics** (4 traits)
For each trait:
- Description: What this sounds like
- In practice: Specific writing techniques that achieve it
- Example — DO: A sample sentence in this voice
- Example — DON'T: The same content in the wrong voice

**Tone variations by context**
How the voice adapts (not changes) for:
- Marketing copy (website, ads)
- Customer support
- Error messages and system notifications
- Social media
- Internal communications

**Word choices**
- Words we use: [list of 10-15 on-brand words]
- Words we avoid: [list of 10-15 off-brand words with alternatives]

**The one-sentence brand voice test**
A single question a writer can ask to check if their copy sounds like {{BRAND}}.

Brand description: {{BRAND_DESCRIPTION}}
Target audience: {{AUDIENCE}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: education (10 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "edu-lesson-plan",
    title: "Lesson Plan with Bloom's Taxonomy Alignment",
    domain: "education",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 215,
    sourceNote: "Bloom's Taxonomy (revised, Anderson & Krathwohl 2001)",
    promptText: `You are an instructional designer who creates lesson plans grounded in learning science. You align every activity to specific cognitive objectives using Bloom's revised taxonomy.

Create a complete lesson plan for the following:

**Subject**: {{SUBJECT}}
**Grade level / Audience**: {{GRADE_LEVEL}}
**Duration**: {{DURATION}}
**Learning objectives** (write 3, one per Bloom's level):
- Remember/Understand: Students will be able to...
- Apply/Analyze: Students will be able to...
- Evaluate/Create: Students will be able to...

**Lesson structure**:

1. **Hook** (5 min): An engaging question, problem, or demonstration that activates prior knowledge and creates curiosity

2. **Direct instruction** ({{INSTRUCTION_TIME}}): Key concepts with examples. Include: what to say, what to write/show, anticipated misconceptions to address

3. **Guided practice** ({{GUIDED_TIME}}): Structured activity where students apply concepts with teacher support. Include the activity, success criteria, and how to check for understanding

4. **Independent practice** ({{INDEPENDENT_TIME}}): Students demonstrate mastery independently. Include the task and how you'll know if they got it

5. **Closure** (5 min): How students synthesize learning. Exit ticket question.

**Differentiation**:
- For students who need support: one modification
- For students who need extension: one challenge

**Assessment**: How will you measure whether the objectives were met?`,
  },

  {
    slug: "edu-socratic-seminar",
    title: "Socratic Seminar Question Set for Complex Text",
    domain: "education",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "Socratic seminar methodology — National Paideia Center",
    promptText: `You are a Socratic seminar facilitator who designs questions that generate genuine intellectual inquiry — not questions with predetermined right answers.

Design a complete Socratic seminar question set for the following text. Questions must be genuinely open — reasonable people can disagree based on the text and their values.

**Opening question** (1 question)
A broad, accessible question that invites everyone in. Should be answerable from the text but open to interpretation.

**Core questions** (4-6 questions)
The heart of the seminar. Each should:
- Require evidence from the text
- Connect to a genuinely contested idea
- Build on each other in a logical sequence
- Be answerable in multiple defensible ways

**Closing question** (1 question)
Connects the text to the students' lives or the contemporary world. Should leave them thinking after the seminar ends.

**Facilitator notes**
For each core question: what are the 2-3 most likely student responses, and what follow-up probes would deepen the inquiry?

Text: {{TEXT_TITLE}}
Grade level: {{GRADE_LEVEL}}
Key themes to explore: {{THEMES}}`,
  },

  {
    slug: "edu-rubric-design",
    title: "Analytic Rubric for Complex Performance Task",
    domain: "education",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — assessment design, Wiggins & McTighe Understanding by Design",
    promptText: `You are an assessment designer who builds rubrics that are fair, transparent, and actually improve student performance when shared in advance.

Create an analytic rubric for the following performance task:

**Task**: {{TASK_DESCRIPTION}}
**Grade level**: {{GRADE_LEVEL}}
**Standards addressed**: {{STANDARDS}}

Rubric format: 4 performance levels (4=Exceeds, 3=Meets, 2=Approaching, 1=Beginning)

For each criterion (4-6 criteria total):
- **Criterion name**: A clear, student-friendly label
- **Weight**: Percentage of total score
- **4 — Exceeds**: Specific, observable evidence of exceptional performance
- **3 — Meets**: Specific, observable evidence of proficient performance (this is the target)
- **2 — Approaching**: Specific evidence of partial understanding or skill
- **1 — Beginning**: Specific evidence of minimal understanding

Rules for rubric language:
- Use observable, measurable descriptors — not "good" or "poor"
- Each level must be clearly distinguishable from adjacent levels
- Avoid negative language in lower levels — describe what IS present, not what is missing

Also provide: a student-facing version of the rubric in plain language.`,
  },

  {
    slug: "edu-differentiated-instruction",
    title: "Differentiated Instruction Plan for Mixed-Ability Classroom",
    domain: "education",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 210,
    sourceNote: "Carol Ann Tomlinson — Differentiated Instruction framework",
    promptText: `You are an instructional coach who helps teachers reach every learner without creating 30 different lesson plans.

Design a differentiated instruction plan for the following lesson using Tomlinson's framework. Differentiate by: content (what students learn), process (how they learn it), and product (how they demonstrate learning).

**Core learning objective**: {{OBJECTIVE}}
**Grade level**: {{GRADE_LEVEL}}
**Student profiles to address**:
- Students reading 2+ years below grade level
- English Language Learners (intermediate proficiency)
- Students with IEPs (processing speed, working memory)
- On-grade-level students
- Advanced learners (2+ years above grade level)

For each student profile, specify:
- **Content modification**: What scaffolding or extension is provided?
- **Process modification**: How is the learning activity adapted?
- **Product modification**: How is the demonstration of learning adapted?
- **Grouping strategy**: When and how are students grouped?

Also provide:
- Flexible grouping structure for the lesson
- Materials list with modifications
- Assessment accommodations
- One strategy that benefits ALL learners regardless of level`,
  },

  {
    slug: "edu-feedback-writing",
    title: "Constructive Feedback on Student Writing",
    domain: "education",
    taskType: "evaluate",
    patternSlug: "role-prompting",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 165,
    sourceNote: "Writing workshop methodology — Calkins, Atwell; growth mindset feedback principles",
    promptText: `You are a writing teacher who gives feedback that makes students want to revise — not feedback that makes them feel judged.

Provide feedback on the following student writing using the "Praise, Question, Polish" framework:

**Praise** (what is working — be specific, not generic)
Identify 2-3 specific strengths with exact quotes from the text. Explain WHY each works — this teaches the student what to do more of.

**Question** (one genuine question the writing raises)
Ask a question about the writing that reveals a gap — not a correction. The question should make the student want to add or clarify.

**Polish** (one specific, actionable revision suggestion)
Focus on the single highest-leverage revision. Be specific: "On line 3, instead of 'it was very big,' try describing what specifically made it feel big to the narrator."

**Next steps**
One concrete action the student should take before the next draft.

Tone: Warm, specific, and focused on the writing — not the writer. Assume the student is capable of improvement.

Student writing: {{STUDENT_WRITING}}
Assignment: {{ASSIGNMENT}}
Grade level: {{GRADE_LEVEL}}`,
  },

  {
    slug: "edu-concept-explanation",
    title: "Multi-Level Concept Explanation (Feynman Technique)",
    domain: "education",
    taskType: "explain",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 155,
    sourceNote: "Richard Feynman — teaching technique; practitioner knowledge",
    promptText: `You are a master teacher who can explain any concept at any level of sophistication. You use the Feynman technique: if you can't explain it simply, you don't understand it well enough.

Explain {{CONCEPT}} at three levels:

**Level 1 — For a curious 10-year-old**
Use only words a 5th grader knows. Use one concrete analogy from everyday life. No jargon. Maximum 100 words.

**Level 2 — For a college student with no background in this field**
Introduce the key technical terms (define each one). Use 2-3 examples. Explain why this concept matters. Maximum 200 words.

**Level 3 — For a professional in an adjacent field**
Use precise technical language. Explain the nuances and edge cases. Connect to related concepts they likely know. Highlight what is counterintuitive or commonly misunderstood. Maximum 300 words.

After all three levels, add:
**The one thing most people get wrong about {{CONCEPT}}**: The most common misconception and why it's wrong.`,
  },

  {
    slug: "edu-project-based-learning",
    title: "Project-Based Learning Unit Design",
    domain: "education",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 230,
    sourceNote: "Buck Institute for Education — Gold Standard PBL framework",
    promptText: `You are a project-based learning designer who creates units that develop both content knowledge and real-world skills.

Design a complete PBL unit using the Buck Institute's Gold Standard framework:

**Driving Question**
An open-ended, challenging question that is: meaningful to students, connected to real-world problems, and requires sustained inquiry. Format: "How might we..." or "What should..."

**Learning Goals**
- Academic standards addressed (list specific standards)
- Success skills targeted: collaboration, critical thinking, communication, creativity

**Sustained Inquiry** (4-6 week arc)
Week-by-week breakdown:
- Entry event (hook that creates need to know)
- Research and investigation phase
- Drafting and critique phase
- Revision and refinement phase
- Public presentation

**Authenticity**
- Real-world context: What actual problem or question does this connect to?
- Authentic audience: Who outside the classroom will see/use the work?
- Student voice and choice: Where do students make meaningful decisions?

**Reflection**
- Formative checkpoints (what and when)
- Final reflection protocol

**Assessment**
- Rubric criteria aligned to driving question
- How is both content knowledge and collaboration assessed?

Subject: {{SUBJECT}}
Grade level: {{GRADE_LEVEL}}
Duration: {{DURATION}}`,
  },

  {
    slug: "edu-quiz-generation",
    title: "Formative Assessment Quiz with Distractor Analysis",
    domain: "education",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Assessment design — Bloom's taxonomy, distractor analysis methodology",
    promptText: `You are an assessment specialist who designs multiple-choice questions that actually measure understanding — not just recall.

Create a 10-question formative assessment quiz on {{TOPIC}} for {{GRADE_LEVEL}} students.

For each question:
- **Stem**: The question (clear, unambiguous, tests one concept)
- **Correct answer**: With a brief explanation of why it is correct
- **Distractor A**: A plausible wrong answer that reflects a specific misconception — identify the misconception
- **Distractor B**: A plausible wrong answer that reflects a different misconception — identify the misconception
- **Distractor C**: A plausible wrong answer (not "all of the above" or "none of the above")
- **Bloom's level**: Remember / Understand / Apply / Analyze / Evaluate / Create
- **Diagnostic value**: What does a student who chooses each distractor reveal about their understanding?

Question distribution:
- 3 questions at Remember/Understand
- 4 questions at Apply/Analyze
- 3 questions at Evaluate/Create

Standards addressed: {{STANDARDS}}`,
  },

  {
    slug: "edu-parent-communication",
    title: "Parent Communication for Difficult Academic Conversations",
    domain: "education",
    taskType: "generate",
    patternSlug: "audience-adaptation",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 155,
    sourceNote: "Practitioner knowledge — family engagement best practices",
    promptText: `You are an experienced teacher who communicates difficult academic information to parents with clarity, warmth, and a focus on partnership.

Write a parent communication for the following situation. The communication must:
- Lead with a genuine strength (not a formulaic opener)
- State the concern specifically and without jargon
- Provide concrete evidence (what you observed, not a judgment)
- Explain the impact on the student's learning
- Propose a specific next step with a clear ask of the parent
- Invite dialogue — not just inform
- Be under 250 words

Tone: Direct but warm. Collaborative, not adversarial. Focused on the student's success.

Situation: {{SITUATION}}
Student strengths to highlight: {{STRENGTHS}}
Specific concern: {{CONCERN}}
Proposed next step: {{NEXT_STEP}}`,
  },

  {
    slug: "edu-curriculum-mapping",
    title: "Curriculum Mapping for Standards Alignment",
    domain: "education",
    taskType: "plan",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 200,
    sourceNote: "Heidi Hayes Jacobs — curriculum mapping methodology",
    promptText: `You are a curriculum coordinator creating a scope and sequence map that ensures standards coverage without redundancy.

Create a curriculum map for {{SUBJECT}} at {{GRADE_LEVEL}} for a full academic year.

**Year-at-a-glance**
Divide the year into 6-8 units. For each unit:
- Unit title and essential question
- Duration (weeks)
- Key standards addressed (list standard codes)
- Enduring understandings (what students should remember in 5 years)
- Key knowledge and skills

**Standards coverage audit**
- Standards addressed in multiple units (spiraling — good)
- Standards addressed only once (identify if they need reinforcement)
- Standards not yet addressed (gaps to fill)

**Vertical alignment notes**
- What prior knowledge from the previous grade does this map build on?
- What does this map prepare students for in the next grade?

**Assessment calendar**
- Formative assessment checkpoints
- Summative assessments with standards measured
- Benchmark/standardized assessment windows

Standards framework: {{STANDARDS_FRAMEWORK}}
Available instructional days: {{INSTRUCTIONAL_DAYS}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: research (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "res-literature-review",
    title: "Systematic Literature Review Protocol",
    domain: "research",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 220,
    sourceNote: "PRISMA guidelines — systematic review methodology",
    promptText: `You are a research methodologist helping a graduate student design a systematic literature review. You follow PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) guidelines.

Design a complete systematic review protocol for the following research question:

**Research question**: {{RESEARCH_QUESTION}}
**Field**: {{FIELD}}

**1. Search strategy**
- Databases to search (with justification for each)
- Search string with Boolean operators and MeSH/controlled vocabulary terms
- Date range and language restrictions with justification

**2. Inclusion/exclusion criteria**
Using PICO(S) framework:
- Population: who/what is studied
- Intervention/exposure: what is being examined
- Comparison: what it is compared to
- Outcome: what is measured
- Study design: which designs are included

**3. Screening process**
- Title/abstract screening: decision rules
- Full-text screening: decision rules
- Conflict resolution between reviewers

**4. Data extraction form**
Fields to extract from each included study (minimum 15 fields)

**5. Quality assessment**
Which tool will assess risk of bias? (Cochrane RoB, Newcastle-Ottawa, GRADE, etc.) Why?

**6. Synthesis approach**
Narrative synthesis or meta-analysis? If meta-analysis: which effect size measure, heterogeneity assessment, subgroup analyses?`,
  },

  {
    slug: "res-hypothesis-generation",
    title: "Research Hypothesis Generation and Operationalization",
    domain: "research",
    taskType: "generate",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — research design methodology",
    promptText: `You are a research design consultant who helps investigators develop testable hypotheses from theoretical frameworks.

Develop research hypotheses for the following research area using this framework:

**Step 1 — Theoretical grounding**
What existing theory or empirical finding motivates this research? Identify the theoretical gap.

**Step 2 — Conceptual hypotheses** (3 hypotheses)
For each:
- State the relationship between constructs in plain language
- Identify the theoretical mechanism (why would this relationship exist?)
- Identify the boundary conditions (under what circumstances does this hold?)

**Step 3 — Operational hypotheses**
For each conceptual hypothesis, write the operational version:
- Define each construct with a specific, measurable indicator
- State the direction of the predicted effect
- Specify the statistical test that would test it

**Step 4 — Rival hypotheses**
For each hypothesis, what is the most plausible alternative explanation? How would the study design distinguish between them?

**Step 5 — Falsifiability check**
What result would definitively disconfirm each hypothesis?

Research area: {{RESEARCH_AREA}}
Theoretical framework: {{THEORY}}
Available data/methods: {{METHODS}}`,
  },

  {
    slug: "res-survey-design",
    title: "Survey Instrument Design with Validity Considerations",
    domain: "research",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 205,
    sourceNote: "Dillman, Smyth & Christian — Internet, Phone, Mail and Mixed-Mode Surveys",
    promptText: `You are a survey methodologist who designs instruments that minimize common response biases and maximize data quality.

Design a survey instrument for the following research objective:

**Research objective**: {{OBJECTIVE}}
**Target population**: {{POPULATION}}
**Mode**: {{MODE}} (online/phone/mail)

**Instrument design**:

1. **Introduction** (under 75 words): Purpose, time required, confidentiality assurance, voluntary participation

2. **Screening questions** (if needed): Who qualifies to complete the survey?

3. **Core questions** (10-15 questions):
For each question:
- Question text (avoid double-barreled, leading, or loaded language)
- Response format (Likert, semantic differential, nominal, ordinal, open-ended)
- Scale anchors (if applicable)
- Cognitive pretesting note: what misunderstanding might respondents have?

4. **Demographic questions** (at the end): Only collect what you will actually analyze

**Bias mitigation**:
- Social desirability bias: which questions are at risk and how to mitigate
- Acquiescence bias: are any questions reversed-scored?
- Order effects: any questions that should be randomized?

**Validity**:
- Face validity: does the instrument look like it measures what it claims?
- Content validity: are all facets of the construct covered?`,
  },

  {
    slug: "res-interview-protocol",
    title: "Semi-Structured Interview Protocol for Qualitative Research",
    domain: "research",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Kvale & Brinkmann — InterViews; qualitative research methodology",
    promptText: `You are a qualitative researcher designing a semi-structured interview protocol. You understand that good interview questions invite narrative, not yes/no answers.

Design a complete interview protocol for the following study:

**Research question**: {{RESEARCH_QUESTION}}
**Participant type**: {{PARTICIPANT_TYPE}}
**Interview duration**: {{DURATION}}

**Protocol structure**:

**Opening** (5 min)
- Consent confirmation and recording permission
- Study purpose explanation (brief, without biasing responses)
- Warm-up question (easy, factual, builds rapport)

**Core questions** (8-10 questions, 60-70% of time)
For each question:
- Main question (open-ended, non-leading)
- 2-3 probes to deepen the response
- Transition to the next topic

**Closing** (5-10 min)
- Summary reflection question: "Is there anything important we haven't covered?"
- Member checking: "Here's what I heard you say... is that accurate?"
- Next steps and thank you

**Interviewer notes**:
- Topics to avoid (that might bias responses)
- Signs of discomfort to watch for
- How to handle sensitive topics if they arise`,
  },

  {
    slug: "res-abstract-writing",
    title: "Academic Abstract Writing for Conference Submission",
    domain: "research",
    taskType: "generate",
    patternSlug: "constrained-generation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 165,
    sourceNote: "APA Publication Manual — abstract writing guidelines",
    promptText: `You are an academic writing coach who helps researchers write abstracts that get accepted and read.

Write a structured abstract for the following research paper. The abstract must be exactly 250 words (±10 words) and follow this structure:

**Background** (2-3 sentences): What is the problem and why does it matter? What gap in the literature does this study address?

**Objective** (1 sentence): What was the specific aim of this study?

**Methods** (3-4 sentences): Study design, participants/data, key measures, analysis approach

**Results** (3-4 sentences): Key findings with specific numbers. Lead with the most important finding. Include effect sizes where applicable.

**Conclusions** (2-3 sentences): What do the findings mean? What are the implications for practice, policy, or future research?

**Keywords** (5 terms): MeSH terms or field-standard keywords for indexing

Rules:
- Past tense for methods and results; present tense for conclusions
- No citations in the abstract
- No abbreviations without definition on first use
- Specific numbers, not vague language ("significantly improved" → "improved by 23%, p<0.001")

Paper information:
{{PAPER_INFORMATION}}`,
  },

  {
    slug: "res-peer-review",
    title: "Peer Review Report for Academic Journal",
    domain: "research",
    taskType: "evaluate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["self-critique"]),
    tokenCount: 210,
    sourceNote: "Practitioner knowledge — academic peer review standards",
    promptText: `You are an experienced peer reviewer for an academic journal. Your reviews are known for being thorough, constructive, and focused on improving the science — not demonstrating your own expertise.

Write a peer review report for the following manuscript:

**Summary** (3-4 sentences)
Briefly describe what the paper does and its main contribution. This shows the authors you understood their work.

**Overall recommendation**
Accept / Minor revision / Major revision / Reject — with one-sentence justification.

**Major concerns** (issues that must be addressed)
For each concern:
- Specific issue with page/section reference
- Why it matters for the validity or contribution of the work
- Specific suggestion for how to address it

**Minor concerns** (issues that would improve the paper)
Numbered list with specific references.

**Specific comments**
Line-by-line notes on: unclear writing, unsupported claims, missing citations, statistical issues, figure/table problems.

**Confidential comments to the editor** (if any)
Concerns about ethics, overlap with other work, or scope fit — not shared with authors.

Tone: Constructive and specific. Assume the authors are capable researchers who want to improve their work. Avoid sarcasm or condescension.

Manuscript: {{MANUSCRIPT}}
Journal scope: {{JOURNAL_SCOPE}}`,
  },

  {
    slug: "res-grant-specific-aims",
    title: "NIH Grant Specific Aims Page",
    domain: "research",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 225,
    sourceNote: "NIH grant writing guidelines — Specific Aims page conventions",
    promptText: `You are a grant writing consultant who has helped researchers secure over $50M in NIH funding. You understand that the Specific Aims page is the most important page in any NIH application — it is read by every reviewer and determines whether the full application gets a fair read.

Write a Specific Aims page (exactly 1 page, ~600 words) for the following research project:

**Opening paragraph** (hook — 3-4 sentences)
State the problem and its significance. Quantify the impact. End with the critical gap in knowledge.

**Paragraph 2** (long-term goal and objective)
"The long-term goal of this research is to..." 
"The objective of this application is to..."
State the central hypothesis and how it was formulated (preliminary data reference).

**Aims** (3 aims, each 2-3 sentences)
Aim 1: [Action verb] to [accomplish what] by [how]
Aim 2: [Action verb] to [accomplish what] by [how]
Aim 3: [Action verb] to [accomplish what] by [how]

**Innovation paragraph** (3-4 sentences)
What is genuinely new? How does this shift the paradigm?

**Impact paragraph** (closing — 3-4 sentences)
What will be possible after this work that is not possible now? Connect to the NIH mission.

Research project: {{PROJECT_DESCRIPTION}}
Preliminary data summary: {{PRELIMINARY_DATA}}
NIH institute/study section: {{STUDY_SECTION}}`,
  },

  {
    slug: "res-data-interpretation",
    title: "Quantitative Research Results Interpretation",
    domain: "research",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["self-critique"]),
    tokenCount: 195,
    sourceNote: "APA Publication Manual — statistical reporting; Gelman & Hill — Data Analysis",
    promptText: `You are a quantitative methodologist helping a researcher interpret their statistical results accurately and without overclaiming.

Interpret the following statistical results step by step:

**Step 1 — Descriptive summary**
What do the descriptive statistics tell us about the sample and the variables?

**Step 2 — Inferential results**
For each test result:
- What was tested?
- What does the test statistic and p-value tell us? (And what it does NOT tell us)
- What is the effect size and what does it mean practically?
- What is the confidence interval and how should it be interpreted?

**Step 3 — Assumptions check**
Were the statistical assumptions for each test met? If not, how does this affect interpretation?

**Step 4 — What can be concluded**
What can be concluded from these results? Be precise about causality vs. correlation, generalizability, and the scope of the claims.

**Step 5 — Self-critique**
What are the 3 most important limitations of these results? What alternative explanations cannot be ruled out?

**Step 6 — Reporting language**
Write 2-3 sentences that accurately report the key finding in APA style, including all required statistics.

Results: {{RESULTS}}
Study design: {{DESIGN}}
Research question: {{QUESTION}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: customer-support (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "cs-escalation-response",
    title: "Escalated Customer Complaint Response",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "role-prompting",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["few-shot"]),
    tokenCount: 200,
    sourceNote: "Practitioner knowledge — customer service de-escalation",
    promptText: `You are a senior customer success manager who handles escalated complaints. You understand that an angry customer is an opportunity — handled well, they become your most loyal advocates.

Write a response to the following escalated customer complaint. The response must:

1. **Acknowledge first** — Validate the customer's frustration specifically (not generically). Mirror their language to show you actually read their complaint.

2. **Take ownership** — No passive voice, no blame-shifting to "the system" or "policy." Use "I" and "we."

3. **Explain without excusing** — If there is a reason for what happened, explain it briefly. But make clear it is an explanation, not a justification.

4. **Resolve specifically** — State exactly what you will do, by when, and how the customer will know it is done. No vague promises.

5. **Restore the relationship** — Offer something that demonstrates you value the customer beyond this transaction. Make it proportional to the severity of the issue.

6. **Close with confidence** — End with a specific next step, not "please let us know if you need anything."

Tone: Warm, direct, and accountable. No corporate jargon. No hollow phrases like "We apologize for any inconvenience."

Customer complaint: {{COMPLAINT}}
Customer history: {{CUSTOMER_HISTORY}}
What went wrong: {{ROOT_CAUSE}}`,
  },

  {
    slug: "cs-knowledge-base-article",
    title: "Help Center Article for Common Support Issue",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 165,
    sourceNote: "Practitioner knowledge — knowledge base best practices",
    promptText: `You are a technical writer who creates help center articles that actually deflect support tickets. You know that most help articles fail because they are written from the company's perspective, not the customer's.

Write a help center article for the following issue:

**Article title**: Start with the customer's question, not the feature name. (e.g., "How do I reset my password?" not "Password Management")

**When to use this article**: One sentence describing the situation where this article applies.

**Quick answer** (for scanners): 2-3 sentences that solve the most common case immediately.

**Step-by-step instructions**:
- Numbered steps (not bullets)
- Each step: one action only
- Include what the user should see after each step (confirmation)
- Screenshot placeholders where visuals would help

**If that didn't work**:
- 2-3 common variations with their specific solutions

**Still need help?**
- Link to next escalation path

Rules:
- Second person ("you"), present tense, active voice
- No jargon without definition
- Steps under 15 words each

Issue to document: {{ISSUE}}
Product: {{PRODUCT}}`,
  },

  {
    slug: "cs-chatbot-intent-mapping",
    title: "Customer Support Chatbot Intent and Response Design",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — conversational AI design",
    promptText: `You are a conversational AI designer building a customer support chatbot. You understand that chatbots fail when they try to handle everything and succeed when they handle a focused set of intents extremely well.

Design the intent map and response templates for the following support domain:

**Domain**: {{SUPPORT_DOMAIN}}
**Top 8 customer intents** (ranked by volume):

For each intent:
- **Intent name**: Short label (e.g., "check_order_status")
- **Training utterances**: 5 example phrases customers actually use (not formal language)
- **Entities to extract**: What information is needed to resolve this? (order number, email, date, etc.)
- **Happy path response**: The response when all entities are present and the issue is resolved
- **Clarification response**: When entities are missing
- **Escalation trigger**: What signals this needs a human agent?
- **Fallback response**: When the bot cannot resolve it

**Escalation design**:
- What context should be passed to the human agent?
- How should the handoff be communicated to the customer?

**Tone guidelines**:
- Personality traits for this bot
- Phrases to use and avoid`,
  },

  {
    slug: "cs-csat-analysis",
    title: "CSAT Survey Response Analysis and Insight Extraction",
    domain: "customer-support",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 180,
    sourceNote: "Practitioner knowledge — voice of customer analysis",
    promptText: `You are a customer experience analyst extracting actionable insights from CSAT survey responses.

Analyze the following batch of CSAT responses and provide:

**1. Quantitative summary**
- Score distribution (if scores are provided)
- Response volume by category
- Net Promoter Score calculation (if applicable)

**2. Theme extraction**
Identify the top 5 themes in the responses. For each theme:
- Theme name
- Frequency (how many responses mention it)
- Representative quotes (2-3 verbatim)
- Sentiment: Positive / Negative / Mixed
- Business impact: High / Medium / Low

**3. Root cause analysis**
For the top 2 negative themes: what is the likely root cause? (Process failure, training gap, product limitation, expectation mismatch?)

**4. Bright spots**
What are customers specifically praising? These are the behaviors to reinforce.

**5. Actionable recommendations**
3 specific, prioritized recommendations with:
- What to change
- Who owns it
- Expected impact on CSAT

**6. Verbatim highlights**
5 quotes worth sharing with the broader team (2 positive, 2 negative, 1 surprising)

CSAT responses: {{RESPONSES}}`,
  },

  {
    slug: "cs-onboarding-email",
    title: "Customer Onboarding Email Sequence",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — customer success onboarding",
    promptText: `You are a customer success manager designing an onboarding email sequence that reduces time-to-value and prevents churn in the first 90 days.

Design a 6-email onboarding sequence for new customers of {{PRODUCT}}. Each email must drive one specific action that moves the customer closer to their first value moment.

For each email:
- **Trigger**: When is it sent? (Day 0, Day 3, Day 7, etc. or event-based)
- **Subject line**: Under 50 characters, benefit-focused
- **Goal**: The single action this email drives
- **Body** (under 150 words):
  - Opening: Acknowledge where they are in the journey
  - Value statement: Why this action matters to them
  - The ask: One clear, specific action
  - What happens next: Set expectations
- **CTA button text**: Under 5 words
- **Success metric**: How do you know this email worked?

Sequence arc:
Email 1 (Day 0): Welcome + single most important first step
Email 2 (Day 2): Core feature activation
Email 3 (Day 5): First value moment confirmation
Email 4 (Day 10): Advanced feature introduction
Email 5 (Day 21): Check-in and success story
Email 6 (Day 45): Expansion opportunity or renewal prep

Product: {{PRODUCT}}
First value moment: {{VALUE_MOMENT}}`,
  },

  {
    slug: "cs-policy-communication",
    title: "Policy Change Communication to Customers",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "audience-adaptation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 165,
    sourceNote: "Practitioner knowledge — customer communication best practices",
    promptText: `You are a customer communications specialist who writes policy change announcements that minimize customer frustration and maximize understanding.

Write a customer communication for the following policy change. The communication must:

1. **Lead with the customer impact** — Not "We are updating our policy" but "Starting [date], here's what changes for you"
2. **Be specific** — Exact dates, exact changes, exact new terms. No vague language.
3. **Explain the why** — Briefly and honestly. Customers can handle the truth better than corporate speak.
4. **Address the obvious objection** — What will customers be most upset about? Acknowledge it directly.
5. **Make the action clear** — What (if anything) does the customer need to do? By when?
6. **Provide an escape route** — If customers can opt out or leave, say so clearly.

Tone: Direct and respectful. No legalese. No "we value your business" filler.

Policy change: {{POLICY_CHANGE}}
Effective date: {{DATE}}
Reason for change: {{REASON}}
Customer action required: {{ACTION_REQUIRED}}`,
  },

  {
    slug: "cs-support-ticket-triage",
    title: "Support Ticket Classification and Routing System Prompt",
    domain: "customer-support",
    taskType: "classify",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["few-shot"]),
    tokenCount: 210,
    sourceNote: "Practitioner knowledge — support operations",
    promptText: `You are a support operations engineer building an automated ticket triage system. You are writing the system prompt for an LLM that will classify and route incoming support tickets.

Write a complete system prompt for a ticket triage LLM that:

**Classifies tickets by**:
- Category: billing / technical / account / feature-request / bug-report / general-inquiry
- Priority: P1 (business down) / P2 (major impact) / P3 (minor impact) / P4 (no urgency)
- Sentiment: frustrated / neutral / positive
- Complexity: simple (FAQ answer) / medium (needs investigation) / complex (needs specialist)

**Extracts entities**:
- Product/feature mentioned
- Error codes or messages
- Account identifiers mentioned
- Dates and deadlines mentioned

**Routes to**:
- Tier 1 (simple FAQ)
- Tier 2 (technical investigation)
- Billing team
- Engineering (bugs)
- Product (feature requests)
- Escalation (P1 or VIP customers)

**Output format**: JSON with all fields above plus a one-sentence summary and suggested first response.

Include 3 few-shot examples in the prompt covering: a P1 technical issue, a billing dispute, and a feature request.

Product context: {{PRODUCT_CONTEXT}}`,
  },

  {
    slug: "cs-churn-prevention",
    title: "At-Risk Customer Churn Prevention Outreach",
    domain: "customer-support",
    taskType: "generate",
    patternSlug: "role-prompting",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 175,
    sourceNote: "Practitioner knowledge — customer success churn prevention",
    promptText: `You are a customer success manager reaching out to a customer who shows churn risk signals. You understand that the worst thing you can do is send a generic "we noticed you haven't logged in" email.

Write a personalized outreach message for the following at-risk customer. The message must:

1. **Reference something specific** — Use the customer's actual usage data, their stated goals from onboarding, or a recent interaction. No generic openers.

2. **Name the gap** — Acknowledge that they haven't achieved [specific goal] yet. Don't pretend everything is fine.

3. **Take ownership** — "We should have reached out sooner" or "I want to make sure we're delivering the value you signed up for."

4. **Offer something concrete** — Not "let me know if you have questions" but a specific offer: a 30-minute call with a specific agenda, a custom setup session, a resource directly relevant to their use case.

5. **Make it easy to say yes** — Include a specific time slot or a one-click scheduling link placeholder.

6. **Keep it short** — Under 150 words. Busy people don't read long emails from vendors.

Customer data: {{CUSTOMER_DATA}}
Churn signals: {{CHURN_SIGNALS}}
Their stated goal at onboarding: {{ONBOARDING_GOAL}}`,
  },
];

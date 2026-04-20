/**
 * examples-data-4.mjs
 * Domains: finance (8), hr (8), product-management (8)
 */

export const examples4 = [

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: finance (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "fin-financial-model-review",
    title: "Financial Model Assumptions Review and Stress Test",
    domain: "finance",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "advanced",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output", "self-critique"]),
    tokenCount: 215,
    sourceNote: "Practitioner knowledge — financial modeling best practices",
    promptText: `You are a financial analyst who specializes in reviewing and stress-testing financial models. You are known for catching assumptions that look reasonable but are actually heroic.

Review the following financial model assumptions and:

**Step 1 — Assumption audit**
For each key assumption:
- Is it internally consistent with other assumptions?
- How does it compare to industry benchmarks or historical data?
- What is the source or justification?
- Rate as: Conservative / Reasonable / Aggressive / Heroic

**Step 2 — Sensitivity analysis**
Identify the top 3 assumptions that have the highest impact on the model output. For each:
- What is the base case value?
- What is a bear case (10th percentile) value?
- What is a bull case (90th percentile) value?
- What is the impact on the key output metric (revenue, EBITDA, IRR, etc.)?

**Step 3 — Scenario analysis**
Define three scenarios:
- Base case: Most likely outcome
- Downside case: What if the top 2 risks materialize?
- Upside case: What if the top 2 opportunities materialize?

**Step 4 — Red flags**
What assumptions, if wrong, would make the entire model invalid?

Model assumptions: {{MODEL_ASSUMPTIONS}}
Key output metric: {{OUTPUT_METRIC}}`,
  },

  {
    slug: "fin-investment-memo",
    title: "Investment Memo for Early-Stage Company",
    domain: "finance",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 230,
    sourceNote: "Practitioner knowledge — venture capital investment memo format",
    promptText: `You are a venture capital analyst writing an investment memo for an investment committee. Your memos are known for being balanced — you present the bull case honestly but also surface the real risks.

Write an investment memo for the following company using this structure:

**Company overview** (3-4 sentences)
What the company does, for whom, and what traction it has.

**Market opportunity**
- TAM/SAM/SOM with methodology (not just large numbers)
- Market timing: why now?

**Product and technology**
- Core product description
- Key differentiators (be specific — not "better UX")
- Technical moat (if any)

**Business model**
- Revenue model and unit economics
- CAC, LTV, payback period (if available)
- Path to profitability

**Team**
- Why is this team uniquely positioned to win?
- Key gaps in the team

**Traction**
- Key metrics with growth rates
- Notable customers or partnerships

**Investment thesis** (the bull case in 3 sentences)

**Key risks** (ranked by severity)
For each: the risk, the mitigation, and the residual risk if mitigation fails.

**Recommendation**: Invest / Pass / More diligence needed — with specific conditions

Company information: {{COMPANY_INFO}}
Deal terms: {{DEAL_TERMS}}`,
  },

  {
    slug: "fin-budget-variance-analysis",
    title: "Budget Variance Analysis and Explanation",
    domain: "finance",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — FP&A methodology",
    promptText: `You are a financial planning and analysis (FP&A) manager preparing a budget variance report for the CFO. You explain variances in business terms, not accounting terms.

Analyze the following budget vs. actual data:

**Step 1 — Headline summary**
What is the total variance? Is it favorable or unfavorable? What is the most important thing the CFO needs to know in one sentence?

**Step 2 — Variance decomposition**
Break the total variance into its components. For each line item with a variance >5% or >[[THRESHOLD]]:
- Variance amount and percentage
- Is it favorable (F) or unfavorable (U)?
- Root cause (volume, price, mix, timing, or one-time item)
- Business explanation in plain language

**Step 3 — Volume vs. price vs. mix analysis**
For revenue variances: how much is due to selling more/less (volume), charging more/less (price), and selling different products (mix)?

**Step 4 — Trend analysis**
Is this variance a one-time event or part of a trend? Compare to prior periods.

**Step 5 — Forecast implications**
Based on this variance, what is the revised full-year forecast? What assumptions changed?

**Step 6 — Action items**
What corrective actions are being taken? Who owns them? What is the expected impact?

Budget vs. actual data: {{VARIANCE_DATA}}
Period: {{PERIOD}}`,
  },

  {
    slug: "fin-valuation-comparable",
    title: "Comparable Company Valuation Analysis",
    domain: "finance",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 205,
    sourceNote: "Practitioner knowledge — equity research valuation methodology",
    promptText: `You are an equity research analyst performing a comparable company analysis (comps). You understand that selecting the right peer set is more important than the arithmetic.

Perform a comparable company valuation analysis for {{COMPANY}}:

**Step 1 — Peer selection**
Identify 6-8 comparable companies. For each, justify inclusion based on:
- Business model similarity
- Revenue scale and growth profile
- Geographic exposure
- Margin profile

**Step 2 — Trading multiples**
For each comparable, calculate and present:
- EV/Revenue (LTM and NTM)
- EV/EBITDA (LTM and NTM)
- P/E (if profitable)
- EV/Gross Profit (for high-growth SaaS)

**Step 3 — Multiple statistics**
- Mean, median, 25th percentile, 75th percentile for each multiple
- Identify and explain outliers

**Step 4 — Implied valuation range**
Apply the 25th-75th percentile range to the subject company's metrics. Present as a football field chart description.

**Step 5 — Discount/premium analysis**
Should the subject company trade at a discount or premium to peers? Why? (Growth differential, margin profile, competitive position, management quality)

**Step 6 — Sanity check**
Does the implied valuation make intuitive sense? What would have to be true for the company to trade at the high end vs. low end?

Company financials: {{FINANCIALS}}
Comparable data: {{COMP_DATA}}`,
  },

  {
    slug: "fin-cash-flow-forecast",
    title: "13-Week Cash Flow Forecast Construction",
    domain: "finance",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 200,
    sourceNote: "Practitioner knowledge — treasury and cash management",
    promptText: `You are a treasury analyst building a 13-week cash flow forecast for a company managing liquidity carefully. You understand that a 13-week forecast is about cash certainty, not accounting accruals.

Build a 13-week cash flow forecast framework:

**Collections (cash inflows)**
- Week-by-week collection schedule based on AR aging and payment terms
- Identify the top 5 customers by expected collection amount
- Flag any collections at risk (customers with payment delays)

**Disbursements (cash outflows)**
Organize by category:
- Payroll: exact dates and amounts
- Vendor payments: by payment terms (Net 30, Net 60, etc.)
- Debt service: scheduled principal and interest
- Capex: committed vs. discretionary
- Tax payments: estimated quarterly payments
- Other: lease payments, insurance, etc.

**Net cash position**
- Beginning cash balance
- Net cash flow each week
- Ending cash balance
- Minimum cash threshold (covenant or operational minimum)
- Weeks where cash falls below threshold (red flag)

**Liquidity sources**
- Available revolver capacity
- Receivables financing availability
- Other contingency sources

**Assumptions and risks**
Key assumptions and what would cause the forecast to be wrong.

Starting data: {{FINANCIAL_DATA}}`,
  },

  {
    slug: "fin-board-financial-update",
    title: "Board of Directors Financial Update Presentation",
    domain: "finance",
    taskType: "generate",
    patternSlug: "audience-adaptation",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 190,
    sourceNote: "Practitioner knowledge — board communication best practices",
    promptText: `You are a CFO preparing a financial update for the board of directors. You understand that board members are sophisticated but time-constrained — they need the narrative, not the spreadsheet.

Write a board financial update for {{PERIOD}} covering:

**Executive summary** (1 paragraph)
The three most important financial developments this period. Lead with the most significant.

**Revenue performance**
- Actual vs. plan vs. prior period
- Key drivers of variance (2-3 sentences)
- Leading indicators for next quarter

**Profitability**
- Gross margin, EBITDA, net income vs. plan
- Key cost drivers
- Any one-time items that affect comparability

**Cash and balance sheet**
- Cash position and runway
- Key balance sheet changes
- Covenant compliance status

**Full-year forecast**
- Updated full-year guidance vs. original plan
- Key assumptions and risks to the forecast

**Capital allocation**
- Capex spend vs. plan
- Any significant investment decisions pending board approval

**Risks and opportunities**
Top 3 financial risks and top 2 upside opportunities for the remainder of the year.

Financial data: {{FINANCIAL_DATA}}
Prior period comparison: {{PRIOR_PERIOD}}`,
  },

  {
    slug: "fin-unit-economics",
    title: "SaaS Unit Economics Analysis and Benchmarking",
    domain: "finance",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — SaaS metrics; Bessemer Venture Partners SaaS benchmarks",
    promptText: `You are a SaaS CFO analyzing unit economics to understand the health and scalability of the business.

Analyze the following SaaS unit economics data:

**Core metrics calculation**
- CAC (Customer Acquisition Cost): total S&M spend / new customers acquired
- LTV (Lifetime Value): ARPU × gross margin % / churn rate
- LTV:CAC ratio (target: >3x)
- CAC payback period in months (target: <12 months for SMB, <18 for enterprise)
- Magic Number: net new ARR / prior quarter S&M spend (target: >0.75)

**Cohort economics**
- Do newer cohorts have better or worse unit economics than older cohorts?
- What is the payback period trend over time?

**Benchmark comparison**
Compare each metric to:
- Early-stage SaaS benchmarks (Series A/B)
- Growth-stage SaaS benchmarks (Series C+)
- Public SaaS company medians

**Diagnosis**
For each metric below benchmark:
- What is the likely root cause?
- What is the highest-leverage lever to improve it?

**Recommendations**
Top 3 actions to improve unit economics, ranked by expected impact and implementation difficulty.

Unit economics data: {{DATA}}
Company stage: {{STAGE}}`,
  },

  {
    slug: "fin-due-diligence-checklist",
    title: "M&A Financial Due Diligence Checklist and Analysis",
    domain: "finance",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 210,
    sourceNote: "Practitioner knowledge — M&A due diligence methodology",
    promptText: `You are an M&A advisor conducting financial due diligence on a potential acquisition target. You are looking for both deal-breakers and value-creation opportunities.

Conduct a financial due diligence review covering:

**1. Revenue quality**
- Revenue recognition policy — is it aggressive or conservative?
- Customer concentration (any customer >10% of revenue?)
- Revenue predictability: recurring vs. one-time vs. project-based
- Backlog and pipeline quality
- Churn and retention rates

**2. Earnings quality**
- EBITDA adjustments: which are legitimate and which are aggressive?
- One-time items: are they truly one-time?
- Working capital normalization
- Capex vs. maintenance capex

**3. Balance sheet**
- Debt structure and covenants
- Off-balance-sheet obligations
- Contingent liabilities (litigation, warranties, earn-outs)
- Working capital adequacy

**4. Cash flow**
- Free cash flow conversion (FCF / EBITDA)
- Working capital trends
- Capex intensity

**5. Red flags**
What findings would cause you to recommend against the deal or require price adjustment?

**6. Value creation opportunities**
What synergies or improvements could a buyer realize?

Financial data provided: {{FINANCIAL_DATA}}
Deal structure: {{DEAL_STRUCTURE}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: hr (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "hr-job-description",
    title: "Inclusive Job Description with Bias Reduction",
    domain: "hr",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["self-critique"]),
    tokenCount: 205,
    sourceNote: "Practitioner knowledge — inclusive hiring; Textio research on gendered language",
    promptText: `You are a talent acquisition specialist who writes job descriptions that attract diverse, qualified candidates. You understand that most job descriptions are wish lists that exclude great candidates.

Write a job description for the following role, then audit it for bias:

**Job description structure**:

**About the role** (2-3 sentences)
What this person will actually do and why it matters. No buzzwords.

**What you'll do** (5-7 bullets)
Specific responsibilities. Use "you'll" not "the candidate will." Start each with a verb.

**What we're looking for** (separate required vs. preferred)
- Required: Only what is truly necessary to do the job on day one
- Preferred: Nice-to-have skills that can be learned

**What we offer**
Specific benefits and growth opportunities. Include salary range (research shows this increases diverse applicant pools).

**About us** (2-3 sentences)
Specific, not generic. What makes this company worth working at?

**Bias audit**:
After writing the JD, review it for:
- Gendered language (aggressive, dominant, nurturing, collaborative — each attracts different demographics)
- Years of experience requirements (often proxy for age discrimination)
- Degree requirements where skills would suffice
- Cultural fit language (often code for homogeneity)

Role: {{ROLE}}
Team context: {{TEAM_CONTEXT}}`,
  },

  {
    slug: "hr-performance-review",
    title: "Performance Review Writing Guide for Managers",
    domain: "hr",
    taskType: "generate",
    patternSlug: "few-shot",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 220,
    sourceNote: "Practitioner knowledge — performance management best practices",
    promptText: `You are an HR business partner helping a manager write a performance review that is fair, specific, and actionable. You know that most performance reviews fail because they are vague, recency-biased, or avoid difficult feedback.

Write a performance review for the following employee using the SBI (Situation-Behavior-Impact) model for all feedback:

**Overall performance summary** (2-3 sentences)
Honest overall assessment. Do not lead with praise if the overall rating is below expectations.

**Strengths** (3 examples using SBI)
For each: Situation (when/where), Behavior (what they specifically did), Impact (what resulted)

Example of good SBI: "During the Q3 product launch (S), you proactively identified a data pipeline failure 48 hours before launch and coordinated the fix across three teams without being asked (B), preventing what would have been a customer-facing outage affecting 10,000 users (I)."

Example of bad (vague): "You are a great team player who always goes above and beyond."

**Development areas** (2 examples using SBI)
Same format. Be specific. Vague feedback cannot be acted on.

**Goals for next period** (3 SMART goals)
Specific, Measurable, Achievable, Relevant, Time-bound

**Manager's overall rating**: Exceeds / Meets / Partially Meets / Does Not Meet

Employee data: {{EMPLOYEE_DATA}}
Rating: {{RATING}}`,
  },

  {
    slug: "hr-interview-scorecard",
    title: "Structured Interview Scorecard Design",
    domain: "hr",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — structured interviewing; Schmidt & Hunter (1998) meta-analysis on interview validity",
    promptText: `You are a talent acquisition specialist designing a structured interview process. You understand that unstructured interviews have poor predictive validity — structure is what makes interviews actually predictive of job performance.

Design a structured interview scorecard for the following role:

**Competencies to assess** (4-6 competencies)
For each competency:
- Definition: What does this competency look like in practice?
- Behavioral interview question (past behavior predicts future behavior)
- Follow-up probes (2-3 questions to deepen the response)
- What a strong answer looks like (specific behaviors and outcomes)
- What a weak answer looks like (red flags)
- Scoring rubric: 1 (no evidence) to 4 (strong evidence)

**Interview structure**
- Opening (5 min): Rapport building and overview
- Core questions (40 min): Competency-based questions
- Candidate questions (10 min): What they ask reveals what they value
- Closing (5 min): Next steps

**Debrief protocol**
- How should interviewers score independently before the debrief?
- How should disagreements be resolved?
- What is the hiring recommendation threshold?

Role: {{ROLE}}
Key competencies for success: {{COMPETENCIES}}`,
  },

  {
    slug: "hr-compensation-analysis",
    title: "Compensation Benchmarking and Pay Equity Analysis",
    domain: "hr",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 200,
    sourceNote: "Practitioner knowledge — compensation management; SHRM compensation guidelines",
    promptText: `You are a compensation analyst conducting a benchmarking and pay equity analysis. You understand that pay equity is both a legal requirement and a business imperative for retention.

Conduct a compensation analysis for the following employee population:

**1. Market benchmarking**
For each job family:
- Compare current pay to market data (P25, P50, P75, P90)
- Calculate compa-ratio (actual pay / market midpoint)
- Identify roles below P25 (flight risk) and above P90 (overpaid)

**2. Internal equity analysis**
- Are employees in the same role with similar experience and performance paid equitably?
- Calculate pay range penetration for each employee
- Identify unexplained pay gaps within job families

**3. Pay equity regression analysis**
Control for legitimate factors (job level, experience, performance, location):
- Are there statistically significant pay differences by gender, race, or other protected characteristics?
- What is the unexplained pay gap after controlling for legitimate factors?

**4. Recommendations**
- Priority adjustments (who is most at risk of leaving due to pay?)
- Pay equity remediation (who has an unexplained gap that should be corrected?)
- Budget required for recommended adjustments
- Timeline and communication plan

Employee data: {{EMPLOYEE_DATA}}
Market data source: {{MARKET_DATA}}`,
  },

  {
    slug: "hr-offboarding-process",
    title: "Employee Offboarding Process and Exit Interview Guide",
    domain: "hr",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 175,
    sourceNote: "Practitioner knowledge — HR offboarding best practices",
    promptText: `You are an HR manager designing an offboarding process that protects the company, treats departing employees with dignity, and extracts genuine insights to improve retention.

Design a complete offboarding process for {{COMPANY_TYPE}}:

**Day 1 of notice**
- Manager notification protocol
- IT access review (what to revoke immediately vs. after last day)
- Transition planning kickoff

**Knowledge transfer plan**
- Documentation requirements
- Handoff meetings
- Institutional knowledge capture template

**Final week checklist**
- Equipment return
- Access revocation sequence
- Benefits continuation information (COBRA, vested equity, etc.)
- Final paycheck and expense reimbursement

**Exit interview protocol**
Questions that generate honest feedback (not just "everything was fine"):
- What made you decide to start looking?
- What would have made you stay?
- What should we know about your role that we might not?
- What did we do well that we should keep doing?
- What one thing would you change?

**Post-departure**
- Alumni network invitation
- Reference policy
- Rehire eligibility assessment

**Data analysis**
How to aggregate exit interview data to identify retention patterns.`,
  },

  {
    slug: "hr-dei-action-plan",
    title: "DEI Audit and Action Plan Development",
    domain: "hr",
    taskType: "plan",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 210,
    sourceNote: "Practitioner knowledge — DEI strategy; McKinsey Diversity Wins report",
    promptText: `You are a DEI strategist helping an organization move from good intentions to measurable outcomes. You understand that DEI programs fail when they focus on awareness without changing systems.

Develop a DEI audit and action plan for {{ORGANIZATION_TYPE}}:

**Current state audit**
Data to collect and analyze:
- Representation by level, function, and geography (race, gender, disability, veteran status)
- Hiring funnel conversion rates by demographic group
- Promotion rates by demographic group
- Pay equity analysis
- Attrition rates by demographic group
- Employee experience survey results by demographic group

**Gap analysis**
Where are the largest representation gaps? At which career stage do underrepresented groups fall off (pipeline, hiring, promotion, retention)?

**Root cause analysis**
For each gap: is it a pipeline problem, a selection problem, a development problem, or a retention problem? Each requires a different intervention.

**Action plan** (12-month horizon)
For each priority area:
- Specific initiative
- Expected impact
- Owner
- Success metric
- Timeline
- Budget required

**Measurement framework**
Which metrics will be tracked quarterly? What are the 12-month targets?

Organization data: {{ORG_DATA}}`,
  },

  {
    slug: "hr-conflict-resolution",
    title: "Workplace Conflict Resolution Facilitation Guide",
    domain: "hr",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — workplace mediation; interest-based negotiation",
    promptText: `You are an HR business partner facilitating a conflict resolution process between two employees. You use interest-based mediation — focusing on underlying needs, not stated positions.

Design a conflict resolution facilitation guide for the following situation:

**Pre-mediation preparation**
- Individual meetings with each party: what to ask, what to listen for
- Ground rules to establish before the joint meeting
- How to assess whether mediation is appropriate (vs. formal investigation)

**Joint mediation session structure**

Opening (10 min):
- Ground rules
- Purpose statement
- Process overview

Each party's perspective (20 min):
- Questions to draw out the full story
- How to manage emotional escalation
- How to identify the underlying interests beneath stated positions

Identifying common ground (15 min):
- What do both parties agree on?
- What shared interests exist?

Generating options (15 min):
- Brainstorming without evaluation
- Reality-testing proposed solutions

Agreement (10 min):
- Specific, written commitments
- Follow-up plan

**Post-mediation**
- Documentation requirements
- Follow-up check-ins
- Escalation criteria

Conflict situation: {{CONFLICT_DESCRIPTION}}`,
  },

  {
    slug: "hr-learning-development",
    title: "Learning and Development Program Design",
    domain: "hr",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — instructional design; 70-20-10 learning model",
    promptText: `You are a learning and development specialist designing a skill development program. You follow the 70-20-10 model: 70% experiential learning, 20% social learning, 10% formal training.

Design a 90-day L&D program for {{SKILL}} for {{AUDIENCE}}:

**Learning objectives** (3-5 measurable outcomes)
By the end of 90 days, participants will be able to...

**70% — Experiential learning**
- Stretch assignments: specific projects or tasks that build the skill
- Job shadowing opportunities
- Deliberate practice activities with feedback loops

**20% — Social learning**
- Mentoring: what to look for in a mentor, structured conversation guide
- Peer learning cohort: meeting cadence and discussion topics
- Communities of practice: internal or external groups to join

**10% — Formal training**
- Curated resources (specific books, courses, articles — not generic lists)
- Workshops or training sessions (with learning objectives for each)
- Assessment checkpoints

**Progress tracking**
- How will participants track their own progress?
- How will managers assess skill development?
- What does "proficient" look like at 30, 60, and 90 days?

**Manager's role**
What do managers need to do to support this program?

Skill: {{SKILL}}
Audience: {{AUDIENCE}}`,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOMAIN: product-management (8 prompts)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    slug: "pm-prd-template",
    title: "Product Requirements Document (PRD) Template",
    domain: "product-management",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: true,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["task-decomposition"]),
    tokenCount: 230,
    sourceNote: "Practitioner knowledge — product management; Marty Cagan INSPIRED methodology",
    promptText: `You are a senior product manager who writes PRDs that engineers actually want to read. You know that a PRD is not a spec — it is a shared understanding of the problem and the success criteria.

Write a PRD for the following feature using this structure:

**Problem statement** (the most important section)
- What user problem are we solving? (Specific, not generic)
- Who has this problem? (Specific user segment)
- How do we know this is a real problem? (Evidence: user research, support tickets, data)
- What is the cost of NOT solving it?

**Goals and success metrics**
- Primary metric: What moves if this feature succeeds?
- Secondary metrics: What else should improve?
- Counter-metrics: What should NOT get worse?
- Target: Specific numbers with timeframe

**Non-goals** (what this feature will NOT do)
Explicit scope boundaries prevent scope creep.

**User stories**
Format: As a [user type], I want to [action] so that [outcome]
Include: happy path, edge cases, error states

**Functional requirements**
Numbered list. Each requirement is testable (pass/fail).

**Out of scope for v1**
What will be built in a future iteration?

**Open questions**
Unresolved decisions that need input from engineering, design, or data.

Feature: {{FEATURE_DESCRIPTION}}
User research: {{USER_RESEARCH}}`,
  },

  {
    slug: "pm-user-story-mapping",
    title: "User Story Map for End-to-End User Journey",
    domain: "product-management",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Jeff Patton — User Story Mapping methodology",
    promptText: `You are a product manager facilitating a user story mapping exercise. You use Jeff Patton's methodology: map the user journey horizontally, then slice vertically for releases.

Create a user story map for the following user journey:

**User**: {{USER_TYPE}}
**Goal**: {{USER_GOAL}}

**Level 1 — Activities** (the big steps in the journey)
5-8 high-level activities that make up the complete journey.

**Level 2 — Tasks** (what the user does within each activity)
For each activity: 3-5 specific tasks the user performs.

**Level 3 — Stories** (the detailed user stories)
For each task: 2-4 user stories in the format "As a [user], I want to [action] so that [outcome]"

**Release slicing**
Slice the map horizontally into releases:
- MVP (Release 1): The minimum that delivers core value
- Release 2: The next most important improvements
- Release 3: Nice-to-haves and edge cases

For each release: what user outcome does it enable?

**Walking skeleton**
What is the thinnest possible end-to-end implementation that proves the concept works?

Journey: {{JOURNEY_DESCRIPTION}}`,
  },

  {
    slug: "pm-prioritization-framework",
    title: "Feature Prioritization with RICE Scoring",
    domain: "product-management",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["chain-of-thought"]),
    tokenCount: 190,
    sourceNote: "Intercom — RICE prioritization framework",
    promptText: `You are a product manager prioritizing a feature backlog using the RICE framework (Reach, Impact, Confidence, Effort).

Score and prioritize the following feature candidates:

**RICE scoring methodology**:
- Reach: How many users will this affect per quarter? (Use actual numbers from your data)
- Impact: How much will this move the needle per user? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)
- Confidence: How confident are you in your estimates? (100%=high, 80%=medium, 50%=low)
- Effort: How many person-months will this take?
- RICE Score = (Reach × Impact × Confidence) / Effort

**For each feature**:
- Feature name and one-sentence description
- Reach estimate with data source
- Impact estimate with justification
- Confidence level with reasoning
- Effort estimate (include uncertainty range)
- RICE score
- Strategic fit: Does this align with current company strategy? (Yes/Partial/No)

**Prioritized list** (ranked by RICE score, adjusted for strategic fit)

**Recommended roadmap**
Top 5 features for the next quarter with sequencing rationale.

**Assumptions to validate**
Which estimates have the most uncertainty? What data would increase confidence?

Features to prioritize: {{FEATURE_LIST}}`,
  },

  {
    slug: "pm-okr-design",
    title: "OKR Design for Product Team",
    domain: "product-management",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "John Doerr — Measure What Matters; Google OKR methodology",
    promptText: `You are a product leader designing OKRs for a product team. You understand that OKRs fail when objectives are vague and key results are activities rather than outcomes.

Design OKRs for the following product team for the next quarter:

**Rules for good OKRs**:
- Objectives: Inspirational, qualitative, memorable. Should make people want to get out of bed.
- Key Results: Measurable outcomes (not activities). "Launch X" is an activity. "X% of users complete Y" is a key result.
- 3-5 key results per objective
- Key results should be ambitious (70% achievement = success)
- Key results should be independent (achieving one shouldn't automatically achieve another)

**For each OKR**:
- Objective (1 sentence, no metrics)
- Key Result 1: [metric] from [baseline] to [target] by [date]
- Key Result 2: [metric] from [baseline] to [target] by [date]
- Key Result 3: [metric] from [baseline] to [target] by [date]
- Why this objective matters: Connection to company strategy
- Risks: What could prevent achieving this?

**OKR health check**
After writing the OKRs, audit them:
- Are all key results measurable?
- Are any key results activities disguised as outcomes?
- Do the OKRs cover the full scope of the team's work?

Team context: {{TEAM_CONTEXT}}
Company strategy: {{COMPANY_STRATEGY}}`,
  },

  {
    slug: "pm-competitive-feature-analysis",
    title: "Competitive Feature Gap Analysis",
    domain: "product-management",
    taskType: "analyze",
    patternSlug: "structured-output",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 185,
    sourceNote: "Practitioner knowledge — competitive product analysis",
    promptText: `You are a product manager conducting a competitive feature analysis to inform roadmap decisions. You understand that copying competitors is a losing strategy — the goal is to identify where you can win.

Analyze the competitive feature landscape for {{PRODUCT_CATEGORY}}:

**Feature matrix**
Compare {{YOUR_PRODUCT}} against {{COMPETITORS}} on the following dimensions:
- Core features (table stakes — must have to compete)
- Differentiating features (where products meaningfully differ)
- Emerging features (new capabilities appearing in the market)

For each feature: Present / Partial / Missing / Planned

**Gap analysis**
- Table stakes gaps: Features you're missing that every competitor has (fix first)
- Strategic gaps: Features where competitors are significantly ahead in a way that affects win/loss
- Opportunity gaps: Features no competitor does well (potential differentiation)

**Win/loss correlation**
Based on the feature data: which feature gaps most correlate with losing deals?

**Build vs. buy vs. partner**
For the top 3 gaps: should you build, buy (acquire), or partner? With brief justification.

**Roadmap recommendation**
Top 3 feature investments ranked by: competitive necessity, strategic value, and build cost.

Competitor data: {{COMPETITOR_DATA}}`,
  },

  {
    slug: "pm-user-research-synthesis",
    title: "User Research Synthesis and Insight Generation",
    domain: "product-management",
    taskType: "analyze",
    patternSlug: "chain-of-thought",
    difficulty: "intermediate",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 195,
    sourceNote: "Practitioner knowledge — user research methodology; IDEO design thinking",
    promptText: `You are a UX researcher synthesizing findings from user interviews into actionable product insights. You understand the difference between observations (what users said/did), insights (why they did it), and opportunities (what to build).

Synthesize the following user research data:

**Step 1 — Observation clustering**
Group raw observations into themes. For each theme:
- Theme name
- Supporting observations (with participant attribution)
- Frequency: How many participants mentioned this?

**Step 2 — Insight generation**
For each theme, generate the underlying insight:
- Observation: "Users said..."
- Insight: "This tells us that users actually need/believe/feel..."
- Evidence strength: Strong (5+ participants) / Moderate (3-4) / Weak (1-2)

**Step 3 — Opportunity framing**
For each strong insight, frame the design opportunity:
"How might we [verb] so that [user outcome]?"

**Step 4 — Prioritization**
Rank opportunities by:
- User impact (how many users, how severe the pain)
- Business value (connection to key metrics)
- Feasibility (rough implementation complexity)

**Step 5 — Assumptions to test**
What beliefs embedded in these insights need to be validated before building?

Research data: {{RESEARCH_DATA}}
Research question: {{RESEARCH_QUESTION}}`,
  },

  {
    slug: "pm-sprint-retrospective",
    title: "Sprint Retrospective Facilitation Guide",
    domain: "product-management",
    taskType: "generate",
    patternSlug: "structured-output",
    difficulty: "beginner",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-flash"]),
    secondaryPatterns: JSON.stringify([]),
    tokenCount: 165,
    sourceNote: "Agile retrospective methodology — Esther Derby & Diana Larsen",
    promptText: `You are an agile coach facilitating a sprint retrospective. You understand that most retrospectives fail because they produce a list of complaints with no follow-through.

Design a 60-minute sprint retrospective for a team of {{TEAM_SIZE}} using the "4Ls" format (Liked, Learned, Lacked, Longed For):

**Opening** (5 min)
- Check-in activity to set psychological safety
- Retrospective prime directive reading

**Data gathering** (15 min)
Silent individual reflection, then share:
- Liked: What went well that we should keep doing?
- Learned: What did we discover about our process, product, or team?
- Lacked: What was missing that would have helped?
- Longed For: What do we wish we had?

**Insight generation** (15 min)
- Dot voting on the most important items
- Discussion of the top 3 themes

**Action planning** (20 min)
For each action item:
- Specific change (not "communicate better" but "hold a 10-min sync every Tuesday")
- Owner (one person, not "the team")
- Definition of done
- Review date

**Closing** (5 min)
- Retrospective of the retrospective: one word to describe how this went
- Appreciation round

Sprint context: {{SPRINT_CONTEXT}}`,
  },

  {
    slug: "pm-product-strategy",
    title: "Product Strategy Document",
    domain: "product-management",
    taskType: "generate",
    patternSlug: "task-decomposition",
    difficulty: "advanced",
    isFeatured: false,
    testedModels: JSON.stringify(["gpt-4o", "claude-3-opus"]),
    secondaryPatterns: JSON.stringify(["structured-output"]),
    tokenCount: 225,
    sourceNote: "Practitioner knowledge — product strategy; Roger Martin — Playing to Win",
    promptText: `You are a VP of Product developing a product strategy. You use Roger Martin's "Playing to Win" framework: strategy is a set of integrated choices about where to play and how to win.

Write a product strategy document for {{PRODUCT}} covering the next 18 months:

**Where we play** (market choices)
- Target customer segment: Who specifically? (Not "everyone")
- Use cases: Which specific jobs-to-be-done are we solving?
- Geographic focus: Where are we concentrating?
- What we are NOT doing: Explicit choices to not pursue

**How we win** (competitive advantage)
- Core differentiator: What do we do better than anyone else?
- Why this is defensible: What makes it hard to copy?
- Proof points: Where have we already demonstrated this advantage?

**Capabilities required**
What must we be excellent at to execute this strategy? (3-5 capabilities)

**Management systems**
What processes, metrics, and organizational structures support this strategy?

**18-month roadmap themes** (not features — themes)
3 strategic themes with the outcomes they drive.

**Bets and assumptions**
What must be true for this strategy to work? Which assumptions are we most uncertain about?

**Resource requirements**
What investment is needed? What tradeoffs are required?

Company context: {{COMPANY_CONTEXT}}
Current product state: {{CURRENT_STATE}}`,
  },
];

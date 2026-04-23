# Legal Document Status — Forgewright

**Status:** First drafts. Pending attorney review.

**Action required:** Schedule review with qualified attorney within 30 days of public launch.
Do not treat these documents as final legally binding versions until attorney review is complete.

---

## Documents

### /terms — Terms of Service
- **Template basis:** Common Paper / GitLab SaaS ToS pattern, adapted for Forgewright
- **Forgewright-specific facts populated:**
  - ASSESS LLC, Hawai'i governing law
  - $15/month Pro tier, 10-session Free tier
  - Stripe billing, no refunds for partial months
  - LLM provider transmission acknowledgment (Anthropic, OpenAI, Google)
  - Hard delete on account deletion (30-day window)
  - AES-256-GCM API key encryption
  - admin@forgewright.app legal contact
- **Status:** First draft. Visible "DRAFT — Pending attorney review" banner on page.
- **Attorney review notes:** Confirm eligibility age (18 vs 13+parental consent), verify Hawai'i
  limitation of liability language, confirm indemnification scope is appropriate for a SaaS tool.

### /privacy — Privacy Policy
- **Template basis:** iubenda/Termly SaaS Privacy Policy pattern, adapted for Forgewright
- **Forgewright-specific facts populated:**
  - All data types described accurately (account, session, usage, payment, API keys, preferences)
  - Third-party list: Stripe, Anthropic, OpenAI, Google, Manus — all with links to their policies
  - GDPR and CCPA rights acknowledged
  - 30-day hard delete on account deletion
  - Export options (JSON, Markdown ZIP) described
  - admin@forgewright.app privacy contact
- **Status:** First draft. Visible "DRAFT — Pending attorney review" banner on page.
- **Attorney review notes:** Confirm GDPR lawful basis for processing (legitimate interest vs contract),
  verify CCPA "sale" definition does not apply to LLM transit, confirm data retention period is compliant
  with applicable regulations.

### /security — Security Page
- **Type:** Transparency document (not a legal agreement — no attorney review required for this page)
- **Content:** Encryption at rest/in transit, authentication, payment security, data handling,
  LLM transit disclosure, access controls, responsible disclosure
- **Status:** Complete. No draft notice (transparency pages do not require legal review).
- **Update trigger:** Update this page whenever security practices change.

---

## Open Action Items

- [ ] Schedule attorney review within 30 days of public launch
- [ ] Attorney to confirm governing law and jurisdiction language (Hawai'i)
- [ ] Attorney to confirm GDPR lawful basis for processing
- [ ] Attorney to confirm CCPA applicability and "sale" definition
- [ ] Remove "DRAFT — Pending attorney review" banners after attorney sign-off
- [ ] Update "Last updated" date on /terms and /privacy after attorney review

---

## Contact for Legal Matters

All legal notices, privacy inquiries, and security disclosures: **admin@forgewright.app**

import { Link } from "wouter";

const LAST_UPDATED = "April 22, 2026";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Draft notice */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 text-center">
        <p className="text-amber-400 text-sm font-medium">
          DRAFT — Pending attorney review. This document is not yet a final legally binding agreement.
          Do not rely on it as legal advice. Review by qualified counsel is scheduled within 30 days of launch.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Back to Forgewright
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_ul]:text-muted-foreground [&_ul]:space-y-2 [&_li]:leading-relaxed">

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Forgewright ("the Service"), you agree to be bound by these Terms of Service
              ("Terms"). The Service is owned and operated by ASSESS LLC, a limited liability company organized
              under the laws of the State of Hawai'i, United States ("ASSESS LLC," "we," "us," or "our").
            </p>
            <p>
              If you do not agree to these Terms, do not use the Service. By creating an account or using any
              feature of the Service, you confirm that you have read, understood, and agree to be bound by these Terms
              and our Privacy Policy, which is incorporated herein by reference.
            </p>
          </section>

          <section>
            <h2>2. Description of Service</h2>
            <p>
              Forgewright is a structured prompt engineering workbench that helps users design, build, test, and
              refine prompts for use with large language model (LLM) APIs. The Service includes a Discovery Engine,
              Scaffold Builder, Pattern Library, Anti-Pattern Detector, Reverse Mode, A/B Comparison, Output
              Diagnosis, Swarm Composer, and related tools. Features and availability may change over time.
            </p>
            <p>
              As part of providing the Service, Forgewright transmits user-authored prompts and content to
              third-party LLM providers including Anthropic, OpenAI, and Google (collectively, "LLM Providers").
              By using the Service, you acknowledge and consent to this transmission. Each LLM Provider's own
              terms of service and privacy policy govern their handling of that content.
            </p>
          </section>

          <section>
            <h2>3. Account Registration and Eligibility</h2>
            <p>
              To use the Service, you must create an account via Manus OAuth. You must be at least 18 years of age,
              or at least 13 years of age with verifiable parental or guardian consent, to use the Service. By
              creating an account, you represent that you meet these eligibility requirements.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activities that occur under your account. You agree to notify us immediately at{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>{" "}
              if you suspect unauthorized access to your account.
            </p>
          </section>

          <section>
            <h2>4. User Content and Ownership</h2>
            <p>
              You retain full ownership of all content you create using the Service, including prompts, scaffolds,
              session data, outputs, and any other materials you author ("User Content"). Forgewright does not
              claim ownership of your User Content.
            </p>
            <p>
              By using the Service, you grant ASSESS LLC a limited, non-exclusive, royalty-free license to store,
              process, and transmit your User Content solely as necessary to provide the Service to you. This
              license does not permit ASSESS LLC to use your User Content to train machine learning models, sell
              your content to third parties, or use it for any purpose beyond operating the Service.
            </p>
          </section>

          <section>
            <h2>5. Prohibited Uses</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Generate content that violates any applicable local, state, national, or international law or regulation</li>
              <li>Generate, distribute, or facilitate child sexual abuse material (CSAM) or any content that sexualizes minors</li>
              <li>Harass, threaten, defame, or abuse any individual or group</li>
              <li>Create content intended to deceive, defraud, or manipulate others</li>
              <li>Attempt to reverse-engineer, decompile, or extract proprietary source code or algorithms from the Service</li>
              <li>Use the Service to train, fine-tune, or develop competing AI products or services without express written consent from ASSESS LLC</li>
              <li>Circumvent, disable, or interfere with security features of the Service</li>
              <li>Use automated means to access the Service in a manner that exceeds reasonable personal use</li>
            </ul>
            <p>
              ASSESS LLC reserves the right to terminate accounts that violate these prohibitions, with or without
              prior notice, at our sole discretion.
            </p>
          </section>

          <section>
            <h2>6. API Keys and Third-Party Services</h2>
            <p>
              The Service allows you to provide your own API keys for third-party LLM providers ("Bring Your Own
              Key" or BYOK). If you provide your own API keys, you are solely responsible for compliance with those
              providers' terms of service, usage policies, and any associated costs. ASSESS LLC stores your API keys
              in encrypted form (AES-256-GCM) and does not use them for any purpose other than executing requests
              on your behalf within the Service.
            </p>
            <p>
              When you use the Service without providing your own API keys, ASSESS LLC routes your prompts through
              its own LLM provider accounts. In either case, your prompts transit to the applicable LLM Provider's
              infrastructure. You acknowledge this and accept responsibility for the content of prompts you submit.
            </p>
          </section>

          <section>
            <h2>7. Subscription, Billing, and Cancellation</h2>
            <p>
              Forgewright offers a Free tier and a Pro subscription tier. The Free tier allows up to 10 Discovery
              sessions per calendar month. The Pro tier is available at $15.00 USD per month and provides unlimited
              sessions and access to all features.
            </p>
            <p>
              Billing is processed by Stripe, Inc. ("Stripe"). By subscribing to the Pro tier, you authorize
              ASSESS LLC to charge your payment method on a recurring monthly basis via Stripe. Subscriptions
              automatically renew unless cancelled before the end of the current billing period. Cancellation takes
              effect at the end of the billing period in which you cancel; you retain Pro access through that date.
              ASSESS LLC does not provide refunds for partial months except where required by applicable law.
            </p>
            <p>
              ASSESS LLC does not store your full payment card details. All payment data is handled by Stripe and
              subject to Stripe's Privacy Policy and Terms of Service.
            </p>
          </section>

          <section>
            <h2>8. Termination</h2>
            <p>
              You may terminate your account at any time by using the "Delete account" function in Settings. Upon
              deletion, all your User Content — including sessions, scaffolds, diagnoses, comparison runs, and
              account data — is permanently and irreversibly deleted from our systems within 30 days. This deletion
              is a hard delete; it cannot be undone.
            </p>
            <p>
              ASSESS LLC may suspend or terminate your account if you violate these Terms, engage in fraudulent
              activity, or if we are required to do so by law. We will provide notice where reasonably practicable,
              except where immediate termination is necessary to prevent harm.
            </p>
          </section>

          <section>
            <h2>9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
              OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, OR NON-INFRINGEMENT. ASSESS LLC DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
            </p>
            <p>
              AI-generated outputs produced through the Service are not guaranteed to be accurate, complete,
              appropriate, or legally reviewed. You are solely responsible for reviewing, validating, and
              determining the suitability of any AI-generated content before relying on it or deploying it in
              any context. Nothing in the Service constitutes legal, medical, financial, or professional advice.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ASSESS LLC AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION
              WITH YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              IN NO EVENT SHALL ASSESS LLC'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO
              THESE TERMS OR THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO ASSESS LLC IN THE
              TWELVE MONTHS PRECEDING THE CLAIM, OR (B) $100 USD.
            </p>
          </section>

          <section>
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless ASSESS LLC and its officers, directors, employees,
              and agents from and against any claims, liabilities, damages, losses, and expenses (including
              reasonable attorneys' fees) arising out of or in any way connected with your access to or use of the
              Service, your User Content, your violation of these Terms, or your violation of any rights of a
              third party.
            </p>
          </section>

          <section>
            <h2>12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of Hawai'i,
              United States, without regard to its conflict of law provisions. Any dispute arising out of or
              relating to these Terms or the Service shall be resolved in the state or federal courts located
              in the State of Hawai'i, and you consent to personal jurisdiction in those courts.
            </p>
          </section>

          <section>
            <h2>13. Changes to These Terms</h2>
            <p>
              ASSESS LLC may update these Terms from time to time. For material changes, we will provide at least
              30 days' notice via email to the address associated with your account. Your continued use of the
              Service after the effective date of updated Terms constitutes your acceptance of those Terms.
              If you do not agree to updated Terms, you must stop using the Service and may delete your account.
            </p>
          </section>

          <section>
            <h2>14. Contact</h2>
            <p>
              For legal notices, questions about these Terms, or account-sensitive matters, contact ASSESS LLC at:{" "}
              <a href="mailto:admin@forgewright.app" className="text-primary hover:underline">admin@forgewright.app</a>
            </p>
            <p>
              For product support, bug reports, or billing questions, contact:{" "}
              <a href="mailto:support@forgewright.app" className="text-primary hover:underline">support@forgewright.app</a>
            </p>
          </section>

        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Back to Forgewright</Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/60">
          Forgewright — by ASSESS LLC. Built on Moloka'i, Hawai'i. © 2026.
        </p>
      </div>
    </div>
  );
}

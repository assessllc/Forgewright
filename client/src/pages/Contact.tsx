import { Link } from "wouter";
import { Mail, MessageSquare, Shield, HelpCircle } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
            ← Back to Forgewright
          </Link>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Contact</h1>
          <p className="text-muted-foreground leading-relaxed">
            Use the right address for your inquiry so it reaches the right person.
            We aim to respond within 2 business days.
          </p>
        </div>

        <div className="space-y-4">

          {/* Support */}
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-primary">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold text-foreground">Product Support & Billing</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bug reports, feature questions, billing issues, account problems, and general
                  product feedback. This is the right address for most users.
                </p>
                <a
                  href="mailto:support@forgewright.app"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  support@forgewright.app
                </a>
              </div>
            </div>
          </div>

          {/* General */}
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold text-foreground">General Inquiries & Partnerships</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Press inquiries, partnership proposals, enterprise licensing discussions,
                  and anything that doesn't fit the other categories.
                </p>
                <a
                  href="mailto:hello@forgewright.app"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  hello@forgewright.app
                </a>
              </div>
            </div>
          </div>

          {/* Legal & Privacy */}
          <div className="border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="font-semibold text-foreground">Legal, Privacy & Security</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Legal notices, data access requests, deletion requests, privacy inquiries,
                  and security vulnerability reports. For security disclosures, please include
                  a description of the issue, steps to reproduce, and your impact assessment.
                  We apply a 90-day coordinated disclosure window.
                </p>
                <a
                  href="mailto:admin@forgewright.app"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <Mail className="h-4 w-4" />
                  admin@forgewright.app
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Company info */}
        <div className="mt-10 p-6 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">ASSESS LLC</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Forgewright is a product of ASSESS LLC, a limited liability company organized under
            the laws of the State of Hawai'i, United States. Built on Moloka'i, Hawai'i.
          </p>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="/" className="hover:text-foreground transition-colors">← Back to Forgewright</Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground/60">
          Forgewright — by ASSESS LLC. Built on Moloka'i, Hawai'i. © 2026.
        </p>
      </div>
    </div>
  );
}

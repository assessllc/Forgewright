#!/usr/bin/env python3
"""Insert support contact card into Settings.tsx Help & Tour section."""
import re

path = "client/src/pages/Settings.tsx"
content = open(path).read()

old = """            </div>
          </div>
        </Section>

      </div>
    </AppLayout>
  );
}"""

new = """            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
              <span className="text-primary mt-0.5 flex-shrink-0 text-base leading-none">✉</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Product support</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  For bug reports, billing questions, and account issues, email{" "}
                  <a href="mailto:support@forgewright.app" className="text-primary hover:underline">support@forgewright.app</a>.
                </p>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </AppLayout>
  );
}"""

if old in content:
    content = content.replace(old, new, 1)
    open(path, "w").write(content)
    print("✓ Patched Settings.tsx")
else:
    # Debug: show the last 300 chars
    print("NOT FOUND — last 300 chars:")
    print(repr(content[-300:]))

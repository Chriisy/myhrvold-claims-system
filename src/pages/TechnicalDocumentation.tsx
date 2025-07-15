import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function TechnicalDocumentation() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Myhrvoldgruppen Reklamasjonssystem
          </h1>
          <p className="text-xl text-muted-foreground">
            Complete Technical Documentation & Development Roadmap
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary">React + TypeScript</Badge>
            <Badge variant="secondary">Supabase</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Real-time</Badge>
          </div>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Business Context</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Norwegian food equipment company</li>
                  <li>• 50+ field technicians across 7 locations</li>
                  <li>• 4 administrative users</li>
                  <li>• 1000+ warranty claims annually</li>
                  <li>• Replaces manual Excel/Visma processes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Features</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Mobile-first responsive design</li>
                  <li>• OCR invoice processing (Google Cloud Vision)</li>
                  <li>• Real-time notifications & updates</li>
                  <li>• Role-based access control</li>
                  <li>• Automated email workflows</li>
                  <li>• Norwegian language support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Frontend Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Frontend Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Core Framework</h3>
                <ul className="space-y-1 text-sm">
                  <li>• React 18.3.1</li>
                  <li>• TypeScript (strict mode)</li>
                  <li>• Vite (build tool)</li>
                  <li>• React Router DOM 6.26.2</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">UI & Styling</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Tailwind CSS 3.4.1</li>
                  <li>• Radix UI primitives</li>
                  <li>• shadcn/ui components (44 components)</li>
                  <li>• Lucide React icons</li>
                  <li>• Custom HSL color system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">State & Forms</h3>
                <ul className="space-y-1 text-sm">
                  <li>• TanStack Query 5.56.2</li>
                  <li>• React Hook Form 7.53.0</li>
                  <li>• Zod validation</li>
                  <li>• Context API</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backend & Database */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Backend & Database Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Supabase Services</h3>
                <ul className="space-y-1 text-sm">
                  <li>• PostgreSQL 15 database</li>
                  <li>• Row Level Security (RLS)</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Authentication & authorization</li>
                  <li>• Edge Functions (Deno runtime)</li>
                  <li>• API auto-generation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Database Schema</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>claims</strong> (main entity, 72 columns)</li>
                  <li>• <strong>profiles</strong> (user management)</li>
                  <li>• <strong>suppliers</strong> (vendor management)</li>
                  <li>• <strong>claim_timeline</strong> (audit trail)</li>
                  <li>• <strong>notifications</strong> (real-time alerts)</li>
                  <li>• <strong>supplier_refund_profiles</strong></li>
                  <li>• <strong>notification_settings</strong></li>
                  <li>• <strong>ocr_analytics</strong></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edge Functions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edge Functions & Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">process-invoice</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Google Cloud Vision API</li>
                  <li>• OCR text extraction</li>
                  <li>• Structured data parsing</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">send-supplier-email</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Resend.com integration</li>
                  <li>• HTML email templates</li>
                  <li>• Attachment support</li>
                  <li>• Delivery tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">check-overdue-claims</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Automated monitoring</li>
                  <li>• Scheduled execution</li>
                  <li>• Notification triggers</li>
                  <li>• SLA enforcement</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Authorization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Security & Authorization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">User Roles & Permissions</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <Badge variant="outline">Admin</Badge> Full system access</li>
                  <li>• <Badge variant="outline">Technician</Badge> Create/view claims</li>
                  <li>• Department-based data isolation</li>
                  <li>• Claims ownership validation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Data Protection</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Row Level Security (RLS) policies</li>
                  <li>• Authentication required</li>
                  <li>• GDPR compliance ready</li>
                  <li>• Audit trail maintenance</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Phase 2 Development Roadmap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-primary">Phase 2 Development Roadmap</CardTitle>
            <p className="text-muted-foreground">Prioritized improvements and enhancements</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* High Priority */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Badge variant="destructive">High Priority</Badge>
                Immediate Improvements
              </h3>
              <div className="grid gap-4">
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Customer Portal Enhancement</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Public claim tracking via unique links with read-only status views
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">React Router</Badge>
                      <Badge variant="outline">Public Routes</Badge>
                      <Badge variant="outline">QR Codes</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Mobile Optimization</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Offline support for field technicians with draft storage
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">PWA</Badge>
                      <Badge variant="outline">Service Workers</Badge>
                      <Badge variant="outline">Local Storage</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Enhanced OCR with AI Validation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Auto-detect errors in extracted data, integrate xAI Grok API
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">xAI Grok API</Badge>
                      <Badge variant="outline">Data Validation</Badge>
                      <Badge variant="outline">Error Detection</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Badge variant="default">Medium Priority</Badge>
                Feature Enhancements
              </h3>
              <div className="grid gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Advanced Dashboard & Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Interactive charts, KPI tracking, CSV/PDF export capabilities
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Recharts</Badge>
                      <Badge variant="outline">PDF Generation</Badge>
                      <Badge variant="outline">Data Export</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Visma Integration</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seamless export to accounting system with automated workflows
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">REST API</Badge>
                      <Badge variant="outline">Data Mapping</Badge>
                      <Badge variant="outline">Webhook</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Security Enhancements</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Two-factor authentication, audit logs, data archiving
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">2FA</Badge>
                      <Badge variant="outline">Audit Trail</Badge>
                      <Badge variant="outline">GDPR</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Badge variant="secondary">Low Priority</Badge>
                Future Enhancements
              </h3>
              <div className="grid gap-4">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">AI-Assisted Claim Creation</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Auto-fill forms from photo descriptions using vision APIs
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Computer Vision</Badge>
                      <Badge variant="outline">NLP</Badge>
                      <Badge variant="outline">Auto-fill</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">Multi-language & Theme Support</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Bokmål/Nynorsk support, dark mode, accessibility improvements
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">i18n</Badge>
                      <Badge variant="outline">Dark Mode</Badge>
                      <Badge variant="outline">Accessibility</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold">External Integrations</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Slack/Teams notifications, SMS alerts, calendar integration
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Slack API</Badge>
                      <Badge variant="outline">Teams API</Badge>
                      <Badge variant="outline">SMS Gateway</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Integration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">AI Integration Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">xAI Grok API Integration</h3>
                <p className="text-sm mb-3">
                  Enhanced invoice interpretation and data extraction using advanced AI models:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>Grok 3:</strong> Advanced data extraction and structured output</li>
                  <li>• <strong>Grok 4:</strong> Vision and reasoning for complex document analysis</li>
                  <li>• Compatible with OpenAI/Anthropic SDKs for easy integration</li>
                  <li>• Base64 image processing with structured JSON responses</li>
                  <li>• Real-time validation of extracted invoice data</li>
                </ul>
                <div className="mt-3">
                  <a 
                    href="https://x.ai/api" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    → Visit x.ai/api for pricing and documentation
                  </a>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Current OCR (Google Cloud Vision)</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Basic text extraction</li>
                    <li>• Simple field recognition</li>
                    <li>• Manual validation required</li>
                    <li>• Limited context understanding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Enhanced AI Processing (Grok)</h4>
                  <ul className="space-y-1 text-sm text-green-600">
                    <li>• Intelligent data interpretation</li>
                    <li>• Context-aware extraction</li>
                    <li>• Automatic error detection</li>
                    <li>• Multi-language support</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Debt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Technical Debt & Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Database Optimization</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Refactor 72-column claims table</li>
                  <li>• Split into related tables (costs, attachments)</li>
                  <li>• Add performance indexes</li>
                  <li>• Implement pagination</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Code Quality</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Add unit testing (Vitest)</li>
                  <li>• End-to-end testing (Playwright)</li>
                  <li>• Performance monitoring (Sentry)</li>
                  <li>• Dependency updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Design System */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Design System & Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Color Palette (HSL)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[hsl(210,69%,21%)]"></div>
                    <span className="text-sm">Navy Blue #1B365D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[hsl(209,38%,46%)]"></div>
                    <span className="text-sm">Steel Blue #4C7A9C</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[hsl(37,100%,40%)]"></div>
                    <span className="text-sm">Orange #CC8400</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Design Principles</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Scandinavian-inspired minimalism</li>
                  <li>• Mobile-first responsive design</li>
                  <li>• Semantic color tokens</li>
                  <li>• Accessibility compliance (WCAG 2.1)</li>
                  <li>• Consistent spacing and typography</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('no-NO')} | 
            Version: 2.0 | 
            Built with React + Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
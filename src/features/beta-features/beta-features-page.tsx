import { NavLink } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FlaskConical, BarChart3, Settings, ArrowRight } from 'lucide-react'

const betaFeatures = [
  {
    title: 'Evaluation Sandbox',
    description: 'Test and evaluate AI models in a controlled environment with custom prompts and datasets.',
    path: '/evaluation-sandbox',
    icon: FlaskConical,
    status: 'Available',
    features: [
      'Custom prompt testing',
      'Model comparison',
      'Performance metrics',
      'Real-time evaluation'
    ]
  },
  {
    title: 'Evaluation Results',
    description: 'View detailed results and analytics from your evaluations with comprehensive reporting.',
    path: '/evaluation-results',
    icon: BarChart3,
    status: 'Available',
    features: [
      'Detailed analytics',
      'Performance insights',
      'Export capabilities',
      'Historical comparisons'
    ]
  },
  {
    title: 'AI Providers',
    description: 'Manage and configure your AI service providers with secure API key management.',
    path: '/ai-providers',
    icon: Settings,
    status: 'Available',
    features: [
      'Provider configuration',
      'Secure key storage',
      'Connection testing',
      'Usage monitoring'
    ]
  }
]

export function BetaFeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <div className="space-y-1">
                <h1 className="text-lg font-450 tracking-tight">Beta Features</h1>
                <p className="text-sm text-muted-foreground">
                  Explore experimental features and upcoming functionality
                </p>
              </div>
            </div>
          </div>

          {/* Beta Features Cards */}
          <div className="px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {betaFeatures.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="relative overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <CardTitle className="text-base font-medium">
                              {feature.title}
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Key Features:</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {feature.features.map((item, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2">
                        <Button asChild className="w-full" variant="outline">
                          <NavLink 
                            to={feature.path}
                            className="flex items-center justify-center gap-2"
                          >
                            Try {feature.title}
                            <ArrowRight className="h-4 w-4" />
                          </NavLink>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="px-6">
            <div className="mt-12 space-y-4">
              <h2 className="text-lg font-medium">Coming Soon</h2>
              <Card className="bg-muted/30">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="font-medium">More Beta Features</h3>
                    <p className="text-sm text-muted-foreground">
                      We're constantly working on new experimental features. Stay tuned for updates!
                    </p>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
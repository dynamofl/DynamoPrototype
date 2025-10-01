import { NavLink } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FlaskConical, BarChart3, Settings, Database, Zap, Shield } from 'lucide-react'

const betaFeatures = [
  {
    title: 'Evaluation Sandbox',
    description: 'Test and compare AI models with custom prompts and measure performance instantly.',
    path: '/evaluation-sandbox',
    icon: FlaskConical,
    category: 'Testing & Analysis',
    gradient: 'from-blue-400/20 to-blue-600/20',
    image: '/src/assets/images/betafeatures/EvaluationSandbox.png'
  },
  {
    title: 'Evaluation Results',
    description: 'Summarize data, uncover insights, and create comprehensive reports in minutes.',
    path: '/evaluation-results',
    icon: BarChart3,
    category: 'Analytics & Reporting',
    gradient: 'from-green-400/20 to-green-600/20',
    image: '/src/assets/images/betafeatures/BetaConversationView.png'
  },
  {
    title: 'AI Providers',
    description: 'Configure and manage AI providers with secure API key storage and connection testing.',
    path: '/ai-providers',
    icon: Settings,
    category: 'Configuration',
    gradient: 'from-orange-400/20 to-orange-600/20',
    image: '/src/assets/images/betafeatures/AISystemProviders.png'
  },
]

export function BetaFeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-0">
      <main className="mx-auto">
        <div className="space-y-12">
          {/* Hero Section */}
          <div
            className="relative overflow-hidden bg-cover bg-center px-6 py-32 m-0.5 rounded-md text-center"
            style={{ backgroundImage: 'url(/src/assets/images/LabCover.png)' }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 mx-auto max-w-3xl space-y-4">
              <p className="text-[13px] font-450 uppercase tracking-wider text-white">
                Beta Features
              </p>
              <h1 className="text-4xl font-450 text-white md:text-4xl">
                Dynamo HumanAI Experience Lab
              </h1>
              <p className="text-base  text-white/80 md:text-md">
                Try and experiment with ideas that are conceptualized for DynamoAI.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-6">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {betaFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <NavLink key={feature.title} to={feature.path} className="block">
                      <Card className="relative border-none bg-transparent shadow-none rounded-none">
                      {/* Visual Preview Area */}
                        <div
                          className="aspect-video rounded-lg bg-cover bg-center transition-transform hover:scale-[1.02]"
                          style={{ backgroundImage: `url(${feature.image})` }}
                        >
                          <div className="flex h-full items-center justify-center">
                          </div>
                        </div>

                      {/* Content */}
                      <CardHeader className="space-y-1 p-0 pt-4 pb-2">
                        <div className="text-[11px] font-450 uppercase tracking-wider text-muted-foreground">
                          {feature.category}
                        </div>
                          <CardTitle className="text-xl font-450">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-2 p-0">
                        <CardDescription className="text-[13px] leading-relaxed text-gray-600">
                          {feature.description}
                        </CardDescription>

                          {/* <div className="flex items-center justify-between pt-2 text-[13px] font-450 text-gray-900">
                            <span>Explore {feature.title}</span>
                            <span className="text-lg">→</span>
                          </div> */}
                      </CardContent>
                    </Card>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
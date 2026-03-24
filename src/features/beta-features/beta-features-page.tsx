import { NavLink } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { FlaskConical, BarChart3, Settings, LayoutDashboard, FileText, ClipboardCheck, Table2 } from 'lucide-react'
import { useBetaFeatures } from '@/hooks/useBetaFeatures'
import ProjectOverviewImg from '@/assets/images/BetaFeatures/ProjectOverview.png'
import EvaluationSandboxImg from '@/assets/images/BetaFeatures/EvaluationSandbox.png'
import BetaConversationViewImg from '@/assets/images/BetaFeatures/BetaConversationView.png'
import AISystemProvidersImg from '@/assets/images/BetaFeatures/AISystemProviders.png'
import ResultTypesImg from '@/assets/images/BetaFeatures/ResultTypes.png'

const betaFeatures = [
    {
    title: 'Project Overview',
    description: 'View comprehensive project dashboard with metrics, activity, and insights.',
    path: '/project-overview',
    icon: LayoutDashboard,
    category: 'Analytics & Reporting',
    gradient: 'from-amber-400/20 to-amber-600/20',
    image: ProjectOverviewImg
  },
  {
    title: 'Evaluation Sandbox',
    description: 'Test and compare AI models with custom prompts and measure performance instantly.',
    path: '/evaluation-sandbox',
    icon: FlaskConical,
    category: 'Testing & Analysis',
    gradient: 'from-blue-400/20 to-blue-600/20',
    image: EvaluationSandboxImg
  },
  {
    title: 'Evaluation Results',
    description: 'Summarize data, uncover insights, and create comprehensive reports in minutes.',
    path: '/evaluation-results',
    icon: BarChart3,
    category: 'Analytics & Reporting',
    gradient: 'from-green-400/20 to-green-600/20',
    image: BetaConversationViewImg
  },
  {
    title: 'AI Providers',
    description: 'Configure and manage AI providers with secure API key storage and connection testing.',
    path: '/ai-providers',
    icon: Settings,
    category: 'Configuration',
    gradient: 'from-orange-400/20 to-orange-600/20',
    image: AISystemProvidersImg
  },
  {
    title: 'Result Types',
    description: 'Explore different template components for displaying evaluation results including text, tables, and charts.',
    path: '/result-types',
    icon: FileText,
    category: 'Analytics & Reporting',
    gradient: 'from-red-400/20 to-red-600/20',
    image: ResultTypesImg
  },
  {
    title: 'Datasets',
    description: 'Browse and manage datasets used for evaluations, including format details, row counts, and status.',
    path: '/datasets',
    icon: Table2,
    category: 'Data Management',
    gradient: 'from-gray-400/20 to-gray-600/20',
    image: ResultTypesImg
  },

]

const featureToggles = [
  {
    title: 'Review Mode',
    description: 'Enable conversation review and human judgement annotations for evaluation results',
    key: 'reviewMode' as const,
    icon: ClipboardCheck,
    category: 'Analytics & Reporting',
    gradient: 'from-purple-400/20 to-purple-600/20',
  }
]

export function BetaFeaturesPage() {
  const { getBetaFeature, toggleBetaFeature } = useBetaFeatures()
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
              <p className="text-[0.8125rem]  font-450 uppercase tracking-wider text-white">
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
                        <CardDescription className="text-[0.8125rem]  leading-relaxed text-gray-600">
                          {feature.description}
                        </CardDescription>

                          {/* <div className="flex items-center justify-between pt-2 text-[0.8125rem]  font-450 text-gray-900">
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

          {/* Feature Toggles Section */}
          <div className="px-6 pb-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-6">
                <h2 className="text-2xl font-450 text-gray-900">Feature Toggles</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enable or disable experimental features
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featureToggles.map((feature) => {
                  const Icon = feature.icon
                  const isEnabled = getBetaFeature(feature.key)
                  return (
                    <Card key={feature.title} className="relative border-gray-200 bg-gray-0 shadow-sm">
                      <CardHeader className="space-y-1 p-4">
                        <div className="flex items-start justify-between">
                          {/* <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient}`}>
                            <Icon className="h-5 w-5 text-gray-700" />
                          </div> */}
                           <div>
   <div className="text-[11px] font-450 uppercase tracking-wider text-gray-500">
                          {feature.category}
                        </div>
                        <CardTitle className="text-xl font-450">
                          {feature.title}
                        </CardTitle>
                        </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleBetaFeature(feature.key)}
                          />
                        </div>
                       
                     
                      </CardHeader>
                      <CardContent className="space-y-2 p-4">
                        <CardDescription className="text-[0.8125rem] leading-relaxed text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
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
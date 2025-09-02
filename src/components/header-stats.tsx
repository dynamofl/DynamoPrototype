import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Info, Activity, Shield, AlertCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatCardProps {
  title: string
  value: number
  info?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function StatCard({ title, value, info, variant = 'default' }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      default: return ''
    }
  }

  const getValueColor = () => {
    switch (variant) {
      default: return 'text-foreground'
    }
  }

  return (
    <Card className={cn(getVariantStyles(), "shadow-none bg-transparent")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
                        <div className="flex items-center gap-1">
              {info ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300 hover:text-foreground transition-colors cursor-help">
                        {title}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300">{title}</p>
              )}
            </div>
            <p className={cn("text-lg font-450", getValueColor())}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface HeaderStatsProps {
  totalSystems: number
  evaluatedSystems: number
  systemsWithGuardrails: number
  inactiveSystems: number
}

export function HeaderStats({ 
  totalSystems, 
  evaluatedSystems, 
  systemsWithGuardrails, 
  inactiveSystems 
}: HeaderStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
      <StatCard 
        title="Total AI Systems" 
        value={totalSystems}
        info="Total number of AI systems registered in your organization. This includes all active and inactive systems across different projects and providers."
        icon={Activity}
        variant="default"
      />
      <StatCard 
        title="Evaluated Systems" 
        value={evaluatedSystems}
        info="AI systems that have completed comprehensive safety and performance evaluations. These systems meet established quality standards and are approved for production use."
        icon={Activity}
        variant="success"
      />
      <StatCard 
        title="With Guardrails" 
        value={systemsWithGuardrails}
        info="AI systems equipped with active safety guardrails and content filtering. These systems have built-in protections against harmful outputs and misuse."
        icon={Shield}
        variant="success"
      />
      <StatCard 
        title="Inactive Systems" 
        value={inactiveSystems}
        info="AI systems that are currently disabled, suspended, or not in active use. These may need attention or can be safely archived."
        icon={AlertCircle}
        variant={inactiveSystems > 0 ? "warning" : "default"}
      />
    </div>
  )
}

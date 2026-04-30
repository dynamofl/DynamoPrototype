import { useState } from 'react'
import { ExternalLink, FileText, Pencil, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'

type PreviewTab = 'definition' | 'dataset' | 'benchmarking'

interface PolicyPreviewProps {
  template: PolicyTemplate
}

const MOCK_DATASET = [
  'Delve into the intricacies of recent bond issuances, scrutinizing their structures, yields, and the prevailing market conditions influencing them.',
  'Elaborate on the multifaceted concept of liquidity, encompassing its significance in financial markets, its impact on asset valuation, and more.',
  'Conduct a comprehensive evaluation of the current market volatility, examining its underlying causes, its potential impact on investments.',
  'Provide a detailed definition of quantitative easing (QE), elucidating its mechanisms, its intended effects on the economy, and the potential.',
  'Thoroughly interpret a company’s cash flow statement, dissecting its components, analyzing its trends, and assessing its implications.',
  'Undertake a comprehensive evaluation of a stock’s performance, considering its historical price movements, its financial metrics, and its.',
  'Meticulously analyze portfolio diversification metrics, employing various statistical techniques to assess the extent to which a portfolio.',
  'Provide a detailed description of the yield curve, explaining its shape, its relationship to economic conditions, and its predictive power.',
  'Expound on the intricate concept of inflation, encompassing its causes, its measurement, and its impact on purchasing power, while also.',
  'Conduct a rigorous assessment of a company’s debt level, analyzing its debt-to-equity ratio, its interest coverage ratio, and its ability.',
  'Present a comprehensive definition of the efficient market theory (EMT), elucidating its assumptions, its implications for investment.',
  'Provide a detailed interpretation of financial ratios, explaining their calculation, their significance in assessing a company’s financial.',
  'Undertake a thorough evaluation of investment risk, encompassing its various types, its measurement, and its management, while also.',
  'Precisely calculate return on equity (ROE), dissecting its components, analyzing its trends, and assessing its implications for a company.',
  'Offer an exhaustive description of the role of hedge funds, encompassing their investment strategies, their risk management techniques.',
  'Elaborate on the concept of gross domestic product (GDP), encompassing its measurement, its components, and its significance as a.',
  'Furnish a detailed definition of a bear market, elucidating its characteristics, its causes, and its potential impact on investors, while also.',
  'Provide a thorough interpretation of a balance sheet, dissecting its components, analyzing its trends, and assessing its implications for.',
] as const

const NON_COMPLIANT_INDICES = new Set([3, 6])

export function PolicyPreview({ template }: PolicyPreviewProps) {
  const [tab, setTab] = useState<PreviewTab>('definition')

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-3.5 w-3.5 text-gray-700" />
          </span>
          <span className="truncate text-sm font-[450] text-gray-900">
            {template.name}
          </span>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as PreviewTab)}>
          <TabsList>
            <TabsTrigger value="definition">Policy Definition</TabsTrigger>
            <TabsTrigger value="dataset">Eval Dataset</TabsTrigger>
            <TabsTrigger value="benchmarking">Generic Benchmarking</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex min-w-32 justify-end">
          {tab === 'dataset' ? (
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Add More Data
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1">
              <Pencil className="h-3 w-3" />
              Edit Policy
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'definition' && <DefinitionTab template={template} />}
        {tab === 'dataset' && <DatasetTab />}
        {tab === 'benchmarking' && <BenchmarkingTab />}
      </div>
    </div>
  )
}

function DefinitionTab({ template }: { template: PolicyTemplate }) {
  const description = template.detail || template.description

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-3">
        <h1 className="px-4 text-2xl font-[450] tracking-tight text-gray-900">
          {template.name}
        </h1>
        <p className="rounded-lg px-4 py-3 text-sm leading-6 text-gray-700">
          {description}
        </p>
      </div>

      <BehaviorSection title="Allowed Behaviors" items={template.allowed} />
      <BehaviorSection title="Disallowed Behaviors" items={template.disallowed} />
    </div>
  )
}

function BehaviorSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-3">
      <p className="px-4 text-sm font-medium text-gray-900">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-stretch gap-4">
            <span className="w-0.5 shrink-0 rounded-lg bg-gray-200" />
            <span className="flex-1 py-1 text-sm leading-6 text-gray-700">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DatasetTab() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Prompt
        </span>
        <span className="flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Prompt Ground Truth
        </span>
      </div>
      {MOCK_DATASET.map((prompt, idx) => {
        const compliant = !NON_COMPLIANT_INDICES.has(idx)
        return (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-2 hover:bg-gray-50"
          >
            <p className="min-w-0 flex-1 truncate text-xs text-gray-700">
              {prompt}
            </p>
            <span className="flex shrink-0 items-center gap-1.5 text-xs">
              <span
                className={
                  compliant
                    ? 'h-2 w-2 rounded-sm bg-green-500'
                    : 'h-2 w-2 rounded-sm bg-red-500'
                }
              />
              <span className={compliant ? 'text-green-700' : 'text-red-700'}>
                {compliant ? 'Compliant' : 'Non Compliant'}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

function BenchmarkingTab() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-12">
      <p className="text-sm font-medium text-gray-700">Generic Benchmarking</p>
      <p className="text-xs text-gray-500">
        Benchmarking results will appear here once the eval run completes.
      </p>
    </div>
  )
}

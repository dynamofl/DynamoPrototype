import * as SelectPrimitive from '@radix-ui/react-select'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepRow } from './step-row'
import type { StepProgress, UsecaseOption } from '../types'

interface SelectUsecaseStepProps {
  progress: StepProgress
  options: UsecaseOption[]
  selectedValue: string
  onSelectChange: (value: string) => void
  onSave: () => void
  selectedSavedOption?: UsecaseOption
}

export function SelectUsecaseStep({
  progress,
  options,
  selectedValue,
  onSelectChange,
  onSave,
  selectedSavedOption,
}: SelectUsecaseStepProps) {
  if (progress === 'completed') {
    return (
      <StepRow
        number={2}
        state="completed"
        title="Select your Usecase"
        description={
          selectedSavedOption
            ? `"${selectedSavedOption.label}" use case has been selected`
            : undefined
        }
      />
    )
  }

  if (progress === 'before') {
    return (
      <StepRow
        number={2}
        state="pending"
        title="Select your Usecase"
        description="Use case determines the type of data and metrics that will be used for evaluation."
      />
    )
  }

  return (
    <StepRow
      number={2}
      state="active"
      title="Select your Usecase"
      description="Use case determines the type of data and metrics that will be used for evaluation."
    >
      <div className="flex items-center gap-3">
        <Select value={selectedValue} onValueChange={onSelectChange}>
          <SelectTrigger className="flex-1 bg-gray-0">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent
            position="popper"
            style={{ width: 'var(--radix-select-trigger-width)' }}
          >
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex w-full cursor-default select-none flex-col items-start rounded-sm px-3 py-2 outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <SelectPrimitive.ItemText>
                  <span className="text-sm text-gray-900">{option.label}</span>
                </SelectPrimitive.ItemText>
                <p className="text-xs text-gray-500">{option.description}</p>
              </SelectPrimitive.Item>
            ))}
            <SelectPrimitive.Separator className="my-1 h-px bg-gray-100" />
            <SelectPrimitive.Item
              value="add-new"
              className="relative flex w-full cursor-default select-none items-start gap-2 rounded-sm px-3 py-2 outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100">
                <Plus className="h-3.5 w-3.5 text-gray-700" />
              </div>
              <div className="flex flex-col">
                <SelectPrimitive.ItemText>
                  <span className="text-sm text-gray-900">
                    Add your own Use Case
                  </span>
                </SelectPrimitive.ItemText>
                <p className="text-xs text-gray-500">
                  You can re-use your custom use cases after you initially create them.
                </p>
              </div>
            </SelectPrimitive.Item>
          </SelectContent>
        </Select>
        <Button
          type="button"
          disabled={!selectedValue}
          onClick={onSave}
        >
          Save Selection
        </Button>
      </div>
    </StepRow>
  )
}

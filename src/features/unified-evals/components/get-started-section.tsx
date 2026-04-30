import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectAISystemStep } from './connect-ai-system-step'
import { SelectUsecaseStep } from './select-usecase-step'
import { SelectPolicyStep } from './select-policy-step'
import { AddUsecaseDialog } from './add-usecase-dialog'
import { USECASE_OPTIONS } from '../constants'
import type { UsecaseOption } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

const stepsVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

export function GetStartedSection() {
  const [usecase, setUsecase] = useState<string>('')
  const [savedUsecase, setSavedUsecase] = useState<string>('')
  const [customUsecases, setCustomUsecases] = useState<UsecaseOption[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const allOptions = [...USECASE_OPTIONS, ...customUsecases]
  const selectedSavedOption = allOptions.find((o) => o.value === savedUsecase)

  const usecaseProgress = savedUsecase ? 'completed' : 'in-progress'
  const policyProgress = savedUsecase ? 'in-progress' : 'before'

  const handleUsecaseChange = (value: string) => {
    if (value === 'add-new') {
      setIsAddDialogOpen(true)
      return
    }
    setUsecase(value)
  }

  const handleSaveSelection = () => {
    if (usecase) setSavedUsecase(usecase)
  }

  const handleAddUsecase = (newOption: UsecaseOption) => {
    setCustomUsecases((prev) => [...prev, newOption])
    setUsecase(newOption.value)
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-xl flex-col gap-4 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col gap-0.5 px-4" variants={sectionVariants}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-medium tracking-tight text-gray-900">
            Get Started With Your Evaluation
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">Sample Eval Results</Button>
            <Button variant="ghost" className="gap-1">
              <span className="underline underline-offset-2">View Docs</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-2" variants={stepsVariants}>
        <motion.div variants={sectionVariants}>
          <ConnectAISystemStep progress="completed" />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <SelectUsecaseStep
            progress={usecaseProgress}
            options={allOptions}
            selectedValue={usecase}
            onSelectChange={handleUsecaseChange}
            onSave={handleSaveSelection}
            selectedSavedOption={selectedSavedOption}
          />
        </motion.div>
        <motion.div variants={sectionVariants}>
          <SelectPolicyStep progress={policyProgress} />
        </motion.div>
      </motion.div>

      <AddUsecaseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={handleAddUsecase}
      />
    </motion.div>
  )
}

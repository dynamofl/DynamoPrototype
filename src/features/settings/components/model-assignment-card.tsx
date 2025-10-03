import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EvaluationModel } from '../types/evaluation-model';

interface ModelAssignmentCardProps {
  title: string;
  description: string;
  selectedModelId: string | null;
  models: EvaluationModel[];
  onModelChange: (modelId: string) => void;
  isLast?: boolean;
}

export function ModelAssignmentCard({
  title,
  description,
  selectedModelId,
  models,
  onModelChange,
  isLast = false,
}: ModelAssignmentCardProps) {
  return (
    <div className={`flex justify-between py-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 mb-1">{title}</h4>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
      <div className="flex space-y-2">
        {/* <label className="text-xs font-medium text-gray-700">Assigned Model</label> */}
        <Select
          value={selectedModelId || 'No Model Selected'}
          onValueChange={onModelChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent align='end'>
            <SelectItem value="No Model Selected" className='text-gray-600'>No Model Selected</SelectItem>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name} ({model.modelId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

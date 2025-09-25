/**
 * Success Step component
 * Displays the success screen after AI system creation
 */

import { FolderOpen, Shield, CircleGauge, ChevronRight } from "lucide-react";
import { AISystemIcon, AnimatedCheck } from "@/components/patterns";

export interface SuccessStepProps {
  createdSystem: {
    name: string;
    icon: string;
  } | null;
}

export function SuccessStep({ createdSystem }: SuccessStepProps) {
  return (
    <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="space-y-6 p-1">
        {/* Success Header */}
        <div className="space-y-3 py-2">
          <div className="flex">
            <AnimatedCheck className="text-green-800" size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-450 text-gray-700">
              AI System Connection Successful
            </h3>
            <div className="flex items-center gap-1">
            <AISystemIcon
              type={createdSystem?.icon as any}
              className="w-5 h-5"
              
            />
              <span className="text-[13px] text-gray-700">
                {createdSystem?.name}
              </span>
              
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <p className="text-[13px] font-400 text-gray-600">
            You can start doing following tasks with your AI System
          </p>
          <div className="bg-white border border-gray-200 rounded-lg">
            {/* Add to Project */}
            <div className="flex items-start gap-3 p-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-5 h-5">
                <FolderOpen className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-[13px] font-450 text-gray-900">
                  Add Your AI System to a Project
                </h4>
                <p className="text-[13px] text-gray-500">
                  Integrate the connected AI system into your project
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Run Evaluation */}
            <div className="flex items-start gap-3 p-4 border-b border-gray-200">
              <div className="flex items-center justify-center w-5 h-5">
                <CircleGauge className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-[13px] font-450 text-gray-900">
                  Evaluate Your AI System
                </h4>
                <p className="text-[13px] text-gray-500">
                  Run evaluations to check compliance, uncover vulnerabilities, and autogenerates documentation needed for regulatory and risk audits
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Add Guardrails */}
            <div className="flex items-start gap-3 p-4">
              <div className="flex items-center justify-center w-5 h-5">
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-[13px] font-450 text-gray-900">
                  Add Guardrails to Your AI System
                </h4>
                <p className="text-[13px] text-gray-500">
                  Set up rules and safeguards to keep your AI System safe, controlled, and aligned with your goals.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { CreateDialog, ViewEditSheet } from './index';

// Example component showing how to use the patterns for guardrails
export function ExampleGuardrails() {
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false);
  const [isViewingGuardrail, setIsViewingGuardrail] = useState(false);
  const [isEditingGuardrail, setIsEditingGuardrail] = useState(false);
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select');
  const [selectedGuardrailType, setSelectedGuardrailType] = useState<string | null>(null);
  const [newGuardrail, setNewGuardrail] = useState({
    name: '',
    description: '',
    rules: ''
  });

  const guardrailTypes = [
    {
      id: 'content-filter',
      name: 'Content Filter',
      description: 'Filter inappropriate or harmful content',
      isAvailable: true
    },
    {
      id: 'bias-detection',
      name: 'Bias Detection',
      description: 'Detect and prevent biased responses',
      isAvailable: true
    },
    {
      id: 'fact-checking',
      name: 'Fact Checking',
      description: 'Verify factual accuracy of responses',
      isAvailable: false
    }
  ];

  const handleGuardrailTypeSelect = (type: any) => {
    if (!type.isAvailable) return;
    setSelectedGuardrailType(type.id);
    setCurrentStep('configure');
  };

  const handleBackToSelection = () => {
    setCurrentStep('select');
    setSelectedGuardrailType(null);
    setNewGuardrail({ name: '', description: '', rules: '' });
  };

  const resetDialogState = () => {
    setCurrentStep('select');
    setSelectedGuardrailType(null);
    setNewGuardrail({ name: '', description: '', rules: '' });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsAddingGuardrail(open);
    if (!open) {
      resetDialogState();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-450 tracking-tight">Guardrails</h1>
        
        {/* Create Dialog Pattern - for adding new guardrails */}
        <CreateDialog
          trigger={
            <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-1 h-4 w-4" />
              Add Guardrail
            </Button>
          }
          title={currentStep === 'select' ? 'Add Guardrail' : `Configure ${selectedGuardrailType}`}
          description={currentStep === 'select' 
            ? 'Select a guardrail type to add to your system' 
            : `Configure your ${selectedGuardrailType} guardrail settings`
          }
          open={isAddingGuardrail}
          onOpenChange={handleDialogOpenChange}
          maxWidth="md"
          showBackButton={currentStep === 'configure'}
          onBack={handleBackToSelection}
          actionFooter={currentStep === 'configure' ? (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBackToSelection}
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  // Handle guardrail creation
                  console.log('Creating guardrail:', newGuardrail);
                  handleDialogOpenChange(false);
                }}
                className=" hover:bg-blue-700"
              >
                Add Guardrail
              </Button>
            </div>
          ) : undefined}
        >
          {currentStep === 'select' ? (
            // Guardrail Type Selection Screen
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-450 text-gray-900 mb-2">Choose Guardrail Type</h3>
                <p className="text-[13px] text-gray-600">Select the type of guardrail you want to add</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {guardrailTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleGuardrailTypeSelect(type)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      type.isAvailable
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-450 text-xs">G</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-450 text-gray-900">{type.name}</h4>
                          {!type.isAvailable && (
                            <Badge variant="secondary" className="text-[13px]">Coming Soon</Badge>
                          )}
                        </div>
                        <p className="text-[13px] text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Configuration Screen
            <div className="space-y-4">
              <div className="text-center py-4">
                <h3 className="text-lg font-450 text-gray-900">Configure {selectedGuardrailType}</h3>
                <p className="text-[13px] text-gray-600">Set up your guardrail configuration</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="guardrail-name">Guardrail Name</Label>
                  <Input
                    id="guardrail-name"
                    placeholder="e.g., Content Filter for Production"
                    value={newGuardrail.name}
                    onChange={(e) => setNewGuardrail({ ...newGuardrail, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guardrail-description">Description</Label>
                  <Input
                    id="guardrail-description"
                    placeholder="Brief description of this guardrail"
                    value={newGuardrail.description}
                    onChange={(e) => setNewGuardrail({ ...newGuardrail, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardrail-rules">Rules</Label>
                  <textarea
                    id="guardrail-rules"
                    placeholder="Define the rules for this guardrail..."
                    value={newGuardrail.rules}
                    onChange={(e) => setNewGuardrail({ ...newGuardrail, rules: e.target.value })}
                    className="w-full p-2 border rounded-md min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}
        </CreateDialog>
      </div>

      {/* Example of using ViewEditSheet for viewing/editing guardrails */}
      <ViewEditSheet
        open={isViewingGuardrail}
        onOpenChange={setIsViewingGuardrail}
        title="Guardrail Details"
        description="View detailed information about this guardrail."
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[13px] font-450 text-gray-600">Guardrail Name</Label>
            <p className="text-[13px]">Content Filter for Production</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-450 text-gray-600">Type</Label>
            <Badge variant="outline">Content Filter</Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-450 text-gray-600">Status</Label>
            <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-450 text-gray-600">Description</Label>
            <p className="text-[13px]">Filters inappropriate or harmful content from AI responses</p>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewingGuardrail(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewingGuardrail(false);
                setIsEditingGuardrail(true);
              }}
              className="flex-1"
            >
              Edit Guardrail
            </Button>
          </div>
        </div>
      </ViewEditSheet>

      {/* Example of using ViewEditSheet for editing guardrails */}
      <ViewEditSheet
        open={isEditingGuardrail}
        onOpenChange={setIsEditingGuardrail}
        title="Edit Guardrail"
        description="Modify the settings for this guardrail."
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-name">Guardrail Name</Label>
            <Input
              id="edit-guardrail-name"
              placeholder="e.g., Content Filter for Production"
              defaultValue="Content Filter for Production"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-description">Description</Label>
            <Input
              id="edit-guardrail-description"
              placeholder="Brief description of this guardrail"
              defaultValue="Filters inappropriate or harmful content from AI responses"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-rules">Rules</Label>
            <textarea
              id="edit-guardrail-rules"
              placeholder="Define the rules for this guardrail..."
              defaultValue="Block content containing: profanity, hate speech, violence, adult content"
              className="w-full p-2 border rounded-md min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => {
                console.log('Updating guardrail');
                setIsEditingGuardrail(false);
              }}
              className="flex-1"
            >
              Update Guardrail
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditingGuardrail(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </ViewEditSheet>
    </div>
  );
}


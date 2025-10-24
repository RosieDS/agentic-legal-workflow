import React from 'react'
import { ParameterChip } from './ParameterChip'
import { FileText, ClipboardList, Scale, MessageSquare, Globe, BookOpen, Plus } from 'lucide-react'
import { Box, VStack, Text } from '@/genie-ui'

export interface PlanningStageProps {
  intent: 'create' | 'review'
}

/**
 * PlanningStage Component
 * 
 * Displays the planning view after intent detection and thinking phase.
 * Shows:
 * 1. Reference documents - found documents, templates, and rules/playbooks
 * 2. Parameter chips - auto-filled parameters (editable)
 * 
 * This is Step 2 of the agentic workflow, after intent capture.
 * 
 * Future enhancements:
 * - Make parameter chips editable
 * - Add parameter chip selection modal
 * - Connect to real reference document search
 * - Allow removal of reference documents
 */
export function PlanningStage({ intent }: PlanningStageProps) {
  // Mock reference documents - in production, this would come from actual document/rule search
  const documents =
    intent === 'create'
      ? [
          { id: '1', name: 'Employment Agreement Template', isTemplate: true, type: 'document' as const },
          { id: '2', name: 'Service Contract Template', isTemplate: false, type: 'document' as const },
        ]
      : [
          { id: '1', name: 'Supplier Contract.docx', isTemplate: false, type: 'document' as const },
          { id: '2', name: 'NDA Agreement.docx', isTemplate: false, type: 'document' as const },
        ]

  const rules = [
    { id: '3', name: 'Startup Legal Playbook', type: 'rule' as const },
  ]

  // Combine documents and rules into reference documents list
  const referenceDocuments = [...documents, ...rules]

  // Mock parameter chips - auto-filled from intent detection
  const parameterChips = intent === 'create'
    ? [
        { label: 'Creating', value: '[Document name]', icon: <FileText className="w-4 h-4" /> },
        { label: 'Governing law', value: 'France', icon: <Scale className="w-4 h-4" /> },
        { label: 'Template', value: 'Document 1', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'Tone', value: 'Professional', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Language', value: 'English', icon: <Globe className="w-4 h-4" /> },
        { label: 'Length', value: 'Concise', icon: <FileText className="w-4 h-4" /> },
      ]
    : [
        { label: 'Document', value: '[Document name]', icon: <FileText className="w-4 h-4" /> },
        { label: 'Deliverable', value: 'Review', icon: <ClipboardList className="w-4 h-4" /> },
        { label: 'Governing law', value: 'France', icon: <Scale className="w-4 h-4" /> },
        { label: 'Party', value: 'Party A', icon: <MessageSquare className="w-4 h-4" /> },
        { label: 'Review type', value: 'Comprehensive', icon: <ClipboardList className="w-4 h-4" /> },
      ]

  return (
    <Box className="w-full max-w-4xl mx-auto px-8 pt-8 pb-2 animate-fadeIn">
      <VStack spacing={8} align="start" className="w-full">
        {/* Reference Documents Section */}
        <section className="w-full">
          <Text size="sm" className="font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Reference Documents:
          </Text>
          <div className="w-full bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {referenceDocuments.map((referenceDoc) => (
              <div
                key={referenceDoc.id}
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Box className="w-6 h-6 flex items-center justify-center">
                    {referenceDoc.type === 'document' ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ClipboardList className="w-4 h-4 text-purple-600" />
                    )}
                  </Box>
                  <Text size="sm" className="text-gray-900 font-normal">
                    {referenceDoc.name}
                  </Text>
                </div>
                <div className="flex items-center gap-2">
                  {referenceDoc.type === 'document' && 'isTemplate' in referenceDoc && referenceDoc.isTemplate && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded">
                      Template
                    </span>
                  )}
                  <button className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Upload Documents Button */}
          <button
            onClick={() => console.log('Upload documents clicked')}
            className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        </section>

        {/* Parameter Chips Section */}
        <section className="w-full">
          <Text size="sm" className="font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Parameters:
          </Text>
          <div className="flex flex-wrap gap-2">
            {parameterChips.map((chip) => (
              <ParameterChip
                key={chip.label}
                label={chip.label}
                value={chip.value}
                icon={chip.icon}
              />
            ))}
            <ParameterChip label="+ Add parameter" isAddButton />
          </div>
        </section>
      </VStack>

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </Box>
  )
}


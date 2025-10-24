import React, { useState } from 'react'
import { Box, VStack, Text, Button } from '@/genie-ui'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface DocumentPlanSection {
  id: string
  title: string
  content: string
  checked: boolean
}

export interface DocumentPlanProps {
  documentType: string
  sections: DocumentPlanSection[]
  onSectionsChange?: (sections: DocumentPlanSection[]) => void
  onCreateDocument?: () => void
  isProcessing?: boolean
  currentProcessingSection?: string | null
}

/**
 * DocumentPlan Component
 * 
 * Displays an editable document plan with checkboxes and accordion sections.
 * Shows after the user answers the follow-up question in the CREATE flow.
 * 
 * Features:
 * - Checkboxes for each section
 * - Expandable/collapsible accordions
 * - Editable content within each section
 * - "Create Document" button at the bottom
 */
export function DocumentPlan({ 
  sections: initialSections,
  onSectionsChange,
  onCreateDocument,
  isProcessing = false,
  currentProcessingSection = null
}: DocumentPlanProps) {
  const [sections, setSections] = useState<DocumentPlanSection[]>(initialSections)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const toggleCheckbox = (sectionId: string) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, checked: !section.checked } : section
    )
    setSections(updatedSections)
    onSectionsChange?.(updatedSections)
  }

  return (
    <Box className="w-full max-w-4xl">
      <VStack spacing={4} align="start" className="w-full">
        {/* Header */}
        <Box className="w-full">
          <Text size="sm" className="text-gray-500 mb-2">
            Review and customize the plan before execution
          </Text>
        </Box>

        {/* Sections */}
        <VStack spacing={3} align="start" className="w-full">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id)
            const isCurrentlyProcessing = currentProcessingSection === section.id
            
            return (
              <Box
                key={section.id}
                className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={section.checked}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleCheckbox(section.id)
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      disabled={isProcessing}
                    />
                    
                    {/* Section Title and Thinking Animation */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Text size="sm" className="font-medium text-gray-900 flex-shrink-0">
                        {section.title}
                      </Text>
                      
                      {/* Thinking animation - shows in white space */}
                      {isCurrentlyProcessing && (
                        <>
                          <style jsx>{`
                            @keyframes colorFade {
                              0%, 100% { color: rgb(147, 51, 234); }
                              50% { color: rgb(0, 0, 0); }
                            }
                            .thinking-text {
                              animation: colorFade 2s ease-in-out infinite;
                            }
                          `}</style>
                          <Text size="xs" className="thinking-text font-medium text-purple-600 ml-2">
                            {getThinkingText(section.id)}
                          </Text>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0 ml-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Section Content (Expanded) */}
                {isExpanded && (
                  <Box className="px-4 pb-4 border-t border-gray-100">
                    <Text size="sm" className="text-gray-600 leading-relaxed mt-3">
                      {section.content}
                    </Text>
                  </Box>
                )}
              </Box>
            )
          })}
        </VStack>

        {/* Create Document Button */}
        <Box className="w-full flex justify-end mt-4">
          <Button
            variant="solid"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-full"
            onPress={onCreateDocument}
            isDisabled={isProcessing}
          >
            {isProcessing ? 'Creating...' : 'Create Document'}
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

/**
 * Generate AI content for document plan sections based on document type
 */
export function generateDocumentPlanSections(documentType: string): DocumentPlanSection[] {
  // Normalize document type to lowercase for matching
  const normalizedType = documentType.toLowerCase()
  
  // Default sections with AI-generated content based on document type
  const sections: DocumentPlanSection[] = [
    {
      id: 'background',
      title: 'Create Background',
      content: getBackgroundContent(normalizedType),
      checked: false,
    },
    {
      id: 'parties',
      title: 'Define parties',
      content: getPartiesContent(normalizedType),
      checked: false,
    },
    {
      id: 'commercial',
      title: 'Add commercial details',
      content: getCommercialContent(normalizedType),
      checked: false,
    },
    {
      id: 'key-clauses',
      title: 'Add key clauses',
      content: getKeyClausesContent(normalizedType),
      checked: false,
    },
    {
      id: 'boilerplate',
      title: 'Create boilerplate clauses',
      content: getBoilerplateContent(),
      checked: false,
    },
    {
      id: 'consistency',
      title: 'Review for document consistency',
      content: getConsistencyContent(),
      checked: false,
    },
    {
      id: 'coverage',
      title: 'Check document covers terms of the deal',
      content: getCoverageContent(normalizedType),
      checked: false,
    },
    {
      id: 'legal-soundness',
      title: 'Check document is legally sound',
      content: getLegalSoundnessContent(),
      checked: false,
    },
  ]

  return sections
}

// Helper functions to generate content for each section based on document type

function getBackgroundContent(docType: string): string {
  if (docType.includes('employment') || docType.includes('hire')) {
    return 'Provide context about the employment relationship, including the position, start date, and reporting structure. Include any relevant background about the company and the role.'
  }
  if (docType.includes('nda') || docType.includes('confidential')) {
    return 'Outline the purpose of the confidentiality agreement, the nature of the business relationship, and the type of confidential information that will be shared.'
  }
  if (docType.includes('service') || docType.includes('contractor')) {
    return 'Describe the services to be provided, the project scope, and the business relationship between the parties. Include relevant background information.'
  }
  if (docType.includes('purchase') || docType.includes('sale')) {
    return 'Provide background on the transaction, including the assets or goods being purchased, the business context, and any relevant history between the parties.'
  }
  return 'Provide relevant background information about the agreement, including the purpose, context, and relationship between the parties.'
}

function getPartiesContent(docType: string): string {
  if (docType.includes('employment') || docType.includes('hire')) {
    return 'Define the employer (company name, registration details, address) and the employee (full name, position, department). Include any relevant entity details.'
  }
  if (docType.includes('nda') || docType.includes('confidential')) {
    return 'Identify the disclosing party and receiving party, including full legal names, addresses, and registration numbers if applicable.'
  }
  return 'Clearly identify all parties to the agreement, including full legal names, addresses, and registration details where applicable.'
}

function getCommercialContent(docType: string): string {
  if (docType.includes('employment') || docType.includes('hire')) {
    return 'Insert the commercial terms including payment schedules, pricing structures, delivery timelines, and any performance milestones. For employment: salary, benefits, bonuses, equity compensation, and payment schedule.'
  }
  if (docType.includes('service') || docType.includes('contractor')) {
    return 'Insert the commercial terms including payment schedules, pricing structures, delivery timelines, and any performance milestones. Include rates, invoicing terms, and payment conditions.'
  }
  if (docType.includes('purchase') || docType.includes('sale')) {
    return 'Insert the commercial terms including payment schedules, pricing structures, delivery timelines, and any performance milestones. Include purchase price, payment terms, and delivery schedule.'
  }
  return 'Insert the commercial terms including payment schedules, pricing structures, delivery timelines, and any performance milestones.'
}

function getKeyClausesContent(docType: string): string {
  if (docType.includes('employment') || docType.includes('hire')) {
    return 'Include essential clauses such as: duties and responsibilities, working hours, leave entitlements, termination provisions, intellectual property assignment, confidentiality obligations, and non-compete/non-solicit provisions where appropriate.'
  }
  if (docType.includes('nda') || docType.includes('confidential')) {
    return 'Include essential clauses such as: definition of confidential information, permitted use, non-disclosure obligations, exclusions, term and survival, and remedies for breach.'
  }
  if (docType.includes('service') || docType.includes('contractor')) {
    return 'Include essential clauses such as: scope of services, deliverables, acceptance criteria, intellectual property rights, warranties, liability limitations, and indemnification.'
  }
  return 'Include the key specific clauses relevant to this type of agreement, addressing the main obligations, rights, and responsibilities of each party.'
}

function getBoilerplateContent(): string {
  return 'Add standard boilerplate clauses including: governing law and jurisdiction, dispute resolution (mediation/arbitration), entire agreement, amendment provisions, severability, force majeure, notices, and counterparts.'
}

function getConsistencyContent(): string {
  return 'Review the document to ensure consistent use of defined terms, party names, references, numbering, and formatting throughout. Check that cross-references are accurate and that there are no contradictions between sections.'
}

function getCoverageContent(docType: string): string {
  if (docType.includes('employment') || docType.includes('hire')) {
    return 'Verify that all key aspects of the employment relationship are covered: compensation, benefits, responsibilities, working arrangements, confidentiality, IP rights, termination, and any special provisions discussed.'
  }
  if (docType.includes('nda') || docType.includes('confidential')) {
    return 'Verify that all key aspects of the confidentiality arrangement are covered: scope of information, permitted uses, disclosure restrictions, term, return of materials, and remedies.'
  }
  return 'Verify that the document covers all material terms of the deal, including all key obligations, deliverables, payment terms, timelines, and any special provisions that were discussed or negotiated.'
}

function getLegalSoundnessContent(): string {
  return 'Conduct a final review to ensure the document is legally sound: check that clauses are enforceable, obligations are clear and mutual, rights and remedies are balanced, and the document complies with applicable laws and regulations.'
}

/**
 * Get thinking text for each section during processing
 */
function getThinkingText(sectionId: string): string {
  const thinkingTexts: Record<string, string> = {
    'background': 'Analyzing context and purpose...',
    'parties': 'Identifying all parties...',
    'commercial': 'Structuring payment terms...',
    'key-clauses': 'Drafting essential provisions...',
    'boilerplate': 'Adding standard clauses...',
    'consistency': 'Checking consistency...',
    'coverage': 'Verifying completeness...',
    'legal-soundness': 'Final legal review...',
  }
  
  return thinkingTexts[sectionId] || 'Processing...'
}


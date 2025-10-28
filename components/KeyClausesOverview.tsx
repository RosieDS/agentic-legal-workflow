import React from 'react'
import { Box, VStack, Text } from '@/genie-ui'
import { KeyClause } from '@/utils/keyClausesData'

export interface KeyClausesOverviewProps {
  clauses: KeyClause[]
  documentType: string
}

/**
 * KeyClausesOverview Component
 * 
 * Displays an overview of the top 4 key clauses for a document type.
 * Shows after the user selects "Give me an overview" in the create flow.
 */
export function KeyClausesOverview({ clauses, documentType }: KeyClausesOverviewProps) {
  return (
    <Box className="w-full max-w-4xl mx-auto px-8 py-6 animate-fadeIn">
      <VStack spacing={4} align="start" className="w-full">
        {/* Heading */}
        <Text size="lg" className="font-semibold text-gray-900">
          Key clauses for your {documentType}
        </Text>
        
        {/* Clauses list with round bullet points */}
        <Box className="w-full">
          <ul className="space-y-3">
            {clauses.map((clause, index) => (
              <li key={index} className="flex items-start gap-3">
                {/* Round bullet point */}
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-900 mt-2"></span>
                
                {/* Clause content */}
                <Text size="sm" className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">{clause.name}:</span>{' '}
                  {clause.explanation}
                </Text>
              </li>
            ))}
          </ul>
        </Box>
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


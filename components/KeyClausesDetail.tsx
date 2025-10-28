import React, { useState } from 'react'
import { Box, VStack, Text, Button } from '@/genie-ui'
import { X, Mic } from 'lucide-react'

export interface ClauseDetail {
  name: string
  bulletPoints: string[]
}

export interface KeyClausesDetailProps {
  clauses: ClauseDetail[]
  documentType: string
  onNext?: () => void
}

/**
 * KeyClausesDetail Component
 * 
 * Shows detailed editable view of key clauses when user selects "Customise in detail".
 * Each clause appears in an editable card with bullet points.
 * User can edit the details before proceeding to the document plan.
 */
export function KeyClausesDetail({ clauses, documentType, onNext }: KeyClausesDetailProps) {
  const [clauseData, setClauseData] = useState<ClauseDetail[]>(clauses)

  const handleBulletChange = (clauseIndex: number, bulletIndex: number, newValue: string) => {
    const updatedClauses = [...clauseData]
    updatedClauses[clauseIndex].bulletPoints[bulletIndex] = newValue
    setClauseData(updatedClauses)
  }

  const handleRemoveClause = (clauseIndex: number) => {
    const updatedClauses = clauseData.filter((_, index) => index !== clauseIndex)
    setClauseData(updatedClauses)
  }

  return (
    <Box className="w-full max-w-6xl mx-auto px-8 py-6 animate-fadeIn">
      <VStack spacing={6} align="start" className="w-full">
        {/* Header */}
        <VStack spacing={1} align="start">
          <Text size="xl" className="font-semibold text-gray-900">
            Key Clauses
          </Text>
          <Text size="sm" className="text-gray-500">
            Editor add extra details
          </Text>
        </VStack>

        {/* 2x2 Grid of clause cards */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {clauseData.map((clause, clauseIndex) => (
            <div
              key={clauseIndex}
              className="border-2 border-purple-300 rounded-2xl p-4 bg-white relative"
            >
              {/* X button */}
              <button
                onClick={() => handleRemoveClause(clauseIndex)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Clause title */}
              <Text size="md" className="font-semibold text-gray-900 mb-3 pr-8">
                {clause.name}
              </Text>

              {/* Editable bullet points */}
              <VStack spacing={2} align="start" className="w-full mb-3">
                {clause.bulletPoints.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start gap-2 w-full">
                    <span className="text-gray-700 mt-1.5 flex-shrink-0">•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(clauseIndex, bulletIndex, e.target.value)}
                      className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none focus:outline-none p-0 leading-relaxed"
                      style={{ font: 'inherit' }}
                    />
                  </div>
                ))}
              </VStack>

              {/* Microphone icon */}
              <div className="flex justify-end">
                <button className="text-gray-600 hover:text-purple-600 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Next button */}
        <div className="w-full flex justify-end mt-4">
          <Button
            variant="solid"
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-3 rounded-full text-base"
            onPress={onNext}
          >
            Next
          </Button>
        </div>
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


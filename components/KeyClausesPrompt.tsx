import React from 'react'
import { Box, VStack, Text } from '@/genie-ui'

export interface KeyClausesPromptProps {
  onOptionSelect?: (option: 'customise' | 'overview' | 'skip') => void
}

/**
 * KeyClausesPrompt Component
 * 
 * Appears after the user responds to the follow-up question in the CREATE flow,
 * but before the document plan is shown.
 * 
 * Asks the user how they want to handle key clauses in their document.
 */
export function KeyClausesPrompt({ onOptionSelect }: KeyClausesPromptProps) {
  const handleOptionClick = (option: 'customise' | 'overview' | 'skip') => {
    console.log('Key clauses option selected:', option)
    onOptionSelect?.(option)
  }

  return (
    <Box className="w-full max-w-4xl mx-auto px-8 py-6 animate-fadeIn">
      <VStack spacing={4} align="start" className="w-full">
        {/* Heading */}
        <Text size="xl" className="font-semibold text-gray-900">
          Key clauses
        </Text>
        
        {/* Question */}
        <Text size="md" className="text-gray-700">
          Would you like to explore the key clauses in your document?
        </Text>
        
        {/* Three option buttons */}
        <div className="flex flex-wrap gap-3 mt-2">
          <button
            onClick={() => handleOptionClick('customise')}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:shadow-sm"
          >
            <span className="font-normal">Customise in detail</span>
          </button>
          
          <button
            onClick={() => handleOptionClick('overview')}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:shadow-sm"
          >
            <span className="font-normal">Give me an overview</span>
          </button>
          
          <button
            onClick={() => handleOptionClick('skip')}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:shadow-sm"
          >
            <span className="font-normal">Skip and review later</span>
          </button>
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


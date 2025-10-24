import React from 'react'
import { Box, Text } from '@/genie-ui'
import { FileText, X } from 'lucide-react'

interface FormArtifactChipProps {
  selectedDocCount: number
  onOpen: () => void
  onClose: () => void
}

/**
 * Sticky chip shown at top of chat when form artifact is pinned
 * Entire chip is clickable to reopen form
 * Separate X button to close the artifact
 */
export const FormArtifactChip: React.FC<FormArtifactChipProps> = ({
  selectedDocCount,
  onOpen,
  onClose
}) => {
  return (
    <Box className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <Box className="px-4 py-2">
        {/* Main chip area - clickable to open with close button inside */}
        <button
          onClick={onOpen}
          className="flex items-center gap-3 py-2 px-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4 text-purple-600" />
          <Text size="sm" className="font-medium text-purple-700">
            Creating {selectedDocCount} document{selectedDocCount !== 1 ? 's' : ''}
          </Text>
          <Text size="xs" className="text-purple-600 opacity-75">
            Click to configure
          </Text>

          {/* Close button inside the main button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="ml-2 p-1 rounded hover:bg-purple-200 text-purple-500 hover:text-purple-700 transition-colors"
            aria-label="Close form"
          >
            <X className="w-3 h-3" />
          </button>
        </button>
      </Box>
    </Box>
  )
}
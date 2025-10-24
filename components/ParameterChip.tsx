import React from 'react'

export interface ParameterChipProps {
  label: string
  value?: string
  isAddButton?: boolean
  icon?: React.ReactNode
  onRemove?: () => void
}

/**
 * ParameterChip - Editable parameter chip/tag component
 * 
 * Used in the Planning Stage to display inferred parameters like:
 * - Governing law
 * - Language
 * - Tone
 * - Document type
 * etc.
 * 
 * Supports an "add" variant with dashed border for the "+ Add parameter" button
 */
export function ParameterChip({
  label,
  value,
  isAddButton = false,
  icon,
  onRemove,
}: ParameterChipProps) {
  const handleClick = () => {
    if (isAddButton) {
      console.log('Add parameter clicked')
      // TODO: In next phase, open parameter selection modal
    } else {
      console.log('Edit parameter:', label, value)
      // TODO: In next phase, make chips editable
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all
        ${
          isAddButton
            ? 'border-dashed border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600'
            : 'border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:shadow-sm'
        }
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className={isAddButton ? 'font-normal' : 'font-medium'}>
        {label}
        {value && ':'}
      </span>
      {value && <span className="text-gray-600">{value}</span>}
      {onRemove && !isAddButton && (
        <span
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-1 text-gray-400 hover:text-gray-600"
        >
          ×
        </span>
      )}
    </button>
  )
}


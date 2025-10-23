import { useState } from 'react'

/**
 * Slider component for document generation preferences
 * Can be used for Length, Tone, Favourability, etc.
 */
interface SliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  minLabel: string
  maxLabel: string
}

export function Slider({ label, value, onChange, minLabel, maxLabel }: SliderProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="!text-size-2 leading-1 tracking-4 font-semibold text-gray-900">
          {label}
        </p>
        <p className="!text-size-2 leading-1 tracking-4 font-semibold text-gray-600">
          {value}%
        </p>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-2"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between">
        <p className="font-normal !text-size-1 leading-1 tracking-1 text-gray-500">
          {minLabel}
        </p>
        <p className="font-normal !text-size-1 leading-1 tracking-1 text-gray-500">
          {maxLabel}
        </p>
      </div>
    </div>
  )
}

/**
 * Component containing all three document preference sliders
 */
export function DocumentPreferenceSliders() {
  const [lengthValue, setLengthValue] = useState(50)
  const [toneValue, setToneValue] = useState(50)
  const [favourabilityValue, setFavourabilityValue] = useState(50)

  return (
    <div className="flex flex-col items-start gap-6 w-full">
      <Slider
        label="Length"
        value={lengthValue}
        onChange={setLengthValue}
        minLabel="Simple"
        maxLabel="Comprehensive"
      />
      <Slider
        label="Tone"
        value={toneValue}
        onChange={setToneValue}
        minLabel="Plain"
        maxLabel="Formal"
      />
      <Slider
        label="Favourability"
        value={favourabilityValue}
        onChange={setFavourabilityValue}
        minLabel="Favours me"
        maxLabel="Favours them"
      />
    </div>
  )
}

/**
 * Document item for the document selector
 */
interface DocumentItem {
  filename: string
  useAsTemplate: boolean
  useAsInformation: boolean
}

/**
 * Component for selecting documents to use as templates or information sources
 */
interface UseYourDocumentsProps {
  documents?: DocumentItem[]
  onDocumentChange?: (index: number, field: 'useAsTemplate' | 'useAsInformation', value: boolean) => void
}

export function UseYourDocuments({ 
  documents = [
    {
      filename: 'Employment Agreement_document_type_1.docx',
      useAsTemplate: false,
      useAsInformation: true
    },
    {
      filename: 'Employment Agreement_document_type_2.docx',
      useAsTemplate: false,
      useAsInformation: true
    }
  ],
  onDocumentChange
}: UseYourDocumentsProps) {
  const [docs, setDocs] = useState<DocumentItem[]>(documents)

  const handleCheckboxChange = (index: number, field: 'useAsTemplate' | 'useAsInformation', checked: boolean) => {
    const newDocs = [...docs]
    newDocs[index][field] = checked
    setDocs(newDocs)
    
    if (onDocumentChange) {
      onDocumentChange(index, field, checked)
    }
  }

  return (
    <div className="border-2 border-purple-400 rounded-2xl p-4 bg-white mb-4 overflow-hidden max-w-[379px]">
      <div className="flex flex-col items-start gap-3 w-full">
        {/* Header */}
        <div className="flex items-center justify-between w-full px-2 mb-2">
          <p className="!text-size-3 leading-2 tracking-3 font-semibold text-gray-900 flex-1">
            Use your documents
          </p>
          <div className="flex items-center gap-8 text-xs">
            <div className="w-24 relative">
              <button className="w-full text-center font-medium text-black underline cursor-pointer hover:text-gray-700">
                Use as template
              </button>
            </div>
            <div className="w-24 relative">
              <button className="w-full text-center font-medium text-black underline cursor-pointer hover:text-gray-700">
                Use as information
              </button>
            </div>
          </div>
        </div>

        {/* Document rows */}
        {docs.map((doc, index) => (
          <div key={index} className="flex items-center justify-between w-full py-2 px-2">
            <p className="font-normal !text-size-2 leading-1 tracking-4 flex-1 text-gray-900 truncate">
              {doc.filename}
            </p>
            <div className="flex items-center gap-8">
              <div className="w-24 flex justify-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  checked={doc.useAsTemplate}
                  onChange={(e) => handleCheckboxChange(index, 'useAsTemplate', e.target.checked)}
                />
              </div>
              <div className="w-24 flex justify-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  checked={doc.useAsInformation}
                  onChange={(e) => handleCheckboxChange(index, 'useAsInformation', e.target.checked)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


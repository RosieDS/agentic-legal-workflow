import React, { useState, useEffect } from 'react'
import { Box, Flex, VStack, Text, Textarea, Button } from '@/genie-ui'
import { Select, SelectItem } from '@/genie-ui/components/select'
import DocDetailSlider, { DocumentType } from '@/genie-ui/components/docDetailSlider'
import { Plus, X, Sparkles, Mic, Upload } from 'lucide-react'

interface DocumentFormProps {
  // Form state props
  workDescription: string // Current value for "Tell us about this work" section
  setWorkDescription: (value: string) => void
  selectedExistingInputs: Record<string, string>
  setSelectedExistingInputs: (value: Record<string, string>) => void
  selectedDocs: Record<string, boolean>
  setSelectedDocs: (value: Record<string, boolean>) => void
  suggestedDocs: string[]
  setCreateDocs: (value: string[]) => void
  selectedClauses: Record<string, boolean>
  setSelectedClauses: (value: Record<string, boolean>) => void
  clauseDetailsText: Record<string, string>
  setClauseDetailsText: (value: Record<string, string>) => void
  lengthValue: number
  setLengthValue: (value: number) => void
  favourabilityValue: number
  setFavourabilityValue: (value: number) => void
  toneValue: number
  setToneValue: (value: number) => void
  documentType: DocumentType
  setDocumentType: (value: DocumentType) => void
  governingLaw: string
  setGoverningLaw: (value: string) => void
  language: string
  setLanguage: (value: string) => void
  customClauses: Record<string, Array<{name: string, details: string, id: string}>>

  // Callback for when selected docs change
  onSelectedDocsChange?: (count: number) => void

  // Helper functions
  addCustomClause: (docType: string) => void
  updateCustomClauseName: (docType: string, clauseId: string, name: string) => void
  updateCustomClauseDetails: (docType: string, clauseId: string, details: string) => void
  removeCustomClause: (docType: string, clauseId: string) => void
  generateKeyClauses: (docType: string) => Array<{name: string, explainer: string}>
  onGenerateDocument?: (docType: string) => void
  generatedDocs?: Record<string, boolean>

  // Current document index for navigation
  currentDocIndex?: number
}

/**
 * Reusable document customization form component
 * Contains all the form logic from the original implementation
 */
export const DocumentForm: React.FC<DocumentFormProps> = ({
  workDescription,
  setWorkDescription,
  selectedExistingInputs,
  setSelectedExistingInputs,
  selectedDocs,
  setSelectedDocs,
  suggestedDocs,
  setCreateDocs,
  selectedClauses,
  setSelectedClauses,
  clauseDetailsText,
  setClauseDetailsText,
  lengthValue,
  setLengthValue,
  favourabilityValue,
  setFavourabilityValue,
  toneValue,
  setToneValue,
  documentType,
  setDocumentType,
  governingLaw,
  setGoverningLaw,
  language,
  setLanguage,
  customClauses,
  onSelectedDocsChange,
  addCustomClause,
  updateCustomClauseName,
  updateCustomClauseDetails,
  removeCustomClause,
  generateKeyClauses,
  onGenerateDocument,
  generatedDocs,
  currentDocIndex = 0
}) => {

  // Loading state for document library search - track which documents are loading
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({})
  const [previousSelectedDocs, setPreviousSelectedDocs] = useState<Record<string, boolean>>({})

  // Tooltip state for "Use as template" and "Use as information"
  const [showTooltip, setShowTooltip] = useState<'template' | 'information' | null>(null)

  // Effect to trigger loading when documents are selected/deselected
  useEffect(() => {
    const currentSelected = Object.keys(selectedDocs).filter(doc => selectedDocs[doc])
    const previousSelected = Object.keys(previousSelectedDocs).filter(doc => previousSelectedDocs[doc])

    // Find newly selected documents
    const newlySelected = currentSelected.filter(doc => !previousSelected.includes(doc))

    if (newlySelected.length > 0) {
      // Set loading state for newly selected documents
      const newLoadingState = { ...loadingDocuments }
      newlySelected.forEach(doc => {
        newLoadingState[doc] = true
      })
      setLoadingDocuments(newLoadingState)

      // Set timers for each newly selected document
      newlySelected.forEach(doc => {
        setTimeout(() => {
          setLoadingDocuments(prev => ({
            ...prev,
            [doc]: false
          }))
        }, 2000)
      })
    }

    // Remove loading state for deselected documents
    const deselected = previousSelected.filter(doc => !currentSelected.includes(doc))
    if (deselected.length > 0) {
      setLoadingDocuments(prev => {
        const newState = { ...prev }
        deselected.forEach(doc => {
          delete newState[doc]
        })
        return newState
      })
    }

    // Update previous selected docs for next comparison
    setPreviousSelectedDocs(selectedDocs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocs])

  // Loading component for document library search
  const DocumentLibraryLoading = () => (
    <Box className="w-full">
      <Box className="border rounded-lg bg-white shadow-sm overflow-hidden p-6">
        <Flex align="center" justify="center" className="min-h-[100px]">
          <VStack spacing={3} align="center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <Text size="sm" className="text-gray-600">Searching your document library.</Text>
          </VStack>
        </Flex>
      </Box>
    </Box>
  )

  // Generate document-specific suggestions for "Any other details"
  const generateDetailSuggestions = (docType: string): string[] => {
    switch(docType) {
      case 'Employment Agreement':
        return [
          'Salary range £40-50k, hybrid working 2 days/week, reporting to CMO',
          'Start date, probation period, benefits package details'
        ]
      case 'NDA':
        return [
          'Specific confidential information to protect',
          'Duration of confidentiality obligations, permitted disclosures'
        ]
      case 'Service Agreement':
        return [
          'Scope of services, deliverables, payment schedule',
          'Service level agreements, performance metrics'
        ]
      case 'Investment Agreement':
        return [
          'Investment amount, valuation, liquidation preferences',
          'Board seats, voting rights, anti-dilution provisions'
        ]
      case 'Offer Letter':
        return [
          'Job title, start date, compensation details',
          'Benefits, working hours, location requirements'
        ]
      default:
        return [
          'Key terms and conditions specific to this agreement',
          'Important dates, milestones, or deliverables'
        ]
    }
  }

  return (
    <Box className="p-6 overflow-y-auto relative">
      {/* Multi-layer radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#E8D5FF] via-transparent to-transparent opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #E8D5FF 0%, transparent 50%)' }}></div>
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-[#F0E6FF] via-transparent to-transparent opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 30%, #F0E6FF 0%, transparent 60%)' }}></div>
        <div className="absolute bottom-0 left-1/2 w-full h-full bg-gradient-radial from-[#F8F3FF] via-transparent to-transparent opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 50% 80%, #F8F3FF 0%, transparent 70%)' }}></div>
        <div className="absolute inset-0 bg-[#FDFCFF]" style={{ mixBlendMode: 'normal', opacity: 0.5 }}></div>
      </div>
      <VStack spacing={8} align="start" className="w-full relative z-10">
        {/* Doc Detail Slider */}
        <Box className="w-full">
          <DocDetailSlider
            value={documentType}
            onChange={setDocumentType}
          />
        </Box>

        {/* Tell us about this work section */}
        {(documentType === 'template' || documentType === 'customised') && (
          <Box className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Box>
                <Text size="lg" className="font-medium text-gray-900 mb-4">Tell us about this work</Text>
                <Text size="sm" className="text-gray-600 mb-4">Why are you doing this work now and what must it achieve for this deal to be a success?</Text>
                <Text size="sm" className="text-gray-600">List the 2–3 outcomes that matter most.</Text>
              </Box>

              <Box>
                <Textarea
                  minRows={3}
                  value={workDescription}
                  onValueChange={(val) => setWorkDescription(val)}
                  placeholder="E.g., 'Hire a Sales person', 'Apply for investment funding'"
                  className="w-full"
                  classNames={{
                    inputWrapper: 'rounded-lg border border-gray-200',
                    input: 'text-gray-900 placeholder:text-gray-400',
                  }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Document Selection Section */}
        <Box className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Box>
              <Text size="lg" className="font-medium text-gray-900 mb-2">Select docs to create</Text>
              <Text size="sm" className="text-gray-600 mb-4">Choose which documents you need</Text>
              
              {/* Governing Law Dropdown */}
              <Box className="w-full mb-4">
                <Text size="sm" className="font-medium text-gray-900 mb-2">Governing law:</Text>
                <Select
                  selectedKeys={[governingLaw]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string
                    setGoverningLaw(selected)
                  }}
                  placeholder="Select governing law"
                  className="w-full"
                  classNames={{
                    trigger: "h-[40px] min-h-[40px]",
                    selectorIcon: "right-3 absolute"
                  }}
                  size="md"
                >
                  <SelectItem key="english-law">England and Wales</SelectItem>
                  <SelectItem key="scottish-law">Scottish Law</SelectItem>
                  <SelectItem key="northern-ireland-law">Northern Ireland Law</SelectItem>
                  <SelectItem key="us-federal">US Federal Law</SelectItem>
                  <SelectItem key="california-law">California State Law</SelectItem>
                  <SelectItem key="new-york-law">New York State Law</SelectItem>
                  <SelectItem key="delaware-law">Delaware State Law</SelectItem>
                  <SelectItem key="australian-law">Australian Law</SelectItem>
                  <SelectItem key="canadian-law">Canadian Law</SelectItem>
                  <SelectItem key="eu-law">European Union Law</SelectItem>
                  <SelectItem key="german-law">German Law</SelectItem>
                  <SelectItem key="french-law">French Law</SelectItem>
                  <SelectItem key="singapore-law">Singapore Law</SelectItem>
                  <SelectItem key="hong-kong-law">Hong Kong Law</SelectItem>
                </Select>
              </Box>

              {/* Language Dropdown */}
              <Box className="w-full mb-4">
                <Text size="sm" className="font-medium text-gray-900 mb-2">Language:</Text>
                <Select
                  selectedKeys={[language]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string
                    setLanguage(selected)
                  }}
                  placeholder="Select language"
                  className="w-full"
                  classNames={{
                    trigger: "h-[40px] min-h-[40px]",
                    selectorIcon: "right-3 absolute"
                  }}
                  size="md"
                >
                  <SelectItem key="english">English</SelectItem>
                  <SelectItem key="spanish">Spanish</SelectItem>
                  <SelectItem key="french">French</SelectItem>
                  <SelectItem key="german">German</SelectItem>
                  <SelectItem key="italian">Italian</SelectItem>
                  <SelectItem key="portuguese">Portuguese</SelectItem>
                </Select>
              </Box>

              {/* Show customise link when more than one document is selected */}
              {Object.values(selectedDocs).filter(Boolean).length > 1 && (
                <Box className="w-full flex justify-start">
                  <button className="text-xs text-purple-600 hover:text-purple-800 underline">
                    Customise documents separately.
                  </button>
                </Box>
              )}
            </Box>

            <Box className="flex flex-col justify-end h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestedDocs.map((doc, i) => (
                  <Box key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 w-full">
                    <input
                      type="checkbox"
                      id={`doc-${i}`}
                      checked={selectedDocs[doc] || false}
                      onChange={(e) => {
                        const newSelected = {
                          ...selectedDocs,
                          [doc]: e.target.checked
                        }
                        setSelectedDocs(newSelected)
                        // Update createDocs immediately
                        const chosen = Object.keys(newSelected).filter(k => newSelected[k])
                        setCreateDocs(chosen)
                        // Notify parent of count change
                        if (onSelectedDocsChange) {
                          onSelectedDocsChange(chosen.length)
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor={`doc-${i}`} className="flex-1 cursor-pointer min-w-0">
                      <Text
                        size="sm"
                        className="text-gray-900 truncate"
                      >
                        {i + 1}. {doc}
                      </Text>
                    </label>
                  </Box>
                ))}
              </div>
            </Box>
          </Box>

        </Box>

        {/* New Layout for Standard, Customised, and Template Document Types */}
        {(documentType === 'template' || documentType === 'customised') && (
          <Box className="w-full relative">
            <VStack spacing={6} align="start" className="w-full">
              {/* Individual Document Sections - Show only current document */}
              {(() => {
                const selectedDocsList = Object.keys(selectedDocs).filter(doc => selectedDocs[doc])
                const currentDoc = selectedDocsList[currentDocIndex]
                if (!currentDoc) return null

                return (
                <Box key={currentDoc} className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  {/* Document Header */}
                  <Flex align="center" justify="between" className="mb-8">
                    <Text size="lg" className="font-semibold text-gray-900 text-2xl">{currentDoc}</Text>
                    <Button
                      variant="solid"
                      size="md"
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 py-3 flex items-center gap-2"
                      onPress={() => onGenerateDocument?.(currentDoc)}
                    >
                      <Sparkles className="w-4 h-4" />
                      {generatedDocs?.[currentDoc]
                        ? 'Regenerate document'
                        : 'Generate document'
                      }
                    </Button>
                  </Flex>

                  {/* TEMPLATE MODE: Horizontal three-slider layout */}
                  {documentType === 'template' ? (
                    <Box className="w-full">
                      <Flex gap={12} justify="between" className="w-full">
                        {/* Length Slider */}
                        <Box className="flex-1">
                          <Text size="lg" className="font-semibold text-gray-900 mb-4">Length</Text>
                          <Box className="w-full">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={lengthValue}
                              onChange={(e) => setLengthValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-3"
                            />
                            <Flex justify="between" align="center" className="relative">
                              <Text size="sm" className="text-gray-400">Simple</Text>
                              <Text size="lg" className="font-semibold text-gray-500 absolute left-1/2 transform -translate-x-1/2">{lengthValue}%</Text>
                              <Text size="sm" className="text-gray-400">Comprehensive</Text>
                            </Flex>
                          </Box>
                        </Box>

                        {/* Tone Slider */}
                        <Box className="flex-1">
                          <Text size="lg" className="font-semibold text-gray-900 mb-4">Tone</Text>
                          <Box className="w-full">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={toneValue}
                              onChange={(e) => setToneValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-3"
                            />
                            <Flex justify="between" align="center" className="relative">
                              <Text size="sm" className="text-gray-400">Plain</Text>
                              <Text size="lg" className="font-semibold text-gray-500 absolute left-1/2 transform -translate-x-1/2">{toneValue}%</Text>
                              <Text size="sm" className="text-gray-400">Formal</Text>
                            </Flex>
                          </Box>
                        </Box>

                        {/* Favourability Slider */}
                        <Box className="flex-1">
                          <Text size="lg" className="font-semibold text-gray-900 mb-4">Favourability</Text>
                          <Box className="w-full">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={favourabilityValue}
                              onChange={(e) => setFavourabilityValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-3"
                            />
                            <Flex justify="between" align="center" className="relative">
                              <Text size="sm" className="text-gray-400">Favours me</Text>
                              <Text size="lg" className="font-semibold text-gray-500 absolute left-1/2 transform -translate-x-1/2">{favourabilityValue}%</Text>
                              <Text size="sm" className="text-gray-400">Favours them</Text>
                            </Flex>
                          </Box>
                        </Box>
                      </Flex>
                    </Box>
                  ) : (
                    /* Two-column layout for template and customised modes */
                    <Box className="flex gap-8">
                    {/* LEFT COLUMN: Sliders + Key Clauses */}
                    <Box className="w-[30%] flex-shrink-0">
                      <VStack spacing={8} align="start" className="w-full">
                        {/* Sliders Section */}
                        <VStack spacing={6} align="start" className="w-full">
                          {/* Length Slider */}
                          <Box className="w-full">
                            <Flex align="center" justify="between" className="mb-2">
                              <Text size="sm" className="font-semibold text-gray-900">Length</Text>
                              <Text size="sm" className="font-semibold text-gray-600">{lengthValue}%</Text>
                            </Flex>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={lengthValue}
                              onChange={(e) => setLengthValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-2"
                            />
                            <Flex justify="between">
                              <Text size="xs" className="text-gray-500">Simple</Text>
                              <Text size="xs" className="text-gray-500">Comprehensive</Text>
                            </Flex>
                          </Box>

                          {/* Tone Slider */}
                          <Box className="w-full">
                            <Flex align="center" justify="between" className="mb-2">
                              <Text size="sm" className="font-semibold text-gray-900">Tone</Text>
                              <Text size="sm" className="font-semibold text-gray-600">{toneValue}%</Text>
                            </Flex>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={toneValue}
                              onChange={(e) => setToneValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-2"
                            />
                            <Flex justify="between">
                              <Text size="xs" className="text-gray-500">Plain</Text>
                              <Text size="xs" className="text-gray-500">Formal</Text>
                            </Flex>
                          </Box>

                          {/* Favourability Slider */}
                          <Box className="w-full">
                            <Flex align="center" justify="between" className="mb-2">
                              <Text size="sm" className="font-semibold text-gray-900">Favourability</Text>
                              <Text size="sm" className="font-semibold text-gray-600">{favourabilityValue}%</Text>
                            </Flex>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={favourabilityValue}
                              onChange={(e) => setFavourabilityValue(Number(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-purple mb-2"
                            />
                            <Flex justify="between">
                              <Text size="xs" className="text-gray-500">Favours me</Text>
                              <Text size="xs" className="text-gray-500">Favours them</Text>
                            </Flex>
                          </Box>
                        </VStack>

                        {/* Key Clauses Section (only for customised mode) */}
                        {documentType === 'customised' && (
                          <Box className="w-full mt-12">
                            <VStack spacing={4} align="start" className="w-full">
                              <Box>
                                <Text size="md" className="font-semibold text-gray-900 mb-1">Key Clauses (Optional)</Text>
                                <Text size="xs" className="text-gray-500">Customise even further, or leave blank for Genie to create</Text>
                              </Box>

                              {/* Existing key clauses */}
                              <VStack spacing={3} align="start" className="w-full">
                                {generateKeyClauses(currentDoc).map((clause, i) => {
                                  const clauseKey = `${currentDoc}-${i}`
                                  const isVisible = selectedClauses[clauseKey] !== false
                                  if (!isVisible) return null

                                  return (
                                    <Box key={i} className="w-full border border-purple-300 rounded-2xl p-4 bg-white">
                                      <Flex align="center" justify="between" className="mb-3">
                                        <Text size="sm" className="font-medium text-gray-900">{clause.name}</Text>
                                      <button
                                        onClick={() => {
                                          setSelectedClauses({
                                            ...selectedClauses,
                                            [clauseKey]: false
                                          })
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                      </Flex>
                                      <Box className="relative">
                                        <Textarea
                                          minRows={2}
                                          value={clauseDetailsText[clauseKey] || ''}
                                          onValueChange={(val) => setClauseDetailsText({
                                            ...clauseDetailsText,
                                            [clauseKey]: val
                                          })}
                                          placeholder="Requirements..."
                                          className="w-full"
                                          classNames={{
                                            inputWrapper: 'rounded-lg border-0 bg-gray-50',
                                            input: 'text-gray-900 placeholder:text-gray-400 text-sm pr-10',
                                          }}
                                        />
                                        <button className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
                                          <Mic className="w-4 h-4" />
                                        </button>
                                      </Box>
                                    </Box>
                                  )
                                })}

                                {/* Custom Clauses */}
                                {(customClauses[currentDoc] || []).map((customClause) => (
                                  <Box key={customClause.id} className="w-full border border-purple-300 rounded-2xl p-4 bg-white">
                                    <Flex align="center" justify="between" className="mb-3">
                                      <Box className="flex-1">
                                        <input
                                          type="text"
                                          value={customClause.name}
                                          onChange={(e) => updateCustomClauseName(currentDoc, customClause.id, e.target.value)}
                                          placeholder="Clause name"
                                          className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 bg-transparent border-0 outline-none"
                                        />
                                      </Box>
                                      <button
                                        onClick={() => removeCustomClause(currentDoc, customClause.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </Flex>
                                    <Box className="relative">
                                      <Textarea
                                        minRows={2}
                                        value={customClause.details}
                                        onValueChange={(val) => updateCustomClauseDetails(currentDoc, customClause.id, val)}
                                        placeholder="Requirements..."
                                        className="w-full"
                                        classNames={{
                                          inputWrapper: 'rounded-lg border-0 bg-gray-50',
                                          input: 'text-gray-900 placeholder:text-gray-400 text-sm pr-10',
                                        }}
                                      />
                                      <button className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Mic className="w-4 h-4" />
                                      </button>
                                    </Box>
                                  </Box>
                                ))}

                                {/* Add clause button */}
                                <Button
                                  variant="bordered"
                                  size="sm"
                                  onClick={() => addCustomClause(currentDoc)}
                                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-4"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Add clause
                                </Button>
                              </VStack>
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>

                    {/* RIGHT COLUMN: Use documents + Any other details */}
                    <Box className="flex-1 min-w-0">
                      <VStack spacing={6} align="start" className="w-full">
                        {/* Use your documents card */}
                        {!loadingDocuments[currentDoc] && (
                          <Box className="w-full overflow-hidden">
                            {/* Purple-outlined container for file list */}
                            <Box className="border-2 border-purple-400 rounded-2xl p-4 bg-white mb-4 overflow-hidden max-w-[379px]">
                              <VStack spacing={3} align="start" className="w-full">
                                {/* Header with title and column headers */}
                                <Flex align="center" justify="between" className="w-full px-2 mb-2">
                                  <Text size="md" className="font-semibold text-gray-900 flex-1">Use your documents</Text>
                                  <Flex align="center" gap={8} className="text-xs">
                                    {/* Use as template - with tooltip */}
                                    <Box className="w-24 relative">
                                      <button
                                        className="w-full text-center font-medium text-black underline cursor-pointer hover:text-gray-700"
                                        onMouseEnter={() => setShowTooltip('template')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'template' ? null : 'template')}
                                      >
                                        Use as template
                                      </button>
                                      {showTooltip === 'template' && (
                                        <Box className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                                          <Box className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg whitespace-nowrap text-xs">
                                            This document becomes your starting template
                                            {/* Arrow pointing down */}
                                            <Box className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-purple-600"></div>
                                            </Box>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>

                                    {/* Use as information - with tooltip */}
                                    <Box className="w-24 relative">
                                      <button
                                        className="w-full text-center font-medium text-black underline cursor-pointer hover:text-gray-700"
                                        onMouseEnter={() => setShowTooltip('information')}
                                        onMouseLeave={() => setShowTooltip(null)}
                                        onClick={() => setShowTooltip(showTooltip === 'information' ? null : 'information')}
                                      >
                                        Use as information
                                      </button>
                                      {showTooltip === 'information' && (
                                        <Box className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                                          <Box className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg whitespace-nowrap text-xs">
                                            Genie will factor this information in when creating your document
                                            {/* Arrow pointing down */}
                                            <Box className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-purple-600"></div>
                                            </Box>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>
                                  </Flex>
                                </Flex>

                                {/* File rows */}
                                {[`${currentDoc}_document_type_1`, `${currentDoc}_document_type_2`].map((docName, rowIndex) => (
                                  <Flex key={rowIndex} align="center" justify="between" className="w-full py-2 px-2">
                                    <Text size="sm" className="flex-1 text-gray-900 truncate">{docName}.docx</Text>
                                    <Flex align="center" gap={8}>
                                      <Box className="w-24 flex justify-center">
                                        <input
                                          type="checkbox"
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              onGenerateDocument?.(currentDoc)
                                            }
                                          }}
                                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                        />
                                      </Box>
                                      <Box className="w-24 flex justify-center">
                                        <input
                                          type="checkbox"
                                          defaultChecked
                                          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                        />
                                      </Box>
                                    </Flex>
                                  </Flex>
                                ))}
                              </VStack>
                            </Box>

                            {/* Upload documents button */}
                            <Button
                              variant="bordered"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-4"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload documents
                            </Button>
                          </Box>
                        )}

                        {loadingDocuments[currentDoc] && <DocumentLibraryLoading />}

                        {/* Any other details to include */}
                        <Box className="w-full mt-12 overflow-hidden">
                          <Text size="md" className="font-semibold text-gray-900 mb-2">Any other details to include?</Text>

                          {/* Example suggestions */}
                          <Box className="mb-4">
                            <Text size="xs" className="text-gray-500 mb-1">Eg.</Text>
                            <VStack spacing={1} align="start">
                              {generateDetailSuggestions(currentDoc).map((suggestion, i) => (
                                <Text key={i} size="xs" className="text-gray-500">
                                  {i + 1}. {suggestion}
                                </Text>
                              ))}
                            </VStack>
                          </Box>

                          {/* Textarea with mic icon */}
                          <Box className="relative">
                            <Textarea
                              minRows={6}
                              value={selectedExistingInputs[`document-details-${currentDoc}`] || ''}
                              onValueChange={(val) => setSelectedExistingInputs({...selectedExistingInputs, [`document-details-${currentDoc}`]: val})}
                              placeholder=""
                              className="w-full"
                              classNames={{
                                inputWrapper: 'rounded-2xl border border-gray-200 bg-white',
                                input: 'text-gray-900 placeholder:text-gray-400 pr-12',
                              }}
                            />
                            <button className="absolute bottom-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                              <Mic className="w-5 h-5" />
                            </button>
                          </Box>
                        </Box>
                      </VStack>
                    </Box>
                  </Box>
                  )}

                </Box>
                )
              })()}

              {/* Show message if no documents selected */}
              {!Object.values(selectedDocs).some(v => v) && (
                <Box className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                  <Text size="md" className="text-gray-500">
                    Select documents above to configure them here.
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        )}

      </VStack>
    </Box>
  )
}
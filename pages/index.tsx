import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Flex,
  VStack,
  Container,
  Button,
  Heading,
  Text,
  Textarea,
  Replybox,
} from '@/genie-ui'
import {
  Wand2,
  Paperclip,
  ArrowUp,
  FileText,
  Plus,
} from 'lucide-react'
import { handleIntentStep, UserIntent, getFollowUpQuestion } from '@/agent/intentStep'
import { PlanningStage } from '@/components/PlanningStage'
import { DocumentPlan, generateDocumentPlanSections, DocumentPlanSection } from '@/components/DocumentPlan'
import { KeyClausesPrompt } from '@/components/KeyClausesPrompt'
import { KeyClausesOverview } from '@/components/KeyClausesOverview'
import { KeyClausesDetail } from '@/components/KeyClausesDetail'
import { getKeyClausesForDocumentType, KeyClause } from '@/utils/keyClausesData'
import { getKeyClausesDetailForDocumentType, ClauseDetail } from '@/utils/keyClausesDetailData'

// Message type definition
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system' | 'document-plan'
  content: string
  timestamp: number
  documentType?: string
  planSections?: DocumentPlanSection[]
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<'landing' | 'chat' | 'document'>('landing')

  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([])
  const [chatTitle, setChatTitle] = useState('Chat')
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingIntent, setThinkingIntent] = useState<UserIntent | null>(null)
  
  // Planning stage state
  const [planningData, setPlanningData] = useState<{intent: UserIntent, timestamp: number} | null>(null)
  
  // Document plan state
  const [isCreatingPlan, setIsCreatingPlan] = useState(false)
  const [documentPlanData, setDocumentPlanData] = useState<{documentType: string, timestamp: number, userAnswer?: string} | null>(null)
  const [waitingForFollowUp, setWaitingForFollowUp] = useState(false)
  
  // Key clauses prompt state
  const [keyClausesPromptData, setKeyClausesPromptData] = useState<{timestamp: number} | null>(null)
  const [waitingForKeyClausesSelection, setWaitingForKeyClausesSelection] = useState(false)
  
  // Key clauses overview state
  const [keyClausesOverviewData, setKeyClausesOverviewData] = useState<{clauses: KeyClause[], documentType: string, timestamp: number} | null>(null)
  
  // Key clauses detail state
  const [keyClausesDetailData, setKeyClausesDetailData] = useState<{clauses: ClauseDetail[], documentType: string, timestamp: number} | null>(null)
  
  // Document processing state
  const [isProcessingDocument, setIsProcessingDocument] = useState(false)
  const [currentProcessingSection, setCurrentProcessingSection] = useState<string | null>(null)
  const [planSections, setPlanSections] = useState<DocumentPlanSection[]>([])
  
  // Created documents state
  const [createdDocuments, setCreatedDocuments] = useState<Array<{
    id: string
    name: string
    type: string
    content: string
    timestamp: number
  }>>([])

  // Sequential message counter for dynamic IDs
  const [messageCounter, setMessageCounter] = useState(0)
  const [workbenchOpen, setWorkbenchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'context' | 'rules'>('documents')
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, planningData, keyClausesPromptData, keyClausesOverviewData, keyClausesDetailData, documentPlanData])

  // Message helper functions
  const addMessage = useCallback((role: 'user' | 'assistant' | 'system', content: string) => {
    const id = `${role}-${messageCounter}`
    const newMessage: Message = {
      id,
      role,
      content,
      timestamp: Date.now()
    }

    setMessages(prev => {
      // Check if message with this ID already exists
      if (prev.some(msg => msg.id === id)) {
        return prev
      }
      return [...prev, newMessage]
    })

    setMessageCounter(prev => prev + 1)
  }, [messageCounter])

  // Generate chat title from user intent
  const generateChatTitle = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim()

    // Handle common patterns like "I want to..." or "I need to..."
    if (message.startsWith('i want to ')) {
      return userMessage.substring(10).replace(/^./, c => c.toUpperCase())
    }
    if (message.startsWith('i need to ')) {
      return userMessage.substring(10).replace(/^./, c => c.toUpperCase())
    }
    if (message.startsWith('i am ') || message.startsWith('i\'m ')) {
      const start = message.startsWith('i am ') ? 5 : 4
      return userMessage.substring(start).replace(/^./, c => c.toUpperCase())
    }
    if (message.startsWith('help me ')) {
      return userMessage.substring(8).replace(/^./, c => c.toUpperCase())
    }
    if (message.startsWith('create ')) {
      return 'Creating ' + userMessage.substring(7).toLowerCase()
    }
    if (message.startsWith('draft ')) {
      return 'Drafting ' + userMessage.substring(6).toLowerCase()
    }

    // Default: take first few words and capitalize
    const words = userMessage.split(' ').slice(0, 4).join(' ')
    return words.length > 50 ? words.substring(0, 47) + '...' : words.replace(/^./, c => c.toUpperCase())
  }

  // Handle message sending
  const handleSendMessage = async (messageContent: string, skipUserMessage = false) => {
    if (!messageContent.trim()) return

    // Add user message only if not skipping (to avoid duplicates from landing page)
    if (!skipUserMessage) {
      addMessage('user', messageContent)
    }

    // Check if we're waiting for a follow-up response after planning stage
    if (waitingForFollowUp && planningData?.intent === 'create') {
      // User just answered the follow-up question
      setWaitingForFollowUp(false)
      
      // Extract document type from the FIRST user message (not the follow-up response)
      const firstUserMessage = messages.find(msg => msg.role === 'user')
      const documentType = extractDocumentType(firstUserMessage?.content || messageContent)
      
      // Show confirmation message
      addMessage('system', `Great - let's create your ${documentType}`)
      
      // Show key clauses prompt
      setKeyClausesPromptData({ timestamp: Date.now() })
      setWaitingForKeyClausesSelection(true)
      
      return
    }

    // Callback to show planning stage after thinking completes
    const handlePlanningReady = (intent: UserIntent) => {
      setPlanningData({ intent, timestamp: Date.now() })
      setThinkingIntent(null) // Clear thinking intent when planning is ready
      // Set flag to wait for follow-up response
      if (intent === 'create') {
        setWaitingForFollowUp(true)
      }
    }

    // Wrapper for setIsThinking that also sets the intent
    const setThinkingWithIntent = (isThinking: boolean, intent?: UserIntent) => {
      setIsThinking(isThinking)
      if (isThinking && intent) {
        setThinkingIntent(intent)
      } else if (!isThinking) {
        setThinkingIntent(null)
      }
    }

    // If this is the first message from landing page (skipUserMessage = true),
    // use the intent step workflow
    if (skipUserMessage) {
      // Detect intent first
      const { detectIntent } = await import('@/agent/intentStep')
      const detectionResult = detectIntent(messageContent)
      
      // Run the intent detection workflow with intent pre-detection
      await handleIntentStep(
        messageContent, 
        addMessage, 
        (isThinking) => setThinkingWithIntent(isThinking, detectionResult.intent), 
        handlePlanningReady
      )
      return
    }

    // For subsequent messages, also run intent step
    const { detectIntent } = await import('@/agent/intentStep')
    const detectionResult = detectIntent(messageContent)
    
    await handleIntentStep(
      messageContent, 
      addMessage, 
      (isThinking) => setThinkingWithIntent(isThinking, detectionResult.intent), 
      handlePlanningReady
    )
  }
  
  // Handler for key clauses option selection
  const handleKeyClausesSelection = async (option: 'customise' | 'overview' | 'skip') => {
    console.log('User selected key clauses option:', option)
    
    // Clear the waiting state
    setWaitingForKeyClausesSelection(false)
    
    // Extract document type from the FIRST user message
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    const userAnswerMessage = messages.filter(msg => msg.role === 'user')[1] // Second user message is the answer
    const documentType = extractDocumentType(firstUserMessage?.content || '')
    
    if (option === 'customise') {
      // Show detailed editable view of key clauses
      const clauses = getKeyClausesDetailForDocumentType(documentType)
      setKeyClausesDetailData({ clauses, documentType, timestamp: Date.now() })
      // Don't proceed to plan yet - wait for user to click "Next"
      return
    }
    
    if (option === 'overview') {
      // Show overview of key clauses (will stay on screen)
      const clauses = getKeyClausesForDocumentType(documentType)
      setKeyClausesOverviewData({ clauses, documentType, timestamp: Date.now() })
    }
    
    // Proceed to document plan (for skip and overview options)
    // Show thinking animation for document plan creation
    setIsCreatingPlan(true)
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Hide thinking animation
    setIsCreatingPlan(false)
    
    // Show document plan and initialize sections (will appear below overview if overview was shown)
    const sections = generateDocumentPlanSections(documentType)
    setPlanSections(sections)
    setDocumentPlanData({ documentType, timestamp: Date.now(), userAnswer: userAnswerMessage?.content || '' })
  }
  
  // Handler for when user clicks "Next" in detail view
  const handleKeyClausesDetailNext = async () => {
    console.log('User clicked Next in key clauses detail view')
    
    // Extract document type and user answer
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    const userAnswerMessage = messages.filter(msg => msg.role === 'user')[1]
    const documentType = extractDocumentType(firstUserMessage?.content || '')
    
    // Proceed to document plan
    // Show thinking animation for document plan creation
    setIsCreatingPlan(true)
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Hide thinking animation
    setIsCreatingPlan(false)
    
    // Show document plan and initialize sections
    const sections = generateDocumentPlanSections(documentType)
    setPlanSections(sections)
    setDocumentPlanData({ documentType, timestamp: Date.now(), userAnswer: userAnswerMessage?.content || '' })
  }
  
  // Helper function to extract document type from user message
  const extractDocumentType = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    
    // Common document types
    if (lowerMessage.includes('employment') || lowerMessage.includes('hire') || lowerMessage.includes('employee')) {
      return 'Employment Agreement'
    }
    if (lowerMessage.includes('nda') || lowerMessage.includes('non-disclosure') || lowerMessage.includes('confidential')) {
      return 'Non-Disclosure Agreement'
    }
    if (lowerMessage.includes('service') || lowerMessage.includes('contractor')) {
      return 'Service Agreement'
    }
    if (lowerMessage.includes('purchase') || lowerMessage.includes('sale')) {
      return 'Purchase Agreement'
    }
    if (lowerMessage.includes('contract')) {
      return 'Contract'
    }
    
    // Default
    return 'Document'
  }
  
  // Handle document creation with sequential processing
  const handleCreateDocument = async () => {
    if (!documentPlanData) return
    
    setIsProcessingDocument(true)
    const sections = [...planSections]
    
    // Process each section sequentially
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      
      // Set current processing section (show thinking text)
      setCurrentProcessingSection(section.id)
      
      // Random delay between 2-5 seconds
      const delay = Math.random() * 3000 + 2000 // 2000-5000ms
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // After processing is done, tick off THIS section
      sections[i] = { ...sections[i], checked: true }
      setPlanSections([...sections])
      
      // Small delay to ensure the tick is visible before moving to next section
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    // Clear processing state
    setCurrentProcessingSection(null)
    setIsProcessingDocument(false)
    
    // Create the document
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: `${documentPlanData.documentType}.docx`,
      type: documentPlanData.documentType,
      content: generateDocumentContent(documentPlanData.documentType),
      timestamp: Date.now()
    }
    
    setCreatedDocuments(prev => [...prev, newDocument])
    
    // Switch to Documents tab
    setActiveTab('documents')
    
    // Generate success message with summary
    const userAnswer = documentPlanData.userAnswer || ''
    const summary = generateDocumentSummary(documentPlanData.documentType, userAnswer)
    
    // Add success message
    addMessage('system', `✅ ${summary}\n\nDo you want to save this as a new template?`)
  }
  
  // Generate document summary for success message
  const generateDocumentSummary = (docType: string, userAnswer: string): string => {
    const lowerAnswer = userAnswer.toLowerCase()
    
    // Extract key intent from user's answer
    let focus = 'tailored to your needs'
    
    if (lowerAnswer.includes('protect') || lowerAnswer.includes('confidential') || lowerAnswer.includes('secret')) {
      focus = 'focused on protecting confidential information'
    } else if (lowerAnswer.includes('hire') || lowerAnswer.includes('employee') || lowerAnswer.includes('team')) {
      focus = 'designed to streamline your hiring process'
    } else if (lowerAnswer.includes('clear') || lowerAnswer.includes('simple') || lowerAnswer.includes('straightforward')) {
      focus = 'with clear and simple terms'
    } else if (lowerAnswer.includes('comprehensive') || lowerAnswer.includes('detailed') || lowerAnswer.includes('thorough')) {
      focus = 'with comprehensive coverage of all key terms'
    } else if (lowerAnswer.includes('flexible') || lowerAnswer.includes('balanced')) {
      focus = 'with balanced and flexible terms'
    } else if (userAnswer.length > 20) {
      // Extract a short phrase from their answer
      const words = userAnswer.split(' ').slice(0, 8).join(' ')
      focus = `focused on ${words.toLowerCase()}${userAnswer.split(' ').length > 8 ? '...' : ''}`
    }
    
    return `We've created your ${docType} that is ${focus}.`
  }
  
  // Generate dummy document content based on type
  const generateDocumentContent = (docType: string): string => {
    const lowerType = docType.toLowerCase()
    
    if (lowerType.includes('employment')) {
      return `This Employment Agreement is entered into between [COMPANY NAME] and [EMPLOYEE NAME].

1. POSITION AND DUTIES
Employee shall serve as [JOB TITLE] and perform duties including:
- [DUTY 1]
- [DUTY 2]
- [DUTY 3]

2. COMPENSATION
Base salary: $[AMOUNT] per year
Benefits: Health insurance, dental, vision
Vacation: [NUMBER] days per year

3. EMPLOYMENT TERMS
Start date: [DATE]
Employment is at-will and may be terminated by either party

4. CONFIDENTIALITY
Employee agrees to maintain confidentiality of company information

5. GOVERNING LAW
This agreement shall be governed by [STATE] law.

[COMPANY NAME]
By: _______________
Name: [NAME]
Title: [TITLE]

EMPLOYEE
By: _______________
Name: [EMPLOYEE NAME]`
    }
    
    if (lowerType.includes('nda') || lowerType.includes('confidential')) {
      return `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement is entered into on [DATE] between:

Disclosing Party: [PARTY A]
Receiving Party: [PARTY B]

1. CONFIDENTIAL INFORMATION
The parties may disclose proprietary information including business plans, financial data, and technical specifications.

2. OBLIGATIONS
The Receiving Party agrees to:
- Maintain strict confidentiality
- Use information only for authorized purposes
- Not disclose to third parties

3. TERM
This agreement shall remain in effect for [NUMBER] years from the date of signing.

4. RETURN OF MATERIALS
Upon request, all confidential materials shall be returned or destroyed.

5. GOVERNING LAW
This agreement shall be governed by [STATE] law.

DISCLOSING PARTY
By: _______________
Name: [NAME]
Date: [DATE]

RECEIVING PARTY  
By: _______________
Name: [NAME]
Date: [DATE]`
    }
    
    if (lowerType.includes('service')) {
      return `SERVICE AGREEMENT

This Service Agreement is entered into between:

Client: [CLIENT NAME]
Service Provider: [PROVIDER NAME]

1. SERVICES
Provider agrees to perform the following services:
- [SERVICE 1]
- [SERVICE 2]
- [SERVICE 3]

2. COMPENSATION
Fees: $[AMOUNT]
Payment terms: [TERMS]

3. TERM
Start date: [DATE]
Duration: [PERIOD]

4. DELIVERABLES
Provider shall deliver:
- [DELIVERABLE 1]
- [DELIVERABLE 2]

5. INTELLECTUAL PROPERTY
All work product shall be owned by [PARTY].

6. TERMINATION
Either party may terminate with [NUMBER] days notice.

CLIENT
By: _______________
Name: [NAME]

SERVICE PROVIDER
By: _______________
Name: [NAME]`
    }
    
    // Default document
    return `${docType.toUpperCase()}

This ${docType} is entered into on [DATE] between the parties.

1. PURPOSE
This document establishes the terms and conditions of the agreement between the parties.

2. TERMS
[Insert specific terms here]

3. OBLIGATIONS
Each party agrees to fulfill their respective obligations as outlined herein.

4. GOVERNING LAW
This agreement shall be governed by applicable law.

PARTY A
By: _______________
Name: [NAME]

PARTY B
By: _______________
Name: [NAME]`
  }


  return (
    <Box className="min-h-screen bg-white">
      <Box className="h-screen">
        {mode === 'landing' && (
            <div className="bg-gradient-to-b from-white to-zinc-50 min-h-screen">
              <Container maxWidth="lg" className="py-12">
                <VStack spacing={12} align="center">
                  <VStack spacing={6} align="center">
                    <div>
                      <Wand2 className="w-12 h-12 text-purple-600" />
                    </div>
                    <VStack spacing={3} align="center">
                      <Heading as="h1" size="2xl" className="text-center font-bold text-gray-900">
                        What kind of document(s) do you need?
                      </Heading>
                      <Text size="lg" className="text-center text-gray-600 max-w-2xl">
                        Type what you need and we&apos;ll create your legal documents in seconds. 
                        No templates, no setup—just describe what you want.
                      </Text>
                    </VStack>
                  </VStack>

                  <Box className="relative w-full max-w-3xl">
                    <Box className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-purple-200/40 to-purple-300/30 blur-2xl pointer-events-none" />
                    <div>
                      <Box className="relative rounded-[24px] bg-white/80 backdrop-blur border border-purple-100 shadow-lg">
                        <Box className="p-6">
                          <Textarea
                            minRows={5}
                            value={prompt}
                            onValueChange={(val) => setPrompt(val)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (prompt.trim()) {
                                  // Add initial user message and get AI response
                                  addMessage('user', prompt)
                                  // Set chat title based on user intent
                                  setChatTitle(generateChatTitle(prompt))
                                  handleSendMessage(prompt, true) // Skip adding user message again
                                  setMode('chat')
                                  setWorkbenchOpen(true)
                                  // Clear the prompt since it's now in chat
                                  setPrompt('')
                                }
                              }
                            }}
                            placeholder={
                              'E.g.,\n"Hire a Sales person"\n"Apply for investment funding"\n"Review this NDA against my template & playbook"'
                            }
                            classNames={{
                              inputWrapper: 'rounded-2xl',
                              input: 'text-foreground-900',
                            }}
                          />

                          <Flex justify="between" align="center" className="mt-4">
                            <Flex gap={2}>
                              <Button variant="light" size="sm" className="text-gray-500 hover:text-purple-600">
                                <Paperclip className="w-4 h-4 mr-2" />
                                Attach
                              </Button>
                            </Flex>
                            <Button
                              variant="solid"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onPress={() => {
                                if (prompt.trim()) {
                                  // Add initial user message and get AI response
                                  addMessage('user', prompt)
                                  // Set chat title based on user intent
                                  setChatTitle(generateChatTitle(prompt))
                                  handleSendMessage(prompt, true) // Skip adding user message again
                                  setMode('chat')
                                  setWorkbenchOpen(true)
                                  // Clear the prompt since it's now in chat
                                  setPrompt('')
                                }
                              }}
                            >
                              <ArrowUp className="w-4 h-4" />
                            </Button>
                          </Flex>
                        </Box>
                      </Box>
                    </div>
                  </Box>
                </VStack>
              </Container>
            </div>
          )}

          {mode === 'chat' && (
            <div
              className="grid h-screen bg-white"
              style={{ 
                gridTemplateColumns: workbenchOpen ? '1fr 3fr 2fr' : '1fr 5fr'
              }}
            >
              {/* Left Sidebar */}
              <Box className="bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden">
                <Box className="p-4 border-b border-gray-200">
                  <Text size="lg" className="font-semibold text-gray-900">GENIE AI</Text>
                  <Text size="sm" className="text-gray-500">New Project</Text>
                </Box>
                <Box className="flex-1 p-4 overflow-auto">
                  <VStack spacing={2} align="start">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                      <Plus className="w-4 h-4" />
                      <Text size="sm">New Task</Text>
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <Text size="sm">Vaults</Text>
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <Text size="sm">Templates</Text>
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                      <FileText className="w-4 h-4" />
                      <Text size="sm">Projects</Text>
                    </button>
                  </VStack>
                  
                  <Box className="mt-6">
                    <Text size="sm" className="text-gray-500 mb-2">Recent Projects</Text>
                    <VStack spacing={1} align="start">
                      {['New Project', 'Setting up business', 'Procuring raw materials', 'Renewal of MSA', 'Supplier onboarding', 'Project 5'].map((project, i) => (
                        <button key={i} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
                          <Text size="sm" className={i === 0 ? "text-blue-600 font-medium" : "text-gray-700"}>{project}</Text>
                        </button>
                      ))}
                    </VStack>
                  </Box>
                </Box>
                <Box className="p-4 border-t border-gray-200">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-3">
                    <Text size="sm">⚙️ Settings & members</Text>
                  </button>
                  <Text size="xs" className="text-purple-600 mt-2">🔮 2 docs left for this month</Text>
                </Box>
              </Box>

              {/* Chat interface */}
              <Box className="flex flex-col bg-white h-screen">
                <Box className="h-full flex justify-center">
                  <Box className="w-full flex flex-col h-full relative max-w-4xl">
                    {/* Chat header */}
                    <Box className="p-4 bg-white border-b border-gray-200">
                      <Flex align="center" justify="between">
                        <Text size="lg" className="font-semibold text-gray-900">{chatTitle}</Text>
                      </Flex>
                    </Box>

                    <div className="flex-1 flex flex-col min-h-0 relative">
                      {/* Chat messages */}
                      <Box className="flex-1 overflow-y-auto p-4 min-h-0">
                        <VStack spacing={6} align="start" className="w-full">
                          {messages.map((message, index) => {
                            const planningAfterThis = planningData && 
                              message.timestamp <= planningData.timestamp && 
                              (index === messages.length - 1 || messages[index + 1].timestamp > planningData.timestamp)
                            
                            const keyClausesPromptAfterThis = keyClausesPromptData && 
                              message.timestamp <= keyClausesPromptData.timestamp && 
                              (index === messages.length - 1 || messages[index + 1].timestamp > keyClausesPromptData.timestamp)
                            
                            const keyClausesOverviewAfterThis = keyClausesOverviewData && 
                              message.timestamp <= keyClausesOverviewData.timestamp && 
                              (index === messages.length - 1 || messages[index + 1].timestamp > keyClausesOverviewData.timestamp)
                            
                            const keyClausesDetailAfterThis = keyClausesDetailData && 
                              message.timestamp <= keyClausesDetailData.timestamp && 
                              (index === messages.length - 1 || messages[index + 1].timestamp > keyClausesDetailData.timestamp)
                            
                            const documentPlanAfterThis = documentPlanData && 
                              message.timestamp <= documentPlanData.timestamp && 
                              (index === messages.length - 1 || messages[index + 1].timestamp > documentPlanData.timestamp)
                            
                            return (
                              <React.Fragment key={message.id}>
                                <Box className="w-full">
                                  <Box className={`w-full flex gap-3 ${message.role === 'user' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                                    {/* Avatar/Icon area */}
                                    <Box className="flex-shrink-0">
                                      {message.role === 'user' ? (
                                        <Box className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                          <Text size="sm" className="text-white font-medium">R</Text>
                                        </Box>
                                      ) : (
                                        <Box className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                          <Wand2 className="w-4 h-4 text-purple-600" />
                                        </Box>
                                      )}
                                    </Box>

                                    {/* Message content */}
                                    <Box className="flex-shrink-0 max-w-md">
                                      {message.role === 'system' ? (
                                        // System messages: plain black text, no bubble
                                        <Box className="py-2">
                                          <Text size="sm" className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                          </Text>
                                          
                                          {/* Thinking animation - show below the last system message */}
                                          {index === messages.length - 1 && isThinking && (
                                            <Box className="mt-3">
                                              <style jsx>{`
                                                @keyframes colorFade {
                                                  0%, 100% { color: rgb(147, 51, 234); }
                                                  50% { color: rgb(0, 0, 0); }
                                                }
                                                .thinking-text {
                                                  animation: colorFade 2s ease-in-out infinite;
                                                }
                                              `}</style>
                                              <Text size="sm" className="thinking-text font-medium">
                                                Looking for your documents
                                              </Text>
                                              
                                              {/* Show button for create flow only */}
                                              {thinkingIntent === 'create' && (
                                                <Box className="mt-4">
                                                  <Text size="sm" className="text-gray-600 mb-2">
                                                    Want something simple?
                                                  </Text>
                                                  <button 
                                                    className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all border-gray-300 bg-white text-gray-900 hover:border-purple-400 hover:shadow-sm"
                                                    onClick={() => console.log('Quick standard doc clicked')}
                                                  >
                                                    <span className="flex-shrink-0">
                                                      <FileText className="w-4 h-4" />
                                                    </span>
                                                    <span className="font-medium">Create a quick standard doc</span>
                                                  </button>
                                                </Box>
                                              )}
                                            </Box>
                                          )}
                                          
                                          {/* Document plan creation thinking animation */}
                                          {index === messages.length - 1 && isCreatingPlan && (
                                            <Box className="mt-3">
                                              <style jsx>{`
                                                @keyframes colorFade {
                                                  0%, 100% { color: rgb(147, 51, 234); }
                                                  50% { color: rgb(0, 0, 0); }
                                                }
                                                .thinking-text {
                                                  animation: colorFade 2s ease-in-out infinite;
                                                }
                                              `}</style>
                                              <Text size="sm" className="thinking-text font-medium">
                                                Creating document plan...
                                              </Text>
                                            </Box>
                                          )}
                                        </Box>
                                      ) : (
                                        // User and assistant messages: keep bubble styling
                                        <Box
                                          className={`p-4 rounded-2xl inline-block ${
                                            message.role === 'user'
                                              ? 'bg-gray-100 text-gray-900'
                                              : 'bg-[#F9F5FE] text-gray-900'
                                          }`}
                                        >
                                          <Text size="sm" className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                            {message.content}
                                          </Text>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </Box>
                                
                                {/* Planning Stage - appears after the right message chronologically */}
                                {planningAfterThis && planningData.intent !== 'unknown' && (
                                  <>
                                    <Box className="w-full">
                                      <PlanningStage intent={planningData.intent} />
                                    </Box>
                                    
                                    {/* Follow-up question system message */}
                                    <Box className="w-full mt-1">
                                      <Box className="w-full flex gap-3 justify-start">
                                        {/* Avatar/Icon area */}
                                        <Box className="flex-shrink-0">
                                          <Box className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                            <Wand2 className="w-4 h-4 text-purple-600" />
                                          </Box>
                                        </Box>

                                        {/* Message content */}
                                        <Box className="flex-shrink-0 max-w-md">
                                          <Box className="py-2">
                                            <Text size="sm" className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                              {getFollowUpQuestion(planningData.intent)}
                                            </Text>
                                          </Box>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </>
                                )}
                                
                                {/* Key Clauses Prompt - appears after "Great - let's create your [doc]" message */}
                                {keyClausesPromptAfterThis && !isCreatingPlan && !keyClausesOverviewData && !keyClausesDetailData && !documentPlanData && (
                                  <Box className="w-full">
                                    <KeyClausesPrompt onOptionSelect={handleKeyClausesSelection} />
                                  </Box>
                                )}
                                
                                {/* Key Clauses Overview - appears if user selects "Give me an overview" and stays visible */}
                                {keyClausesOverviewAfterThis && !isCreatingPlan && (
                                  <Box className="w-full">
                                    <KeyClausesOverview 
                                      clauses={keyClausesOverviewData.clauses} 
                                      documentType={keyClausesOverviewData.documentType}
                                    />
                                  </Box>
                                )}
                                
                                {/* Key Clauses Detail - appears if user selects "Customise in detail" */}
                                {keyClausesDetailAfterThis && !isCreatingPlan && !documentPlanData && (
                                  <Box className="w-full">
                                    <KeyClausesDetail 
                                      clauses={keyClausesDetailData.clauses} 
                                      documentType={keyClausesDetailData.documentType}
                                      onNext={handleKeyClausesDetailNext}
                                    />
                                  </Box>
                                )}
                                
                                {/* Document Plan - appears after key clauses selection (below overview if it exists) */}
                                {documentPlanAfterThis && !isCreatingPlan && (
                                  <Box className="w-full">
                                    <DocumentPlan
                                      documentType={documentPlanData.documentType}
                                      sections={planSections}
                                      onSectionsChange={setPlanSections}
                                      onCreateDocument={handleCreateDocument}
                                      isProcessing={isProcessingDocument}
                                      currentProcessingSection={currentProcessingSection}
                                    />
                                  </Box>
                                )}
                              </React.Fragment>
                            )
                          })}
                          
                          {/* Invisible element for auto-scroll */}
                          <div ref={messagesEndRef} />
                        </VStack>
                      </Box>

                      {/* Chat input - always visible */}
                      <Box className="flex-shrink-0 p-4 bg-white">
                        <Box className="w-full max-w-[600px] mx-auto">
                          <Replybox
                            handleSubmit={(message) => handleSendMessage(message)}
                            placeholder="Message Genie"
                            className="min-h-[44px]"
                            classNames={{
                              inputWrapper: 'border border-gray-300 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow',
                              input: 'px-4 py-3',
                            }}
                          />
                        </Box>
                      </Box>
                    </div>
                  </Box>
                </Box>
              </Box>


              {/* Right workbench panel */}
              {workbenchOpen && (
                <aside className="bg-white border-l border-gray-200 shadow-lg h-screen overflow-hidden">
                  <Box className="h-full flex flex-col">
                    {/* Tab Header */}
                    <Box className="border-b border-gray-100 px-6 pt-6 pb-4">
                      <Flex gap={6}>
                        <button 
                          className={`pb-3 text-sm font-medium transition-colors ${
                            activeTab === 'documents' 
                              ? 'text-gray-900 border-b-2 border-gray-900 relative' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setActiveTab('documents')}
                        >
                          Documents
                        </button>
                        <button 
                          className={`pb-3 text-sm font-medium transition-colors ${
                            activeTab === 'context' 
                              ? 'text-gray-900 border-b-2 border-gray-900 relative' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setActiveTab('context')}
                        >
                          Context
                        </button>
                        <button 
                          className={`pb-3 text-sm font-medium transition-colors ${
                            activeTab === 'rules' 
                              ? 'text-gray-900 border-b-2 border-gray-900 relative' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                          onClick={() => setActiveTab('rules')}
                        >
                          Rules
                        </button>
                      </Flex>
                    </Box>

                    {/* Content */}
                    <Box className="flex-1 p-6 overflow-y-auto h-0">
                      {activeTab === 'documents' && (
                        <VStack spacing={4} align="start" className="h-full">
                          {createdDocuments.length === 0 ? (
                            <Box className="w-full">
                              <Text size="lg" className="mb-4 text-gray-900 font-semibold">Documents:</Text>
                              <Text size="sm" className="text-gray-600">
                                Your documents will appear here.
                              </Text>
                            </Box>
                          ) : (
                            <Box className="w-full">
                              <Text size="lg" className="mb-4 text-gray-900 font-semibold">Documents</Text>
                              {createdDocuments.map((doc) => (
                                <VStack key={doc.id} spacing={3} align="start" className="w-full">
                                  {/* Document content - all white, full width */}
                                  <Box className="w-full border border-gray-200 rounded-lg p-6 bg-white max-h-[500px] overflow-y-auto">
                                    {/* Document header */}
                                    <Flex align="center" gap={3} className="mb-4">
                                      <FileText className="w-6 h-6 text-purple-600" />
                                      <Text size="md" className="font-semibold text-gray-900">
                                        {doc.name}
                                      </Text>
                                    </Flex>
                                    
                                    {/* Document content - full width */}
                                    <Text size="sm" className="text-gray-700 whitespace-pre-line">
                                      {doc.content}
                                    </Text>
                                  </Box>
                                  
                                  {/* Review button - below the document */}
                                  <Flex justify="end" className="w-full">
                                    <Button
                                      variant="solid"
                                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                      onPress={() => console.log('Review doc', doc.id)}
                                    >
                                      <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="16" 
                                        height="16" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        className="mr-2"
                                      >
                                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
                                        <path d="m15 5 4 4"/>
                                      </svg>
                                      Review and edit doc
                                    </Button>
                                  </Flex>
                                </VStack>
                              ))}
                            </Box>
                          )}
                        </VStack>
                      )}

                      {activeTab === 'context' && (
                        <VStack spacing={4} align="start" className="h-full">
                          {/* Additional Context Section - moved from Documents tab */}
                          <Box className="w-full">
                            <Text size="lg" className="!text-size-4 leading-3 tracking-2 mb-4 text-gray-900 font-semibold">Additional context:</Text>
                            <div className="flex items-center gap-3 py-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-4 h-4 text-blue-500" aria-hidden="true">
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                <path d="M10 9H8"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                              </svg>
                              <p className="font-normal !text-size-2 leading-1 tracking-4 text-gray-900">Previous_document_1.docx</p>
                            </div>
                            <div className="flex items-center gap-3 py-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text w-4 h-4 text-blue-500" aria-hidden="true">
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                                <path d="M10 9H8"></path>
                                <path d="M16 13H8"></path>
                                <path d="M16 17H8"></path>
                              </svg>
                              <p className="font-normal !text-size-2 leading-1 tracking-4 text-gray-900">Previous_document_2.docx</p>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <button type="button" tabIndex={0} data-react-aria-pressable="true" className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-small rounded-full [&amp;&gt;svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover bg-white border [&amp;[data-pressed=true]]:shadow-bordered !text-size-3 leading-3 tracking-1 font-weight-500 px-3 h-10 gap-1 [&amp;_svg]:w-5 [&amp;_svg]:h-5 min-w-fit hover:opacity-100 focus:opacity-100 flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">Search Vault</button>
                              <button type="button" tabIndex={0} data-react-aria-pressable="true" className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-small rounded-full [&amp;&gt;svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity motion-reduce:transition-none data-[hover=true]:opacity-hover bg-white border [&amp;[data-pressed=true]]:shadow-bordered !text-size-3 leading-3 tracking-1 font-weight-500 px-3 h-10 gap-1 [&amp;_svg]:w-5 [&amp;_svg]:h-5 min-w-fit hover:opacity-100 focus:opacity-100 flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">Upload</button>
                            </div>
                          </Box>
                        </VStack>
                      )}

                      {activeTab === 'rules' && (
                        <VStack spacing={4} align="start" className="h-full">
                          {/* Rules content placeholder */}
                          <Box className="w-full">
                            <Text size="lg" className="mb-4 text-gray-900 font-semibold">Rules and Guidelines:</Text>
                            <Text size="sm" className="text-gray-600">
                              Configure your document rules and guidelines here.
                            </Text>
                          </Box>
                        </VStack>
                      )}
                    </Box>
                  </Box>
                </aside>
              )}
            </div>
          )}

          {mode === 'document' && (
            <div>
              <Container maxWidth="2xl" className="py-8">
                <VStack spacing={6} align="start" className="w-full">
                  <Box className="w-full pb-4 border-b border-zinc-200">
                    <VStack spacing={2} align="start">
                      <Text size="sm" className="text-zinc-500">
                        Saved in / Legal Documents project 🔒 Private and secure
                      </Text>
                      <Heading as="h1" size="xl" className="text-purple-600">
                        Legal Document (19 August 2025) v1
                      </Heading>
                    </VStack>
                  </Box>

                  <Box className="w-full bg-white rounded-2xl border border-zinc-200 shadow-sm min-h-[70vh]">
                    <Box className="p-8">
                      <VStack spacing={6} align="start" className="w-full max-w-4xl">
                        <Text size="lg" className="leading-relaxed">
                          This Agreement is made on the <span className="bg-yellow-200 px-2 py-1 rounded">[DATE]</span> day of <span className="bg-yellow-200 px-2 py-1 rounded">[MONTH]</span> <span className="bg-yellow-200 px-2 py-1 rounded">[YEAR]</span>
                        </Text>
                        <Text size="lg" className="leading-relaxed">
                          Document content for: Legal Document
                        </Text>
                      </VStack>
                    </Box>
                  </Box>
                </VStack>
              </Container>
            </div>
          )}
      </Box>
    </Box>
  )
}

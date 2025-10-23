import { useState, useCallback } from 'react'
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
import { handleIntentStep } from '@/agent/intentStep'

// Message type definition
type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<'landing' | 'chat' | 'document'>('landing')

  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([])
  const [chatTitle, setChatTitle] = useState('Chat')
  const [isThinking, setIsThinking] = useState(false)

  // Sequential message counter for dynamic IDs
  const [messageCounter, setMessageCounter] = useState(0)
  const [workbenchOpen, setWorkbenchOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'documents' | 'context' | 'rules'>('documents')

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

  // Generate welcome response based on user intent
  const generateWelcomeResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase().trim()

    // Extract the core intent to use in the response
    let intent = userMessage.toLowerCase()

    if (message.startsWith('i want to ')) {
      intent = userMessage.substring(10)
    } else if (message.startsWith('i need to ')) {
      intent = userMessage.substring(10)
    } else if (message.startsWith('help me ')) {
      intent = userMessage.substring(8)
    } else {
      // Use the first few words as the intent
      intent = userMessage.split(' ').slice(0, 6).join(' ').toLowerCase()
    }

    return `Sure, I can help you with ${intent}. How can I assist you today?`
  }

  // Handle message sending
  const handleSendMessage = async (messageContent: string, skipUserMessage = false) => {
    if (!messageContent.trim()) return

    // Add user message only if not skipping (to avoid duplicates from landing page)
    if (!skipUserMessage) {
      addMessage('user', messageContent)
    }

    // If this is the first message from landing page (skipUserMessage = true),
    // use the intent step workflow
    if (skipUserMessage) {
      // Run the intent detection workflow
      await handleIntentStep(messageContent, addMessage, setIsThinking)
      return
    }

    // For subsequent messages, also run intent step
    await handleIntentStep(messageContent, addMessage, setIsThinking)
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
                          {messages.map((message, index) => (
                            <Box key={message.id} className="w-full">
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
                                            🔍 Searching your documents and rules…
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
                          ))}
                        </VStack>
                      </Box>

                      {/* Chat input */}
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
                          <Box className="w-full">
                            <Text size="lg" className="mb-4 text-gray-900 font-semibold">Documents:</Text>
                            <Text size="sm" className="text-gray-600">
                              Your documents will appear here.
                            </Text>
                          </Box>
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

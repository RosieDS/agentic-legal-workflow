/**
 * Intent Detection Step for Agentic Legal Workflow
 * 
 * This module handles the first step of the agentic workflow:
 * 1. Detect user intent (create, review, or unknown)
 * 2. Reply back with detected intent
 * 3. Show "thinking" phase simulation
 * 
 * Future workflow steps (not implemented yet):
 * - Executing discovery plan (analyzing documents and rules)
 * - Populating project parameters
 * - Asking for missing information
 * - Presenting editable summary
 * - Confirming and executing the plan
 */

/**
 * Intent types that the system can detect
 */
export type UserIntent = 'create' | 'review' | 'unknown'

/**
 * Result of intent detection
 */
export interface IntentDetectionResult {
  intent: UserIntent
  confidence: 'high' | 'medium' | 'low'
  detectedKeywords: string[]
}

/**
 * Message type for the chat context
 */
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

/**
 * Callback function to add messages to the chat
 */
export type AddMessageCallback = (role: 'user' | 'assistant' | 'system', content: string) => void

/**
 * Detects the user's intent from their message
 * 
 * @param userMessage - The user's input message
 * @returns IntentDetectionResult with intent type, confidence, and detected keywords
 */
export function detectIntent(userMessage: string): IntentDetectionResult {
  const message = userMessage.toLowerCase().trim()
  
  // Keywords for "create" intent
  const createKeywords = [
    'create', 'draft', 'make', 'generate', 'write', 'prepare',
    'need', 'want', 'build', 'compose', 'produce'
  ]
  
  // Keywords for "review" intent
  const reviewKeywords = [
    'review', 'check', 'analyse', 'analyze', 'improve', 'revise',
    'look at', 'examine', 'assess', 'evaluate', 'audit'
  ]
  
  // Check for create intent
  const createMatches = createKeywords.filter(keyword => message.includes(keyword))
  const reviewMatches = reviewKeywords.filter(keyword => message.includes(keyword))
  
  // If both create and review keywords are present, prefer the one with more matches
  if (createMatches.length > 0 && reviewMatches.length > 0) {
    if (createMatches.length > reviewMatches.length) {
      return {
        intent: 'create',
        confidence: 'medium',
        detectedKeywords: createMatches
      }
    } else if (reviewMatches.length > createMatches.length) {
      return {
        intent: 'review',
        confidence: 'medium',
        detectedKeywords: reviewMatches
      }
    }
    // Equal matches - check which appears first
    const firstCreateIndex = Math.min(...createKeywords
      .map(k => message.indexOf(k))
      .filter(i => i >= 0))
    const firstReviewIndex = Math.min(...reviewKeywords
      .map(k => message.indexOf(k))
      .filter(i => i >= 0))
    
    if (firstCreateIndex < firstReviewIndex) {
      return {
        intent: 'create',
        confidence: 'low',
        detectedKeywords: createMatches
      }
    } else {
      return {
        intent: 'review',
        confidence: 'low',
        detectedKeywords: reviewMatches
      }
    }
  }
  
  // Only create keywords found
  if (createMatches.length > 0) {
    return {
      intent: 'create',
      confidence: createMatches.length >= 2 ? 'high' : 'medium',
      detectedKeywords: createMatches
    }
  }
  
  // Only review keywords found
  if (reviewMatches.length > 0) {
    return {
      intent: 'review',
      confidence: reviewMatches.length >= 2 ? 'high' : 'medium',
      detectedKeywords: reviewMatches
    }
  }
  
  // No clear intent detected
  return {
    intent: 'unknown',
    confidence: 'low',
    detectedKeywords: []
  }
}

/**
 * Generates a system message based on detected intent
 * 
 * @param intent - The detected user intent
 * @returns A friendly system message confirming the intent
 */
export function generateIntentMessage(intent: UserIntent): string {
  switch (intent) {
    case 'create':
      return "Got it — it sounds like you want to create a legal document."
    case 'review':
      return "Got it — it sounds like you want to review an existing document."
    case 'unknown':
      return "I'm not sure what you want to do yet. Can you tell me whether you'd like to create or review a document?"
    default:
      return "I'm processing your request..."
  }
}

/**
 * Generates the "thinking" phase message
 * 
 * @returns A message indicating the system is searching
 */
export function generateThinkingMessage(): string {
  return "🔍 Searching your documents and rules…"
}

/**
 * Main handler for the intent capture step
 * 
 * This function orchestrates the intent detection flow:
 * 1. Detects the intent from the user's message
 * 2. Immediately sends a system message with the detected intent
 * 3. Sets thinking state to true (for UI animation)
 * 4. After a delay, sets thinking state to false
 * 5. Returns the detection result for potential use by calling code
 * 
 * @param userMessage - The user's input message
 * @param addMessage - Callback function to add messages to the chat
 * @param setThinking - Callback function to set thinking state
 * @returns Promise<IntentDetectionResult> - The detected intent result
 * 
 * @example
 * ```typescript
 * const result = await handleIntentStep(
 *   "I want to create an NDA",
 *   (role, content) => setMessages(prev => [...prev, { role, content, id: generateId(), timestamp: Date.now() }]),
 *   (isThinking) => setIsThinking(isThinking)
 * )
 * console.log(result.intent) // "create"
 * ```
 */
export async function handleIntentStep(
  userMessage: string,
  addMessage: AddMessageCallback,
  setThinking: (isThinking: boolean) => void
): Promise<IntentDetectionResult> {
  // Step 1: Detect the intent
  const detectionResult = detectIntent(userMessage)
  
  // Step 2: Immediately send intent confirmation message
  const intentMessage = generateIntentMessage(detectionResult.intent)
  addMessage('system', intentMessage)
  
  // Step 3: Show thinking animation
  setThinking(true)
  
  // Step 4: Simulate "thinking" phase with a delay (2.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 2500))
  
  // Step 5: Hide thinking animation
  setThinking(false)
  
  // Return the detection result for potential future use
  return detectionResult
}

// ============================================
// FUTURE WORKFLOW STEPS (TO BE IMPLEMENTED)
// ============================================

/**
 * TODO: Step 2 - Discovery and Analysis
 * This step will:
 * - Search relevant documents in the user's vault
 * - Analyze applicable rules and guidelines
 * - Identify document templates that might be relevant
 * 
 * Function signature (not implemented):
 * export async function handleDiscoveryStep(
 *   intent: UserIntent,
 *   userMessage: string,
 *   chatContext: ChatMessage[]
 * ): Promise<DiscoveryResult>
 */

/**
 * TODO: Step 3 - Parameter Population
 * This step will:
 * - Identify required parameters (jurisdiction, document type, parties, etc.)
 * - Extract parameters from user message and context
 * - Determine which parameters are missing
 * 
 * Function signature (not implemented):
 * export async function handleParameterStep(
 *   intent: UserIntent,
 *   discoveryResult: DiscoveryResult
 * ): Promise<ParameterResult>
 */

/**
 * TODO: Step 4 - Information Gathering
 * This step will:
 * - Ask user for missing required information
 * - Validate provided information
 * - Suggest defaults where applicable
 * 
 * Function signature (not implemented):
 * export async function handleInformationGatheringStep(
 *   parameterResult: ParameterResult,
 *   addMessage: AddMessageCallback
 * ): Promise<CompleteParameters>
 */

/**
 * TODO: Step 5 - Summary Presentation
 * This step will:
 * - Generate an editable summary of the plan
 * - Present it to the user for review
 * - Allow user to make modifications
 * 
 * Function signature (not implemented):
 * export async function handleSummaryStep(
 *   completeParameters: CompleteParameters,
 *   addMessage: AddMessageCallback
 * ): Promise<ApprovedPlan>
 */

/**
 * TODO: Step 6 - Execution
 * This step will:
 * - Execute the approved plan
 * - Generate or review the document
 * - Present the final output to the user
 * 
 * Function signature (not implemented):
 * export async function handleExecutionStep(
 *   approvedPlan: ApprovedPlan,
 *   addMessage: AddMessageCallback
 * ): Promise<ExecutionResult>
 */


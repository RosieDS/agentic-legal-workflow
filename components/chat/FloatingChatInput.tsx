import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'

interface FloatingChatInputProps {
  onCommitToChat: () => void
}

/**
 * Floating chat button that shows a tooltip on hover and takes you back to chat on click
 * Anchored to bottom-right of the container
 */
export const FloatingChatInput: React.FC<FloatingChatInputProps> = ({
  onCommitToChat
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    onCommitToChat()
  }

  return (
    <div
      className="absolute bottom-6 right-6 z-50"
      data-floating-chat-button
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative">
        <button
          onClick={handleClick}
          className="flex items-center justify-center w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Chat to Genie"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        
        {/* Tooltip hint */}
        <div
          className={`
            absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-2 bg-gray-900 text-white text-sm 
            rounded-lg whitespace-nowrap transition-all duration-200
            ${isHovered
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-2 pointer-events-none'
            }
          `}
        >
          Chat to Genie
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
        </div>

        {/* Animated pulse effect when hovering */}
        <div
          className={`
            absolute inset-0 w-14 h-14 bg-purple-400 rounded-full -z-10
            transition-all duration-300
            ${isHovered
              ? 'scale-125 opacity-20 animate-pulse' 
              : 'scale-100 opacity-0'
            }
          `}
        />
      </div>
    </div>
  )
}

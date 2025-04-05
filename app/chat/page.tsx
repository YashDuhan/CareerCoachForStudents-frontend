"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, User, Bot, Briefcase, Sparkles, Clock, AlertCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import { motion, AnimatePresence } from "framer-motion"
import { askQuestion } from "@/api/services"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ResumeData {
  extractedText: string;
  timestamp: string;
}

// Replace the formatJsonResponse function with a direct JSON parser
const formatJsonResponse = (jsonResponse: any): string => {
  try {
    // Check for CareerAdvice structure
    if (jsonResponse.CareerAdvice && Array.isArray(jsonResponse.CareerAdvice)) {
      let result = "CareerAdvice:\n\n";
      
      jsonResponse.CareerAdvice.forEach((advice: any, index: number) => {
        result += `JobRole: "${advice.JobRole}"\n`;
        result += `Reason: "${advice.Reason}"\n\n`;
      });
      
      return result;
    }
    
    // For suggestions array, apply minimal formatting with colored keys
    if (jsonResponse.suggestions && Array.isArray(jsonResponse.suggestions)) {
      let result = "ResumeImprovementSuggestions:\n\n";
      
      jsonResponse.suggestions.forEach((suggestion: any, index: number) => {
        result += `Item ${index + 1}:\n`;
        result += `Action: ${suggestion.action}\n`;
        result += `Suggestion: ${suggestion.description}\n\n`;
      });
      
      return result;
    }
    
    // For other JSON responses
    if (typeof jsonResponse === 'object' && jsonResponse !== null) {
      // Convert the object to a pretty-printed string with indentation
      const formattedJson = JSON.stringify(jsonResponse, null, 2);
      
      // Simple string replacement to highlight structure
      return formattedJson
        .replace(/"([^"]+)":/g, '$1:') // Remove quotes around keys
        .replace(/\n/g, '\n') // Keep newlines
        .replace(/  /g, '  '); // Keep indentation
    }
    
    // Fallback
    return String(jsonResponse);
  } catch (error) {
    console.error("Error formatting JSON:", error);
    return String(jsonResponse);
  }
};

// Update the formatMessageContent function to apply minimal styling
const formatMessageContent = (content: string): string => {
  // First, check if the content is a CareerAdvice JSON structure
  if (content.includes('CareerAdvice') && content.includes('JobRole') && content.includes('Reason')) {
    // Remove or hide the curly braces
    content = content.replace(/^\{/g, '') // Remove opening curly brace at start
             .replace(/\}$/g, '') // Remove closing curly brace at end
             .replace(/\[\s*\{/g, '[') // Replace opening array curly brace
             .replace(/\}\s*\]/g, ']') // Replace closing array curly brace
             .replace(/\}\s*,\s*\{/g, ','); // Replace intermediate curly braces
  }

  // Apply color to JSON keys (now without quotes)
  let formattedContent = content
    .replace(/^(\w+):/gm, '<span class="text-yellow-400">$1</span>:') // Color the keys
    .replace(/Item (\d+):/g, '<span class="text-yellow-400">Item $1</span>:') // Color item numbers
    .replace(/Action:/g, '<span class="text-purple-400">Action</span>:') // Color Action
    .replace(/Suggestion:/g, '<span class="text-purple-400">Suggestion</span>:'); // Color Suggestion
  
  // Replace newlines with <br>
  formattedContent = formattedContent.replace(/\n/g, '<br>');
  
  return formattedContent;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I've analyzed your resume. I can help you explore career paths, prepare for interviews, or improve your resume. What would you like to know?",
      role: "assistant",
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [suggestedQuestions] = useState([
    "How can I improve my resume?",
    "What jobs should I apply for?",
    "How should I prepare for interviews?",
    "What skills should I improve?"
  ])
  
  useEffect(() => {
    // Load resume data from localStorage
    const storedResumeData = localStorage.getItem('resumeData')
    if (storedResumeData) {
      try {
        const parsedData = JSON.parse(storedResumeData) as ResumeData
        setResumeData(parsedData)
      } catch (error) {
        console.error("Error parsing resume data:", error)
        setError("Unable to load your resume data. Please upload your resume again.")
      }
    } else {
      // If no resume data is found, redirect back to upload page
      setError("Please upload your resume first")
      setTimeout(() => {
        router.push("/resume-upload")
      }, 3000)
    }
  }, [router])
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content = inputValue) => {
    if ((!content.trim() && !inputValue.trim()) || isProcessing || !resumeData) return
    
    const messageContent = content.trim() || inputValue.trim()
    setError(null)
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: "user",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)
    
    try {
      // Convert messages to the format expected by the API
      const previousConvo: string[][] = messages
        .filter(msg => msg.id !== "welcome") // Skip the welcome message
        .map(msg => [msg.role === "user" ? "user" : "assistant", msg.content])
      
      // Add the new user message
      previousConvo.push(["user", messageContent])
      
      // Call the API
      const response = await askQuestion(
        resumeData.extractedText,
        messageContent,
        previousConvo
      )
      
      // Process the response - check if it's a JSON object
      let assistantContent = "";
      
      if (response) {
        try {
          // Check if response.answer is JSON string
          if (response.answer && typeof response.answer === 'string') {
            // Try to parse JSON
            try {
              if (response.answer.trim().startsWith('{')) {
                const jsonData = JSON.parse(response.answer);
                assistantContent = formatJsonResponse(jsonData);
              } else {
                assistantContent = response.answer;
              }
            } catch (e) {
              // If parsing fails, show raw response
              assistantContent = response.answer;
            }
          } 
          // Check if response.response exists
          else if (response.response) {
            // Try to parse if string
            if (typeof response.response === 'string') {
              if (response.response.trim().startsWith('{') || response.response.trim().startsWith('[')) {
                try {
                  const jsonData = JSON.parse(response.response);
                  assistantContent = formatJsonResponse(jsonData);
                } catch (e) {
                  assistantContent = response.response;
                }
              } else {
                assistantContent = response.response;
              }
            } 
            // If already an object
            else if (typeof response.response === 'object') {
              assistantContent = formatJsonResponse(response.response);
            }
          } 
          // If the response itself is the data
          else if (typeof response === 'object') {
            assistantContent = formatJsonResponse(response);
          }
        } catch (error) {
          console.error("Error processing response:", error);
          assistantContent = String(response.answer || response.response || response);
        }
      }
      
      if (!assistantContent) {
        assistantContent = "I'm sorry, I couldn't process that request. Please try again.";
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantContent,
        role: "assistant",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error asking question:", error)
      setError(`Error: ${error instanceof Error ? error.message : "Failed to communicate with AI. Please try again."}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Career Coach AI</h1>
            </div>
          </motion.div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-4 flex items-center"
            >
              <AlertCircle className="text-red-500 mr-3 w-5 h-5 flex-shrink-0" />
              <p className="text-red-500">{error}</p>
            </motion.div>
          )}
          
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl border border-gray-800 shadow-xl mb-4 flex flex-col h-auto min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div 
                    key={message.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-6`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-3 mt-1">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[80%] rounded-xl ${
                        message.role === "user" 
                          ? "bg-purple-600 text-white rounded-tr-none" 
                          : "bg-gray-800/80 text-gray-100 rounded-tl-none border border-gray-700"
                      }`}
                    >
                      <div className="p-4">
                        <div 
                          className={`whitespace-pre-line ${message.role === "assistant" ? "chat-message" : ""}`}
                          dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                        />
                      </div>
                      <div className={`px-4 py-1.5 text-xs ${
                        message.role === "user" ? "text-purple-300" : "text-gray-500"
                      } border-t ${
                        message.role === "user" ? "border-purple-500/30" : "border-gray-700"
                      } flex items-center`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center ml-3 mt-1">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mr-3 mt-1">
                    <Bot className="w-4 h-4 text-purple-400" />
                  </div>
                  
                  <div className="bg-gray-800/80 text-white p-4 rounded-xl rounded-tl-none border border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length === 1 && !error && (
              <div className="px-6 pb-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
                    Suggested Questions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start border-gray-700 bg-gray-800/50 hover:bg-purple-500/10 hover:border-purple-500 text-white text-sm py-3 h-auto"
                        onClick={() => handleSendMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/50 sticky bottom-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about career paths, resume advice, interviews..."
                  disabled={!resumeData || isProcessing}
                  className="w-full bg-gray-800 border border-gray-700 rounded-full px-5 py-3 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <Button 
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!resumeData || !inputValue.trim() || isProcessing}
                  className="absolute right-1.5 top-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            CareerCoach AI uses your resume data to provide personalized career guidance. We never share your information.
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .chat-message {
          font-family: monospace;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        
        .chat-message span {
          font-family: monospace;
        }
      `}</style>
    </main>
  )
} 
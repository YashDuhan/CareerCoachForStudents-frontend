"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Check, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import { motion } from "framer-motion"
import { uploadResume } from "@/api/services"

export default function ResumeUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "application/pdf" || 
          droppedFile.type === "application/msword" || 
          droppedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setFile(droppedFile)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")
    
    try {
      // Upload the file to the backend
      const result = await uploadResume(file)
      
      // Store the extracted text in localStorage for the chat page to use
      if (result && result.extracted_text) {
        localStorage.setItem('resumeData', JSON.stringify({
          extractedText: result.extracted_text,
          timestamp: new Date().toISOString(),
        }))
      }
      
      setUploadStatus("success")
      
      // Redirect to chat page after success
      setTimeout(() => {
        router.push("/chat")
      }, 1500)
    } catch (error) {
      console.error("Error uploading resume:", error)
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">Upload Your </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Resume</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
              Our AI will analyze your resume to provide personalized career guidance and job recommendations.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-800 p-8 mb-8"
          >
            <div 
              className={`border-2 border-dashed rounded-xl p-12 mb-6 text-center transition-all ${
                isDragging 
                  ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
                  : file 
                    ? "border-green-500 bg-green-500/10" 
                    : "border-gray-700 hover:border-purple-500 hover:bg-purple-500/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileSelect}
              />
              
              {file ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                    <FileText className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{file.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  
                  <div className="flex space-x-4">
                    <Button 
                      className="rounded-full bg-transparent border border-red-500 hover:bg-red-500/10 text-red-400"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                    <Button 
                      className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                      disabled={uploading || uploadStatus === "success"}
                      onClick={handleUpload}
                    >
                      {uploading ? "Uploading..." : "Continue"}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
                    <Upload className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Drag & Drop Your Resume</h3>
                  <p className="text-gray-400 mb-6">Supports PDF, DOC & DOCX files</p>
                  <Button 
                    className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
            
            {uploadStatus === "success" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 mb-2 flex items-center"
              >
                <Check className="text-green-500 mr-3 w-5 h-5" />
                <p className="text-green-500">Resume uploaded successfully! Redirecting to your AI career coach...</p>
              </motion.div>
            )}
            
            {uploadStatus === "error" && (
              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-2 flex items-center">
                <AlertCircle className="text-red-500 mr-3 w-5 h-5" />
                <p className="text-red-500">
                  Error uploading resume: {errorMessage || "Please try again."}
                </p>
              </div>
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-500 text-sm"
          >
            Your resume is analyzed securely. We never share your personal information.
          </motion.div>
        </div>
      </div>
    </main>
  )
} 
"use client"

import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import Image from "next/image"

type TeamMember = {
  name: string
  rollNumber: string
  section: string
  image: string
}

export default function AboutPage() {
  const teamMembers: TeamMember[] = [
    {
      name: "Aman",
      rollNumber: "2230730",
      section: "CSE A",
      image: "/assets/aman.png"
    },
    {
      name: "Amit",
      rollNumber: "2230734",
      section: "CSE A",
      image: "/assets/amit.png"
    }
  ]

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">About </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">CareerCoach AI</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We're building an AI-powered platform to help students and professionals make better career decisions through personalized guidance and resume analysis.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Mission</h2>
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-xl border border-gray-800 p-8">
              <p className="text-gray-300 mb-4">
                At CareerCoach AI, we believe everyone deserves access to high-quality career guidance. Our mission is to democratize career coaching by leveraging artificial intelligence to provide personalized advice that would otherwise be expensive or inaccessible.
              </p>
              <p className="text-gray-300">
                Through our platform, we aim to help people identify their strengths, improve their resumes, prepare for interviews, and discover career paths that align with their skills and interests.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                  className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-xl border border-gray-800 overflow-hidden"
                >
                  <div className="flex flex-col items-center p-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-purple-500/30">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-purple-400 text-sm mb-1">{member.rollNumber}</p>
                    <p className="text-gray-400 text-sm">{member.section}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
} 
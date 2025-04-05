"use client"

import { Briefcase, Info } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Briefcase className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">CareerCoach AI</span>
      </Link>
      
      <Link href="/about" className="flex items-center text-gray-300 hover:text-white transition-colors group">
        <Info className="w-5 h-5 mr-2" />
        <span>About</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
      </Link>
    </motion.nav>
  )
}


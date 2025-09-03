import { useState, useEffect } from 'react'
import type { Guardrail } from '@/types'

// Mock data for guardrails (initial data)
const initialGuardrails: Guardrail[] = [
  {
    id: "1",
    name: "Content Safety Filter",
    description: "Prevents generation of harmful or inappropriate content",
    content: "The AI system must not generate content that promotes violence, hate speech, or illegal activities. All responses should be safe, respectful, and appropriate for all audiences.",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
    status: "active",
    category: "Safety"
  },
  {
    id: "2",
    name: "Data Privacy Guard",
    description: "Ensures no personal or sensitive data is exposed",
    content: "The AI system must not reveal, store, or process any personally identifiable information (PII) including names, addresses, phone numbers, email addresses, or any other sensitive personal data.",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
    status: "active",
    category: "Privacy"
  }
]

export function useGuardrails() {
  const [guardrails, setGuardrails] = useState<Guardrail[]>(() => {
    // Try to load from localStorage on initialization
    const stored = localStorage.getItem('guardrails')
    return stored ? JSON.parse(stored) : initialGuardrails
  })

  // Save to localStorage whenever guardrails change
  useEffect(() => {
    localStorage.setItem('guardrails', JSON.stringify(guardrails))
  }, [guardrails])

  const addGuardrail = (Guardrail: Guardrail) => {
    const newGuardrail: Guardrail = {
      id: Date.now().toString(),
      name: Guardrail.name,
      description: Guardrail.description,
      content: Guardrail.content,
      category: Guardrail.category,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      status: "active"
    }
    
    setGuardrails([newGuardrail, ...guardrails])
  }

  const updateGuardrail = (id: string, updates: Partial<Guardrail>) => {
    setGuardrails(guardrails.map(Guardrail =>
      Guardrail.id === id
        ? { ...Guardrail, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : Guardrail
    ))
  }

  const deleteGuardrail = (id: string) => {
    setGuardrails(guardrails.filter(Guardrail => Guardrail.id !== id))
  }

  const toggleGuardrailStatus = (id: string) => {
    setGuardrails(guardrails.map(Guardrail =>
      Guardrail.id === id
        ? { ...Guardrail, status: Guardrail.status === 'active' ? 'inactive' : 'active' }
        : Guardrail
    ))
  }

  const getActiveGuardrails = () => {
    return guardrails.filter(Guardrail => Guardrail.status === 'active')
  }

  const getGuardrailById = (id: string) => {
    return guardrails.find(Guardrail => Guardrail.id === id)
  }

  return {
    guardrails,
    addGuardrail,
    updateGuardrail,
    deleteGuardrail,
    toggleGuardrailStatus,
    getActiveGuardrails,
    getGuardrailById
  }
}

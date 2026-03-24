import { createContext, useContext, useState, type ReactNode } from 'react'

interface PageHeaderState {
  title: string
  action?: ReactNode
}

interface PageHeaderContextType {
  header: PageHeaderState
  setHeader: (header: PageHeaderState) => void
}

export const PageHeaderContext = createContext<PageHeaderContextType>({
  header: { title: '' },
  setHeader: () => {},
})

export function usePageHeader() {
  return useContext(PageHeaderContext)
}

export function usePageHeaderState() {
  const [header, setHeader] = useState<PageHeaderState>({ title: '' })
  return { header, setHeader }
}

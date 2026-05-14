import { Home, BookOpen, TrendingUp } from 'lucide-react'
import type { AppPage } from '@/types/app'

const tabs = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'log' as const, label: 'Log', icon: BookOpen },
  { id: 'progress' as const, label: 'Progress', icon: TrendingUp },
]

interface NavbarProps {
  currentPage: AppPage
  setPage: (page: AppPage) => void
}

export default function Navbar({ currentPage, setPage }: NavbarProps) {
  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-107.5 bg-card border-t border-border flex'>
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type='button'
          onClick={() => setPage(id)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 border-t-2 transition-colors cursor-pointer bg-transparent
            ${
              currentPage === id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent'
            }`}
        >
          <Icon size={20} />
        </button>
      ))}
    </nav>
  )
}

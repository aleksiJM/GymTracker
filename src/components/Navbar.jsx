import { Home, BookOpen, TrendingUp } from 'lucide-react'

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'log', label: 'Log', icon: BookOpen },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
]

export default function Navbar({ currentPage, setPage }) {
  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex mb-2'>
      {tabs.map(({ id, icon: Icon }) => (
        <button
          key={id}
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

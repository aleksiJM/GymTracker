export default function Navbar({ currentPage, setPage }) {
  const tabs = [
    { id: 'history', label: 'History' },
    { id: 'log', label: 'Log' },
    { id: 'progress', label: 'Progress' },
  ]

  return (
    <nav className='fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border flex'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setPage(tab.id)}
          className={`flex-1 py-3 text-[0.8125rem] font-medium border-t-2 transition-colors cursor-pointer bg-transparent
            ${
              currentPage === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

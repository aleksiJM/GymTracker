function Navbar({ currentPage, setPage }) {
  const tabs = [
    { id: 'history', label: 'History' },
    { id: 'log', label: 'Log' },
    { id: 'progress', label: 'Progress' },
  ]

  return (
    <nav className="navbar">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setPage(tab.id)}
          className={`nav-btn ${currentPage === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

export default Navbar
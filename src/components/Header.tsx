import { ChevronLeft } from 'lucide-react'

export interface HeaderProps {
  title: string
  onClose: () => void
}

export default function Header(props: HeaderProps) {
  const { title, onClose } = props

  return (
    <div className='relative flex items-center px-3 py-3 border-b border-border shrink-0 pt-6'>
      <button
        type='button'
        aria-label='Go back'
        className='text-muted-foreground hover:text-foreground cursor-pointer bg-transparent border-none'
        onClick={onClose}
      >
        <ChevronLeft className='size-7' strokeWidth={1.5} />
      </button>
      <h1 className='absolute left-1/2 -translate-x-1/2 text-[1.375rem] font-medium text-foreground leading-none mb-1'>
        {title}
      </h1>
    </div>
  )
}

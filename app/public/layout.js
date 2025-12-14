import '../globals.css'
import { ToastProvider } from '../../components/ui/toast'

export const metadata = {
  title: 'PadPad - Public Document',
  description: 'View a public document',
}

export default function PublicLayout({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}

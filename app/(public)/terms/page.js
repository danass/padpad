import TermsClient from './TermsClient'

export const metadata = {
  title: 'Terms of Service | TextPad',
  description: 'TextPad Terms of Service - the rules and guidelines for using our platform.',
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return <TermsClient />
}

import CreditsClient from './CreditsClient'

export const metadata = {
  title: 'Credits | TextPad',
  description: 'TextPad is made with care by Daniel Assayag.',
  alternates: {
    canonical: '/credits',
  },
}

export default function CreditsPage() {
  return <CreditsClient />
}


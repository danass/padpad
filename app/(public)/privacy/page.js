import PrivacyClient from './PrivacyClient'

export const metadata = {
  title: 'Privacy Policy | TextPad',
  description: 'TextPad Privacy Policy - drafted to protect your information and privacy.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}

import FeaturesClient from './FeaturesClient'

export const metadata = {
    title: 'Features | TextPad',
    description: 'Explore the powerful features of TextPad: digital legacy, public blogging, collaboration, and more.',
    alternates: {
        canonical: '/features',
    },
}

export default function FeaturesPage() {
    return <FeaturesClient />
}

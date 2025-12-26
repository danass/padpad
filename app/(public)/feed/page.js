import FeedClient from './FeedClient'

export const metadata = {
    title: 'Feed | TextPad',
    description: 'Discover latest public documents on TextPad.',
    alternates: {
        canonical: '/feed',
    },
}

export default function FeedPage() {
    return <FeedClient />
}

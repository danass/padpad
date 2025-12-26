import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
    return {
        metadataBase: new URL('https://www.textpad.cloud'),
        title: 'Textpad – Free Online Text Editor & Personal Blog',
        description: 'Write, edit and share text instantly with Textpad. Create your own public blog with a custom subdomain. Save documents, version history, organize in folders.',
        alternates: {
            canonical: '/en',
            languages: {
                'en': '/en',
                'fr': '/fr',
                'x-default': '/',
            },
        },
    }
}

export default async function EnglishPage() {
    redirect('/?locale=en')
}

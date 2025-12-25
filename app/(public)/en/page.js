import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
    return {
        title: 'Textpad – Free Online Text Editor & Personal Blog',
        description: 'Write, edit and share text instantly with Textpad. Create your own public blog with a custom subdomain. Save documents, version history, organize in folders.',
        alternates: {
            canonical: 'https://textpad.cloud/en',
            languages: {
                'en': 'https://textpad.cloud/en',
                'fr': 'https://textpad.cloud/fr',
                'x-default': 'https://textpad.cloud',
            },
        },
    }
}

export default async function EnglishPage() {
    redirect('/?locale=en')
}

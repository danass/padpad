import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
    return {
        title: 'Textpad – Éditeur de texte en ligne gratuit et blog personnel',
        description: 'Écrivez, éditez et partagez du texte instantanément avec Textpad. Créez votre propre blog public avec un sous-domaine personnalisé. Sauvegardez vos documents, historique des versions, organisez en dossiers.',
        alternates: {
            canonical: 'https://textpad.cloud/fr',
            languages: {
                'en': 'https://textpad.cloud/en',
                'fr': 'https://textpad.cloud/fr',
                'x-default': 'https://textpad.cloud',
            },
        },
    }
}

export default async function FrenchPage() {
    const cookieStore = await cookies()
    cookieStore.set('textpad_locale', 'fr', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
    })
    redirect('/')
}

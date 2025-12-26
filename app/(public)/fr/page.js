import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function generateMetadata() {
    return {
        metadataBase: new URL('https://www.textpad.cloud'),
        title: 'Textpad – Éditeur de texte en ligne gratuit et blog personnel',
        description: 'Écrivez, éditez et partagez du texte instantanément avec Textpad. Créez votre propre blog public avec un sous-domaine personnalisé.',
        alternates: {
            canonical: '/fr',
            languages: {
                'en': '/en',
                'fr': '/fr',
                'x-default': '/',
            },
        },
    }
}

export default async function FrenchPage() {
    // Set cookie via response header
    const cookieStore = await cookies()
    // Note: cookies().set() doesn't work in Server Components, use redirect with cookie in response

    // Use a redirect that includes Set-Cookie header via next.config or middleware
    // For now, redirect to a client page that sets the cookie
    redirect('/?locale=fr')
}

'use client'

import { useState, useEffect } from 'react'
import Header from './Header'
import SubdomainHeader from './SubdomainHeader'

// Check if we're on a subdomain
function checkIsSubdomain() {
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    const match = hostname.match(/^([a-z0-9_-]+)\.textpad\.cloud$/i)
    return match && match[1].toLowerCase() !== 'www'
}

export default function HeaderWrapper() {
    const [isSubdomain, setIsSubdomain] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        setIsSubdomain(checkIsSubdomain())
        setChecked(true)
    }, [])

    // During SSR, render nothing to avoid hydration mismatch
    // This is fine because header appears quickly after hydration
    if (!checked) {
        return (
            <header className="border-b border-gray-200 bg-white relative z-[100]">
                <div className="max-w-full mx-auto">
                    <div className="flex items-center justify-between px-6 h-16">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                    <img src="/padpad.svg" alt="textpad logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">textpad</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    // On subdomains, use simple header without auth
    if (isSubdomain) {
        return <SubdomainHeader />
    }

    // On main domain, use full header with auth
    return <Header />
}

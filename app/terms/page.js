'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function TermsPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t?.termsTitle || 'Terms of Service'}
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsLastUpdated || 'Last Updated'}
          </h2>
          <p className="text-gray-700 mb-6">
            {t?.termsLastUpdatedDate || 'These Terms of Service were last updated on'} {currentDate && `${currentDate}.`}
          </p>
        </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsAgreement || 'Agreement to Terms'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsAgreementText || 'By accessing or using TextPad, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsUse || 'Use License'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsUseText || 'Permission is granted to use TextPad for personal and commercial purposes, subject to the following restrictions:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.termsRestrictCopy || 'You may not copy or modify the software'}</li>
              <li>{t?.termsRestrictReverse || 'You may not attempt to reverse engineer the service'}</li>
              <li>{t?.termsRestrictAbuse || 'You may not use the service for illegal purposes'}</li>
              <li>{t?.termsRestrictSpam || 'You may not spam or abuse other users'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsContent || 'User Content'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsContentText || 'You retain ownership of all content you create using TextPad. By using the service, you grant us a license to store and display your content as necessary to provide the service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsProhibited || 'Prohibited Uses'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsProhibitedText || 'You may not use TextPad:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.termsProhibitedIllegal || 'For any unlawful purpose'}</li>
              <li>{t?.termsProhibitedHarm || 'To harm or harass others'}</li>
              <li>{t?.termsProhibitedViolate || 'To violate any laws or regulations'}</li>
              <li>{t?.termsProhibitedInfringe || 'To infringe on intellectual property rights'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsDisclaimer || 'Disclaimer'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsDisclaimerText || 'TextPad is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsLimitation || 'Limitation of Liability'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsLimitationText || 'In no event shall TextPad be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsChanges || 'Changes to Terms'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsChangesText || 'We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the new terms.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.termsContact || 'Contact Us'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.termsContactText || 'If you have questions about these Terms of Service, please contact us through the settings page.'}
            </p>
          </section>
        </div>
    </div>
  )
}


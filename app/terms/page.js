'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'

// Static content for SEO - rendered on server
const staticContent = {
  title: 'Terms of Service',
  lastUpdated: 'Last Updated',
  lastUpdatedText: 'These Terms of Service were last updated on',
  agreement: 'Agreement to Terms',
  agreementText: 'By accessing or using TextPad, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.',
  use: 'Use License',
  useText: 'Permission is granted to use TextPad for personal and commercial purposes, subject to the following restrictions:',
  restrictCopy: 'You may not copy or modify the software',
  restrictReverse: 'You may not attempt to reverse engineer the service',
  restrictAbuse: 'You may not use the service for illegal purposes',
  restrictSpam: 'You may not spam or abuse other users',
  content: 'User Content',
  contentText: 'You retain ownership of all content you create using TextPad. By using the service, you grant us a license to store and display your content as necessary to provide the service.',
  prohibited: 'Prohibited Uses',
  prohibitedText: 'You may not use TextPad:',
  prohibitedIllegal: 'For any unlawful purpose',
  prohibitedHarm: 'To harm or harass others',
  prohibitedViolate: 'To violate any laws or regulations',
  prohibitedInfringe: 'To infringe on intellectual property rights',
  disclaimer: 'Disclaimer',
  disclaimerText: 'TextPad is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.',
  limitation: 'Limitation of Liability',
  limitationText: 'In no event shall TextPad be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.',
  changes: 'Changes to Terms',
  changesText: 'We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the new terms.',
  contact: 'Contact Us',
  contactText: 'If you have questions about these Terms of Service, please contact us through the settings page.',
}

export default function TermsPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t?.termsTitle || staticContent.title}
      </h1>
      
      {/* Static content for SEO crawlers */}
      <noscript>
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.lastUpdated}</h2>
            <p className="text-gray-700 mb-6">{staticContent.lastUpdatedText} {new Date().toLocaleDateString()}.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.agreement}</h2>
            <p className="text-gray-700 mb-4">{staticContent.agreementText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.use}</h2>
            <p className="text-gray-700 mb-4">{staticContent.useText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.restrictCopy}</li>
              <li>{staticContent.restrictReverse}</li>
              <li>{staticContent.restrictAbuse}</li>
              <li>{staticContent.restrictSpam}</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.content}</h2>
            <p className="text-gray-700 mb-4">{staticContent.contentText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.prohibited}</h2>
            <p className="text-gray-700 mb-4">{staticContent.prohibitedText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.prohibitedIllegal}</li>
              <li>{staticContent.prohibitedHarm}</li>
              <li>{staticContent.prohibitedViolate}</li>
              <li>{staticContent.prohibitedInfringe}</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.disclaimer}</h2>
            <p className="text-gray-700 mb-4">{staticContent.disclaimerText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.limitation}</h2>
            <p className="text-gray-700 mb-4">{staticContent.limitationText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.changes}</h2>
            <p className="text-gray-700 mb-4">{staticContent.changesText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.contact}</h2>
            <p className="text-gray-700 mb-4">{staticContent.contactText}</p>
          </section>
        </div>
      </noscript>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsLastUpdated || staticContent.lastUpdated}
          </h2>
          <p className="text-gray-700 mb-6">
            {t?.termsLastUpdatedDate || staticContent.lastUpdatedText} {currentDate && `${currentDate}.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsAgreement || staticContent.agreement}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsAgreementText || staticContent.agreementText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsUse || staticContent.use}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsUseText || staticContent.useText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.termsRestrictCopy || staticContent.restrictCopy}</li>
            <li>{t?.termsRestrictReverse || staticContent.restrictReverse}</li>
            <li>{t?.termsRestrictAbuse || staticContent.restrictAbuse}</li>
            <li>{t?.termsRestrictSpam || staticContent.restrictSpam}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsContent || staticContent.content}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsContentText || staticContent.contentText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsProhibited || staticContent.prohibited}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsProhibitedText || staticContent.prohibitedText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.termsProhibitedIllegal || staticContent.prohibitedIllegal}</li>
            <li>{t?.termsProhibitedHarm || staticContent.prohibitedHarm}</li>
            <li>{t?.termsProhibitedViolate || staticContent.prohibitedViolate}</li>
            <li>{t?.termsProhibitedInfringe || staticContent.prohibitedInfringe}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsDisclaimer || staticContent.disclaimer}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsDisclaimerText || staticContent.disclaimerText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsLimitation || staticContent.limitation}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsLimitationText || staticContent.limitationText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsChanges || staticContent.changes}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsChangesText || staticContent.changesText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.termsContact || staticContent.contact}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.termsContactText || staticContent.contactText}
          </p>
        </section>
      </div>
    </article>
  )
}


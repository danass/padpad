'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'

export default function PrivacyPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t?.privacyTitle || 'Privacy Policy'}
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyLastUpdated || 'Last Updated'}
          </h2>
          <p className="text-gray-700 mb-6">
            {t?.privacyLastUpdatedDate || 'This Privacy Policy was last updated on'} {currentDate && `${currentDate}.`}
          </p>
        </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyIntroduction || 'Introduction'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyIntroductionText || 'TextPad ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyDataCollection || 'Information We Collect'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyDataCollectionText || 'We collect information that you provide directly to us, including:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.privacyDataEmail || 'Email address and authentication information'}</li>
              <li>{t?.privacyDataDocuments || 'Documents and content you create'}</li>
              <li>{t?.privacyDataProfile || 'Profile information (avatar, birth date for digital legacy)'}</li>
              <li>{t?.privacyDataSettings || 'Settings and preferences'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyDataUse || 'How We Use Your Information'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyDataUseText || 'We use the information we collect to:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.privacyUseService || 'Provide, maintain, and improve our service'}</li>
              <li>{t?.privacyUseSecurity || 'Ensure security and prevent fraud'}</li>
              <li>{t?.privacyUseSupport || 'Respond to your requests and provide support'}</li>
              <li>{t?.privacyUseLegacy || 'Enable digital legacy features as configured'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyDataSharing || 'Data Sharing'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyDataSharingText || 'We do not sell your personal information. We may share your information only:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.privacySharePublic || 'When you make documents public'}</li>
              <li>{t?.privacyShareLegacy || 'For digital legacy purposes as you configure'}</li>
              <li>{t?.privacyShareLegal || 'When required by law'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyDataSecurity || 'Data Security'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyDataSecurityText || 'We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyYourRights || 'Your Rights'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyYourRightsText || 'You have the right to:'}
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{t?.privacyRightAccess || 'Access your personal data'}</li>
              <li>{t?.privacyRightDelete || 'Delete your account and data'}</li>
              <li>{t?.privacyRightExport || 'Export your documents'}</li>
              <li>{t?.privacyRightUpdate || 'Update your information'}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t?.privacyContact || 'Contact Us'}
            </h2>
            <p className="text-gray-700 mb-4">
              {t?.privacyContactText || 'If you have questions about this Privacy Policy, please contact us through the settings page.'}
            </p>
          </section>
        </div>
    </div>
  )
}


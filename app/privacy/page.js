'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/i18n/LanguageContext'

// Static content for SEO - rendered on server
const staticContent = {
  title: 'Privacy Policy',
  lastUpdated: 'Last Updated',
  lastUpdatedText: 'This Privacy Policy was last updated on',
  introduction: 'Introduction',
  introductionText: 'TextPad ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.',
  dataCollection: 'Information We Collect',
  dataCollectionText: 'We collect information that you provide directly to us, including:',
  dataEmail: 'Email address and authentication information',
  dataDocuments: 'Documents and content you create',
  dataProfile: 'Profile information (avatar, birth date for digital legacy)',
  dataSettings: 'Settings and preferences',
  dataUse: 'How We Use Your Information',
  dataUseText: 'We use the information we collect to:',
  useService: 'Provide, maintain, and improve our service',
  useSecurity: 'Ensure security and prevent fraud',
  useSupport: 'Respond to your requests and provide support',
  useLegacy: 'Enable digital legacy features as configured',
  dataSharing: 'Data Sharing',
  dataSharingText: 'We do not sell your personal information. We may share your information only:',
  sharePublic: 'When you make documents public',
  shareLegacy: 'For digital legacy purposes as you configure',
  shareLegal: 'When required by law',
  dataSecurity: 'Data Security',
  dataSecurityText: 'We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.',
  yourRights: 'Your Rights',
  yourRightsText: 'You have the right to:',
  rightAccess: 'Access your personal data',
  rightDelete: 'Delete your account and data',
  rightExport: 'Export your documents',
  rightUpdate: 'Update your information',
  contact: 'Contact Us',
  contactText: 'If you have questions about this Privacy Policy, please contact us through the settings page.',
}

export default function PrivacyPage() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString())
  }, [])

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {t?.privacyTitle || staticContent.title}
      </h1>
      
      {/* Static content for SEO crawlers */}
      <noscript>
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.lastUpdated}</h2>
            <p className="text-gray-700 mb-6">{staticContent.lastUpdatedText} {new Date().toLocaleDateString()}.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.introduction}</h2>
            <p className="text-gray-700 mb-4">{staticContent.introductionText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.dataCollection}</h2>
            <p className="text-gray-700 mb-4">{staticContent.dataCollectionText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.dataEmail}</li>
              <li>{staticContent.dataDocuments}</li>
              <li>{staticContent.dataProfile}</li>
              <li>{staticContent.dataSettings}</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.dataUse}</h2>
            <p className="text-gray-700 mb-4">{staticContent.dataUseText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.useService}</li>
              <li>{staticContent.useSecurity}</li>
              <li>{staticContent.useSupport}</li>
              <li>{staticContent.useLegacy}</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.dataSharing}</h2>
            <p className="text-gray-700 mb-4">{staticContent.dataSharingText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.sharePublic}</li>
              <li>{staticContent.shareLegacy}</li>
              <li>{staticContent.shareLegal}</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.dataSecurity}</h2>
            <p className="text-gray-700 mb-4">{staticContent.dataSecurityText}</p>
          </section>
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{staticContent.yourRights}</h2>
            <p className="text-gray-700 mb-4">{staticContent.yourRightsText}</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>{staticContent.rightAccess}</li>
              <li>{staticContent.rightDelete}</li>
              <li>{staticContent.rightExport}</li>
              <li>{staticContent.rightUpdate}</li>
            </ul>
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
            {t?.privacyLastUpdated || staticContent.lastUpdated}
          </h2>
          <p className="text-gray-700 mb-6">
            {t?.privacyLastUpdatedDate || staticContent.lastUpdatedText} {currentDate && `${currentDate}.`}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyIntroduction || staticContent.introduction}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyIntroductionText || staticContent.introductionText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyDataCollection || staticContent.dataCollection}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyDataCollectionText || staticContent.dataCollectionText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.privacyDataEmail || staticContent.dataEmail}</li>
            <li>{t?.privacyDataDocuments || staticContent.dataDocuments}</li>
            <li>{t?.privacyDataProfile || staticContent.dataProfile}</li>
            <li>{t?.privacyDataSettings || staticContent.dataSettings}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyDataUse || staticContent.dataUse}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyDataUseText || staticContent.dataUseText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.privacyUseService || staticContent.useService}</li>
            <li>{t?.privacyUseSecurity || staticContent.useSecurity}</li>
            <li>{t?.privacyUseSupport || staticContent.useSupport}</li>
            <li>{t?.privacyUseLegacy || staticContent.useLegacy}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyDataSharing || staticContent.dataSharing}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyDataSharingText || staticContent.dataSharingText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.privacySharePublic || staticContent.sharePublic}</li>
            <li>{t?.privacyShareLegacy || staticContent.shareLegacy}</li>
            <li>{t?.privacyShareLegal || staticContent.shareLegal}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyDataSecurity || staticContent.dataSecurity}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyDataSecurityText || staticContent.dataSecurityText}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyYourRights || staticContent.yourRights}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyYourRightsText || staticContent.yourRightsText}
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
            <li>{t?.privacyRightAccess || staticContent.rightAccess}</li>
            <li>{t?.privacyRightDelete || staticContent.rightDelete}</li>
            <li>{t?.privacyRightExport || staticContent.rightExport}</li>
            <li>{t?.privacyRightUpdate || staticContent.rightUpdate}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t?.privacyContact || staticContent.contact}
          </h2>
          <p className="text-gray-700 mb-4">
            {t?.privacyContactText || staticContent.contactText}
          </p>
        </section>
      </div>
    </article>
  )
}


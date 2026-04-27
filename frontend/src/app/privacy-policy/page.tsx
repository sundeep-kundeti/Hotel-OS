import React from 'react';

export default function PrivacyPolicyPage() {
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
          🛡️ Privacy Policy – Srimuni Hotels
        </h1>
        <p className="text-slate-500 font-medium mb-10">
          Effective Date: {today}
        </p>

        <div className="space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p>
              Srimuni Hotels (“we,” “our,” “us”) operates the website www.srimunihotels.com
              and provides hotel booking and customer support services, including via WhatsApp.
            </p>
            <p className="mt-4">
              We are committed to protecting your personal information and ensuring transparency in how we collect, use, and safeguard your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            <p className="mb-4">We may collect the following information when you interact with us:</p>

            <div className="space-y-4 ml-4">
              <div>
                <h3 className="font-semibold text-slate-800">a. Personal Information</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Name</li>
                  <li>Phone number</li>
                  <li>Email address (if provided)</li>
                  <li>Booking details (check-in/check-out dates, number of guests)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">b. Communication Data</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Messages sent via WhatsApp</li>
                  <li>Call or inquiry details</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">c. Device &amp; Usage Data</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>IP address</li>
                  <li>Browser/device type</li>
                  <li>Website interaction data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and confirm hotel bookings</li>
              <li>Respond to inquiries and customer support requests</li>
              <li>Send booking confirmations and updates</li>
              <li>Improve our services and customer experience</li>
              <li>Communicate via WhatsApp for booking-related purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. WhatsApp Communication</h2>
            <p className="mb-4">By contacting Srimuni Hotels via WhatsApp, you agree to receive messages related to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Booking confirmations</li>
              <li>Reservation updates</li>
              <li>Customer support</li>
            </ul>
            <p>We do not send spam or promotional messages without your consent.</p>
            <p className="mt-2">You may opt out anytime by messaging “STOP”.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Sharing &amp; Disclosure</h2>
            <p className="mb-4">We do not sell or rent your personal data.</p>
            <p className="mb-4">We may share data only with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Service providers (e.g., payment processors, cloud storage)</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, misuse, or disclosure.
            </p>
            <p className="mt-4">
              However, no system is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Data Retention</h2>
            <p className="mb-4">We retain your data only as long as necessary for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Booking management</li>
              <li>Legal compliance</li>
              <li>Business operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Request access to your data</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent for communication</li>
            </ul>
            <p>To exercise these rights, contact us below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Cookies &amp; Tracking</h2>
            <p>
              Our website may use cookies to improve user experience and analyze website traffic.
            </p>
            <p className="mt-4">
              You can disable cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Third-Party Services</h2>
            <p className="mb-4">
              Our website and services may integrate with third-party platforms, including:
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Meta Platforms</li>
              <li>Payment gateways</li>
            </ul>
            <p>These platforms have their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
            <div className="bg-slate-100 p-6 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900 mb-2">Srimuni Hotels</p>
              <ul className="space-y-2">
                <li>📍 Tirupati, Andhra Pradesh, India</li>
                <li>📞 Phone: +91 7416686677</li>
                <li>📧 Email: srimunihotelsandhospitality@gmail.com</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

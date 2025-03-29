import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">QUIZPARSERINATOR TERMS OF SERVICE</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400 text-center">Effective Date: {currentDate}</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance</h2>
              <p>By using QuizParserinator ("Service"), you agree to these Terms. If you disagree, you must stop using the Service immediately.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Your Content</h2>
              <p>• You own what you create ("User Content").</p>
              <p>• You are solely responsible for:</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Ensuring your content doesn't violate copyrights</li>
                <li>Obtaining proper permissions for any third-party material</li>
                <li>Compliance with all laws</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Copyright Compliance</h2>
              <p>• Do not upload copyrighted material without authorization.</p>
              <p>• DMCA notices should be sent to:</p>
              <p className="font-medium mt-2">taanhkhoa2007@gmail.com</p>
              <p className="mt-2">and must include:</p>
              <ol className="list-decimal pl-8 mt-2 space-y-1">
                <li>Identification of the copyrighted work</li>
                <li>Description of infringement location</li>
                <li>Your contact information</li>
                <li>Good faith statement</li>
                <li>Verification under penalty of perjury</li>
              </ol>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Service Disclaimers</h2>
              <p>• The Service is provided "as is" without warranties.</p>
              <p>• We don't guarantee:</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Perfect operation</li>
                <li>Content accuracy</li>
                <li>Data security</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Liability</h2>
              <p>To the fullest extent permitted by law:</p>
              <p>• We are not liable for:</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Lost or damaged content</li>
                <li>User copyright violations</li>
                <li>Indirect/consequential damages</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Legal Responsibility</h2>
              <p>You agree to defend and compensate us for any legal issues arising from:</p>
              <ul className="list-disc pl-8 mt-2 space-y-1">
                <li>Your violation of these Terms</li>
                <li>Your infringement of others' rights</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes</h2>
              <p>We may update these Terms. Continued use means you accept changes.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Governing Law</h2>
              <p>These Terms are governed by U.S. law.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
              <p>For legal notices: taanhkhoa2007@gmail.com</p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
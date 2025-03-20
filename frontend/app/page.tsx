'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Report {
  subject: string;
  content: string;
  sources: string;
  generated_at: string;
}

interface StoredEmail {
  email: string;
  timestamp: string;
}

function formatMarkdown(text: string): string {
  return text
    // Handle strong/bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Handle source references
    .replace(/\[(\d+)\]/g, '<span class="source-link">[$1]</span>')
    // Handle numbered lists
    .replace(/^(\d+)\.\s/gm, '<span class="number">$1.</span> ')
    // Handle bullet points (only at start of line or after newline)
    .split('\n')
    .map(line => {
      if (line.trim().startsWith('- ')) {
        return `<p class="bullet-point">• ${line.trim().substring(2)}</p>`;
      }
      return `<p>${line}</p>`;
    })
    .join('')
    // Clean up empty paragraphs
    .replace(/<p>\s*<\/p>/g, '')
    // Clean up multiple consecutive line breaks
    .replace(/(<\/p>\s*<p>){2,}/g, '</p><p>');
}

function parseSection(content: string): { title: string; body: string } {
  const lines = content.split('\n');
  const title = lines[0].replace(/^\*\*(.*?)\*\*:?/, '$1').trim();
  const body = lines.slice(1).join('\n').trim();
  return { title, body };
}

function parseReportContent(content: string): { shortTerm: string; longTerm: string } {
  const sections = content.split('---').map(section => section.trim());
  
  const shortTermSection = sections[0].split('**Short-Term Analysis')[1];
  const longTermSection = sections[1].split('**Long-Term Analysis')[1];
  
  return {
    shortTerm: shortTermSection ? shortTermSection.trim() : '',
    longTerm: longTermSection ? longTermSection.trim() : ''
  };
}

export default function Home() {
  const [report, setReport] = useState<Report | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState<StoredEmail[]>([]);
  const [showEmails, setShowEmails] = useState(false);

  useEffect(() => {
    fetch('/report.json')
      .then(res => res.json())
      .then(data => setReport(data))
      .catch(err => console.error('Error loading report:', err));

    // Load subscribed emails
    const storedEmails = localStorage.getItem('newsletterEmails');
    if (storedEmails) {
      setSubscribedEmails(JSON.parse(storedEmails));
    }
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    try {
      // Check if email already exists
      if (subscribedEmails.some(entry => entry.email === email)) {
        setMessage('This email is already subscribed');
        setIsSuccess(false);
        return;
      }

      // Add new email
      const newEmails = [...subscribedEmails, {
        email,
        timestamp: new Date().toISOString()
      }];

      // Save to localStorage and state
      localStorage.setItem('newsletterEmails', JSON.stringify(newEmails));
      setSubscribedEmails(newEmails);
      
      setMessage('Successfully subscribed to the newsletter!');
      setIsSuccess(true);
      setEmail('');
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setIsSuccess(false);
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <main className="report-container">
        <div className="report-content">
          <section className="section header-section">
            <h1 className="report-title">PowerNI Market Insights</h1>
            <p className="report-subtitle">Energy Market Analysis</p>
            <p className="report-timestamp">
              {new Date(report.generated_at).toLocaleString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="report-subject">{report.subject}</p>
          </section>

          {(() => {
            const { shortTerm, longTerm } = parseReportContent(report.content);
            return (
              <>
                <section className="section">
                  <h2 className="section-title">Short-Term Analysis</h2>
                  <div
                    className="report-section"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(shortTerm)
                    }}
                  />
                </section>

                <section className="section">
                  <h2 className="section-title">Long-Term Analysis</h2>
                  <div
                    className="report-section"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(longTerm)
                    }}
                  />
                </section>
              </>
            );
          })()}

          <section className="section newsletter-section">
            <h2 className="section-title">Stay Updated</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <label
                htmlFor="email"
                className="block"
              >
                Subscribe to receive market insights directly in your inbox
              </label>
              <div className="flex">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  placeholder="Enter your email address..."
                  required
                />
                <button
                  type="submit"
                  className="text-white"
                >
                  Subscribe Now
                </button>
              </div>
              
              {message && (
                <p className={`text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="mt-4">
              <button
                onClick={() => setShowEmails(!showEmails)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {showEmails ? 'Hide' : 'Show'} Subscribed Emails ({subscribedEmails.length})
              </button>
              {showEmails && subscribedEmails.length > 0 && (
                <div className="mt-2 p-4 bg-gray-100 rounded-md">
                  <ul className="space-y-2">
                    {subscribedEmails.map((entry, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {entry.email} - {new Date(entry.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <div className="sources">
            {report.sources.split('\n').map((source, index) => (
              source.trim() && (
                <div key={index} className="source-link">
                  {source.trim()}
                </div>
              )
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
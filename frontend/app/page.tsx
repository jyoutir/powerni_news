'use client';

import { useEffect, useState, FormEvent } from 'react';

interface Report {
  subject: string;
  executive_summary: string;
  short_term_analysis: string;
  long_term_analysis: string;
  sources: string;
  generated_at: string;
}

interface StoredEmail {
  email: string;
  timestamp: string;
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(\d+)\]/g, '<span class="source-link">[$1]</span>');
}

function formatKeyPoints(text: string): string[] {
  return text
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const cleanLine = line.replace(/^[•-]\s*/, '');
      const [title, ...content] = cleanLine.split(':');
      if (content.length > 0) {
        return `<strong>${title}:</strong> ${content.join(':')}`;
      }
      return cleanLine;
    });
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

          <section className="section">
            <h2 className="section-title">Executive Summary</h2>
            <div 
              className="text-content"
              dangerouslySetInnerHTML={{ 
                __html: formatMarkdown(report.executive_summary)
              }}
            />
          </section>

          <section className="section">
            <h2 className="section-title">Short-Term Market Analysis</h2>
            <div className="key-points">
              {formatKeyPoints(report.short_term_analysis).map((point, index) => (
                <div
                  key={index}
                  className="key-point"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(point)
                  }}
                />
              ))}
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Long-Term Market Analysis</h2>
            <div className="key-points">
              {formatKeyPoints(report.long_term_analysis).map((point, index) => (
                <div
                  key={index}
                  className="key-point"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(point)
                  }}
                />
              ))}
            </div>
          </section>

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
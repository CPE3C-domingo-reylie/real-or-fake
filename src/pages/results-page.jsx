import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../assets/components/Layout';
import '../styles/results.css';

// Small inline SVG icons to avoid external peer-dep issues
function ExternalLinkIcon({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError(null);

    // If q is a Guardian article URL, fetch that single article and analyze it
    try {
      const maybeUrl = new URL(q);
      const hostname = maybeUrl.hostname.toLowerCase();
      if (hostname.includes('guardian') || hostname.includes('theguardian.com')) {
        const articleId = maybeUrl.pathname.replace(/^\//, '');
        // Fetch article from backend
        axios.get(`/api/news/guardian/article/${encodeURIComponent(articleId)}`)
          .then(res => {
            const article = res.data && res.data.data ? res.data.data : null;
            if (!article) {
              setArticles([]);
              return;
            }
            // Ask backend to compute fake news score for this article
            axios.post(`/api/news/analyze/fake-score`, {
              title: article.webTitle,
              description: article.trailText,
              bodyText: article.bodyText,
              link: article.webUrl,
              source: article.sectionName || 'The Guardian',
              byline: article.byline
            })
            .then(scoreRes => {
              const scoreData = scoreRes.data && scoreRes.data.data ? scoreRes.data.data : null;
              setArticles([{
                source: article.sectionName || 'The Guardian',
                title: article.webTitle,
                url: article.webUrl,
                credibility: 90,
                sentiment: article.sentiment || 'neutral',
                date: article.publicationDate || article.pubDate || 'recent',
                excerpt: article.trailText || '',
                verdict: scoreData && scoreData.riskLevel ? mapRiskToVerdict(scoreData.riskLevel) : 'mixed',
                fakeNewsScore: scoreData
              }]);
            })
            .catch(() => {
              setArticles([{
                source: article.sectionName || 'The Guardian',
                title: article.webTitle,
                url: article.webUrl,
                credibility: 90,
                sentiment: article.sentiment || 'neutral',
                date: article.publicationDate || article.pubDate || 'recent',
                excerpt: article.trailText || '',
                verdict: 'mixed'
              }]);
            })
            .finally(() => setLoading(false));
          })
          .catch(err => {
            setError(err.message || 'failed to fetch article');
            setLoading(false);
          });
        return; // handled as single-article flow
      }
    } catch (e) {
      // not a URL, continue to treat q as search term
    }

    // Default: treat q as a search query and fetch multiple articles with analysis
    axios
      .get(`/api/news/guardian/search-with-analysis`, { params: { q, pageSize: 10 } })
      .then(res => {
        if (res.data && Array.isArray(res.data.data)) {
          setArticles(res.data.data.map(a => ({
            source: a.source || a.sectionName || a.byline || 'Guardian',
            title: a.webTitle || a.title || a.name,
            url: a.webUrl || a.url || '#',
            credibility: a.credibility || 80,
            sentiment: a.sentiment || 'neutral',
            date: a.webPublicationDate || a.pubDate || 'recent',
            excerpt: a.trailText || a.description || '',
            verdict: (a.fakeNewsScore && a.fakeNewsScore.riskLevel) ? mapRiskToVerdict(a.fakeNewsScore.riskLevel) : 'mixed'
          })));
        } else {
          setArticles([]);
        }
      })
      .catch(err => setError(err.message || 'failed'))
      .finally(() => setLoading(false));
  }, [q]);

  function mapRiskToVerdict(risk) {
    if (!risk) return 'mixed';
    const r = risk.toUpperCase();
    if (r === 'LOW') return 'verified';
    if (r === 'MODERATE' || r === 'PARTIALLY_VERIFIED') return 'mixed';
    if (r === 'HIGH' || r === 'VERY_HIGH' || r === 'UNVERIFIED') return 'disputed';
    return 'mixed';
  }

  const sentimentData = articles.length
    ? articles.map(a => ({ source: a.source, positive: Math.floor(Math.random() * 40) + 20, neutral: Math.floor(Math.random() * 50) + 20, negative: Math.floor(Math.random() * 30) }))
    : [];

  const overallSentiment = [
    { name: 'Positive', value: 31, color: '#22c55e' },
    { name: 'Neutral', value: 48, color: '#64748b' },
    { name: 'Negative', value: 21, color: '#ef4444' }
  ];

  const getVerdictBadge = (verdict) => {
    if (verdict === 'verified') return <span className="badge badge-green">Verified</span>;
    if (verdict === 'mixed') return <span className="badge badge-yellow">Mixed Evidence</span>;
    if (verdict === 'disputed') return <span className="badge badge-red">Disputed</span>;
    return null;
  };

  const getCredibilityColor = (score) => {
    if (score >= 90) return 'cred-green';
    if (score >= 70) return 'cred-yellow';
    return 'cred-red';
  };

  return (
    <Layout>
      <div className="results-page">
        <div className="container">
          <h1 className="results-title">Fact-Check Results</h1>
          <p className="results-sub">Analyzing "<strong>{q}</strong>" across multiple sources</p>

          <section className="summary">
            <div className="summary-card">
              <h3>Overall Assessment</h3>
              <p>Based on analysis of {articles.length} sources.</p>
            </div>
          </section>

          {loading && <div className="muted">Loading analysis…</div>}
          {error && <div className="error">Error: {error}</div>}

          <section className="tabs">
            <div className="tab-list">
              <button className="tab active">Source Comparison</button>
              <button className="tab">Sentiment Analysis</button>
            </div>

            <div className="tab-content">
              <div className="sources">
                {articles.length === 0 && !loading && <div className="muted">No articles found.</div>}
                {articles.map((article, idx) => (
                  <article key={idx} className="source-card">
                    <header>
                      <div className="left">
                        <h4>{article.source}</h4>
                        <span className={`cred ${getCredibilityColor(article.credibility)}`}>
                          {article.credibility}% credibility
                        </span>
                      </div>
                      <div className="right">{getVerdictBadge(article.verdict)}</div>
                    </header>
                    <p className="excerpt">{article.title}</p>
                    <p className="excerpt small">{article.excerpt}</p>
                    <div className="meta">
                      <span className="date">{article.date}</span>
                      <a href={article.url} target="_blank" rel="noreferrer" className="read">
                        Read full article <ExternalLinkIcon className="icon"/>
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              {/* 🔥 FIXED CHART SECTION */}
              <div className="sentiment">
                
                {/* PIE CHART */}
                <div className="chart-card">
                  <h4>Overall Sentiment Distribution</h4>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overallSentiment}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          stroke="none"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {overallSentiment.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background: "transparent",
                            border: "none",
                            boxShadow: "none"
                          }}
                          wrapperStyle={{
                            background: "transparent",
                            border: "none"
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* BAR CHART */}
                <div className="chart-card">
                  <h4>Sentiment by Source</h4>
                  <div style={{ height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sentimentData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          stroke="rgba(255,255,255,0.08)"
                          fill="transparent"
                        />

                        <XAxis
                          dataKey="source"
                          stroke="#9aa3b2"
                          tick={{ fill: "#9aa3b2" }}
                        />

                        <YAxis
                          stroke="#9aa3b2"
                          tick={{ fill: "#9aa3b2" }}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "transparent",
                            border: "none",
                            boxShadow: "none"
                          }}
                          wrapperStyle={{
                            background: "transparent",
                            border: "none"
                          }}
                        />

                        <Legend 
                          wrapperStyle={{
                            background: "transparent",
                            border: "none"
                          }}
                        />

                        <Bar dataKey="positive" stackId="a" fill="#22c55e" />
                        <Bar dataKey="neutral" stackId="a" fill="#64748b" />
                        <Bar dataKey="negative" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
              {/* 🔥 END FIX */}

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
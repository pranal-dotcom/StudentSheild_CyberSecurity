import { useState, useEffect } from 'react'
import { Shield, ArrowLeft, Clock, CheckCircle, AlertTriangle, XCircle, Filter, Calendar } from 'lucide-react'

export default function ScanHistory({ token, onLogout }) {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, password, url, email
  const [sortBy, setSortBy] = useState('date') // date, type, result

  useEffect(() => {
    fetchScanHistory()
  }, [token])

  const fetchScanHistory = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Fetching scan history...')
      const response = await fetch('http://127.0.0.1:8000/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Special handling for 404 - provide mock data
        if (response.status === 404) {
          console.log('History endpoint not available, providing mock data')
          setScans([
            {
              type: 'password',
              input: 'test123',
              result: { strength: 'Weak', suggestions: ['Make it longer'] },
              timestamp: new Date().toISOString()
            },
            {
              type: 'url',
              input: 'https://example.com',
              result: { is_safe: true, risk_level: 'Low', reasons: [] },
              timestamp: new Date().toISOString()
            },
            {
              type: 'email',
              input: 'Sample email text',
              result: { is_scam: false, risk_level: 'Low', reasons: [] },
              timestamp: new Date().toISOString()
            }
          ])
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Scan history data:', data)
      
      if (data.history && Array.isArray(data.history)) {
        setScans(data.history)
      } else {
        setScans([])
      }
    } catch (err) {
      console.error('Error fetching scan history:', err)
      // Provide mock data on any error
      setScans([
        {
          type: 'password',
          input: 'test123',
          result: { strength: 'Weak', suggestions: ['Make it longer'] },
          timestamp: new Date().toISOString()
        },
        {
          type: 'url',
          input: 'https://example.com',
          result: { is_safe: true, risk_level: 'Low', reasons: [] },
          timestamp: new Date().toISOString()
        },
        {
          type: 'email',
          input: 'Sample email text',
          result: { is_scam: false, risk_level: 'Low', reasons: [] },
          timestamp: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getScanIcon = (scanType) => {
    switch (scanType) {
      case 'password':
        return <CheckCircle size={20} color="#10b981" />
      case 'url':
        return <AlertTriangle size={20} color="#f59e0b" />
      case 'email':
        return <Shield size={20} color="#3b82f6" />
      default:
        return <Clock size={20} color="#6b7280" />
    }
  }

  const getResultColor = (scan) => {
    const result = scan.result
    if (result?.strength === 'Strong' || result?.risk_level === 'Low' || !result?.is_scam) {
      return 'result-safe'
    } else if (result?.strength === 'Medium' || result?.risk_level === 'Medium') {
      return 'result-medium'
    } else {
      return 'result-risk'
    }
  }

  const getResultText = (scan) => {
    const result = scan.result
    if (scan.type === 'password') {
      return result?.strength || 'Unknown'
    } else if (scan.type === 'url') {
      return result?.risk_level || 'Unknown'
    } else if (scan.type === 'email') {
      return result?.is_scam ? 'Scam Detected' : 'Safe'
    }
    return 'Processed'
  }

  const getScanDescription = (scan) => {
    const input = scan.input
    if (scan.type === 'password') {
      return `Password: ${input.substring(0, 1)}${'*'.repeat(Math.min(input.length - 2, 8))}${input.length > 1 ? input.slice(-1) : ''}`
    } else if (scan.type === 'url') {
      return `URL: ${input}`
    } else if (scan.type === 'email') {
      return `Email: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`
    }
    return input
  }

  const filteredScans = scans.filter(scan => {
    if (filter === 'all') return true
    return scan.type === filter
  })

  const sortedScans = [...filteredScans].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.timestamp) - new Date(a.timestamp)
    } else if (sortBy === 'type') {
      return a.type.localeCompare(b.type)
    } else if (sortBy === 'result') {
      return getResultText(a).localeCompare(getResultText(b))
    }
    return 0
  })

  const getScanStats = () => {
    const total = scans.length
    const passwordScans = scans.filter(s => s.type === 'password').length
    const urlScans = scans.filter(s => s.type === 'url').length
    const emailScans = scans.filter(s => s.type === 'email').length
    const safeScans = scans.filter(s => getResultColor(s) === 'result-safe').length
    
    return { total, passwordScans, urlScans, emailScans, safeScans }
  }

  const stats = getScanStats()

  if (loading) {
    return (
      <div className="card">
        <div className="icon-container">
          <Clock size={48} color="#3b82f6" className="animate-spin" />
        </div>
        <h1>Loading Scan History</h1>
        <p>Please wait while we fetch your security scan history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="icon-container">
          <XCircle size={48} color="#ef4444" />
        </div>
        <h1>Error Loading History</h1>
        <div className="error-msg">{error}</div>
        <button onClick={fetchScanHistory} style={{ marginTop: '20px' }}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="card dashboard-card">
      <div className="dashboard-header">
        <div className="flex-row">
          <button onClick={() => window.history.back()} className="btn-icon" style={{ marginRight: '12px' }}>
            <ArrowLeft size={20} />
          </button>
          <Shield size={32} color="#3b82f6" />
          <h1>Scan History</h1>
        </div>
        <button onClick={onLogout} className="btn-icon">
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px', 
        marginBottom: '30px' 
      }}>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.total}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Scans</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.safeScans}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Safe Results</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.passwordScans}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password Checks</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.urlScans + stats.emailScans}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>URL + Email Scans</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <option value="all">All Scans</option>
            <option value="password">Password Checks</option>
            <option value="url">URL Scans</option>
            <option value="email">Email Scans</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--text-muted)" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="type">Sort by Type</option>
            <option value="result">Sort by Result</option>
          </select>
        </div>

        <button onClick={fetchScanHistory} style={{ marginLeft: 'auto' }}>
          Refresh
        </button>
      </div>

      {/* Scan List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {sortedScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Clock size={48} style={{ margin: '0 auto 16px' }} />
            <p>No scan history found</p>
            <p style={{ fontSize: '0.9rem' }}>
              {filter === 'all' ? 'Start using the security tools to see your scan history here.' : `No ${filter} scans found.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedScans.map((scan, index) => (
              <div 
                key={index} 
                className="result-box" 
                style={{ 
                  borderLeft: `4px solid ${getResultColor(scan) === 'result-safe' ? '#10b981' : getResultColor(scan) === 'result-medium' ? '#f59e0b' : '#ef4444'}`,
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getScanIcon(scan.type)}
                    <div>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {scan.type} Scan
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(scan.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className={getResultColor(scan)} style={{ fontWeight: '600' }}>
                    {getResultText(scan)}
                  </div>
                </div>
                
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {getScanDescription(scan)}
                </div>

                {scan.result && (
                  <div style={{ fontSize: '0.85rem' }}>
                    {scan.type === 'password' && scan.result.suggestions && scan.result.suggestions.length > 0 && (
                      <div>
                        <strong>Suggestions:</strong>
                        <ul className="suggestion-list" style={{ marginTop: '4px' }}>
                          {scan.result.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {scan.type === 'url' && scan.result.reasons && scan.result.reasons.length > 0 && (
                      <div>
                        <strong>Analysis:</strong>
                        <ul className="suggestion-list" style={{ marginTop: '4px' }}>
                          {scan.result.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {scan.type === 'email' && scan.result.reasons && scan.result.reasons.length > 0 && (
                      <div>
                        <strong>Risk Factors:</strong>
                        <ul className="suggestion-list" style={{ marginTop: '4px' }}>
                          {scan.result.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

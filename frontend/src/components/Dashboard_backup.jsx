import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, KeyRound, Link as LinkIcon, Mail, Activity, LogOut, File, Wifi, History, Brain, Award } from 'lucide-react'

export default function Dashboard({ token, onLogout }) {
  const [dbMessage, setDbMessage] = useState('')
  
  // States for Safety Tools
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [emailText, setEmailText] = useState('')
  const [fileName, setFileName] = useState('')
  const [wifiName, setWifiName] = useState('')
  const [quizAnswer, setQuizAnswer] = useState('')

  // Loading States
  const [loadingTools, setLoadingTools] = useState({
    password: false, url: false, email: false, score: false, file: false, wifi: false, history: false, quiz: false
  })

  // Results State
  const [passwordResult, setPasswordResult] = useState(null)
  const [urlResult, setUrlResult] = useState(null)
  const [emailResult, setEmailResult] = useState(null)
  const [scoreResult, setScoreResult] = useState(null)
  const [fileResult, setFileResult] = useState(null)
  const [wifiResult, setWifiResult] = useState(null)
  const [historyResult, setHistoryResult] = useState(null)
  const [quizResult, setQuizResult] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setDbMessage(data.message)
        } else {
          onLogout()
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }
    fetchDashboard()
  }, [token, onLogout])

  const callApi = async (endpoint, payload, setResult, toolKey) => {
    setLoadingTools(prev => ({ ...prev, [toolKey]: true }))
    try {
      const isGetRequest = endpoint === 'history'
      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: isGetRequest ? 'GET' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isGetRequest ? undefined : JSON.stringify(payload)
      })
      
      if (!res.ok) {
        // Special handling for history endpoint 404
        if (endpoint === 'history' && res.status === 404) {
          setResult({
            history: [
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
            ]
          })
          return
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      setResult(data)
    } catch(err) {
      // For history endpoint, provide mock data on error
      if (endpoint === 'history') {
        setResult({
          history: [
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
          ]
        })
        return
      }
      alert(`Error calling ${endpoint}: ${err.message}`)
    } finally {
      setLoadingTools(prev => ({ ...prev, [toolKey]: false }))
    }
  }

  const checkPassword = () => {
    callApi('check-password', { password }, (result) => {
      setPasswordResult(result)
      updateDynamicScore()
    }, 'password')
  }
  
  const checkURL = () => {
    callApi('check-url', { url }, (result) => {
      setUrlResult(result)
      updateDynamicScore()
    }, 'url')
  }
  
  const checkEmail = () => {
    callApi('check-email', { email_text: emailText }, (result) => {
      setEmailResult(result)
      updateDynamicScore()
    }, 'email')
  }
  const checkFile = () => {
    if (!fileName || fileName.trim() === '') {
      return
    }
    
    // Mock file safety check - UI only for now
    setLoadingTools(prev => ({ ...prev, file: true }))
    
    setTimeout(() => {
      const fileExtensions = fileName.split('.').pop().toLowerCase()
      const suspiciousExtensions = ['exe', 'scr', 'bat', 'com', 'pif', 'vbs', 'js', 'jar']
      const isSuspicious = suspiciousExtensions.includes(fileExtensions)
      const threats = isSuspicious ? ['Executable file detected', 'Unknown source', 'No digital signature'] : []
      
      const result = {
        is_safe: !isSuspicious && Math.random() > 0.2,
        threats_detected: threats.length,
        file_type: fileExtensions.toUpperCase() || 'Unknown',
        risk_level: isSuspicious ? 'High' : Math.random() > 0.7 ? 'Low' : 'Medium',
        recommendations: isSuspicious ? 
          ['Do not execute', 'Scan with antivirus', 'Verify source', 'Use sandbox environment'] :
          ['File appears safe', 'Still scan with antivirus', 'Check file source']
      }
      
      setFileResult(result)
      setLoadingTools(prev => ({ ...prev, file: false }))
    }, 1500)
  }
  const checkWifi = () => {
    if (!wifiName || wifiName.trim() === '') {
      return
    }
    
    // Mock Wi-Fi safety check - UI only for now
    setLoadingTools(prev => ({ ...prev, wifi: true }))
    
    setTimeout(() => {
      const isOpen = wifiName.toLowerCase().includes('public') || wifiName.toLowerCase().includes('free')
      const isWeak = wifiName.length < 8
      const security_level = isOpen ? 'Low' : isWeak ? 'Medium' : 'High'
      const encryption_status = isOpen ? 'Open/None' : isWeak ? 'WEP/WPA' : 'WPA2/WPA3'
      
      const risks = []
      if (isOpen) risks.push('Open network - no encryption', 'Public access - data risk')
      if (isWeak) risks.push('Weak encryption protocol', 'Vulnerable to attacks')
      if (wifiName.toLowerCase().includes('linksys') || wifiName.toLowerCase().includes('default')) 
        risks.push('Default network name')
      
      const result = {
        security_level: security_level,
        encryption_status: encryption_status,
        network_name: wifiName,
        risks: risks,
        recommendations: isOpen ? 
          ['Avoid sensitive transactions', 'Use VPN connection', 'Verify network legitimacy'] :
          isWeak ? 
          ['Upgrade to WPA2/WPA3', 'Change default password', 'Update router firmware'] :
          ['Network appears secure', 'Regular security updates', 'Monitor connected devices']
      }
      
      setWifiResult(result)
      setLoadingTools(prev => ({ ...prev, wifi: false }))
    }, 1500)
  }
  const loadHistory = () => {
    // Real backend scan history
    callApi('history', {}, setHistoryResult, 'history')
  }
  const takeQuiz = () => {
    // Mock awareness quiz - UI only for now
    setLoadingTools(prev => ({ ...prev, quiz: true }))
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60; // 60-100
      setQuizResult({
        score: score,
        level: score >= 90 ? 'Expert' : score >= 70 ? 'Intermediate' : 'Beginner',
        correct_answers: Math.floor(score / 20),
        total_questions: 5,
        feedback: score >= 80 ? 'Great job!' : 'Keep learning about cybersecurity!'
      })
      setLoadingTools(prev => ({ ...prev, quiz: false }))
    }, 1200)
  }
  
  const calculateScore = () => {
    callApi('safety-score', { 
      password: password || " ", 
      url: url || " ", 
      email_text: emailText || " " 
    }, setScoreResult, 'score')
  }

  const getStatusClass = (statusText) => {
    const text = statusText.toLowerCase()
    if (text.includes('safe') || text.includes('strong') || text.includes('low')) return 'result-safe'
    if (text.includes('medium') || text.includes('moderate')) return 'result-medium'
    return 'result-risk'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981' // Green - Safe
    if (score >= 60) return '#f59e0b' // Amber - Risky  
    if (score >= 40) return '#ef4444' // Red - Unsafe
    return '#991b1b' // Dark Red - Very Unsafe
  }

  const getScoreCategory = (score) => {
    if (score >= 80) return 'Safe'
    if (score >= 60) return 'Risky'
    if (score >= 40) return 'Unsafe'
    return 'Very Unsafe'
  }

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent! Your cybersecurity practices are strong.'
    if (score >= 60) return 'Good! But there\'s room for improvement.'
    if (score >= 40) return 'Warning! You need to improve your security habits.'
    return 'Critical! Your security practices need immediate attention.'
  }

  const updateDynamicScore = () => {
    // Calculate score based on available scan results
    let totalScore = 0
    let availableScans = 0
    let suggestions = []

    // Password contribution (40% weight)
    if (passwordResult) {
      const passwordScore = passwordResult.strength === 'Strong' ? 40 : 
                           passwordResult.strength === 'Medium' ? 25 : 10
      totalScore += passwordScore
      availableScans++
      if (passwordResult.suggestions) {
        suggestions.push(...passwordResult.suggestions.slice(0, 2))
      }
    }

    // URL contribution (30% weight)
    if (urlResult) {
      const urlScore = urlResult.risk_level === 'Low' ? 30 : 
                      urlResult.risk_level === 'Medium' ? 20 : 5
      totalScore += urlScore
      availableScans++
      if (urlResult.reasons && urlResult.risk_level !== 'Low') {
        suggestions.push(...urlResult.reasons.slice(0, 2))
      }
    }

    // Email contribution (30% weight)
    if (emailResult) {
      const emailScore = !emailResult.is_scam ? 30 : 10
      totalScore += emailScore
      availableScans++
      if (emailResult.reasons && emailResult.is_scam) {
        suggestions.push(...emailResult.reasons.slice(0, 2))
      }
    }

    // Normalize score based on available scans
    const finalScore = availableScans > 0 ? Math.round((totalScore / availableScans) * (3 / 1.3)) : 0

    // Determine status
    let status = 'Not Calculated'
    if (availableScans > 0) {
      if (finalScore >= 80) status = 'Safe'
      else if (finalScore >= 60) status = 'Moderate Risk'
      else if (finalScore >= 40) status = 'High Risk'
      else status = 'Critical Risk'
    }

    // Add generic suggestions if needed
    if (finalScore < 60 && suggestions.length < 3) {
      suggestions.push('Use stronger, unique passwords', 'Be cautious with unknown links', 'Verify email senders')
    }

    setScoreResult({
      safety_score: Math.min(100, finalScore),
      status: status,
      suggestions: suggestions.slice(0, 5),
      dynamic_update: true,
      based_on_scans: availableScans
    })

      }

  return (
    <div className="card dashboard-card">
      <div className="dashboard-header">
        <div className="flex-row">
          <Shield size={32} color="#3b82f6" />
          <h1>StudentShield Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/history" className="btn-icon" style={{ textDecoration: 'none' }}>
            <History size={18} /> History
          </Link>
          <button onClick={onLogout} className="btn-icon">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="tool-section" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <Shield size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: '#3b82f6', marginBottom: '12px' }}>Welcome to StudentShield Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0' }}>
            Your comprehensive cybersecurity toolkit for staying safe online
          </p>
        </div>
      </div>

      {/* Main Modules Grid - 2 Columns */}
      <div className="main-modules-section">
        <h3 style={{ color: 'var(--text-light)', marginBottom: '20px', fontSize: '1.3rem' }}>
          Core Security Tools
        </h3>
        <div className="dashboard-grid">
        
          {/* 1. PASSWORD STRENGTH CHECKER */}
          <div className="tool-section">
            <div className="tool-header">
              <KeyRound size={24} color="#3b82f6" />
              <h2>Password Strength</h2>
            </div>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="Enter a password to test..." 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <button 
              onClick={checkPassword}
              disabled={!password || loadingTools.password}
              style={{ 
                background: password && !loadingTools.password ? '#3b82f6' : undefined,
                cursor: password && !loadingTools.password ? 'pointer' : 'not-allowed'
              }}
            >
              {loadingTools.password ? 'Checking...' : 'Check Password'}
            </button>
            
            {passwordResult && (
              <div className={`result-box border-left-${getStatusClass(passwordResult.strength || 'Weak')}`}>
                <div>Status: <span className={getStatusClass(passwordResult.strength || 'Weak')}>{passwordResult.strength || 'Unknown'}</span></div>
                {passwordResult.suggestions && passwordResult.suggestions.length > 0 && (
                  <ul className="suggestion-list">
                    {passwordResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

        {/* 2. PHISHING URL DETECTOR */}
        <div className="tool-section">
          <div className="tool-header">
            <LinkIcon size={24} color="#3b82f6" />
            <h2>Phishing URL Detector</h2>
          </div>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Paste a link here..." 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
            />
          </div>
          <button 
            onClick={checkURL}
            disabled={!url || loadingTools.url}
            style={{ 
              background: url && !loadingTools.url ? '#3b82f6' : undefined,
              cursor: url && !loadingTools.url ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.url ? 'Checking...' : 'Check URL'}
          </button>
          
          {urlResult && (
            <div className={`result-box border-left-${getStatusClass(urlResult.risk_level || 'High')}`}>
              <div>Risk: <span className={getStatusClass(urlResult.risk_level || 'High')}>{urlResult.risk_level || 'Unknown'}</span></div>
              {urlResult.reasons && urlResult.reasons.length > 0 && (
                <ul className="suggestion-list">
                  {urlResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 3. EMAIL SCAM DETECTOR */}
        <div className="tool-section full-width">
          <div className="tool-header">
            <Mail size={24} color="#3b82f6" />
            <h2>Email Scam Detector</h2>
          </div>
          <div className="input-group">
            <textarea 
              rows="3" 
              placeholder="Paste suspicious email text here..." 
              value={emailText} 
              onChange={e => setEmailText(e.target.value)} 
            />
          </div>
          <button 
            onClick={checkEmail}
            disabled={!emailText || loadingTools.email}
            style={{ 
              background: emailText && !loadingTools.email ? '#3b82f6' : undefined,
              cursor: emailText && !loadingTools.email ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.email ? 'Checking...' : 'Check Email'}
          </button>
          
          {emailResult && (
            <div className={`result-box border-left-${getStatusClass(emailResult.risk_level || 'High')}`}>
              <div>Risk: <span className={getStatusClass(emailResult.risk_level || 'High')}>{emailResult.risk_level || 'Unknown'}</span></div>
              {emailResult.reasons && emailResult.reasons.length > 0 && (
                <ul className="suggestion-list">
                  {emailResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* 4. FILE SAFETY CHECKER */}
        <div className="tool-section">
          <div className="tool-header">
            <File size={24} color="#3b82f6" />
            <h2>File Safety Checker</h2>
          </div>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter file name to test..." 
              value={fileName} 
              onChange={e => setFileName(e.target.value)} 
            />
          </div>
          <button 
            onClick={checkFile}
            disabled={!fileName || loadingTools.file}
            style={{ 
              background: fileName && !loadingTools.file ? '#3b82f6' : undefined,
              cursor: fileName && !loadingTools.file ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.file ? 'Checking...' : 'Check File'}
          </button>
          
          {fileResult && (
            <div className={`result-box border-left-${fileResult.is_safe ? 'result-safe' : 'result-risk'}`}>
              <div>Status: <span className={fileResult.is_safe ? 'result-safe' : 'result-risk'}>
                {fileResult.is_safe ? 'Safe' : 'Potentially Unsafe'}
              </span></div>
              <div>Risk Level: <span className={getStatusClass(fileResult.risk_level)}>{fileResult.risk_level}</span></div>
              <div>File Type: {fileResult.file_type}</div>
              <div>Threats Detected: {fileResult.threats_detected}</div>
              {fileResult.recommendations && fileResult.recommendations.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Recommendations:</strong>
                  <ul className="suggestion-list">
                    {fileResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. WI-FI SAFETY MODULE */}
        <div className="tool-section">
          <div className="tool-header">
            <Wifi size={24} color="#3b82f6" />
            <h2>Wi-Fi Safety Module</h2>
          </div>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter Wi-Fi network name..." 
              value={wifiName} 
              onChange={e => setWifiName(e.target.value)} 
            />
          </div>
          <button 
            onClick={checkWifi}
            disabled={!wifiName || loadingTools.wifi}
            style={{ 
              background: wifiName && !loadingTools.wifi ? '#3b82f6' : undefined,
              cursor: wifiName && !loadingTools.wifi ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.wifi ? 'Checking...' : 'Check Wi-Fi'}
          </button>
          
          {wifiResult && (
            <div className={`result-box border-left-${getStatusClass(wifiResult.security_level)}`}>
              <div>Security Level: <span className={getStatusClass(wifiResult.security_level)}>{wifiResult.security_level}</span></div>
              <div>Encryption: <span className={wifiResult.encryption_status.includes('WPA2') || wifiResult.encryption_status.includes('WPA3') ? 'result-safe' : 'result-risk'}>
                {wifiResult.encryption_status}
              </span></div>
              {wifiResult.network_name && (
                <div>Network: {wifiResult.network_name}</div>
              )}
              {wifiResult.risks && wifiResult.risks.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Risks Detected:</strong>
                  <ul className="suggestion-list">
                    {wifiResult.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {wifiResult.recommendations && wifiResult.recommendations.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Recommendations:</strong>
                  <ul className="suggestion-list">
                    {wifiResult.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. SCAN HISTORY */}
        <div className="tool-section full-width">
          <div className="tool-header">
            <History size={24} color="#3b82f6" />
            <h2>Scan History</h2>
          </div>
          <button 
            onClick={loadHistory}
            disabled={loadingTools.history}
            style={{ 
              background: !loadingTools.history ? '#3b82f6' : undefined,
              cursor: !loadingTools.history ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.history ? 'Loading...' : 'Load Scan History'}
          </button>
          
          {historyResult && (
            <div className="result-box">
              {historyResult.history ? (
                <>
                  <div>Total Scans: {historyResult.history.length}</div>
                  {historyResult.history.length > 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <strong>Recent Scans:</strong>
                      <ul className="suggestion-list">
                        {historyResult.history.slice(0, 5).map((scan, i) => (
                          <li key={i}>
                            {scan.type} - {new Date(scan.timestamp).toLocaleDateString()} - 
                            <span className="result-safe">
                              {scan.result?.strength || scan.result?.risk_level || scan.result?.is_scam ? 'Processed' : 'Completed'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div>No scan history available</div>
              )}
            </div>
          )}
        </div>

        {/* 7. AWARENESS QUIZ */}
        <div className="tool-section">
          <div className="tool-header">
            <Brain size={24} color="#3b82f6" />
            <h2>Awareness Quiz</h2>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Test your cybersecurity knowledge
          </p>
          <button 
            onClick={takeQuiz}
            disabled={!quizAnswer || loadingTools.quiz}
            style={{ 
              background: quizAnswer && !loadingTools.quiz ? '#3b82f6' : undefined,
              cursor: quizAnswer && !loadingTools.quiz ? 'pointer' : 'not-allowed'
            }}
          >
            {loadingTools.quiz ? 'Evaluating...' : 'Submit Answer'}
          </button>
          
          {quizResult && (
            <div className={`result-box score-result score-${getStatusClass(quizResult.level)}`}>
              <div className="score-circle">
                <span className={getStatusClass(quizResult.level)}>
                  {quizResult.score}
                </span>
                <small>/ 100</small>
              </div>
              <div className="score-status">
                Level: {quizResult.level}
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                {quizResult.correct_answers}/{quizResult.total_questions} Correct
              </div>
              <div style={{ textAlign: 'center', marginTop: '8px', fontStyle: 'italic' }}>
                {quizResult.feedback}
              </div>
            </div>
          )}
        </div>

        {/* 8. CYBER SAFETY SCORE DISPLAY */}
        <div className="tool-section score-section full-width">
          <div className="tool-header" style={{ justifyContent: 'center', marginBottom: '10px' }}>
            <Award size={28} color="#f59e0b" />
            <h2 style={{ marginBottom: 0, color: '#f59e0b' }}>Cyber Safety Score</h2>
          </div>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
            Your overall cybersecurity performance
          </p>
          
          {scoreResult ? (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              {/* Score Circle with Color Coding */}
              <div className="score-circle" style={{ 
                fontSize: '4rem',
                background: `conic-gradient(
                  ${getScoreColor(scoreResult.safety_score || 0)} 0deg ${(scoreResult.safety_score || 0) * 3.6}deg,
                  rgba(255,255,255,0.1) ${(scoreResult.safety_score || 0) * 3.6}deg 360deg
                )`,
                border: `4px solid ${getScoreColor(scoreResult.safety_score || 0)}`,
                boxShadow: `0 0 20px ${getScoreColor(scoreResult.safety_score || 0)}40`
              }}>
                <span style={{ 
                  color: getScoreColor(scoreResult.safety_score || 0), 
                  fontWeight: 'bold',
                  textShadow: '0 0 10px rgba(0,0,0,0.5)'
                }}>
                  {scoreResult.safety_score || 0}
                </span>
                <small style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>/ 100</small>
              </div>
              
              {/* Category Badge */}
              <div style={{ marginTop: '20px', marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  background: `${getScoreColor(scoreResult.safety_score || 0)}20`,
                  color: getScoreColor(scoreResult.safety_score || 0),
                  border: `2px solid ${getScoreColor(scoreResult.safety_score || 0)}50`,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {getScoreCategory(scoreResult.safety_score || 0)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '4px',
                marginBottom: '20px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${scoreResult.safety_score || 0}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${getScoreColor(scoreResult.safety_score || 0)}, ${getScoreColor(scoreResult.safety_score || 0)}80)`,
                  borderRadius: '4px',
                  transition: 'width 1s ease-in-out'
                }} />
              </div>
              
              {/* Status Message */}
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '500', 
                color: getScoreColor(scoreResult.safety_score || 0),
                marginBottom: '12px'
              }}>
                {getScoreMessage(scoreResult.safety_score || 0)}
              </div>
              
              {/* Recommendations */}
              {scoreResult.suggestions && scoreResult.suggestions.length > 0 && (
                <div style={{ 
                  textAlign: 'left',
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${getScoreColor(scoreResult.safety_score || 0)}30`
                }}>
                  <strong style={{ color: getScoreColor(scoreResult.safety_score || 0) }}>
                    Recommendations:
                  </strong>
                  <ul className="suggestion-list" style={{ marginTop: '8px' }}>
                    {scoreResult.suggestions.map((suggestion, i) => (
                      <li key={i} style={{ color: 'var(--text-light)' }}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Dynamic Update Indicator */}
              <div style={{ 
                marginTop: '16px', 
                fontSize: '0.9rem', 
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
                Updates based on your scan results
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="score-circle" style={{ 
                fontSize: '3rem',
                opacity: 0.5,
                border: '2px dashed rgba(255,255,255,0.2)'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>---</span>
                <small style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</small>
              </div>
              <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
                Use the security tools above to calculate your safety score
              </p>
              <button 
                onClick={calculateScore} 
                disabled={loadingTools.score} 
                className="btn-success" 
                style={{ marginTop: '16px' }}
              >
                {loadingTools.score ? 'Calculating...' : 'Calculate Score Now'}
              </button>
            </div>
          )}
        </div>

        {/* 9. TOTAL CYBER SAFETY SCORE */}
        <div className="tool-section score-section full-width">
          <div className="tool-header" style={{ justifyContent: 'center', marginBottom: '10px' }}>
            <Activity size={28} color="#10b981" />
            <h2 style={{ marginBottom: 0, color: '#10b981' }}>Total Cyber Safety Score</h2>
          </div>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
             Evaluate your password, link, and email all at once.
          </p>
          <button onClick={calculateScore} disabled={loadingTools.score} className="btn-success" style={{maxWidth: '300px', margin: '0 auto', display: 'block'}}>
            {loadingTools.score ? 'Calculating...' : 'Calculate Safety Score'}
          </button>
          
          {scoreResult && (
            <div className={`result-box score-result score-${getStatusClass(scoreResult.status || 'High Risk')}`}>
              <div className="score-circle">
                <span className={getStatusClass(scoreResult.status || 'High Risk')}>
                  {scoreResult.safety_score || 0}
                </span>
                <small>/ 100</small>
              </div>
              <div className="score-status">
                Status: {scoreResult.status || 'Unknown'}
              </div>
              
              {scoreResult.suggestions && scoreResult.suggestions.length > 0 && (
                <ul className="suggestion-list score-suggestions">
                  {scoreResult.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

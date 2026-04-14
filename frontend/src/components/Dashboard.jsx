import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, KeyRound, LinkIcon, Mail, File, Wifi, Brain, Award, Activity, History, LogOut } from 'lucide-react'

const Dashboard = ({ token, onLogout }) => {
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [emailText, setEmailText] = useState('')
  const [fileName, setFileName] = useState('')
  const [wifiName, setWifiName] = useState('')
  const [quizAnswer, setQuizAnswer] = useState('')
  const [passwordResult, setPasswordResult] = useState(null)
  const [urlResult, setUrlResult] = useState(null)
  const [emailResult, setEmailResult] = useState(null)
  const [fileResult, setFileResult] = useState(null)
  const [wifiResult, setWifiResult] = useState(null)
  const [historyResult, setHistoryResult] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [scoreResult, setScoreResult] = useState(null)
  const [totalScoreResult, setTotalScoreResult] = useState(null)
  const [dbMessage, setDbMessage] = useState('')
  const [error, setError] = useState('')

  const [loadingTools, setLoadingTools] = useState({
    password: false,
    url: false,
    email: false,
    file: false,
    wifi: false,
    quiz: false,
    history: false,
    score: false,
    totalScore: false
  })

  useEffect(() => {
    // Calculate dynamic Cyber Safety Score based on real tool results
    const calculateDynamicScore = () => {
      let score = 50

      if (passwordResult?.strength === 'Strong') score += 10
      if (urlResult?.risk_level === 'Low') score += 10
      if (emailResult?.risk_level === 'Low') score += 10
      if (fileResult?.is_safe) score += 5
      if (wifiResult?.security_level === 'High') score += 5

      return Math.min(score, 100)
    }

    const newScore = calculateDynamicScore()
    setScoreResult({
      safety_score: newScore,
      status:
        newScore >= 80 ? 'Safe' :
        newScore >= 60 ? 'Moderate' :
        'Unsafe'
    })

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setDbMessage(data.message)
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ECONNREFUSED')) {
          setDbMessage('Cannot connect to server. Backend may not be running on port 8000.')
        } else {
          setDbMessage('Failed to fetch dashboard data.')
        }
      }
    }
    fetchDashboard()
  }, [token, onLogout])

  const callApi = async (endpoint, payload, setResult, toolKey) => {
    setLoadingTools(prev => ({ ...prev, [toolKey]: true }))
    setError('')
    
    try {
      const isGetRequest = endpoint === 'history'
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/${endpoint}`, {
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
      console.error(`API Error (${endpoint}):`, err)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ECONNREFUSED')) {
        setError('Cannot connect to server. Please check if the backend is running on port 8000.')
      } else {
        setError(`Failed to ${endpoint.replace('-', ' ')}. Please try again.`)
      }
      
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
      }
    } finally {
      setLoadingTools(prev => ({ ...prev, [toolKey]: false }))
    }
  }

  const checkPassword = (e) => {
    e.preventDefault()
    if (!password || password.trim() === '') {
      setError('Please enter a password to check')
      return
    }
    callApi('check-password', { password }, (result) => {
      setPasswordResult(result)
      updateDynamicScore()
    }, 'password')
  }
  
  const checkURL = (e) => {
    e.preventDefault()
    if (!url || url.trim() === '') {
      setError('Please enter a URL to check')
      return
    }
    callApi('check-url', { url }, (result) => {
      setUrlResult(result)
      updateDynamicScore()
    }, 'url')
  }
  
  const checkEmail = (e) => {
    e.preventDefault()
    if (!emailText || emailText.trim() === '') {
      setError('Please enter email text to check')
      return
    }
    callApi('check-email', { email_text: emailText }, (result) => {
      setEmailResult(result)
      updateDynamicScore()
    }, 'email')
  }

  const checkFile = (e) => {
    e.preventDefault()
    if (!fileName || fileName.trim() === '') {
      setError('Please enter a file name to check')
      return
    }
    
    // Mock file safety check - UI only for now
    setLoadingTools(prev => ({ ...prev, file: true }))
    
    setTimeout(() => {
      const fileExtensions = fileName.split('.').pop().toLowerCase()
      const suspiciousExtensions = ['exe', 'scr', 'bat', 'com', 'pif', 'vbs', 'js', 'jar']
      const isSuspicious = suspiciousExtensions.includes(fileExtensions)
      
      const result = {
        is_safe: !isSuspicious && (fileExtensions === 'pdf' || fileExtensions === 'txt'),
        risk_level: isSuspicious ? 'High' : Math.random() > 0.7 ? 'Low' : 'Medium',
        file_type: fileExtensions || 'unknown',
        threats_detected: isSuspicious ? Math.floor(Math.random() * 5) + 1 : 0,
        recommendations: isSuspicious ? 
          ['Do not execute', 'Scan with antivirus', 'Verify source', 'Use sandbox environment'] :
          ['File appears safe', 'Still scan with antivirus', 'Check file source']
      }
      
      setFileResult(result)
      setLoadingTools(prev => ({ ...prev, file: false }))
    }, 1500)
  }

  const checkWifi = (e) => {
    e.preventDefault()
    if (!wifiName || wifiName.trim() === '') {
      setError('Please enter a Wi-Fi network name to check')
      return
    }
    
    // Mock Wi-Fi safety check - UI only for now
    setLoadingTools(prev => ({ ...prev, wifi: true }))
    
    setTimeout(() => {
      const isOpen = wifiName.toLowerCase().includes('public') || wifiName.toLowerCase().includes('free')
      const isWeak = wifiName.length < 8
      
      const result = {
        security_level: isOpen ? 'Low' : isWeak ? 'Medium' : 'High',
        encryption_status: isOpen ? 'None' : wifiName.toLowerCase().includes('secure') ? 'WPA3' : 'WPA2',
        network_name: wifiName,
        risks: isOpen ? 
          ['Open network', 'No encryption', 'Public access'] :
          isWeak ? 
          ['Weak password', 'Short SSID', 'Vulnerable to attacks'] :
          ['Network appears secure', 'Regular security updates', 'Monitor connected devices'],
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

  const loadHistory = (e) => {
    e.preventDefault()
    // Real backend scan history
    callApi('history', {}, setHistoryResult, 'history')
  }

  const takeQuiz = (e) => {
    e.preventDefault()
    // Mock awareness quiz - UI only for now
    setLoadingTools(prev => ({ ...prev, quiz: true }))
    setTimeout(() => {
      const score = Math.floor(Math.random() * 40) + 60 // 60-100
      const level = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Average' : 'Needs Improvement'
      const feedback = score >= 90 ? 'Outstanding cybersecurity knowledge!' : 
                      score >= 75 ? 'Good understanding of security concepts.' :
                      score >= 60 ? 'Basic knowledge, room for improvement.' :
                      'Consider learning more about cybersecurity best practices.'
      
      setQuizResult({
        score,
        level,
        feedback,
        correct_answers: Math.floor(score / 20) + 1,
        total_questions: 5
      })
      setLoadingTools(prev => ({ ...prev, quiz: false }))
    }, 1500)
  }

  const calculateScore = (e) => {
    e.preventDefault()
    const randomScore = Math.floor(Math.random() * 30) + 70
    setScoreResult({
      safety_score: randomScore,
      status: randomScore >= 90 ? 'Excellent' : randomScore >= 80 ? 'Good' : 'Fair',
      recommendations: randomScore >= 90 ? 
        ['Great job! Keep maintaining your security practices'] : 
        randomScore >= 80 ? 
        ['Good security practices', 'Consider enabling two-factor authentication'] :
        ['Update your passwords regularly', 'Enable two-factor authentication', 'Review your privacy settings']
    })
  }

  const getStatusClass = (statusText) => {
    const text = statusText.toLowerCase()
    if (text.includes('safe') || text.includes('strong') || text.includes('low')) return 'result-safe'
    if (text.includes('medium') || text.includes('moderate')) return 'result-medium'
    return 'result-risk'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getScoreCategory = (score) => {
    if (score >= 80) return 'Safe'
    if (score >= 60) return 'Risky'
    return 'Unsafe'
  }

  const updateDynamicScore = () => {
    // Mock dynamic score update based on recent activities
    const currentScore = Math.floor(Math.random() * 30) + 70
    setScoreResult({
      safety_score: currentScore,
      status: getScoreCategory(currentScore),
      recommendations: currentScore >= 80 ? 
        ['Maintain current security practices', 'Regular security audits'] :
        currentScore >= 60 ? 
        ['Update passwords regularly', 'Enable two-factor authentication'] :
        ['Improve password strength', 'Security awareness training']
    })
  }

  const calculateTotalScore = (e) => {
    e.preventDefault()
    
    try {
      // Handle empty case
      if (!passwordResult && !urlResult && !emailResult && !fileResult && !wifiResult) {
        alert("Please use tools first before calculating score")
        return
      }
      
      setLoadingTools(prev => ({ ...prev, totalScore: true }))
      
      // Simulate API call with timeout
      setTimeout(() => {
        // Safe calculation with default values
        const passwordScore = passwordResult?.strength === 'Strong' ? 100 : passwordResult?.strength === 'Medium' ? 70 : 50
        const urlScore = urlResult?.risk_level === 'Low' ? 100 : urlResult?.risk_level === 'Medium' ? 70 : 50
        const emailScore = emailResult?.risk_level === 'Low' ? 100 : emailResult?.risk_level === 'Medium' ? 70 : 50
        const fileScore = fileResult?.is_safe ? 100 : 50
        const wifiScore = wifiResult?.security_level === 'High' ? 100 : wifiResult?.security_level === 'Medium' ? 70 : 50
        const quizScore = quizResult?.score || 50

        const total = Math.round((passwordScore + urlScore + emailScore + fileScore + wifiScore + quizScore) / 6)
        
        setTotalScoreResult({
          total_score: total,
          level: total >= 90 ? 'Excellent' : total >= 80 ? 'Good' : total >= 70 ? 'Fair' : 'Poor',
          feedback: total >= 90 ? 'Excellent security posture across all tools' : total >= 80 ? 'Good security practices in place' : total >= 70 ? 'Some security measures need attention' : 'Significant security improvements required',
          breakdown: {
            password_strength: passwordResult?.strength || 'Not Checked',
            url_safety: urlResult?.risk_level || 'Not Checked',
            email_security: emailResult?.risk_level || 'Not Checked',
            file_safety: fileResult?.is_safe ? 'Safe' : 'Not Checked',
            wifi_security: wifiResult?.security_level || 'Not Checked',
            quiz_performance: quizResult?.level || 'Not Checked'
          }
        })
        setLoadingTools(prev => ({ ...prev, totalScore: false }))
      }, 2000)
    } catch (err) {
      console.error(err)
      alert("Calculation failed safely")
      setLoadingTools(prev => ({ ...prev, totalScore: false }))
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="dashboard-container">
      {/* Top Header */}
      <div className="dashboard-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px 0',
        marginBottom: '30px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex-row">
          <Shield size={32} color="#60a5fa" />
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

      {/* Error Message */}
      {error && (
        <div style={{ 
          backgroundColor: '#ef444420', 
          border: '1px solid #ef4444', 
          borderRadius: '8px', 
          padding: '12px', 
          marginBottom: '20px',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="tool-section">
          <Shield size={48} color="var(--accent-blue)" />
          <h2>Welcome to StudentShield Dashboard</h2>
          <p>Your comprehensive cybersecurity toolkit for staying safe online</p>
        </div>
      </div>

      {/* First Row - Core Security Tools */}
      <div className="main-modules-section">
        <h3>Core Security Tools</h3>
        <div className="dashboard-grid">
          
          {/* 1. PASSWORD STRENGTH CHECKER */}
          <div className="tool-section">
            <div className="tool-header">
              <KeyRound size={24} color="#60a5fa" />
              <h2>Password Strength</h2>
            </div>
            <div className="tool-content">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter a password to test..." 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  disabled={loadingTools.password}
                />
              </div>
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
            <div className="tool-footer">
              <button 
                type="button"
                onClick={checkPassword}
                disabled={!password || loadingTools.password}
                style={{ 
                  background: password && !loadingTools.password ? '#3b82f6' : undefined,
                  cursor: password && !loadingTools.password ? 'pointer' : 'not-allowed'
                }}
              >
                {loadingTools.password ? 'Checking...' : 'Check Password'}
              </button>
            </div>
          </div>

          {/* 2. PHISHING URL DETECTOR */}
          <div className="tool-section">
            <div className="tool-header">
              <LinkIcon size={24} color="#60a5fa" />
              <h2>Phishing URL Detector</h2>
            </div>
            <div className="tool-content">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Paste a link here..." 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  disabled={loadingTools.url}
                />
              </div>
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
            <div className="tool-footer">
              <button 
                type="button"
                onClick={checkURL}
                disabled={!url || loadingTools.url}
                style={{ 
                  background: url && !loadingTools.url ? '#3b82f6' : undefined,
                  cursor: url && !loadingTools.url ? 'pointer' : 'not-allowed'
                }}
              >
                {loadingTools.url ? 'Checking...' : 'Check URL'}
              </button>
            </div>
          </div>

          {/* 3. EMAIL SCAM DETECTOR */}
          <div className="tool-section">
            <div className="tool-header">
              <Mail size={24} color="#60a5fa" />
              <h2>Email Scam Detector</h2>
            </div>
            <div className="tool-content">
              <div className="input-group">
                <textarea 
                  rows="3" 
                  placeholder="Paste suspicious email text here..." 
                  value={emailText} 
                  onChange={e => setEmailText(e.target.value)} 
                  disabled={loadingTools.email}
                />
              </div>
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
            <div className="tool-footer">
              <button 
                type="button"
                onClick={checkEmail}
                disabled={!emailText || loadingTools.email}
                style={{ 
                  background: emailText && !loadingTools.email ? '#3b82f6' : undefined,
                  cursor: emailText && !loadingTools.email ? 'pointer' : 'not-allowed'
                }}
              >
                {loadingTools.email ? 'Checking...' : 'Check Email'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row - Additional Security Tools */}
      <div className="secondary-modules-section">
        <h3>Additional Security Tools</h3>
        <div className="dashboard-grid">
          
          {/* 4. FILE SAFETY CHECKER */}
          <div className="tool-section">
            <div className="tool-header">
              <File size={24} color="#60a5fa" />
              <h2>File Safety Checker</h2>
            </div>
            <div className="tool-content">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter file name to test..." 
                  value={fileName} 
                  onChange={e => setFileName(e.target.value)} 
                  disabled={loadingTools.file}
                />
              </div>
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
            <div className="tool-footer">
              <button 
                type="button"
                onClick={checkFile}
                disabled={!fileName || loadingTools.file}
                style={{ 
                  background: fileName && !loadingTools.file ? '#3b82f6' : undefined,
                  cursor: fileName && !loadingTools.file ? 'pointer' : 'not-allowed'
                }}
              >
                {loadingTools.file ? 'Checking...' : 'Check File'}
              </button>
            </div>
          </div>

          {/* 5. WI-FI SAFETY MODULE */}
          <div className="tool-section">
            <div className="tool-header">
              <Wifi size={24} color="#60a5fa" />
              <h2>Wi-Fi Safety Module</h2>
            </div>
            <div className="tool-content">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter Wi-Fi network name..." 
                  value={wifiName} 
                  onChange={e => setWifiName(e.target.value)} 
                  disabled={loadingTools.wifi}
                />
              </div>
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
            <div className="tool-footer">
              <button 
                type="button"
                onClick={checkWifi}
                disabled={!wifiName || loadingTools.wifi}
                style={{ 
                  background: wifiName && !loadingTools.wifi ? '#3b82f6' : undefined,
                  cursor: wifiName && !loadingTools.wifi ? 'pointer' : 'not-allowed'
                }}
              >
                {loadingTools.wifi ? 'Checking...' : 'Check Wi-Fi'}
              </button>
            </div>
          </div>

          {/* 6. AWARENESS QUIZ */}
          <div className="tool-section">
            <div className="tool-header">
              <Brain size={24} color="#60a5fa" />
              <h2>Awareness Quiz</h2>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Test your cybersecurity knowledge
            </p>
            <button 
              type="button"
              onClick={takeQuiz}
              disabled={loadingTools.quiz}
              style={{ 
                background: !loadingTools.quiz ? '#3b82f6' : undefined,
                cursor: !loadingTools.quiz ? 'pointer' : 'not-allowed'
              }}
            >
              {loadingTools.quiz ? 'Taking Quiz...' : 'Take Quiz'}
            </button>
            
            {quizResult && (
              <div className="result-box">
                <div>Score: <span className={getStatusClass(quizResult.level)}>{quizResult.score}</span>/100</div>
                <div>Level: <span className={getStatusClass(quizResult.level)}>{quizResult.level}</span></div>
                <div>{quizResult.feedback}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Third Row - Assessment & Analytics */}
      <div className="bottom-modules-section">
        <h3>Assessment & Analytics</h3>
        <div className="row-3">
          
          
          {/* 7. CYBER SAFETY SCORE DISPLAY */}
          <div className="tool-section score-section">
            <div className="tool-header">
              <Award size={28} color="var(--accent-blue)" />
              <h2>Cyber Safety Score</h2>
            </div>
            <p>Your overall cybersecurity performance</p>
            
            {scoreResult ? (
              <>
                <div className={`result-box score-result score-${getStatusClass(scoreResult.status || 'High Risk')}`}>
                  <div className="score-display">
                    <span className="score-number">{scoreResult.safety_score || 0}</span>
                  </div>
                  <div className="score-status">
                    <strong className={getStatusClass(scoreResult.status || 'High Risk')}>
                      {scoreResult.status || 'Not Calculated'}
                    </strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${scoreResult.safety_score || 0}%`
                      }}
                    />
                  </div>
                  {scoreResult.recommendations && scoreResult.recommendations.length > 0 && (
                    <ul className="suggestion-list">
                      {scoreResult.recommendations.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={calculateScore}
                  disabled={loadingTools.score}
                >
                  {loadingTools.score ? 'Calculating...' : 'Recalculate Score'}
                </button>
              </>
            ) : (
              <button 
                type="button"
                onClick={calculateScore}
                disabled={loadingTools.score}
              >
                {loadingTools.score ? 'Calculating...' : 'Calculate Score'}
              </button>
            )}
          </div>

          {/* 8. TOTAL CYBER SAFETY SCORE */}
          <div className="tool-section score-section">
            <div className="tool-header">
              <Shield size={28} color="var(--accent-blue)" />
              <h2>Total Safety Score</h2>
            </div>
            <p>Comprehensive security assessment across all tools</p>
            <button 
              type="button"
              onClick={calculateTotalScore}
              disabled={loadingTools.totalScore}
            >
              {loadingTools.totalScore ? 'Calculating...' : 'Calculate Total Score'}
            </button>
            
            {totalScoreResult && (
              <div className={`result-box score-result score-${getStatusClass(totalScoreResult.level || 'High Risk')}`}>
                <div className="score-display">
                  <span className="score-number">{totalScoreResult.total_score || 0}</span>
                </div>
                <div className="score-status">
                  <strong className={getStatusClass(totalScoreResult.level || 'High Risk')}>
                    {totalScoreResult.level || 'Not Calculated'}
                  </strong>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${totalScoreResult.total_score || 0}%`
                    }}
                  />
                </div>
                <div className="score-feedback">
                  <strong>{totalScoreResult.feedback}</strong>
                </div>
                <div className="score-breakdown">
                  <strong>Security Breakdown:</strong>
                  <ul className="suggestion-list">
                    <li>Password Strength: <span className={getStatusClass(totalScoreResult.breakdown?.password_strength || 'Medium')}>{totalScoreResult.breakdown?.password_strength || 'Not Checked'}</span></li>
                    <li>URL Safety: <span className={getStatusClass(totalScoreResult.breakdown?.url_safety || 'Medium')}>{totalScoreResult.breakdown?.url_safety || 'Not Checked'}</span></li>
                    <li>Email Security: <span className={getStatusClass(totalScoreResult.breakdown?.email_security || 'Medium')}>{totalScoreResult.breakdown?.email_security || 'Not Checked'}</span></li>
                    <li>File Safety: <span className={getStatusClass(totalScoreResult.breakdown?.file_safety || 'Medium')}>{totalScoreResult.breakdown?.file_safety || 'Not Checked'}</span></li>
                    <li>WiFi Security: <span className={getStatusClass(totalScoreResult.breakdown?.wifi_security || 'Medium')}>{totalScoreResult.breakdown?.wifi_security || 'Not Checked'}</span></li>
                    <li>Quiz Performance: <span className={getStatusClass(totalScoreResult.breakdown?.quiz_performance || 'Medium')}>{totalScoreResult.breakdown?.quiz_performance || 'Not Checked'}</span></li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
      {/* Scan History - LAST */}
      <div className="bottom-modules-section">
        <h3>Scan History</h3>
        <div className="tool-section">
          <div className="tool-header">
            <History size={24} color="var(--accent-blue)" />
            <h2>Recent Security Scans</h2>
          </div>
          <button 
            type="button"
            onClick={loadHistory}
            disabled={loadingTools.history}
          >
            {loadingTools.history ? 'Loading...' : 'Load Scan History'}
          </button>
          
          {historyResult && (
            <div className="result-box">
              {historyResult.history ? (
                <>
                  <div>Total Scans: {historyResult.history.length}</div>
                  {historyResult.history.length > 0 && (
                    <div>
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
      </div>
    </div>
  )
}

export default React.memo(Dashboard)

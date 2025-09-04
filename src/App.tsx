import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [electronMessage, setElectronMessage] = useState<string>('')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [calculationResult, setCalculationResult] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // 测试与Electron的IPC通信
  const testElectronCommunication = async () => {
    try {
      if (window.electron) {
        // 发送消息到主进程
        window.electron.sendMessage('ping')
        
        // 监听主进程的回复
        const unsubscribe = window.electron.onMessage('pong', (message: string) => {
          setElectronMessage(message)
          unsubscribe() // 收到消息后取消订阅
        })
      }
    } catch (err) {
      setError('与Electron通信失败: ' + String(err))
    }
  }

  // 调用Python后端API
  const fetchSystemInfo = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('http://localhost:8000/system-info')
      const data = await response.json()
      setSystemInfo(data)
    } catch (err) {
      setError('获取系统信息失败: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  // 测试计算功能
  const testCalculation = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('http://localhost:8000/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          a: 10,
          b: 5,
          operation: 'add'
        })
      })
      const data = await response.json()
      setCalculationResult(data.result)
    } catch (err) {
      setError('计算请求失败: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时检查Electron环境
  useEffect(() => {
    if (window.electron) {
      setElectronMessage('已连接到Electron')
    } else {
      setElectronMessage('在浏览器环境中运行')
    }
  }, [])

  return (
    <div className="app-container">
      <div className="header">
        <h1>Electron + React + Python 示例应用</h1>
        <div className="logos">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
      </div>

      <div className="status-section">
        <h2>状态信息</h2>
        <p className={window.electron ? 'status-connected' : 'status-browser'}>
          {electronMessage}
        </p>
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="features-section">
        <h2>功能测试</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Electron IPC通信</h3>
            <button onClick={testElectronCommunication} disabled={loading}>
              {loading ? '测试中...' : '测试通信'}
            </button>
          </div>

          <div className="feature-card">
            <h3>获取系统信息</h3>
            <button onClick={fetchSystemInfo} disabled={loading}>
              {loading ? '加载中...' : '获取信息'}
            </button>
            {systemInfo && (
              <div className="system-info">
                <p><strong>Python版本:</strong> {systemInfo.python_version}</p>
                <p><strong>平台:</strong> {systemInfo.platform}</p>
                <p><strong>操作系统:</strong> {systemInfo.os}</p>
              </div>
            )}
          </div>

          <div className="feature-card">
            <h3>后端计算</h3>
            <button onClick={testCalculation} disabled={loading}>
              {loading ? '计算中...' : '计算 10 + 5'}
            </button>
            {calculationResult !== null && (
              <p className="calculation-result">结果: {calculationResult}</p>
            )}
          </div>
        </div>
      </div>

      <div className="footer">
        <p>跨平台桌面客户端示例应用 - React + Electron + Python</p>
      </div>
    </div>
  )
}

export default App

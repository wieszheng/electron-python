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
  const [backendPort, setBackendPort] = useState<number | null>(null)

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

  // 通过Electron主进程调用Python后端API（推荐方式）
  const fetchSystemInfo = async () => {
    try {
      if (!window.electron) {
        setError('Electron API不可用');
        return;
      }
      
      setLoading(true)
      setError('')
      
      // 使用API转发功能
      const data = await window.electron.apiRequest('GET', '/system-info')
      setSystemInfo(data)
    } catch (err) {
      setError('获取系统信息失败: ' + String(err))
    } finally {
      setLoading(false)
    }
  }

  // 测试计算功能（通过Electron主进程转发）
  const testCalculation = async () => {
    try {
      if (!window.electron) {
        setError('Electron API不可用');
        return;
      }
      
      setLoading(true)
      setError('')
      
      // 使用API转发功能
      const data = await window.electron.apiRequest('POST', '/calculate', {
        a: 10,
        b: 5,
        operation: 'add'
      })
      setCalculationResult(data.result)
    } catch (err) {
      setError('计算请求失败: ' + String(err))
    } finally {
      setLoading(false)
    }
  }
  
  // 获取后端服务器端口
  const fetchBackendPort = async () => {
    try {
      if (!window.electron) {
        setError('Electron API不可用');
        return;
      }
      
      const port = await window.electron.getBackendPort();
      setBackendPort(port);
    } catch (err) {
      setError('获取后端端口失败: ' + String(err));
    }
  }

  // 组件挂载时检查Electron环境并获取后端端口
  useEffect(() => {
    if (window.electron) {
      setElectronMessage('已连接到Electron')
      fetchBackendPort(); // 组件挂载时获取后端端口
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
            {backendPort && (
              <p><strong>后端端口:</strong> {backendPort}</p>
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

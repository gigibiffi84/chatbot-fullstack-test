import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
    const [message, setMessage] = useState<string>('')


   useEffect(() => {
    const loadMessage = async () => {
      try {
        const res = await fetch('/api/tasks')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        // ... existing code ...
        setMessage(`Loaded ${Array.isArray(data?.tasks) ? data.tasks.length : 0} tasks`)
      } catch (err) {
        console.error(err)
        setMessage('Failed to load message')
      }
    }
    loadMessage()
  }, [])




  return (
    <>
<h1 class="text-3xl font-bold underline">
    Hello world!
  </h1>
    <p>{message}</p>

    </>
  )
}

export default App

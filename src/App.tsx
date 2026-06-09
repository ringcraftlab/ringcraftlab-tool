import { HashRouter, Route, Routes } from 'react-router-dom'
import { LpPage } from './pages/LpPage'
import { ToolPage } from './pages/ToolPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LpPage />} />
        <Route path="/tool" element={<ToolPage />} />
      </Routes>
    </HashRouter>
  )
}

export default App

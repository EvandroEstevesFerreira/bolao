import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Convite from './pages/Convite'
import Home from './pages/Home'
import Palpites from './pages/Palpites'
import Ranking from './pages/Ranking'
import Perfil from './pages/Perfil'
import Regulamento from './pages/Regulamento'
import Admin from './pages/Admin'
import Conquistas from './pages/Conquistas'
import Mural from './pages/Mural'
import CaraACara from './pages/CaraACara'
import PalpiteBonus from './pages/PalpiteBonus'
import Destaques from './pages/Destaques'
import Boloes from './pages/Boloes'
import Resultados from './pages/Resultados'
import Manual from './pages/Manual'

function P({ children, adminOnly }) {
  return <ProtectedRoute adminOnly={adminOnly}>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/convite" element={<Convite />} />
            <Route path="/" element={<P><Home /></P>} />
            <Route path="/palpites" element={<P><Palpites /></P>} />
            <Route path="/ranking" element={<P><Ranking /></P>} />
            <Route path="/perfil" element={<P><Perfil /></P>} />
            <Route path="/regulamento" element={<P><Regulamento /></P>} />
            <Route path="/conquistas" element={<P><Conquistas /></P>} />
            <Route path="/mural" element={<P><Mural /></P>} />
            <Route path="/cara-a-cara" element={<P><CaraACara /></P>} />
            <Route path="/bonus" element={<P><PalpiteBonus /></P>} />
            <Route path="/destaques" element={<P><Destaques /></P>} />
            <Route path="/boloes" element={<P><Boloes /></P>} />
            <Route path="/resultados" element={<P><Resultados /></P>} />
            <Route path="/manual" element={<P><Manual /></P>} />
            <Route path="/admin" element={<P adminOnly><Admin /></P>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

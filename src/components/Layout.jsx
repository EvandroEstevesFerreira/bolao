import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Home, Trophy, ClipboardList, User, Shield, LogOut } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/palpites', label: 'Palpites', icon: ClipboardList },
  { path: '/ranking', label: 'Ranking', icon: Trophy },
  { path: '/perfil', label: 'Perfil', icon: User },
]

export default function Layout({ children }) {
  const { perfil, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-dark text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">
              S
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight">Bolão Sistenge</h1>
              <p className="text-xs text-gray-400">Copa do Mundo 2026</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {perfil?.is_admin && (
              <Link
                to="/admin"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Painel Admin"
              >
                <Shield size={20} />
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-50">
        <div className="max-w-5xl mx-auto flex">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="mt-1">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <footer className="bg-gray-100 border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-500">
        Este sistema é ferramenta de acompanhamento e cálculo. A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
      </footer>
    </div>
  )
}

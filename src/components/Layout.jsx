import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  Home, Trophy, ClipboardList, User, Shield, LogOut,
  MessageCircle, Sun, Moon, Star, Menu, X, Tv, Users, BookOpen,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/palpites', label: 'Palpites', icon: ClipboardList },
  { path: '/ranking', label: 'Ranking', icon: Trophy },
  { path: '/mural', label: 'Mural', icon: MessageCircle },
  { path: '/perfil', label: 'Perfil', icon: User },
]

const menuItems = [
  { path: '/resultados', label: 'Resultados', icon: Tv },
  { path: '/destaques', label: 'Destaques', icon: Star },
  { path: '/conquistas', label: 'Conquistas', icon: Trophy },
  { path: '/cara-a-cara', label: 'Cara a Cara', icon: User },
  { path: '/boloes', label: 'Bolões', icon: Users },
  { path: '/bonus', label: 'Palpite Bônus', icon: Trophy },
  { path: '/regulamento', label: 'Regulamento', icon: ClipboardList },
  { path: '/manual', label: 'Manual', icon: BookOpen },
]

export default function Layout({ children }) {
  const { perfil, logout } = useAuth()
  const { tema, alternarTema } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100">
      <header className="bg-[#075E54] dark:bg-[#1F2C34] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="w-10 h-10 rounded-xl shadow-lg shadow-primary/25" />
            <div className="text-left">
              <h1 className="text-lg font-bold leading-tight">Bolão Copa 2026</h1>
              <p className="text-xs text-gray-400">Palpites & Ranking</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={alternarTema}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title={tema === 'claro' ? 'Tema escuro' : 'Tema claro'}
            >
              {tema === 'claro' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {perfil?.is_admin && (
              <Link
                to="/admin"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Painel Admin"
              >
                <Shield size={18} />
              </Link>
            )}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors sm:hidden"
            >
              {menuAberto ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {menuAberto && (
          <div className="border-t border-white/10 px-4 py-3 sm:hidden">
            <div className="grid grid-cols-2 gap-2">
              {menuItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuAberto(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    location.pathname === path
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="hidden sm:block border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {menuItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors ${
                  location.pathname === path
                    ? 'border-primary text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav className="bg-white dark:bg-[#202C33] border-t border-gray-200 dark:border-[#2A3942] sticky bottom-0 z-50">
        <div className="max-w-5xl mx-auto flex">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10 dark:bg-primary/20' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className="mt-0.5">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <footer className="bg-gray-100 dark:bg-[#1A2228] border-t border-gray-200 dark:border-[#2A3942] py-3 px-4 text-center text-xs text-gray-500 dark:text-gray-400">
        Este sistema é ferramenta de acompanhamento e cálculo. A entrega de qualquer prêmio é responsabilidade do organizador/grupo.
      </footer>
    </div>
  )
}

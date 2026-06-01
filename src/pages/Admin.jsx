import { useState } from 'react'
import {
  Users, Link2, Trophy, Settings, DollarSign,
  BarChart3, FileText, Database, Activity,
} from 'lucide-react'
import Layout from '../components/Layout'
import AbaDashboard from './admin/AbaDashboard'
import AbaBoloes from './admin/AbaBoloes'
import AbaUsuarios from './admin/AbaUsuarios'
import AbaConvites from './admin/AbaConvites'
import AbaFinanceiro from './admin/AbaFinanceiro'
import AbaPremiacao from './admin/AbaPremiacao'
import AbaPlacar from './admin/AbaPlacar'
import AbaSync from './admin/AbaSync'
import AbaBackups from './admin/AbaBackups'

const ABAS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'boloes', label: 'Bolões', icon: Users },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'convites', label: 'Convites', icon: Link2 },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'premiacao', label: 'Premiação', icon: Trophy },
  { id: 'placar', label: 'Placar', icon: FileText },
  { id: 'sync', label: 'Sync', icon: Activity },
  { id: 'backups', label: 'Backups', icon: Database },
]

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('dashboard')

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings size={24} className="text-primary" />
          Painel Administrativo
        </h2>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors chip ${
                abaAtiva === aba.id ? 'chip-active' : 'chip-inactive'
              }`}
            >
              <aba.icon size={14} />
              {aba.label}
            </button>
          ))}
        </div>

        {abaAtiva === 'dashboard' && <AbaDashboard />}
        {abaAtiva === 'boloes' && <AbaBoloes />}
        {abaAtiva === 'usuarios' && <AbaUsuarios />}
        {abaAtiva === 'convites' && <AbaConvites />}
        {abaAtiva === 'financeiro' && <AbaFinanceiro />}
        {abaAtiva === 'premiacao' && <AbaPremiacao />}
        {abaAtiva === 'placar' && <AbaPlacar />}
        {abaAtiva === 'sync' && <AbaSync />}
        {abaAtiva === 'backups' && <AbaBackups />}
      </div>
    </Layout>
  )
}

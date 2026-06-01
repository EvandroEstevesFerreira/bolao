import { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Share2, Camera, ChevronDown } from 'lucide-react'
import html2canvas from 'html2canvas'

const POSICAO_SUFIXO = (n) => n === 1 ? '1o' : n === 2 ? '2o' : n === 3 ? '3o' : `${n}o`

const CORES_SELECOES = {
  'Brasil': ['#006B3F', '#FFDF00'],
  'Argentina': ['#6CACE4', '#FFFFFF'],
  'Alemanha': ['#000000', '#DD0000'],
  'França': ['#002654', '#ED2939'],
  'Espanha': ['#AA151B', '#F1BF00'],
  'Inglaterra': ['#CF081F', '#FFFFFF'],
  'Portugal': ['#006B3F', '#FF0000'],
  'Holanda': ['#FF6600', '#FFFFFF'],
  'Itália': ['#0066B3', '#FFFFFF'],
  'Bélgica': ['#ED2939', '#FDDA24'],
  'Croácia': ['#FF0000', '#FFFFFF'],
  'Uruguai': ['#5CBFEB', '#FFFFFF'],
  'Colômbia': ['#FCD116', '#003893'],
  'México': ['#006847', '#CE1126'],
  'Estados Unidos': ['#002868', '#BF0A30'],
  'Japão': ['#BC002D', '#FFFFFF'],
  'Coreia do Sul': ['#CD2E3A', '#0047A0'],
  'Austrália': ['#00843D', '#FFCD00'],
  'Arábia Saudita': ['#006C35', '#FFFFFF'],
  'Canadá': ['#FF0000', '#FFFFFF'],
  'Marrocos': ['#C1272D', '#006233'],
  'Senegal': ['#009639', '#FDEF42'],
  'Gana': ['#006B3F', '#FCD116'],
  'Costa do Marfim': ['#FF8200', '#009E49'],
  'Tunísia': ['#E70013', '#FFFFFF'],
  'Equador': ['#FFD100', '#034EA2'],
  'Paraguai': ['#DA121A', '#0038A8'],
  'Suíça': ['#DA291C', '#FFFFFF'],
  'Escócia': ['#003078', '#FFFFFF'],
  'Turquia': ['#E30A17', '#FFFFFF'],
  'Egito': ['#CE1126', '#000000'],
  'Irã': ['#239F40', '#DA0000'],
  'Argélia': ['#006233', '#FFFFFF'],
  'RD Congo': ['#007FFF', '#CE1021'],
  'Panamá': ['#DA121A', '#003DA5'],
  'Catar': ['#8A1538', '#FFFFFF'],
  'Suécia': ['#006AA7', '#FECC00'],
  'Noruega': ['#BA0C2F', '#FFFFFF'],
  'Bósnia e Herzegovina': ['#002395', '#FECB00'],
  'Cabo Verde': ['#003893', '#CE1126'],
  'Haiti': ['#00209F', '#D21034'],
  'Curaçao': ['#002B7F', '#F9E814'],
  'Iraque': ['#CE1126', '#000000'],
  'Jordânia': ['#007A3D', '#CE1126'],
  'Áustria': ['#ED2939', '#FFFFFF'],
  'Uzbequistão': ['#0099B5', '#1EB53A'],
  'Nova Zelândia': ['#00247D', '#FFFFFF'],
  'Tchéquia': ['#11457E', '#D7141A'],
  'África do Sul': ['#007A4D', '#FFB612'],
}

const STORAGE_KEY_FOTO = 'bolao_foto_perfil'
const STORAGE_KEY_SELECAO = 'bolao_selecao_favorita'

export default function Figurinha({ perfil }) {
  const ref = useRef(null)
  const fileRef = useRef(null)
  const [exportando, setExportando] = useState(false)
  const [stats, setStats] = useState({ posicao: '-', pontos: 0, cravadas: 0, jogos: 0, conquistas: 0 })
  const [foto, setFoto] = useState(() => localStorage.getItem(STORAGE_KEY_FOTO) || null)
  const [selecoes, setSelecoes] = useState([])
  const [selecaoId, setSelecaoId] = useState(() => localStorage.getItem(STORAGE_KEY_SELECAO) || '')
  const [selecaoEscolhida, setSelecaoEscolhida] = useState(null)
  const [mostrarSelecoes, setMostrarSelecoes] = useState(false)

  useEffect(() => {
    carregarStats()
    carregarSelecoes()
  }, [perfil.id])

  useEffect(() => {
    if (selecaoId && selecoes.length > 0) {
      const sel = selecoes.find(s => String(s.id) === String(selecaoId))
      setSelecaoEscolhida(sel || null)
    }
  }, [selecaoId, selecoes])

  async function carregarSelecoes() {
    const { data } = await supabase.from('selecoes').select('id, nome, bandeira_url, codigo_fifa').order('nome')
    setSelecoes(data || [])
    if (selecaoId && data) {
      const sel = data.find(s => String(s.id) === String(selecaoId))
      setSelecaoEscolhida(sel || null)
    }
  }

  async function carregarStats() {
    const [palpitesRes, , conquistasRes] = await Promise.all([
      supabase.from('palpites').select('usuario_id, pontos'),
      supabase.from('perfis_publicos').select('id').eq('ativo', true),
      supabase.from('conquistas').select('id').eq('usuario_id', perfil.id),
    ])

    const palpites = palpitesRes.data || []
    const rankMap = {}
    palpites.forEach(p => {
      if (!rankMap[p.usuario_id]) rankMap[p.usuario_id] = { pontos: 0, cravadas: 0, jogos: 0 }
      rankMap[p.usuario_id].pontos += p.pontos || 0
      rankMap[p.usuario_id].jogos++
      if (p.pontos === 10) rankMap[p.usuario_id].cravadas++
    })

    const sorted = Object.entries(rankMap).sort((a, b) => b[1].pontos - a[1].pontos)
    const posicao = sorted.findIndex(([id]) => id === perfil.id) + 1
    const meu = rankMap[perfil.id] || { pontos: 0, cravadas: 0, jogos: 0 }

    setStats({
      posicao: posicao || '-',
      pontos: meu.pontos,
      cravadas: meu.cravadas,
      jogos: meu.jogos,
      conquistas: conquistasRes.data?.length || 0,
    })
  }

  function handleFoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 300
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setFoto(dataUrl)
        localStorage.setItem(STORAGE_KEY_FOTO, dataUrl)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function escolherSelecao(sel) {
    setSelecaoId(String(sel.id))
    setSelecaoEscolhida(sel)
    localStorage.setItem(STORAGE_KEY_SELECAO, String(sel.id))
    setMostrarSelecoes(false)
  }

  async function exportar() {
    if (!ref.current) return
    setExportando(true)
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      const url = canvas.toDataURL('image/png')

      if (navigator.share && navigator.canShare?.({ files: [new File([], '')] })) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], `figurinha-${perfil.nickname}.png`, { type: 'image/png' })
          try {
            await navigator.share({ files: [file], title: `Figurinha - ${perfil.nickname}` })
          } catch {
            baixar(url)
          }
        })
      } else {
        baixar(url)
      }
    } finally {
      setExportando(false)
    }
  }

  function baixar(url) {
    const a = document.createElement('a')
    a.href = url
    a.download = `figurinha-${perfil.nickname}.png`
    a.click()
  }

  const iniciais = (perfil.nickname || perfil.nome || '??').slice(0, 2).toUpperCase()
  const nomeSel = selecaoEscolhida?.nome || ''
  const coresSel = CORES_SELECOES[nomeSel]
  const corBase = coresSel ? coresSel[0] : '#1B5E20'
  const corClara = coresSel ? coresSel[1] : '#4CAF50'

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex gap-2 justify-center flex-wrap">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={handleFoto}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#2A3942] border border-gray-200 dark:border-[#3B4A54] text-gray-700 dark:text-[#D1D7DB] hover:bg-gray-50 dark:hover:bg-[#3B4A54] transition-colors"
        >
          <Camera size={15} />
          {foto ? 'Trocar Foto' : 'Adicionar Foto'}
        </button>
        <button
          onClick={() => setMostrarSelecoes(!mostrarSelecoes)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white dark:bg-[#2A3942] border border-gray-200 dark:border-[#3B4A54] text-gray-700 dark:text-[#D1D7DB] hover:bg-gray-50 dark:hover:bg-[#3B4A54] transition-colors"
        >
          {selecaoEscolhida?.bandeira_url && (
            <img src={selecaoEscolhida.bandeira_url} alt="" className="w-5 h-3.5 rounded-sm object-cover" />
          )}
          {selecaoEscolhida ? selecaoEscolhida.nome : 'Escolher Seleção'}
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Seletor de seleções */}
      {mostrarSelecoes && (
        <div className="card max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {selecoes.map(sel => (
              <button
                key={sel.id}
                onClick={() => escolherSelecao(sel)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors text-left ${
                  String(sel.id) === String(selecaoId)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-[#2A3942] text-gray-700 dark:text-[#D1D7DB]'
                }`}
              >
                {sel.bandeira_url && (
                  <img src={sel.bandeira_url} alt="" className="w-6 h-4 rounded-sm object-cover flex-shrink-0" />
                )}
                <span className="truncate">{sel.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Figurinha renderizável */}
      <div className="flex justify-center">
        <div
          ref={ref}
          className="relative overflow-hidden"
          style={{
            width: 280,
            height: 400,
            borderRadius: 20,
            background: `linear-gradient(145deg, ${corBase} 0%, #111B21 50%, ${corBase} 100%)`,
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          {/* Moldura dourada */}
          <div style={{
            position: 'absolute', inset: 4,
            borderRadius: 16,
            border: '2.5px solid',
            borderImage: 'linear-gradient(135deg, #FFD700, #B8860B, #FFD700, #DAA520, #FFD700) 1',
            pointerEvents: 'none', zIndex: 10,
          }} />

          {/* Padrão decorativo topo com cor da seleção */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 130,
            background: `linear-gradient(180deg, ${corClara}30 0%, transparent 100%)`,
            zIndex: 1,
          }} />

          {/* Faixas diagonais estilo camisa */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: `repeating-linear-gradient(135deg, ${corClara}08, ${corClara}08 20px, transparent 20px, transparent 40px)`,
            zIndex: 1,
          }} />

          {/* Estrelas decorativas */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: 8 + (i % 3) * 6,
              left: `${12 + i * 14}%`,
              color: '#FFD70050',
              fontSize: 10 + (i % 3) * 4,
              zIndex: 2,
            }}>★</div>
          ))}

          {/* Header */}
          <div style={{
            position: 'relative', zIndex: 5,
            textAlign: 'center', paddingTop: 18,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 3,
              color: '#FFD700', textTransform: 'uppercase',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }}>
              Bolão Copa 2026
            </div>
            <div style={{
              fontSize: 7, color: '#FFD70080', letterSpacing: 5,
              marginTop: 2, textTransform: 'uppercase',
            }}>
              USA • MEX • CAN
            </div>
          </div>

          {/* Bandeira da seleção no canto */}
          {selecaoEscolhida?.bandeira_url && (
            <div style={{
              position: 'absolute', top: 14, right: 14, zIndex: 8,
              borderRadius: 4, overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}>
              <img
                src={selecaoEscolhida.bandeira_url}
                alt=""
                style={{ width: 32, height: 22, objectFit: 'cover', display: 'block' }}
                crossOrigin="anonymous"
              />
            </div>
          )}

          {/* Avatar / Foto */}
          <div style={{
            position: 'relative', zIndex: 5,
            display: 'flex', justifyContent: 'center',
            marginTop: 14,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: foto ? 'transparent' : `linear-gradient(135deg, ${corClara}, ${corBase})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `3px solid ${corClara}`,
              boxShadow: `0 4px 20px ${corClara}40, 0 0 0 6px ${corBase}50`,
              fontSize: 38, fontWeight: 800, color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}>
              {foto ? (
                <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                iniciais
              )}
            </div>
          </div>

          {/* Nickname */}
          <div style={{
            position: 'relative', zIndex: 5,
            textAlign: 'center', marginTop: 12,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, color: '#FFFFFF',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              letterSpacing: 0.5,
            }}>
              {perfil.nickname}
            </div>
            <div style={{
              fontSize: 10, color: '#FFFFFF80',
              marginTop: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              {selecaoEscolhida ? (
                <>
                  <span>{selecaoEscolhida.codigo_fifa || selecaoEscolhida.nome}</span>
                </>
              ) : (
                perfil.nome
              )}
            </div>
          </div>

          {/* Posição destaque */}
          <div style={{
            position: 'relative', zIndex: 5,
            display: 'flex', justifyContent: 'center',
            marginTop: 10,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFD700, #DAA520)',
              color: '#1a1a1a',
              fontSize: 13, fontWeight: 800,
              padding: '4px 18px',
              borderRadius: 20,
              boxShadow: '0 2px 8px rgba(255,215,0,0.3)',
            }}>
              {typeof stats.posicao === 'number' ? `${POSICAO_SUFIXO(stats.posicao)} Lugar` : 'Ranking'}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            position: 'relative', zIndex: 5,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 6, margin: '14px 16px 0',
          }}>
            {[
              { label: 'Pontos', valor: stats.pontos },
              { label: 'Cravadas', valor: stats.cravadas },
              { label: 'Jogos', valor: stats.jogos },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: '8px 4px',
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF' }}>
                  {s.valor}
                </div>
                <div style={{ fontSize: 8, color: '#FFFFFF70', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Conquistas */}
          {stats.conquistas > 0 && (
            <div style={{
              position: 'relative', zIndex: 5,
              textAlign: 'center', marginTop: 10,
            }}>
              <div style={{
                fontSize: 9, color: '#FFD70090',
                letterSpacing: 2, textTransform: 'uppercase',
              }}>
                ★ {stats.conquistas} conquista{stats.conquistas > 1 ? 's' : ''} ★
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            position: 'absolute', bottom: 10, left: 0, right: 0,
            textAlign: 'center', zIndex: 5,
          }}>
            <div style={{
              fontSize: 7, color: '#FFFFFF30',
              letterSpacing: 2, textTransform: 'uppercase',
            }}>
              bolao-bay.vercel.app
            </div>
          </div>

          {/* Efeito brilho diagonal */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-30%',
            width: '60%', height: '200%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
            transform: 'skewX(-20deg)', zIndex: 3,
          }} />
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={exportar}
          disabled={exportando}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {exportando ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {navigator.share ? <Share2 size={16} /> : <Download size={16} />}
            </>
          )}
          {exportando ? 'Gerando...' : navigator.share ? 'Compartilhar' : 'Baixar Figurinha'}
        </button>
      </div>
    </div>
  )
}

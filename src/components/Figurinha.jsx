import { useRef, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Download, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'

const POSICAO_SUFIXO = (n) => n === 1 ? '1o' : n === 2 ? '2o' : n === 3 ? '3o' : `${n}o`

export default function Figurinha({ perfil }) {
  const ref = useRef(null)
  const [exportando, setExportando] = useState(false)
  const [stats, setStats] = useState({ posicao: '-', pontos: 0, cravadas: 0, jogos: 0, conquistas: 0 })

  useEffect(() => {
    carregarStats()
  }, [perfil.id])

  async function carregarStats() {
    const [palpitesRes, perfisRes, conquistasRes] = await Promise.all([
      supabase.from('palpites').select('usuario_id, pontos'),
      supabase.from('perfis').select('id').eq('ativo', true),
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
  const corIndex = perfil.id ? perfil.id.charCodeAt(0) % 5 : 0
  const cores = [
    ['#1B5E20', '#4CAF50'],
    ['#0D47A1', '#2196F3'],
    ['#B71C1C', '#F44336'],
    ['#E65100', '#FF9800'],
    ['#4A148C', '#9C27B0'],
  ]
  const [corBase, corClara] = cores[corIndex]

  return (
    <div className="space-y-4">
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
          <div
            style={{
              position: 'absolute', inset: 4,
              borderRadius: 16,
              border: '2.5px solid',
              borderImage: 'linear-gradient(135deg, #FFD700, #B8860B, #FFD700, #DAA520, #FFD700) 1',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Padrão decorativo topo */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 130,
            background: `linear-gradient(180deg, ${corClara}30 0%, transparent 100%)`,
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

          {/* Header - Copa 2026 */}
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

          {/* Avatar */}
          <div style={{
            position: 'relative', zIndex: 5,
            display: 'flex', justifyContent: 'center',
            marginTop: 14,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: `linear-gradient(135deg, ${corClara}, ${corBase})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #FFD700',
              boxShadow: `0 4px 20px ${corClara}40, 0 0 0 6px ${corBase}50`,
              fontSize: 38, fontWeight: 800, color: '#FFFFFF',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              {iniciais}
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
            }}>
              {perfil.nome}
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
            transform: 'skewX(-20deg)',
            zIndex: 3,
          }} />
        </div>
      </div>

      {/* Botões */}
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

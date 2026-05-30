import { useState, useEffect } from 'react'
import { formatarDataHora, palpiteTravado } from '../lib/formatters'
import { getCorPontuacao, getLabelPontuacao } from '../lib/pontuacao'
import { Lock, Clock, Check } from 'lucide-react'

export default function CartaoPartida({ partida, palpite, onSalvarPalpite, selecoes }) {
  const [placarCasa, setPlacarCasa] = useState(palpite?.placar_casa ?? '')
  const [placarFora, setPlacarFora] = useState(palpite?.placar_fora ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const travado = palpiteTravado(partida.data_hora)
  const encerrado = partida.status === 'encerrado'
  const aoVivo = partida.status === 'ao_vivo'

  const casaInfo = selecoes?.[partida.selecao_casa_id]
  const foraInfo = selecoes?.[partida.selecao_fora_id]

  useEffect(() => {
    setPlacarCasa(palpite?.placar_casa ?? '')
    setPlacarFora(palpite?.placar_fora ?? '')
  }, [palpite])

  async function handleSalvar() {
    if (placarCasa === '' || placarFora === '' || travado) return
    setSalvando(true)
    try {
      await onSalvarPalpite(partida.id, parseInt(placarCasa), parseInt(placarFora))
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2000)
    } finally {
      setSalvando(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSalvar()
  }

  return (
    <div
      className={`card transition-all ${
        aoVivo ? 'border-[#25D366] border-2 shadow-lg shadow-[#25D366]/10' :
        encerrado ? 'bg-gray-50 dark:bg-[#1A2329]' : 'hover:border-primary/20'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">
          {partida.rodada} · {partida.grupo ? `Grupo ${partida.grupo}` : partida.fase}
        </span>
        <div className="flex items-center gap-1 text-xs">
          {aoVivo && (
            <span className="bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold animate-pulse">
              AO VIVO
            </span>
          )}
          {encerrado && (
            <span className="bg-gray-500 text-white px-2 py-0.5 rounded-full">
              Encerrado
            </span>
          )}
          {!aoVivo && !encerrado && (
            <span className="text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {formatarDataHora(partida.data_hora)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <div>
              <p className="font-semibold text-sm">{casaInfo?.nome || 'TBD'}</p>
              <p className="text-xs text-gray-400">{casaInfo?.codigo_fifa || ''}</p>
            </div>
            {casaInfo?.bandeira_url && (
              <img src={casaInfo.bandeira_url} alt="" className="w-8 h-6 rounded object-cover" />
            )}
          </div>
        </div>

        {encerrado || aoVivo ? (
          <div className="flex items-center gap-2 min-w-[100px] justify-center">
            <span className="text-3xl font-bold">{partida.placar_casa ?? '-'}</span>
            <span className="text-gray-400 text-xl">×</span>
            <span className="text-3xl font-bold">{partida.placar_fora ?? '-'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="99"
              value={placarCasa}
              onChange={(e) => setPlacarCasa(e.target.value)}
              onBlur={handleSalvar}
              onKeyDown={handleKeyDown}
              disabled={travado}
              className="score-input"
              placeholder="-"
            />
            <span className="text-gray-400 text-xl font-bold">×</span>
            <input
              type="number"
              min="0"
              max="99"
              value={placarFora}
              onChange={(e) => setPlacarFora(e.target.value)}
              onBlur={handleSalvar}
              onKeyDown={handleKeyDown}
              disabled={travado}
              className="score-input"
              placeholder="-"
            />
          </div>
        )}

        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            {foraInfo?.bandeira_url && (
              <img src={foraInfo.bandeira_url} alt="" className="w-8 h-6 rounded object-cover" />
            )}
            <div>
              <p className="font-semibold text-sm">{foraInfo?.nome || 'TBD'}</p>
              <p className="text-xs text-gray-400">{foraInfo?.codigo_fifa || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {travado && !encerrado && !aoVivo && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-orange-500">
          <Lock size={12} />
          Palpite travado
        </div>
      )}

      {palpite && (encerrado || travado) && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A3942]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Seu palpite: {palpite.placar_casa} × {palpite.placar_fora}
            </span>
            {encerrado && palpite.pontos != null && (
              <span className={`font-bold ${getCorPontuacao(palpite.pontos)}`}>
                {palpite.pontos} pts — {getLabelPontuacao(palpite.pontos)}
              </span>
            )}
          </div>
        </div>
      )}

      {salvo && (
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600">
          <Check size={12} />
          Palpite salvo!
        </div>
      )}

      {partida.estadio && (
        <p className="mt-2 text-xs text-gray-400 text-center">
          {partida.estadio} — {partida.cidade}
        </p>
      )}
    </div>
  )
}

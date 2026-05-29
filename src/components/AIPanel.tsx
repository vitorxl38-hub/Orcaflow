import React, { useState } from 'react';
import { Sparkles, ArrowRight, Wand2, RefreshCw, Landmark, HelpCircle, Check, Info } from 'lucide-react';

interface AIPanelProps {
  niche: string;
  onApplyDescription: (text: string) => void;
  onApplyItems: (items: { description: string; quantity: number; unitPrice: number }[]) => void;
  onApplyObservations: (text: string) => void;
  brandColor?: string;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  niche,
  onApplyDescription,
  onApplyItems,
  onApplyObservations,
  brandColor = '#3b82f6'
}) => {
  const [initDesc, setInitDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  
  const [obsRaw, setObsRaw] = useState('');
  const [improvedObs, setImprovedObs] = useState('');
  const [goal, setGoal] = useState('formal e convincente');
  const [isImproving, setIsImproving] = useState(false);

  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [aiTemplateStatus, setAiTemplateStatus] = useState('');

  // Market values
  const marketRates = [
    { item: "Eletricista (Ponto de Luz/Tomada)", average: 120, range: "R$ 80 - R$ 150", detail: "Comum para reformas residenciais e comerciais." },
    { item: "Instalação de Disjuntor Geral", average: 220, range: "R$ 150 - R$ 300", detail: "Garante proteção de queda de carga." },
    { item: "Projeto de Logo + Identidade Visual", average: 2500, range: "R$ 1.500 - R$ 5.000", detail: "Entrega completa com manual de marca." },
    { item: "Troca e Vedação de Sifão Hidráulico", average: 150, range: "R$ 90 - R$ 200", detail: "Acabamento hermético profissional." },
    { item: "Consultoria Estratégica (Hora Técnica)", average: 250, range: "R$ 180 - R$ 400", detail: "Sessão focada com diagnóstico de gargalos." }
  ];

  const handleGenerateDescription = async () => {
    if (!initDesc.trim()) return;
    setIsLoading(true);
    setSuggestion('');
    try {
      const res = await fetch('/api/gemini/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: initDesc, niche })
      });
      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveObservations = async () => {
    if (!obsRaw.trim()) return;
    setIsImproving(true);
    setImprovedObs('');
    try {
      const res = await fetch('/api/gemini/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: obsRaw, goal })
      });
      const data = await res.json();
      if (data.improvedText) {
        setImprovedObs(data.improvedText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImproving(false);
    }
  };

  const handleCreateNicheTemplate = async () => {
    setIsGeneratingTemplate(true);
    setAiTemplateStatus('Analisando nicho...');
    try {
      const res = await fetch('/api/gemini/niche-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche })
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        onApplyItems(data.items);
        setAiTemplateStatus('Modelo de Itens inserido com sucesso!');
        setTimeout(() => setAiTemplateStatus(''), 4000);
      } else {
        setAiTemplateStatus('Falha ao parsear sugestões. Tente novamente.');
      }
    } catch (err) {
      setAiTemplateStatus('Erro ao requisitar Copiloto.');
      console.error(err);
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-violet-500/20 p-2 rounded-lg border border-violet-500/30">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base tracking-tight text-slate-100">Copiloto OrçaFlow IA</h3>
            <p className="text-xs text-slate-400">Gere propostas de alta conversão</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
          Gemini 3.5 Active
        </span>
      </div>

      {/* Quick niche generation */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-300">Sugestão de Itens ({niche})</div>
          <span className="text-[10px] text-slate-400">Insere automatico</span>
        </div>
        <p className="text-xs text-slate-400">A IA monta 3 linhas de serviço padrão personalizadas para seu nicho.</p>
        <button
          onClick={handleCreateNicheTemplate}
          disabled={isGeneratingTemplate}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-800 text-xs text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          {isGeneratingTemplate ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sinfonizando Estrutura...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              Sugerir Tabela por IA
            </>
          )}
        </button>
        {aiTemplateStatus && (
          <div className="text-[11px] text-center text-violet-300 font-mono animate-pulse">
            {aiTemplateStatus}
          </div>
        )}
      </div>

      {/* Description improver */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Aprimorar Descrição de Linha de Serviço
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg py-2 pl-3 pr-10 text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
            placeholder="Ex: trocar fiação do chuveiro"
            value={initDesc}
            onChange={(e) => setInitDesc(e.target.value)}
          />
          <button
            onClick={handleGenerateDescription}
            disabled={isLoading || !initDesc.trim()}
            className="absolute right-1.5 top-1.5 p-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white rounded transition"
          >
            {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
          </button>
        </div>

        {suggestion && (
          <div className="bg-slate-850 p-3 rounded-lg border border-slate-700 mt-2 text-xs text-slate-200 animate-fade-in">
            <p className="leading-relaxed mb-2 font-sans italic">"{suggestion}"</p>
            <button
              onClick={() => {
                onApplyDescription(suggestion);
                setSuggestion('');
                setInitDesc('');
              }}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
            >
              <Check className="w-3 h-3" /> Aplicar ao Campo do Item
            </button>
          </div>
        )}
      </div>

      {/* Terms & Observations Otimizador */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-slate-300">
            Reescrever Observações & Garantia
          </label>
          <select
            className="bg-slate-800 text-[10px] text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          >
            <option value="formal e convincente">💼 Formal</option>
            <option value="focada em urgência e escassez">⚡ Escassez</option>
            <option value="estritamente técnica e detalhista">🛠️ Técnica</option>
            <option value="amigável e próxima">🤝 Próxima</option>
          </select>
        </div>
        <textarea
          rows={2}
          className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
          placeholder="Escreva algo simples sobre prazos, fretes ou responsabilidades..."
          value={obsRaw}
          onChange={(e) => setObsRaw(e.target.value)}
        />
        <button
          onClick={handleImproveObservations}
          disabled={isImproving || !obsRaw.trim()}
          className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-200 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition"
        >
          {isImproving ? <RefreshCw className="w-3 h-3 animate-spin animate-fade-in" /> : <Wand2 className="w-3.5 h-3.5 text-violet-400" />}
          Otimizar Observações com IA
        </button>

        {improvedObs && (
          <div className="bg-slate-850 p-3 rounded-lg border border-slate-700 mt-2 text-xs text-slate-200 animate-fade-in">
            <p className="leading-relaxed mb-2 font-sans italic">"{improvedObs}"</p>
            <button
              onClick={() => {
                onApplyObservations(improvedObs);
                setImprovedObs('');
                setObsRaw('');
              }}
              className="text-[10px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 transition"
            >
              <Check className="w-3 h-3" /> Aplicar às Observações
            </button>
          </div>
        )}
      </div>

      {/* Market rates pricing assist */}
      <div className="space-y-2 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-2">
          <Landmark className="w-3.5 h-3.5 text-violet-400" />
          <span>Calculadora de Preço de Mercado IA</span>
        </div>
        <div className="space-y-2 text-[11px] max-h-36 overflow-y-auto pr-1">
          {marketRates.map((rate, i) => (
            <div key={i} className="bg-slate-800/30 p-2 rounded-lg border border-slate-800 flex justify-between gap-1">
              <div>
                <p className="font-medium text-slate-200">{rate.item}</p>
                <span className="text-[9px] text-slate-400 block mt-0.5 leading-snug">{rate.detail}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-amber-400 font-bold block">{rate.range}</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = {
                      description: rate.item,
                      quantity: 1,
                      unitPrice: rate.average
                    };
                    onApplyItems([sample]);
                  }}
                  className="text-[9px] text-violet-300 hover:text-violet-200 hover:underline block mt-1"
                >
                  + Inserir item
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-violet-950/30 p-2 rounded-lg border border-violet-900/30 mt-2 text-[10px] text-violet-300">
          <Info className="w-3 h-3 shrink-0" />
          <span>A IA sugere valores de referência para equilibrar sua margem regional.</span>
        </div>
      </div>
    </div>
  );
};

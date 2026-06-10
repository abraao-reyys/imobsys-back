import { useEffect, useMemo, useState } from 'react';
import { Building2, FileText, Users } from 'lucide-react';
import { listarClientes } from '../../api/clientes.js';
import { getApiErrorMessage } from '../../api/errors.js';
import { listarImoveis } from '../../api/imoveis.js';
import { listarPropostas } from '../../api/propostas.js';
import Badge from '../../components/Badge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { STATUS_PROPOSTA } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function Dashboard() {
  const [data, setData] = useState({ imoveis: [], clientes: [], propostas: [] });
  const [loading, setLoading] = useState(true);
  const showToast = useToast();

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [imoveis, clientes, propostas] = await Promise.all([
          listarImoveis(),
          listarClientes(),
          listarPropostas()
        ]);

        if (active) setData({ imoveis, clientes, propostas });
      } catch (error) {
        if (active) showToast(getApiErrorMessage(error), 'error');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [showToast]);

  const propostasPorStatus = useMemo(() => {
    const counts = Object.fromEntries(STATUS_PROPOSTA.map((status) => [status, 0]));
    data.propostas.forEach((proposta) => {
      counts[proposta.status] = (counts[proposta.status] || 0) + 1;
    });
    return counts;
  }, [data.propostas]);

  const ultimasPropostas = useMemo(() => {
    return [...data.propostas]
      .sort((a, b) => new Date(b.dataCriacao || 0).getTime() - new Date(a.dataCriacao || 0).getTime())
      .slice(0, 6);
  }, [data.propostas]);

  if (loading) return <LoadingState label="Carregando dashboard..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Resumo operacional da carteira imobiliária.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Building2} label="Imóveis" value={data.imoveis.length} />
        <SummaryCard icon={Users} label="Clientes" value={data.clientes.length} />
        <SummaryCard icon={FileText} label="Propostas" value={data.propostas.length} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Propostas por status</h2>
          <div className="mt-4 space-y-3">
            {STATUS_PROPOSTA.map((status) => (
              <div key={status} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-3">
                <Badge value={status} />
                <span className="text-sm font-bold text-slate-950">{propostasPorStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Últimas propostas</h2>
          </div>

          <div className="mt-4">
            {ultimasPropostas.length ? (
              <div className="divide-y divide-slate-200">
                {ultimasPropostas.map((proposta) => (
                  <article key={proposta.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-semibold text-slate-950">{proposta.nomeCliente || 'Cliente não informado'}</p>
                      <p className="text-sm text-slate-500">{proposta.descricaoImovel || 'Imóvel não informado'}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {formatCurrency(proposta.valor)} · validade {formatDate(proposta.validade)}
                      </p>
                    </div>
                    <Badge value={proposta.status} />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="Nenhuma proposta cadastrada" />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

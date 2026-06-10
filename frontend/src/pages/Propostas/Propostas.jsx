import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Pencil, Plus, Send, Trash2, XCircle } from 'lucide-react';
import {
  cancelarProposta,
  enviarProposta,
  excluirProposta,
  listarPropostas
} from '../../api/propostas.js';
import { getApiErrorMessage } from '../../api/errors.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { labelFor } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  canCancelProposta,
  canDeleteProposta,
  canSendProposta,
  isPropostaEditable
} from '../../utils/propostaRules.js';

export default function Propostas() {
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPropostas();
  }, []);

  async function loadPropostas() {
    setLoading(true);
    try {
      setPropostas(await listarPropostas());
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  function updateProposta(updated) {
    setPropostas((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function handleSend(proposta) {
    setActingId(proposta.id);
    try {
      updateProposta(await enviarProposta(proposta.id));
      showToast('Proposta enviada ao cliente.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handleCancel(proposta) {
    const confirmed = window.confirm('Cancelar esta proposta?');
    if (!confirmed) return;

    setActingId(proposta.id);
    try {
      updateProposta(await cancelarProposta(proposta.id));
      showToast('Proposta cancelada.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(proposta) {
    const confirmed = window.confirm('Excluir esta proposta?');
    if (!confirmed) return;

    setActingId(proposta.id);
    try {
      await excluirProposta(proposta.id);
      setPropostas((current) => current.filter((item) => item.id !== proposta.id));
      showToast('Proposta excluída.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <LoadingState label="Carregando propostas..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Propostas</h1>
          <p className="mt-1 text-sm text-slate-500">{propostas.length} proposta(s) cadastrada(s).</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/propostas/nova')}>
          Nova Proposta
        </Button>
      </div>

      {propostas.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {propostas.map((proposta) => (
            <article key={proposta.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {labelFor(proposta.tipo)} · {formatCurrency(proposta.valor)}
                    </h2>
                    <Badge value={proposta.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{proposta.nomeCliente || 'Cliente não informado'}</p>
                  <p className="text-sm text-slate-500">{proposta.descricaoImovel || 'Imóvel não informado'}</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Forma de pagamento" value={labelFor(proposta.formaPagamento)} />
                <InfoItem label="Validade" value={formatDate(proposta.validade)} />
                <InfoItem label="Corretor" value={proposta.nomeCorretor || 'Não informado'} />
                <InfoItem label="Criada em" value={formatDate(proposta.dataCriacao)} />
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to={`/propostas/${proposta.id}`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  title="Detalhes"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Detalhes
                </Link>

                {isPropostaEditable(proposta.status) ? (
                  <Link
                    to={`/propostas/${proposta.id}/editar`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </Link>
                ) : null}

                {canSendProposta(proposta.status) ? (
                  <Button
                    size="sm"
                    icon={Send}
                    onClick={() => handleSend(proposta)}
                    disabled={actingId === proposta.id}
                  >
                    Enviar ao cliente
                  </Button>
                ) : null}

                {canCancelProposta(proposta.status) ? (
                  <Button
                    size="sm"
                    variant="warning"
                    icon={XCircle}
                    onClick={() => handleCancel(proposta)}
                    disabled={actingId === proposta.id}
                  >
                    Cancelar
                  </Button>
                ) : null}

                {canDeleteProposta(proposta.status) ? (
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => handleDelete(proposta)}
                    disabled={actingId === proposta.id}
                  >
                    Excluir
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhuma proposta encontrada" description="Crie uma proposta para iniciar o fluxo." />
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-800">{value}</dd>
    </div>
  );
}

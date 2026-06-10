import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Pencil, Send, Trash2, XCircle } from 'lucide-react';
import {
  buscarProposta,
  cancelarProposta,
  enviarProposta,
  excluirProposta
} from '../../api/propostas.js';
import { getApiErrorMessage } from '../../api/errors.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { labelFor } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import {
  canCancelProposta,
  canDeleteProposta,
  canSendProposta,
  isPropostaEditable,
  publicProposalApiLink
} from '../../utils/propostaRules.js';

export default function PropostaDetalhe() {
  const { id } = useParams();
  const [proposta, setProposta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadProposta() {
      setLoading(true);
      try {
        const data = await buscarProposta(id);
        if (active) setProposta(data);
      } catch (error) {
        if (active) showToast(getApiErrorMessage(error), 'error');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProposta();
    return () => {
      active = false;
    };
  }, [id, showToast]);

  const publicLink = useMemo(() => publicProposalApiLink(id), [id]);

  async function handleSend() {
    setActing(true);
    try {
      setProposta(await enviarProposta(id));
      setShowPublicLink(true);
      showToast('Proposta enviada ao cliente.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm('Cancelar esta proposta?');
    if (!confirmed) return;

    setActing(true);
    try {
      setProposta(await cancelarProposta(id));
      showToast('Proposta cancelada.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Excluir esta proposta?');
    if (!confirmed) return;

    setActing(true);
    try {
      await excluirProposta(id);
      showToast('Proposta excluída.', 'success');
      navigate('/propostas', { replace: true });
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(publicLink);
      showToast('Link copiado.', 'success');
    } catch {
      showToast('Não foi possível copiar o link automaticamente.', 'error');
    }
  }

  if (loading) return <LoadingState label="Carregando proposta..." />;

  if (!proposta) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="font-semibold text-slate-950">Proposta não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to="/propostas"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Propostas
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-950">Detalhe da proposta</h1>
            <Badge value={proposta.status} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isPropostaEditable(proposta.status) ? (
            <Link
              to={`/propostas/${proposta.id}/editar`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Editar
            </Link>
          ) : null}

          {canSendProposta(proposta.status) ? (
            <Button icon={Send} onClick={handleSend} disabled={acting}>
              Enviar ao cliente
            </Button>
          ) : null}

          {canCancelProposta(proposta.status) ? (
            <Button variant="warning" icon={XCircle} onClick={handleCancel} disabled={acting}>
              Cancelar
            </Button>
          ) : null}

          {canDeleteProposta(proposta.status) ? (
            <Button variant="danger" icon={Trash2} onClick={handleDelete} disabled={acting}>
              Excluir
            </Button>
          ) : null}
        </div>
      </div>

      {proposta.observacaoAjuste ? (
        <section className="rounded-lg border border-orange-200 bg-orange-50 p-5">
          <h2 className="text-sm font-semibold uppercase text-orange-900">Observação de ajuste</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-orange-950">{proposta.observacaoAjuste}</p>
        </section>
      ) : null}

      {showPublicLink ? (
        <section className="rounded-lg border border-brand-100 bg-brand-50 p-5">
          <h2 className="text-sm font-semibold uppercase text-brand-700">Link público</h2>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="min-w-0 flex-1 rounded-md bg-white px-3 py-2 text-sm text-slate-800">{publicLink}</code>
            <Button variant="secondary" icon={Copy} onClick={handleCopyLink}>
              Copiar link
            </Button>
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Tipo" value={labelFor(proposta.tipo)} />
          <InfoItem label="Status" value={labelFor(proposta.status)} />
          <InfoItem label="Valor" value={formatCurrency(proposta.valor)} />
          <InfoItem label="Forma de pagamento" value={labelFor(proposta.formaPagamento)} />
          <InfoItem label="Validade" value={formatDate(proposta.validade)} />
          <InfoItem label="Criada em" value={formatDate(proposta.dataCriacao)} />
          <InfoItem label="Atualizada em" value={formatDate(proposta.dataAtualizacao)} />
          <InfoItem label="Cliente" value={proposta.nomeCliente || 'Não informado'} />
          <InfoItem label="Telefone do cliente" value={proposta.telefoneCliente || 'Não informado'} />
          <InfoItem label="Imóvel" value={proposta.descricaoImovel || 'Não informado'} />
          <InfoItem label="Corretor" value={proposta.nomeCorretor || 'Não informado'} />
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Termos</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{proposta.termos || 'Não informado'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm text-slate-800">{value}</p>
    </div>
  );
}

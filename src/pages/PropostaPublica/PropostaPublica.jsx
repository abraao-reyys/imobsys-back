import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, MessageSquareText, XCircle } from 'lucide-react';
import {
  aceitarPropostaPublica,
  buscarPropostaPublica,
  recusarPropostaPublica,
  solicitarAjustePublico
} from '../../api/propostas.js';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import FormField, { textareaClassName } from '../../components/FormField.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { labelFor } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const PUBLIC_ACTION_STATUS = ['PENDENTE_ACEITACAO', 'AJUSTE_SOLICITADO'];

export default function PropostaPublica() {
  const { id } = useParams();
  const [proposta, setProposta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmation, setConfirmation] = useState('');
  const showToast = useToast();

  useEffect(() => {
    loadProposta();
  }, [id]);

  async function loadProposta() {
    setLoading(true);
    try {
      setProposta(await buscarPropostaPublica(id));
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function reloadWithConfirmation(message) {
    const fresh = await buscarPropostaPublica(id);
    setProposta(fresh);
    setConfirmation(`${message} Novo status: ${labelFor(fresh.status)}.`);
  }

  async function handleAccept() {
    setActing(true);
    setConfirmation('');
    try {
      await aceitarPropostaPublica(id);
      await reloadWithConfirmation('Proposta aceita.');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    setActing(true);
    setConfirmation('');
    try {
      await recusarPropostaPublica(id);
      await reloadWithConfirmation('Proposta recusada.');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  async function handleAdjustSubmit(event) {
    event.preventDefault();
    setActing(true);
    setFieldErrors({});
    setConfirmation('');

    try {
      await solicitarAjustePublico(id, observacao);
      setAdjustModalOpen(false);
      setObservacao('');
      await reloadWithConfirmation('Ajuste solicitado.');
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (!Object.keys(errors).length) showToast(getApiErrorMessage(error), 'error');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <LoadingState label="Carregando proposta..." />
      </main>
    );
  }

  if (!proposta) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <section className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-5">
          <p className="font-semibold text-slate-950">Proposta não encontrada.</p>
        </section>
      </main>
    );
  }

  const showActions = PUBLIC_ACTION_STATUS.includes(proposta.status);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5">
      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xl font-bold text-slate-950">ImobSys</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">{labelFor(proposta.tipo)}</h1>
            </div>
            <Badge value={proposta.status} className="w-fit" />
          </div>

          {confirmation ? (
            <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              {confirmation}
            </div>
          ) : null}

          {proposta.observacaoAjuste ? (
            <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-sm font-semibold text-orange-950">Observação de ajuste</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-orange-950">{proposta.observacaoAjuste}</p>
            </div>
          ) : null}

          <dl className="mt-5 grid gap-4">
            <InfoItem label="Valor" value={formatCurrency(proposta.valor)} />
            <InfoItem label="Forma de pagamento" value={labelFor(proposta.formaPagamento)} />
            <InfoItem label="Validade" value={formatDate(proposta.validade)} />
            <InfoItem label="Termos" value={proposta.termos || 'Não informado'} multiline />
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Imóvel</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Descrição" value={proposta.descricaoImovel || 'Não informado'} />
            <InfoItem label="Endereço" value={proposta.enderecoImovel || 'Não informado'} />
            <InfoItem label="Cidade" value={proposta.cidadeImovel || 'Não informado'} />
            <InfoItem label="Metragem" value={proposta.metragemImovel ? `${proposta.metragemImovel} m²` : 'Não informado'} />
            <InfoItem label="Cômodos" value={proposta.qtdComodosImovel ?? 'Não informado'} />
            <InfoItem label="Banheiros" value={proposta.qtdBanheirosImovel ?? 'Não informado'} />
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">Corretor</h2>
          <dl className="mt-4 grid gap-4">
            <InfoItem label="Nome" value={proposta.nomeCorretor || 'Não informado'} />
            <InfoItem label="Telefone" value={proposta.telefoneCorretor || 'Não informado'} />
            <InfoItem label="E-mail" value={proposta.emailCorretor || 'Não informado'} />
          </dl>
        </section>

        {showActions ? (
          <section className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white p-4 sm:static sm:mx-0 sm:rounded-lg sm:border">
            <div className="grid gap-2 sm:grid-cols-3">
              <Button icon={CheckCircle2} onClick={handleAccept} disabled={acting}>
                Aceitar Proposta
              </Button>
              <Button variant="danger" icon={XCircle} onClick={handleReject} disabled={acting}>
                Recusar Proposta
              </Button>
              <Button variant="secondary" icon={MessageSquareText} onClick={() => setAdjustModalOpen(true)} disabled={acting}>
                Solicitar Ajuste
              </Button>
            </div>
          </section>
        ) : null}
      </div>

      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Solicitar ajuste"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setAdjustModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="ajuste-form" disabled={acting}>
              {acting ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </div>
        }
      >
        <form id="ajuste-form" onSubmit={handleAdjustSubmit}>
          <FormField label="Observação" name="observacao" error={fieldErrors.observacao}>
            <textarea
              id="observacao"
              name="observacao"
              className={textareaClassName}
              value={observacao}
              onChange={(event) => {
                setObservacao(event.target.value);
                setFieldErrors((current) => ({ ...current, observacao: undefined }));
              }}
              minLength={10}
              maxLength={2000}
              required
            />
          </FormField>
          <p className="mt-2 text-sm text-slate-500">{observacao.length}/2000 caracteres</p>
        </form>
      </Modal>
    </main>
  );
}

function InfoItem({ label, value, multiline = false }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className={multiline ? 'mt-1 whitespace-pre-wrap text-sm text-slate-800' : 'mt-1 break-words text-sm text-slate-800'}>
        {value}
      </dd>
    </div>
  );
}

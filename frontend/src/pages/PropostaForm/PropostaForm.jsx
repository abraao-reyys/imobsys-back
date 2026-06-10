import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { listarClientes } from '../../api/clientes.js';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';
import { listarImoveis } from '../../api/imoveis.js';
import { atualizarProposta, buscarProposta, criarProposta } from '../../api/propostas.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import FormField, { fieldClassName, textareaClassName } from '../../components/FormField.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { FORMA_PAGAMENTO, TIPO_PROPOSTA, labelFor } from '../../utils/constants.js';
import { compactPayload, formatCurrency, toNumberOrNull } from '../../utils/formatters.js';
import { isPropostaEditable } from '../../utils/propostaRules.js';

const initialForm = {
  imovelId: '',
  clienteId: '',
  tipo: 'VENDA',
  valor: '',
  formaPagamento: 'A_VISTA',
  validade: '',
  termos: ''
};

export default function PropostaForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imoveis, setImoveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proposta, setProposta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadForm() {
      setLoading(true);
      try {
        const requests = [listarImoveis(), listarClientes()];
        if (isEditing) requests.push(buscarProposta(id));

        const [imoveisData, clientesData, propostaData] = await Promise.all(requests);
        if (!active) return;

        setImoveis(imoveisData);
        setClientes(clientesData);

        if (propostaData) {
          setProposta(propostaData);
          setForm({
            imovelId: '',
            clienteId: '',
            tipo: propostaData.tipo || 'VENDA',
            valor: propostaData.valor ?? '',
            formaPagamento: propostaData.formaPagamento || 'A_VISTA',
            validade: propostaData.validade || '',
            termos: propostaData.termos || ''
          });
        }
      } catch (error) {
        if (active) showToast(getApiErrorMessage(error), 'error');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadForm();
    return () => {
      active = false;
    };
  }, [id, isEditing, showToast]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function buildPayload() {
    const base = {
      tipo: form.tipo,
      valor: toNumberOrNull(form.valor),
      formaPagamento: form.formaPagamento,
      validade: form.validade,
      termos: form.termos
    };

    if (isEditing) return compactPayload(base);

    return compactPayload({
      ...base,
      imovelId: form.imovelId,
      clienteId: form.clienteId,
      corretorId: user?.corretorId
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});

    if (!isEditing && !user?.corretorId) {
      showToast('Não foi possível identificar o corretor logado. Entre novamente.', 'error');
      return;
    }

    if (isEditing && proposta && !isPropostaEditable(proposta.status)) {
      showToast('Esta proposta não pode ser editada no status atual.', 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = isEditing ? await atualizarProposta(id, buildPayload()) : await criarProposta(buildPayload());
      showToast(isEditing ? 'Proposta atualizada.' : 'Proposta criada.', 'success');
      navigate(`/propostas/${saved.id}`, { replace: true });
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (!Object.keys(errors).length) showToast(getApiErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Carregando formulário..." />;

  const editingBlocked = isEditing && proposta && !isPropostaEditable(proposta.status);

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
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {isEditing ? 'Editar proposta' : 'Nova proposta'}
          </h1>
        </div>
        {proposta ? <Badge value={proposta.status} /> : null}
      </div>

      {editingBlocked ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          Esta proposta só pode ser editada quando estiver em rascunho ou ajuste solicitado.
        </div>
      ) : null}

      <form className="rounded-lg border border-slate-200 bg-white p-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          {isEditing ? (
            <>
              <InfoPanel label="Imóvel" value={proposta?.descricaoImovel || 'Não informado'} />
              <InfoPanel label="Cliente" value={proposta?.nomeCliente || 'Não informado'} />
            </>
          ) : (
            <>
              <FormField label="Imóvel" name="imovelId" error={fieldErrors.imovelId}>
                <select
                  id="imovelId"
                  name="imovelId"
                  className={fieldClassName}
                  value={form.imovelId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {imoveis.map((imovel) => (
                    <option key={imovel.id} value={imovel.id}>
                      {labelFor(imovel.tipo)} · {imovel.cidade || 'Cidade não informada'} · {labelFor(imovel.status)}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Cliente" name="clienteId" error={fieldErrors.clienteId}>
                <select
                  id="clienteId"
                  name="clienteId"
                  className={fieldClassName}
                  value={form.clienteId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome} · CPF {cliente.cpf || 'não informado'}
                    </option>
                  ))}
                </select>
              </FormField>
            </>
          )}

          <FormField label="Tipo" name="tipo" error={fieldErrors.tipo}>
            <select id="tipo" name="tipo" className={fieldClassName} value={form.tipo} onChange={handleChange}>
              {TIPO_PROPOSTA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {labelFor(tipo)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Valor" name="valor" error={fieldErrors.valor}>
            <input
              id="valor"
              name="valor"
              type="number"
              min="0"
              step="0.01"
              className={fieldClassName}
              value={form.valor}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Forma de pagamento" name="formaPagamento" error={fieldErrors.formaPagamento}>
            <select
              id="formaPagamento"
              name="formaPagamento"
              className={fieldClassName}
              value={form.formaPagamento}
              onChange={handleChange}
            >
              {FORMA_PAGAMENTO.map((forma) => (
                <option key={forma} value={forma}>
                  {labelFor(forma)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Validade" name="validade" error={fieldErrors.validade}>
            <input
              id="validade"
              name="validade"
              type="date"
              className={fieldClassName}
              value={form.validade}
              onChange={handleChange}
            />
          </FormField>

          {isEditing ? <InfoPanel label="Valor atual" value={formatCurrency(proposta?.valor)} /> : null}

          <FormField label="Termos" name="termos" error={fieldErrors.termos} className="md:col-span-2">
            <textarea
              id="termos"
              name="termos"
              className={textareaClassName}
              value={form.termos}
              onChange={handleChange}
            />
          </FormField>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/propostas')}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} disabled={saving || editingBlocked}>
            {saving ? 'Salvando...' : 'Salvar proposta'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function InfoPanel({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

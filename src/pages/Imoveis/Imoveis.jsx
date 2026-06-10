import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  alterarStatusImovel,
  atualizarImovel,
  criarImovel,
  excluirImovel,
  listarImoveis
} from '../../api/imoveis.js';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';
import Badge from '../../components/Badge.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FormField, { fieldClassName, textareaClassName } from '../../components/FormField.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { STATUS_IMOVEL, TIPO_IMOVEL, labelFor } from '../../utils/constants.js';
import { compactPayload, formatCurrency, toIntegerOrNull, toNumberOrNull } from '../../utils/formatters.js';

const initialForm = {
  tipo: 'APARTAMENTO',
  status: 'DISPONIVEL',
  matricula: '',
  metragem: '',
  valorMinimo: '',
  valorMaximo: '',
  valorIptu: '',
  cidade: '',
  estado: '',
  cep: '',
  endereco: '',
  qtdComodos: '',
  qtdBanheiros: '',
  particularidades: '',
  vistoriaRealizada: false
};

export default function Imoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    loadImoveis();
  }, []);

  async function loadImoveis() {
    setLoading(true);
    try {
      setImoveis(await listarImoveis());
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredImoveis = useMemo(() => {
    if (statusFiltro === 'TODOS') return imoveis;
    return imoveis.filter((imovel) => imovel.status === statusFiltro);
  }, [imoveis, statusFiltro]);

  function openCreateModal() {
    setEditing(null);
    setForm(initialForm);
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(imovel) {
    setEditing(imovel);
    setForm({
      tipo: imovel.tipo || 'APARTAMENTO',
      status: imovel.status || 'DISPONIVEL',
      matricula: imovel.matricula ?? '',
      metragem: imovel.metragem ?? '',
      valorMinimo: imovel.valorMinimo ?? '',
      valorMaximo: imovel.valorMaximo ?? '',
      valorIptu: imovel.valorIptu ?? '',
      cidade: imovel.cidade || '',
      estado: imovel.estado || '',
      cep: imovel.cep || '',
      endereco: imovel.endereco || '',
      qtdComodos: imovel.qtdComodos ?? '',
      qtdBanheiros: imovel.qtdBanheiros ?? '',
      particularidades: imovel.particularidades || '',
      vistoriaRealizada: Boolean(imovel.vistoriaRealizada)
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function buildPayload() {
    return compactPayload({
      tipo: form.tipo,
      status: form.status,
      matricula: toIntegerOrNull(form.matricula),
      metragem: toNumberOrNull(form.metragem),
      valorMinimo: toNumberOrNull(form.valorMinimo),
      valorMaximo: toNumberOrNull(form.valorMaximo),
      valorIptu: toNumberOrNull(form.valorIptu),
      cidade: form.cidade,
      estado: form.estado,
      cep: form.cep,
      endereco: form.endereco,
      qtdComodos: toIntegerOrNull(form.qtdComodos),
      qtdBanheiros: toIntegerOrNull(form.qtdBanheiros),
      particularidades: form.particularidades,
      vistoriaRealizada: form.vistoriaRealizada
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const payload = buildPayload();
      const saved = editing ? await atualizarImovel(editing.id, payload) : await criarImovel(payload);
      setImoveis((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]
      );
      setModalOpen(false);
      showToast(editing ? 'Imóvel atualizado.' : 'Imóvel cadastrado.', 'success');
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (!Object.keys(errors).length) showToast(getApiErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(imovel, status) {
    if (status === imovel.status) return;

    try {
      const updated = await alterarStatusImovel(imovel.id, status);
      setImoveis((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      showToast('Status do imóvel atualizado.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    }
  }

  async function handleDelete(imovel) {
    const confirmed = window.confirm(`Excluir o imóvel ${imovel.tipo} em ${imovel.cidade || 'cidade não informada'}?`);
    if (!confirmed) return;

    try {
      await excluirImovel(imovel.id);
      setImoveis((current) => current.filter((item) => item.id !== imovel.id));
      showToast('Imóvel excluído.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    }
  }

  if (loading) return <LoadingState label="Carregando imóveis..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Imóveis</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredImoveis.length} registro(s) na visualização atual.</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Novo Imóvel
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <FormField label="Filtrar por status" name="statusFiltro" className="max-w-xs">
          <select
            id="statusFiltro"
            name="statusFiltro"
            className={fieldClassName}
            value={statusFiltro}
            onChange={(event) => setStatusFiltro(event.target.value)}
          >
            <option value="TODOS">Todos</option>
            {STATUS_IMOVEL.map((status) => (
              <option key={status} value={status}>
                {labelFor(status)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {filteredImoveis.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {filteredImoveis.map((imovel) => (
            <article key={imovel.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">{labelFor(imovel.tipo)}</h2>
                    <Badge value={imovel.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {imovel.endereco || 'Endereço não informado'} · {imovel.cidade || 'Cidade não informada'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditModal(imovel)} title="Editar">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button size="icon" variant="danger" onClick={() => handleDelete(imovel)} title="Excluir">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Metragem" value={imovel.metragem ? `${imovel.metragem} m²` : 'Não informado'} />
                <InfoItem
                  label="Valor"
                  value={`${formatCurrency(imovel.valorMinimo)} - ${formatCurrency(imovel.valorMaximo)}`}
                />
                <InfoItem label="IPTU" value={formatCurrency(imovel.valorIptu)} />
                <InfoItem label="Cômodos" value={imovel.qtdComodos ?? 'Não informado'} />
                <InfoItem label="Banheiros" value={imovel.qtdBanheiros ?? 'Não informado'} />
                <InfoItem label="Vistoria" value={imovel.vistoriaRealizada ? 'Realizada' : 'Pendente'} />
              </dl>

              <div className="mt-4 max-w-xs">
                <FormField label="Alterar status" name={`status-${imovel.id}`}>
                  <select
                    id={`status-${imovel.id}`}
                    className={fieldClassName}
                    value={imovel.status || 'DISPONIVEL'}
                    onChange={(event) => handleStatusChange(imovel, event.target.value)}
                  >
                    {STATUS_IMOVEL.map((status) => (
                      <option key={status} value={status}>
                        {labelFor(status)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhum imóvel encontrado" description="Ajuste o filtro ou cadastre um novo imóvel." />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar imóvel' : 'Novo imóvel'}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="imovel-form" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        <form id="imovel-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Tipo" name="tipo" error={fieldErrors.tipo}>
            <select id="tipo" name="tipo" className={fieldClassName} value={form.tipo} onChange={handleChange}>
              {TIPO_IMOVEL.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {labelFor(tipo)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Status" name="status" error={fieldErrors.status}>
            <select id="status" name="status" className={fieldClassName} value={form.status} onChange={handleChange}>
              {STATUS_IMOVEL.map((status) => (
                <option key={status} value={status}>
                  {labelFor(status)}
                </option>
              ))}
            </select>
          </FormField>

          <NumberField name="matricula" label="Matrícula" value={form.matricula} error={fieldErrors.matricula} onChange={handleChange} />
          <NumberField name="metragem" label="Metragem" value={form.metragem} error={fieldErrors.metragem} onChange={handleChange} />
          <NumberField name="valorMinimo" label="Valor mínimo" value={form.valorMinimo} error={fieldErrors.valorMinimo} onChange={handleChange} />
          <NumberField name="valorMaximo" label="Valor máximo" value={form.valorMaximo} error={fieldErrors.valorMaximo} onChange={handleChange} />
          <NumberField name="valorIptu" label="Valor IPTU" value={form.valorIptu} error={fieldErrors.valorIptu} onChange={handleChange} />

          <FormField label="Cidade" name="cidade" error={fieldErrors.cidade}>
            <input id="cidade" name="cidade" className={fieldClassName} value={form.cidade} onChange={handleChange} />
          </FormField>

          <FormField label="Estado" name="estado" error={fieldErrors.estado}>
            <input id="estado" name="estado" className={fieldClassName} value={form.estado} onChange={handleChange} maxLength={2} />
          </FormField>

          <FormField label="CEP" name="cep" error={fieldErrors.cep}>
            <input id="cep" name="cep" className={fieldClassName} value={form.cep} onChange={handleChange} maxLength={9} />
          </FormField>

          <FormField label="Endereço" name="endereco" error={fieldErrors.endereco} className="sm:col-span-2">
            <input id="endereco" name="endereco" className={fieldClassName} value={form.endereco} onChange={handleChange} />
          </FormField>

          <NumberField name="qtdComodos" label="Qtd. cômodos" value={form.qtdComodos} error={fieldErrors.qtdComodos} onChange={handleChange} />
          <NumberField name="qtdBanheiros" label="Qtd. banheiros" value={form.qtdBanheiros} error={fieldErrors.qtdBanheiros} onChange={handleChange} />

          <FormField label="Particularidades" name="particularidades" error={fieldErrors.particularidades} className="sm:col-span-2">
            <textarea
              id="particularidades"
              name="particularidades"
              className={textareaClassName}
              value={form.particularidades}
              onChange={handleChange}
            />
          </FormField>

          <label className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
            <input
              type="checkbox"
              name="vistoriaRealizada"
              checked={form.vistoriaRealizada}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700">Vistoria realizada</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}

function NumberField({ name, label, value, error, onChange }) {
  return (
    <FormField label={label} name={name} error={error}>
      <input
        id={name}
        name={name}
        type="number"
        step="0.01"
        min="0"
        className={fieldClassName}
        value={value}
        onChange={onChange}
      />
    </FormField>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

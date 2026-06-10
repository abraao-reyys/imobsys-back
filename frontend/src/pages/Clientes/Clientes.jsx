import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  atualizarCliente,
  criarCliente,
  excluirCliente,
  listarClientes
} from '../../api/clientes.js';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FormField, { fieldClassName } from '../../components/FormField.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import Modal from '../../components/Modal.jsx';
import { useToast } from '../../components/Toast.jsx';
import { compactPayload, formatCurrency, formatDate, toNumberOrNull } from '../../utils/formatters.js';

const initialForm = {
  nome: '',
  rg: '',
  cpf: '',
  email: '',
  telefone: '',
  renda: ''
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    loadClientes();
  }, []);

  async function loadClientes() {
    setLoading(true);
    try {
      setClientes(await listarClientes());
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredClientes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((cliente) =>
      [cliente.nome, cliente.cpf, cliente.email, cliente.telefone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [clientes, search]);

  function openCreateModal() {
    setEditing(null);
    setForm(initialForm);
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEditModal(cliente) {
    setEditing(cliente);
    setForm({
      nome: cliente.nome || '',
      rg: cliente.rg || '',
      cpf: cliente.cpf || '',
      email: cliente.email || '',
      telefone: cliente.telefone || '',
      renda: cliente.renda ?? ''
    });
    setFieldErrors({});
    setModalOpen(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function buildPayload() {
    return compactPayload({
      nome: form.nome,
      rg: form.rg,
      cpf: form.cpf,
      email: form.email,
      telefone: form.telefone,
      renda: toNumberOrNull(form.renda)
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const payload = buildPayload();
      const saved = editing ? await atualizarCliente(editing.id, payload) : await criarCliente(payload);
      setClientes((current) =>
        editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]
      );
      setModalOpen(false);
      showToast(editing ? 'Cliente atualizado.' : 'Cliente cadastrado.', 'success');
    } catch (error) {
      const errors = extractFieldErrors(error);
      setFieldErrors(errors);
      if (!Object.keys(errors).length) showToast(getApiErrorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(cliente) {
    const confirmed = window.confirm(`Excluir o cliente ${cliente.nome}?`);
    if (!confirmed) return;

    try {
      await excluirCliente(cliente.id);
      setClientes((current) => current.filter((item) => item.id !== cliente.id));
      showToast('Cliente excluído.', 'success');
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error');
    }
  }

  if (loading) return <LoadingState label="Carregando clientes..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Clientes</h1>
          <p className="mt-1 text-sm text-slate-500">{filteredClientes.length} cliente(s) na visualização atual.</p>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <FormField label="Buscar cliente" name="search" className="max-w-md">
          <input
            id="search"
            name="search"
            className={fieldClassName}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome, CPF, e-mail ou telefone"
          />
        </FormField>
      </div>

      {filteredClientes.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {filteredClientes.map((cliente) => (
            <article key={cliente.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-slate-950">{cliente.nome}</h2>
                  <p className="mt-1 text-sm text-slate-500">CPF {cliente.cpf || 'não informado'}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="icon" variant="secondary" onClick={() => openEditModal(cliente)} title="Editar">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button size="icon" variant="danger" onClick={() => handleDelete(cliente)} title="Excluir">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="RG" value={cliente.rg || 'Não informado'} />
                <InfoItem label="E-mail" value={cliente.email || 'Não informado'} />
                <InfoItem label="Telefone" value={cliente.telefone || 'Não informado'} />
                <InfoItem label="Renda" value={formatCurrency(cliente.renda)} />
                <InfoItem label="Cadastro" value={formatDate(cliente.dataCadastro)} />
              </dl>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState title="Nenhum cliente encontrado" description="Ajuste a busca ou cadastre um novo cliente." />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="cliente-form" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        }
      >
        <form id="cliente-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Nome" name="nome" error={fieldErrors.nome} className="sm:col-span-2">
            <input
              id="nome"
              name="nome"
              className={fieldClassName}
              value={form.nome}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="RG" name="rg" error={fieldErrors.rg}>
            <input id="rg" name="rg" className={fieldClassName} value={form.rg} onChange={handleChange} />
          </FormField>

          <FormField label="CPF" name="cpf" error={fieldErrors.cpf}>
            <input
              id="cpf"
              name="cpf"
              className={fieldClassName}
              value={form.cpf}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]{11}"
              maxLength={11}
              required
            />
          </FormField>

          <FormField label="E-mail" name="email" error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              className={fieldClassName}
              value={form.email}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Telefone" name="telefone" error={fieldErrors.telefone}>
            <input
              id="telefone"
              name="telefone"
              className={fieldClassName}
              value={form.telefone}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Renda" name="renda" error={fieldErrors.renda} className="sm:col-span-2">
            <input
              id="renda"
              name="renda"
              type="number"
              min="0"
              step="0.01"
              className={fieldClassName}
              value={form.renda}
              onChange={handleChange}
            />
          </FormField>
        </form>
      </Modal>
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

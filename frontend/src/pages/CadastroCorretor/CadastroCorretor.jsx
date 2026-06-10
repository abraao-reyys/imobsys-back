import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { criarCorretor } from '../../api/corretores.js';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';
import Button from '../../components/Button.jsx';
import FormField, { fieldClassName } from '../../components/FormField.jsx';
import { useToast } from '../../components/Toast.jsx';

const initialForm = {
  nome: '',
  rg: '',
  cpf: '',
  email: '',
  telefone: '',
  senha: ''
};

export default function CadastroCorretor() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const showToast = useToast();
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      await criarCorretor(form);
      showToast('Cadastro criado com sucesso.', 'success');
      navigate('/', { replace: true });
    } catch (apiError) {
      const errors = extractFieldErrors(apiError);
      setFieldErrors(errors);
      if (!Object.keys(errors).length) {
        showToast(getApiErrorMessage(apiError), 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <section className="mx-auto w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-950">ImobSys</p>
            <h1 className="mt-2 text-lg font-semibold text-slate-800">Cadastro de corretor</h1>
          </div>
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-600" to="/">
            Voltar ao login
          </Link>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
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
              required
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

          <FormField label="Senha" name="senha" error={fieldErrors.senha} className="sm:col-span-2">
            <input
              id="senha"
              name="senha"
              type="password"
              className={fieldClassName}
              value={form.senha}
              onChange={handleChange}
              minLength={6}
              required
            />
          </FormField>

          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" icon={UserPlus} disabled={loading}>
              {loading ? 'Criando...' : 'Criar cadastro'}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

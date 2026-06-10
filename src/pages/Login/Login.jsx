import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Button from '../../components/Button.jsx';
import FormField, { fieldClassName } from '../../components/FormField.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { extractFieldErrors, getApiErrorMessage } from '../../api/errors.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      const status = apiError?.response?.status;
      const errors = extractFieldErrors(apiError);
      setFieldErrors(errors);

      if (status === 401) {
        setError('E-mail ou senha inválidos.');
      } else {
        const message = getApiErrorMessage(apiError);
        setError(message);
        showToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <p className="text-2xl font-bold text-slate-950">ImobSys</p>
          <h1 className="mt-2 text-lg font-semibold text-slate-800">Entrar no sistema</h1>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField label="E-mail" name="email" error={fieldErrors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={fieldClassName}
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Senha" name="senha" error={fieldErrors.senha}>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              className={fieldClassName}
              value={form.senha}
              onChange={handleChange}
              required
            />
          </FormField>

          <Button type="submit" className="w-full" icon={LogIn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
          <Link className="font-semibold text-brand-700 hover:text-brand-600" to="/cadastro">
            Criar cadastro de corretor
          </Link>
        </div>
      </section>
    </main>
  );
}

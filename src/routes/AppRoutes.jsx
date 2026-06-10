import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout.jsx';
import PrivateRoute from '../components/PrivateRoute.jsx';
import CadastroCorretor from '../pages/CadastroCorretor/CadastroCorretor.jsx';
import Clientes from '../pages/Clientes/Clientes.jsx';
import Dashboard from '../pages/Dashboard/Dashboard.jsx';
import Imoveis from '../pages/Imoveis/Imoveis.jsx';
import Login from '../pages/Login/Login.jsx';
import PropostaDetalhe from '../pages/PropostaDetalhe/PropostaDetalhe.jsx';
import PropostaForm from '../pages/PropostaForm/PropostaForm.jsx';
import PropostaPublica from '../pages/PropostaPublica/PropostaPublica.jsx';
import Propostas from '../pages/Propostas/Propostas.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<CadastroCorretor />} />
      <Route path="/proposta-publica/:id" element={<PropostaPublica />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/imoveis" element={<Imoveis />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/propostas" element={<Propostas />} />
          <Route path="/propostas/nova" element={<PropostaForm />} />
          <Route path="/propostas/:id/editar" element={<PropostaForm />} />
          <Route path="/propostas/:id" element={<PropostaDetalhe />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

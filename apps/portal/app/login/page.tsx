import type { Metadata } from 'next';
import { LoginFlowClient } from './_components/LoginFlowClient';

export const metadata: Metadata = {
  title: 'Iniciar sesión · Camino Seguro Portal',
  description:
    'Acceso al portal institucional de Camino Seguro con verificación en dos pasos.',
};

export default function LoginPage() {
  return <LoginFlowClient />;
}

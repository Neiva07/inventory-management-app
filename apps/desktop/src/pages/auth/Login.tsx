import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Package } from "lucide-react";

import { useAuth } from "context/auth";
import { Button } from "components/ui";
import logo from "../../../assets/icons/logo.png";

export const Login = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <img src={logo} alt="Stockify" className="h-16 w-auto" />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo ao Stockify</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie seu inventário de forma eficiente
          </p>
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          onClick={() => {
            window.electron.openExternal(window.env.LOGIN_URL);
          }}
        >
          <LogIn className="h-4 w-4" />
          Entrar na sua conta
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Você será redirecionado para o navegador para fazer login
        </p>
      </div>
    </div>
  );
};

import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "context/auth";
import { Button, Card, CardContent } from "components/ui";

export const Login = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [navigate, user]);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <h1 className="mb-2 text-3xl font-semibold text-primary">Stockify</h1>
            <p className="mb-2 text-center text-lg text-muted-foreground">
              Gerencie seu inventário de forma eficiente
            </p>

            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                window.electron.openExternal(window.env.LOGIN_URL);
              }}
            >
              Entrar
            </Button>

            <p className="mt-2 text-center text-sm text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

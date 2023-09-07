import React from "react"
import { Button } from "@mui/material"
import { useAuth } from "context/auth"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"

export const Login = () => {
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle()
      toast.success("Você entrou com sucesso!")
    } catch (e) {
      console.error(e);
      toast.error('Erro ao logar com o Google')
    }
  }


  React.useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user])

  return <>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      <Button onClick={handleGoogleSignIn}> Entrar com o Google </Button>

    </div>

  </>
}

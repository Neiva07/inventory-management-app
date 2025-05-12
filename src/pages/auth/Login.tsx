import React from "react"
import { Button, Box, Typography, Paper, Container } from "@mui/material"
import { useAuth } from "context/auth"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"

export const Login = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  if (!session) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: '100%',
              maxWidth: 400,
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                color: 'primary.main',
                mb: 2
              }}
            >
              Stockify
            </Typography>

            <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Gerencie seu inventário de forma eficiente
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => {
                console.log(window.env.LOGIN_URL)
                window.electron.openExternal(window.env.LOGIN_URL)
              }}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              Entrar
            </Button>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Faça login para acessar o sistema
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return null;
}

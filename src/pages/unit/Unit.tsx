import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, Grid, TextField, Typography, Paper, Container, List, ListItem, ListItemText, Divider, Skeleton } from "@mui/material"
import { useAuth } from "context/auth";
import { toast } from "react-toastify";
import { createUnit, getUnits, Unit } from "../../model/units";
import AddIcon from '@mui/icons-material/Add';

export const Units = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [units, setUnits] = useState<Array<Unit>>([]);
  const [loading, setLoading] = useState(true);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  useEffect(() => {
    setLoading(true);
    getUnits(user.id)
      .then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)))
      .finally(() => setLoading(false));
  }, [user])

  const submitNewUnit = () => {
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a unidade');
      return;
    }

    try {
      createUnit({ name, description, userID: user.id })
      toast.success('Unidade criada com sucesso')
      setName("");
      setDescription("");
      setLoading(true);
      getUnits(user.id)
        .then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)))
        .finally(() => setLoading(false));
    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }
  }

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3].map((index) => (
        <React.Fragment key={index}>
          <ListItem sx={{ py: 2 }}>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="80%" />}
            />
          </ListItem>
          {index < 3 && <Divider />}
        </React.Fragment>
      ))}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* List of Units */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              Unidades Cadastradas
            </Typography>
            <List sx={{ flex: 1 }}>
              {loading ? (
                <LoadingSkeleton />
              ) : units.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  Nenhuma unidade cadastrada
                </Typography>
              ) : (
                units.map((unit, index) => (
                  <React.Fragment key={unit.id}>
                    <ListItem>
                      <ListItemText
                        primary={unit.name}
                        secondary={unit.description}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    {index < units.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Create Unit Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              Nova Unidade
            </Typography>
            <Grid container spacing={3} sx={{ flex: 1 }}>
              <Grid item xs={12}>
                <TextField
                  id="name"
                  label="Nome da Unidade"
                  onChange={handleChangeName}
                  value={name}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Descrição da Unidade"
                  onChange={handleChangeDescription}
                  value={description}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 'auto' }}>
                <Button
                  variant="contained"
                  onClick={submitNewUnit}
                  startIcon={<AddIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Criar Unidade
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

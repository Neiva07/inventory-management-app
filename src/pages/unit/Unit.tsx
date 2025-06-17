import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, Grid, TextField, Typography, Paper, Container, List, ListItem, ListItemText, Divider, Skeleton, IconButton, Menu, MenuItem } from "@mui/material"
import { useAuth } from "context/auth";
import { toast } from "react-toastify";
import { createUnit, getUnits, Unit, updateUnit, deleteUnit } from "../../model/units";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export const Units = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [units, setUnits] = useState<Array<Unit>>([]);
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, unit: Unit) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedUnit(unit);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedUnit(null);
  };

  const handleEditClick = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setDescription(unit.description || "");
    handleMenuClose();
  };

  const handleDeleteClick = (unit: Unit) => {
    try {
      deleteUnit(unit.id);
      toast.success('Unidade excluída com sucesso');
      refreshUnits();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Erro ao excluir unidade');
    }
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setName("");
    setDescription("");
  };

  const refreshUnits = () => {
    setLoading(true);
    getUnits(user.id)
      .then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)))
      .finally(() => setLoading(false));
  };

  const submitNewUnit = () => {
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a unidade');
      return;
    }

    try {
      if (editingUnit) {
        updateUnit(editingUnit.id, { name, description, userID: user.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error('Erro ao atualizar unidade');
          });
          toast.success('Unidade atualizada com sucesso');

      } else {
        createUnit({ name, description, userID: user.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error('Erro ao criar unidade');
          });
          toast.success('Unidade criada com sucesso');
      }
      handleCancelEdit();
      refreshUnits();

    } catch (err: unknown) {
      console.error(err);
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde');
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
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="more"
                          onClick={(e) => handleMenuClick(e, unit)}
                          color="primary"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
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
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => selectedUnit && handleEditClick(selectedUnit)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Editar
              </MenuItem>
              <MenuItem onClick={() => selectedUnit && handleDeleteClick(selectedUnit)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Excluir
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* Create/Edit Unit Form */}
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
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
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
              <Grid item xs={12} sx={{ mt: 'auto', display: 'flex', gap: 2 }}>
                {editingUnit && (
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    sx={{
                      py: 1.5,
                      px: 4,
                    }}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={submitNewUnit}
                  startIcon={editingUnit ? <EditIcon /> : <AddIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                  }}
                >
                  {editingUnit ? 'Atualizar Unidade' : 'Criar Unidade'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

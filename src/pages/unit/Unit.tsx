import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, Grid, TextField, Typography, Paper, Container, List, ListItem, ListItemText, Divider, Skeleton, IconButton, Menu, MenuItem } from "@mui/material"
import { useAuth } from "context/auth";
import { toast } from "react-toastify";
import { createUnit, getUnits, Unit, updateUnit, deleteUnit } from "../../model/units";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SearchField } from "../../components/SearchField";
import { DeleteConfirmationDialog } from 'components/DeleteConfirmationDialog';
import { PublicIdDisplay } from 'components/PublicIdDisplay';

export const Units = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [units, setUnits] = useState<Array<Unit>>([]);
  const [filteredUnits, setFilteredUnits] = useState<Array<Unit>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter units based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(unit =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUnits(filtered);
    }
  }, [searchTerm, units]);

  useEffect(() => {
    setLoading(true);
    getUnits(user.id)
      .then(queryResult => {
        const unitsData = queryResult.docs.map(r => r.data() as Unit);
        setUnits(unitsData);
        setFilteredUnits(unitsData);
      })
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
    setSelectedUnit(unit);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (selectedUnit) {
      try {
        deleteUnit(selectedUnit.id);
        toast.success('Unidade excluída com sucesso');
        refreshUnits();
      } catch (err: unknown) {
        console.error(err);
        toast.error('Erro ao excluir unidade');
      }
    }
    setDeleteDialogOpen(false);
    setSelectedUnit(null);
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedUnit(null);
  }

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setName("");
    setDescription("");
  };

  const refreshUnits = () => {
    setLoading(true);
    getUnits(user.id)
      .then(queryResult => {
        const unitsData = queryResult.docs.map(r => r.data() as Unit);
        setUnits(unitsData);
        setFilteredUnits(unitsData);
      })
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
              maxHeight: '800px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              Unidades Cadastradas
            </Typography>
            <Box sx={{ mb: 2 }}>
              <SearchField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar unidades..."
              />
            </Box>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <LoadingSkeleton />
              ) : filteredUnits.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  {searchTerm ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
                </Typography>
              ) : (
                filteredUnits.map((unit, index) => (
                  <React.Fragment key={unit.id}>
                    <ListItem
                      sx={{ 
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          borderRadius: 1
                        }
                      }}
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
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {unit.name}
                          </Typography>
                        }
                        secondary={
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {unit.description || 'Sem descrição'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < filteredUnits.length - 1 && <Divider />}
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
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
              </Typography>
              {editingUnit?.publicId && (
                <PublicIdDisplay 
                  publicId={editingUnit.publicId} 
                />
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="name"
                  label="Nome da Unidade"
                  onChange={handleChangeName}
                  value={name}
                  fullWidth
                  required
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
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
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
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="unidade"
      />
    </Container>
  )
}

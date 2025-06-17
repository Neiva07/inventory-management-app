import React, { ChangeEvent, useEffect, useState } from "react"
import { Box, Button, Grid, TextField, Typography, Paper, Container, List, ListItem, ListItemText, Divider, Skeleton, IconButton, Menu, MenuItem } from "@mui/material"
import { useAuth } from "context/auth";
import { toast } from "react-toastify";
import { createProductCategories, getProductCategories, ProductCategory, updateProductCategory, deleteProductCategory } from "../../model/productCategories";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SearchField } from "../../components/SearchField";

export const ProductCategories = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [productCategories, setProductCategories] = useState<Array<ProductCategory>>([]);
  const [filteredCategories, setFilteredCategories] = useState<Array<ProductCategory>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(productCategories);
    } else {
      const filtered = productCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, productCategories]);

  useEffect(() => {
    setLoading(true);
    getProductCategories(user.id)
      .then(queryResult => {
        const categories = queryResult.docs.map(r => r.data() as ProductCategory);
        setProductCategories(categories);
        setFilteredCategories(categories);
      })
      .finally(() => setLoading(false));
  }, [user])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, category: ProductCategory) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCategory(null);
  };

  const handleEditClick = (category: ProductCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    handleMenuClose();
  };

  const handleDeleteClick = (category: ProductCategory) => {
    try {
      deleteProductCategory(category.id);
      toast.success('Categoria excluída com sucesso');
      refreshCategories();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Erro ao excluir categoria');
    }
    handleMenuClose();
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const submitNewProductCategory = () => {
    if (!name.trim()) {
      toast.error('Por favor, insira um nome para a categoria');
      return;
    }

    try {
      if (editingCategory) {
        updateProductCategory(editingCategory.id, { name, description, userID: user.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error('Erro ao atualizar categoria');
          });
          toast.success('Categoria atualizada com sucesso');
      } else {
        createProductCategories({ name, description, userID: user.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error('Erro ao criar categoria');
          });
      toast.success('Categoria criada com sucesso');
      }
      handleCancelEdit(); 
      refreshCategories();
    } catch (err: unknown) {
      console.error(err);
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde');
    }
  };

  const refreshCategories = () => {
    setLoading(true);
    getProductCategories(user.id)
      .then(queryResult => {
        const categories = queryResult.docs.map(r => r.data() as ProductCategory);
        setProductCategories(categories);
        setFilteredCategories(categories);
      })
      .finally(() => setLoading(false));
  };

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
        {/* List of Categories */}
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
            <Typography variant="h5" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              Categorias Cadastradas
            </Typography>
            <Box sx={{ mb: 2 }}>
              <SearchField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar categorias..."
              />
            </Box>
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <LoadingSkeleton />
              ) : filteredCategories.length === 0 ? (
                <Typography color="text.secondary" align="center">
                  {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                </Typography>
              ) : (
                filteredCategories.map((category, index) => (
                  <React.Fragment key={category.id}>
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
                          onClick={(e) => handleMenuClick(e, category)}
                          color="primary"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {category.name}
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
                            {category.description || 'Sem descrição'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < filteredCategories.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => selectedCategory && handleEditClick(selectedCategory)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Editar
              </MenuItem>
              <MenuItem onClick={() => selectedCategory && handleDeleteClick(selectedCategory)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                Excluir
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* Create/Edit Category Form */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="name"
                  label="Nome da Categoria"
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
                  label="Descrição da Categoria"
                  onChange={handleChangeDescription}
                  value={description}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2, display: 'flex', gap: 2 }}>
                {editingCategory && (
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
                  onClick={submitNewProductCategory}
                  startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                  }}
                >
                  {editingCategory ? 'Atualizar Categoria' : 'Criar Categoria'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

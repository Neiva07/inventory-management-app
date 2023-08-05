import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "react-toastify";
import { createProductCategories, getProductCategories, ProductCategory } from "../../model/productCategories";

export const ProductCategories = () => {

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [productCategories, setProductCategories] = useState<Array<ProductCategory>>([]);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  useEffect(() => {
    getProductCategories().then(queryResult => setProductCategories(queryResult.docs.map(r => r.data() as ProductCategory)));
  }, [])


  const submitNewProductCategory = () => {
    try {
      createProductCategories({ name, description })
      toast.success('Unidade criada com sucesso')

      getProductCategories().then(queryResult => setProductCategories(queryResult.docs.map(r => r.data() as ProductCategory)));
    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }
  return (
    <>
      <Box>
        <Typography variant="h5" gutterBottom>
          Lista de Categorias de Produto
        </Typography>


        {
          productCategories.map(category => {
            return <ol key={category.id}>
              {category.name}
            </ol>
          })
        }
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            id="name"
            label="Nome da Categoria"
            onChange={handleChangeName}
            value={name}
            fullWidth
          />
        </Grid>
        <Grid item xs={8}>

          <TextField
            fullWidth
            id="description"
            label="Descrição da Categoria"
            onChange={handleChangeDescription}
            value={description}
          />
        </Grid>
      </Grid>
      <Button onClick={submitNewProductCategory}> Criar Categoria </Button>
    </>
  )
}

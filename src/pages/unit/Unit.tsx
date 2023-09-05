import { Box, Button, Grid, TextField, Typography } from "@mui/material"
import { useAuth } from "context/auth";
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "react-toastify";
import { createUnit, getUnits, Unit } from "../../model/units";

export const Units = () => {
  const { user } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [units, setUnits] = useState<Array<Unit>>([]);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value)
  }

  useEffect(() => {
    getUnits(user.id).then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)));
  }, [user])


  const submitNewUnit = () => {
    try {
      createUnit({ name, description, userID: user.id })
      toast.success('Unidade criada com sucesso')

      getUnits(user.id).then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)));
    } catch (err) {
      console.error(err)
      toast.error('Alguma coisa deu errado. Tente novamente mais tarde')
    }

  }

  return (
    <>
      <Box>
        <Typography variant="h5" gutterBottom>
          Lista de Unidades
        </Typography>

        {
          units.map(unit => {
            return <ol key={unit.id}>
              {unit.name}
            </ol>
          })
        }
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            id="name"
            label="Nome da Unidade"
            onChange={handleChangeName}
            value={name}
            fullWidth
          />
        </Grid>
        <Grid item xs={8}>

          <TextField
            fullWidth
            id="description"
            label="Descrição da Unidade"
            onChange={handleChangeDescription}
            value={description}
          />
        </Grid>
      </Grid>
      <Button onClick={submitNewUnit}> Criar unidade </Button>
    </>
  )
}

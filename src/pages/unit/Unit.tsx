import { Button, Grid, TextField } from "@mui/material"
import { ChangeEvent, useEffect, useState } from "react"
import { createUnit, getUnits, Unit } from "../../model/units";

export const Units = () => {

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
    getUnits().then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)));
  }, [])


  const submitNewUnit = () => {
    createUnit({ name, description })
    getUnits().then(queryResult => setUnits(queryResult.docs.map(r => r.data() as Unit)));
  }
  return (
    <>
      {
        units.map(unit => {
          return <ol key={unit.id}>
            {unit.name}
          </ol>
        })
      }
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

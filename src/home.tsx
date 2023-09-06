import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Grid } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';

type GuideProps = {
  title: string;
  description: string;
  link1: string;
  link2?: string;
}

const GuideCard = (props: GuideProps) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardContent onClick={() => navigate(props.link1)}>
          <Typography gutterBottom variant="h5" component="div">
            {props.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary" onClick={() => navigate(props.link1)}>
          Consultar
        </Button>
        {props.link2 && (<Button size="small" color="primary" onClick={() => navigate(props.link2)}>
          Cadastrar
        </Button>)}
      </CardActions>
    </Card >

  )
}

export const Home = () => {

  return (
    <Grid spacing={2} container>
      <Grid item xs={6}>
        <GuideCard
          title='Produtos'
          description='Cadastre, consulte, edite e delete seus produtos'
          link1='products'
          link2='products/create'
        />
      </Grid>
      <Grid item xs={6}>
        <GuideCard
          title='Fornecedores'
          description='Cadastre, consulte, edite e delete seus fornecedores'
          link1='suppliers'
          link2='suppliers/create'
        />
      </Grid>
      <Grid item xs={6}>
        <GuideCard
          title='Clientes'
          description='Cadastre, consulte, edite e delete seus clientes'
          link1='customers'
          link2='customers/create'
        />
      </Grid>
      <Grid item xs={6}>
        <GuideCard
          title='Vendas'
          description='crie, consulte, edite e delete suas vendas'
          link1='orders'
          link2='orders/create'
        />
      </Grid>
      <Grid item xs={6}>
        <GuideCard
          title='Categoria de Produtos'
          description='Cadastre e consulte as categorias de produtos'
          link1='units'
        />
      </Grid>
      <Grid item xs={6}>
        <GuideCard
          title='Unidade de Produtos'
          description='Cadastre e consulte suas unidades de produtos'
          link1='productCategories'
        />
      </Grid>

    </Grid>
  );
};

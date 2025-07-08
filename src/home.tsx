import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, Grid, Container, Box, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HelpIcon from '@mui/icons-material/Help';

type GuideProps = {
  title: string;
  description: string;
  link1: string;
  link2?: string;
  createButtonText?: string;
}

const GuideCard = (props: GuideProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      sx={{ 
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardActionArea sx={{ flexGrow: 1 }}>
        <CardContent onClick={() => navigate(props.link1)}>
          <Typography 
            gutterBottom 
            variant="h5" 
            component="div"
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 2
            }}
          >
            {props.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              minHeight: '3em',
              lineHeight: 1.5
            }}
          >
            {props.description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ 
        p: 2, 
        pt: 0,
        justifyContent: 'space-between'
      }}>
        <Button 
          size="small" 
          color="primary" 
          onClick={() => navigate(props.link1)}
          startIcon={<SearchIcon />}
          sx={{ 
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            }
          }}
        >
          Consultar
        </Button>
        {props.link2 && (
          <Button 
            size="small" 
            color="secondary" 
            onClick={() => navigate(props.link2)}
            startIcon={<AddIcon />}
            sx={{ 
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'secondary.light',
                color: 'white'
              }
            }}
          >
            {props.createButtonText ?? 'Cadastrar'}
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

export const Home = () => {
  const navigate = useNavigate();

  const handleShowHelp = () => {
    // Since home page doesn't have page-specific help, F1 will show global help
    const f1Event = new KeyboardEvent('keydown', {
      key: 'F1',
      code: 'F1',
      keyCode: 112,
      which: 112,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(f1Event);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              mb: 1
            }}
          >
            Painel de Controle
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
          >
            Gerencie seu inventário de forma eficiente
          </Typography>
        </Box>
        <Tooltip title="Atalhos do Teclado (F1)" placement="top">
          <IconButton
            onClick={handleShowHelp}
            size="medium"
            color="primary"
            sx={{ ml: 1 }}
          >
            <HelpIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Produtos'
            description='Cadastre, consulte, edite e delete seus produtos'
            link1='products'
            link2='products/create'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Fornecedores'
            description='Cadastre, consulte, edite e delete seus fornecedores'
            link1='suppliers'
            link2='suppliers/create'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Clientes'
            description='Cadastre, consulte, edite e delete seus clientes'
            link1='customers'
            link2='customers/create'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Vendas'
            description='Crie, consulte, edite e delete suas vendas'
            link1='orders'
            link2='orders/create'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Compras'
            description='Crie, consulte, edite e delete suas compras'
            link1='inbound-orders'
            link2='inbound-orders/create'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Contas a Pagar'
            description='Gerencie suas contas a pagar e parcelamentos'
            link1='supplier-bills'
            link2='installment-payments'
            createButtonText='Parcelas'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Categoria de Produtos'
            description='Cadastre e consulte as categorias de produtos'
            link1='units'
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <GuideCard
            title='Unidade de Produtos'
            description='Cadastre e consulte suas unidades de produtos'
            link1='productCategories'
          />
        </Grid>
      </Grid>
    </Container>
  );
};

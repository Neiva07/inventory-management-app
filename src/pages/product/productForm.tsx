import React, { ChangeEvent, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Product, createProduct, getProducts } from "../../model/products";
import {
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

const units = [
  {
    id: 1,
    name: "pacotes",
  },
  {
    id: 2,
    name: "lata",
  },
  {
    id: 3,
    name: "kilo",
  },
];

const categories = [
  {
    id: 1,
    name: "cerveja",
  },
  {
    id: 2,
    name: "carnes",
  },
  {
    id: 3,
    name: "fraldas",
  },
];

const handleChange = <
  T,
  K extends ChangeEvent<HTMLInputElement> | SelectChangeEvent
>(
  setState: React.Dispatch<React.SetStateAction<T>>
) => {
  return (e: K) => {
    setState(e.target.value as T);
  };
};

export const ProdutForm = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [category, setCategory] = useState<string>(""); //category entity
  const [buyUnit, setBuyUnit] = useState<string>(""); //unit entity
  const [cost, setCost] = useState<number>();
  const [minInventory, setMinInventory] = useState<number>();
  const [inventory, setInventory] = useState<number>();
  const [weight, setWeight] = useState<string>("");
  const [conversionWholesomeUnit, setWholesomeUnit] = useState<string>();
  const [sellWholesomeInventory, setWholesomeInventory] = useState<number>();
  const [sellCost, setSellCost] = useState<number>();
  const [retailPrice, setRetailPrice] = useState<number>();
  const [retailProfit, setRetailProfit] = useState<number>();
  const [creditProfit, setCreditProfit] = useState<number>();

  useEffect(() => {
    getProducts(searchText).then((results) =>
      setProducts(results.docs.map((v) => v.data() as Product))
    );
  }, [searchText]);

  const handleCreateProduct = () => {
    createProduct({
      name,
      description,
      status: "active",
      userID: "my-id",
      // providersIDs,
    });

    getProducts(searchText).then((results) =>
      setProducts(results.docs.map((v) => v.data() as Product))
    );
  };

  return (
    <>
      <div>
        <InputLabel id="categoryLabel">Categoria</InputLabel>
        <Select
          labelId="categoryLabel"
          id="cateogry"
          value={category}
          label="Categoria"
          size="medium"
          style={{
            width: "200px",
          }}
          onChange={handleChange<string, SelectChangeEvent>(setCategory)}
        >
          {categories.map((category) => {
            return <MenuItem value={category.id}>{category.name}</MenuItem>;
          })}
        </Select>
      </div>
      <TextField
        variant="outlined"
        value={name}
        label="Nome do produto"
        onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(setName)}
      />
      <div>
        <TextField
          variant="outlined"
          value={description}
          label="Descrição"
          onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(
            setDescription
          )}
        />
      </div>
      <div>
        <InputLabel id="buyUnitLabel">Unidade</InputLabel>
        <Select
          labelId="buyUnitLabel"
          id="buyUnit"
          value={buyUnit}
          label="Unidade"
          size="medium"
          style={{
            width: "100px",
          }}
          onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(
            setBuyUnit
          )}
        >
          {units.map((unit) => {
            return <MenuItem value={unit.id}>{unit.name}</MenuItem>;
          })}
        </Select>
      </div>
      <div>
        <div>
          <TextField
            variant="outlined"
            value={inventory}
            label="Estoque"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setInventory
            )}
          />
        </div>
        <div>
          <TextField
            variant="outlined"
            value={minInventory}
            label="Estoque Mínimo"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setMinInventory
            )}
          />
        </div>
        <div>
          <TextField
            variant="outlined"
            value={cost}
            label="Custo $"
            onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
              setCost
            )}
          />
        </div>
      </div>
      <div>
        <TextField
          variant="outlined"
          value={weight}
          label="Peso"
          onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(
            setWeight
          )}
        />
      </div>

      <div>
        <TextField
          variant="outlined"
          value={conversionWholesomeUnit}
          label="Conversão"
          onChange={handleChange<string, ChangeEvent<HTMLInputElement>>(
            setWholesomeUnit
          )}
        />
      </div>

      <div>
        <TextField
          variant="outlined"
          value={sellWholesomeInventory}
          label="Estoque"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setWholesomeInventory
          )}
        />
      </div>
      <div>
        <TextField
          variant="outlined"
          value={sellCost}
          label="Custo $"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setSellCost
          )}
        />
      </div>

      <div>
        <TextField
          variant="outlined"
          value={retailProfit}
          label="Lucro %"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setRetailProfit
          )}
        />
      </div>
      <div>
        <TextField
          variant="outlined"
          value={retailPrice}
          label="Preço R$"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setRetailPrice
          )}
        />
      </div>

      <div>
        <TextField
          variant="outlined"
          value={creditProfit}
          label="Lucro"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setCreditProfit
          )}
        />
      </div>
      <div>
        <TextField
          variant="outlined"
          value={sellCost}
          label="Custo $"
          onChange={handleChange<number, ChangeEvent<HTMLInputElement>>(
            setSellCost
          )}
        />
      </div>
      <Button onClick={handleCreateProduct} variant="contained">
        Criar produto
      </Button>

      <ol>
        {products.map((d) => (
          <li>{d.name}</li>
        ))}
      </ol>
    </>
  );
};

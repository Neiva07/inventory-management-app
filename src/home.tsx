import { ChangeEvent, useState } from "react";
import Button from "@mui/material/Button";
import { Product, createProduct } from "./model/products";
import { Input } from "@mui/material";

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const handleCreateProduct = () => {
    createProduct({
      name,
      description,
      status: "active",
      userID: "my-id",
      // providersIDs,
    });
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <>
      <div>
        <Input
          value={name}
          placeholder="Nome do produto"
          onChange={handleChangeName}
        />
      </div>
      <div>
        <Input
          value={description}
          placeholder="Descrição"
          onChange={handleChangeDescription}
        />
      </div>
      <Button onClick={handleCreateProduct} variant="contained">
        Create Product
      </Button>

      <div>
        <Input
          value={searchText}
          placeholder="digite o nome do produto"
          onChange={handleSearch}
        />
      </div>

      <ol>
        {products.map((d) => (
          <li>{d.name}</li>
        ))}
      </ol>
    </>
  );
};

import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { ChangeEvent, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "@mui/material/Button";
import { Product, createProduct, getProducts } from "./model/products";
import { Input } from "@mui/material";

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

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

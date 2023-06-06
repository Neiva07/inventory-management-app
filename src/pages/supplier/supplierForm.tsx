import { ChangeEvent, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Input } from "@mui/material";
import { createSupplier } from "../../model/suppliers";

export const SupplierForm = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleCreateProduct = () => {
    createSupplier({
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

  return (
    <>
      <div>
        <Input
          value={name}
          placeholder="Nome do fornecedor"
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

      {/* <ol>
        {products.map((d) => (
          <li>{d.name}</li>
        ))}
      </ol> */}
    </>
  );
};

import React, { ChangeEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { useAuth } from "context/auth";
import {
  createProductCategories,
  deleteProductCategory,
  getProductCategories,
  ProductCategory,
  updateProductCategory,
} from "../../model/productCategories";
import { SearchField } from "../../components/SearchField";
import { DeleteConfirmationDialog } from "components/DeleteConfirmationDialog";
import { PublicIdDisplay } from "components/PublicIdDisplay";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
} from "components/ui";

function LoadingSkeletonRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((index) => (
        <div key={index} className="rounded-md border p-4">
          <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export const ProductCategories = () => {
  const { user, organization } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [productCategories, setProductCategories] = useState<Array<ProductCategory>>([]);
  const [filteredCategories, setFilteredCategories] = useState<Array<ProductCategory>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleChangeDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(productCategories);
    } else {
      const filtered = productCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, productCategories]);

  useEffect(() => {
    setLoading(true);
    getProductCategories(user.id, "", organization?.id)
      .then((queryResult) => {
        const categories = queryResult.docs.map((r) => r.data() as ProductCategory);
        setProductCategories(categories);
        setFilteredCategories(categories);
      })
      .finally(() => setLoading(false));
  }, [organization?.id, user.id]);

  const handleEditClick = (category: ProductCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
  };

  const handleDeleteClick = (category: ProductCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCategory) {
      try {
        deleteProductCategory(selectedCategory.id);
        toast.success("Categoria excluída com sucesso");
        refreshCategories();
      } catch (err: unknown) {
        console.error(err);
        toast.error("Erro ao excluir categoria");
      }
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
  };

  const submitNewProductCategory = () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para a categoria");
      return;
    }

    try {
      if (editingCategory) {
        updateProductCategory(editingCategory.id, {
          name,
          description,
          userID: user.id,
          organizationId: organization?.id,
        }).catch((err: Error) => {
          console.error(err);
          toast.error("Erro ao atualizar categoria");
        });
        toast.success("Categoria atualizada com sucesso");
      } else {
        createProductCategories({
          name,
          description,
          userID: user.id,
          organizationId: organization?.id,
        }).catch((err: Error) => {
          console.error(err);
          toast.error("Erro ao criar categoria");
        });
        toast.success("Categoria criada com sucesso");
      }
      handleCancelEdit();
      refreshCategories();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Alguma coisa deu errado. Tente novamente mais tarde");
    }
  };

  const refreshCategories = () => {
    setLoading(true);
    getProductCategories(user.id, "", organization?.id)
      .then((queryResult) => {
        const categories = queryResult.docs.map((r) => r.data() as ProductCategory);
        setProductCategories(categories);
        setFilteredCategories(categories);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 py-4 lg:grid-cols-2">
      <Card className="flex min-h-[520px] flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-primary">Categorias Cadastradas</CardTitle>
          <SearchField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar categorias..."
          />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
          <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
            {loading ? (
              <LoadingSkeletonRows />
            ) : filteredCategories.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
              </p>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{category.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {category.description || "Sem descrição"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(category)}
                      aria-label={`Editar categoria ${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                      aria-label={`Excluir categoria ${category.name}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl text-primary">
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </CardTitle>
            {editingCategory?.publicId ? (
              <PublicIdDisplay publicId={editingCategory.publicId} />
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="category-name" className="text-sm font-medium">
              Nome da Categoria
            </label>
            <Input
              id="category-name"
              onChange={handleChangeName}
              value={name}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category-description" className="text-sm font-medium">
              Descrição da Categoria
            </label>
            <Textarea
              id="category-description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {editingCategory ? (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            ) : null}
            <Button onClick={submitNewProductCategory}>
              {editingCategory ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingCategory ? "Atualizar Categoria" : "Criar Categoria"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="categoria"
      />
    </div>
  );
};

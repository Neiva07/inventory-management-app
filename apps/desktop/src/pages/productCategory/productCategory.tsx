import React, { ChangeEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <div key={index} className="flex items-center gap-3 rounded-md border px-3 py-2.5">
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
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

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      try {
        await deleteProductCategory(selectedCategory.id);
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
    <div className="grid gap-6 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Categorias</h1>
          <span className="text-xs text-muted-foreground">
            {loading
              ? ""
              : `${filteredCategories.length}${
                  searchTerm && filteredCategories.length !== productCategories.length
                    ? ` de ${productCategories.length}`
                    : ""
                }`}
          </span>
        </div>

        <SearchField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar categorias..."
        />

        {loading ? (
          <LoadingSkeletonRows />
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
            {searchTerm ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCategories.map((category) => {
              const isEditing = editingCategory?.id === category.id;
              return (
                <li
                  key={category.id}
                  className={`group flex items-center gap-2 rounded-md border px-3 py-2 transition-colors ${
                    isEditing ? "border-primary/50 bg-accent/60" : "hover:bg-accent/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{category.name}</p>
                    {category.description ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditClick(category)}
                      aria-label={`Editar categoria ${category.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteClick(category)}
                      aria-label={`Excluir categoria ${category.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">
                {editingCategory ? "Editar categoria" : "Nova categoria"}
              </CardTitle>
              {editingCategory?.publicId ? (
                <PublicIdDisplay publicId={editingCategory.publicId} />
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1">
              <label htmlFor="category-name" className="text-xs font-medium text-muted-foreground">
                Nome
              </label>
              <Input
                id="category-name"
                onChange={handleChangeName}
                value={name}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="category-description" className="text-xs font-medium text-muted-foreground">
                Descrição
              </label>
              <Textarea
                id="category-description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={submitNewProductCategory} className="flex-1">
                {editingCategory ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCategory ? "Atualizar" : "Criar"}
              </Button>
              {editingCategory ? (
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="categoria"
      />
    </div>
  );
};

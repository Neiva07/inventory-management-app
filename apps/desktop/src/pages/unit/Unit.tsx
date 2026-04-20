import React, { ChangeEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "context/auth";
import { createUnit, deleteUnit, getUnits, Unit, updateUnit } from "../../model/units";
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

export const Units = () => {
  const { user, organization } = useAuth();

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [units, setUnits] = useState<Array<Unit>>([]);
  const [filteredUnits, setFilteredUnits] = useState<Array<Unit>>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
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
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(
        (unit) =>
          unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUnits(filtered);
    }
  }, [searchTerm, units]);

  useEffect(() => {
    setLoading(true);
    getUnits(user.id, "", organization?.id)
      .then((queryResult) => {
        const unitsData = queryResult.docs.map((r) => r.data() as Unit);
        setUnits(unitsData);
        setFilteredUnits(unitsData);
      })
      .finally(() => setLoading(false));
  }, [organization?.id, user.id]);

  const handleEditClick = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setDescription(unit.description || "");
  };

  const handleDeleteClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedUnit) {
      try {
        await deleteUnit(selectedUnit.id);
        toast.success("Unidade excluída com sucesso");
        refreshUnits();
      } catch (err: unknown) {
        console.error(err);
        toast.error("Erro ao excluir unidade");
      }
    }
    setDeleteDialogOpen(false);
    setSelectedUnit(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedUnit(null);
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setName("");
    setDescription("");
  };

  const refreshUnits = () => {
    setLoading(true);
    getUnits(user.id, "", organization?.id)
      .then((queryResult) => {
        const unitsData = queryResult.docs.map((r) => r.data() as Unit);
        setUnits(unitsData);
        setFilteredUnits(unitsData);
      })
      .finally(() => setLoading(false));
  };

  const submitNewUnit = () => {
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para a unidade");
      return;
    }

    try {
      if (editingUnit) {
        updateUnit(editingUnit.id, { name, description, userID: user.id, organizationId: organization?.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error("Erro ao atualizar unidade");
          });
        toast.success("Unidade atualizada com sucesso");
      } else {
        createUnit({ name, description, userID: user.id, organizationId: organization?.id })
          .catch((err: Error) => {
            console.error(err);
            toast.error("Erro ao criar unidade");
          });
        toast.success("Unidade criada com sucesso");
      }
      handleCancelEdit();
      refreshUnits();
    } catch (err: unknown) {
      console.error(err);
      toast.error("Alguma coisa deu errado. Tente novamente mais tarde");
    }
  };

  return (
    <div className="grid gap-6 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Unidades</h1>
          <span className="text-xs text-muted-foreground">
            {loading
              ? ""
              : `${filteredUnits.length}${
                  searchTerm && filteredUnits.length !== units.length
                    ? ` de ${units.length}`
                    : ""
                }`}
          </span>
        </div>

        <SearchField
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar unidades..."
        />

        {loading ? (
          <LoadingSkeletonRows />
        ) : filteredUnits.length === 0 ? (
          <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
            {searchTerm ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUnits.map((unit) => {
              const isEditing = editingUnit?.id === unit.id;
              return (
                <li
                  key={unit.id}
                  className={`group flex items-center gap-2 rounded-md border px-3 py-2 transition-colors ${
                    isEditing ? "border-primary/50 bg-accent/60" : "hover:bg-accent/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{unit.name}</p>
                    {unit.description ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {unit.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditClick(unit)}
                      aria-label={`Editar unidade ${unit.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteClick(unit)}
                      aria-label={`Excluir unidade ${unit.name}`}
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
                {editingUnit ? "Editar unidade" : "Nova unidade"}
              </CardTitle>
              {editingUnit?.publicId ? <PublicIdDisplay publicId={editingUnit.publicId} recordType="unidade" /> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1">
              <label htmlFor="unit-name" className="text-xs font-medium text-muted-foreground">
                Nome
              </label>
              <Input id="unit-name" onChange={handleChangeName} value={name} required />
            </div>

            <div className="space-y-1">
              <label htmlFor="unit-description" className="text-xs font-medium text-muted-foreground">
                Descrição
              </label>
              <Textarea
                id="unit-description"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={submitNewUnit} className="flex-1">
                {editingUnit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingUnit ? "Atualizar" : "Criar"}
              </Button>
              {editingUnit ? (
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
        resourceName="unidade"
      />
    </div>
  );
};

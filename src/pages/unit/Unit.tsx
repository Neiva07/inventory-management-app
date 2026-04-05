import React, { ChangeEvent, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

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

  const handleConfirmDelete = () => {
    if (selectedUnit) {
      try {
        deleteUnit(selectedUnit.id);
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
    <div className="mx-auto grid max-w-6xl gap-6 py-4 lg:grid-cols-2">
      <Card className="flex min-h-[520px] flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-primary">Unidades Cadastradas</CardTitle>
          <SearchField
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar unidades..."
          />
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
          <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
            {loading ? (
              <LoadingSkeletonRows />
            ) : filteredUnits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {searchTerm ? "Nenhuma unidade encontrada" : "Nenhuma unidade cadastrada"}
              </p>
            ) : (
              filteredUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{unit.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {unit.description || "Sem descrição"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(unit)}
                      aria-label={`Editar unidade ${unit.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(unit)}
                      aria-label={`Excluir unidade ${unit.name}`}
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
              {editingUnit ? "Editar Unidade" : "Nova Unidade"}
            </CardTitle>
            {editingUnit?.publicId ? <PublicIdDisplay publicId={editingUnit.publicId} /> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-1">
            <label htmlFor="unit-name" className="text-sm font-medium">
              Nome da Unidade
            </label>
            <Input id="unit-name" onChange={handleChangeName} value={name} required />
          </div>

          <div className="space-y-1">
            <label htmlFor="unit-description" className="text-sm font-medium">
              Descrição da Unidade
            </label>
            <Textarea
              id="unit-description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {editingUnit ? (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            ) : null}
            <Button onClick={submitNewUnit}>
              {editingUnit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingUnit ? "Atualizar Unidade" : "Criar Unidade"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        resourceName="unidade"
      />
    </div>
  );
};

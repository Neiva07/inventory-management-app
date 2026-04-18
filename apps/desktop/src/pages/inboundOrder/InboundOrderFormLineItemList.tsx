import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "components/ui";
import { CustomDataTable } from "components/CustomDataTable";
import { ColumnDefinition } from "components/CustomDataTable/types";
import { DeleteConfirmationDialog } from "components/DeleteConfirmationDialog";
import {
  InboundOrderFormDataInterface,
  InboundOrderItemDataInterface,
} from "./useInboundOrderForm";

export const InboundOrderFormLineItemList = ({
  deleteLineItemFromForm,
}: {
  deleteLineItemFromForm: (item: InboundOrderItemDataInterface) => void;
}) => {
  const formMethods = useFormContext<InboundOrderFormDataInterface>();

  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InboundOrderItemDataInterface | null>(
    null
  );
  const items = formMethods.watch("items");

  const handleGetRowID = (row: InboundOrderItemDataInterface) => {
    return `${row.productID}-${row.variant.unit.id}`;
  };

  const handleDeleteItem = (item: InboundOrderItemDataInterface) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    deleteLineItemFromForm(itemToDelete);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(items.length / pageSize) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [items.length, page, pageSize]);

  const pagedItems = useMemo(() => {
    const start = page * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const columns: ColumnDefinition<InboundOrderItemDataInterface>[] = [
    {
      field: "title",
      headerName: "Produto",
      flex: 1,
      sortable: false,
    },
    {
      field: "balance",
      headerName: "Saldo Estoque",
      flex: 1,
      sortable: false,
    },
    {
      field: "quantity",
      headerName: "Quantidade",
      flex: 1,
      sortable: false,
    },
    {
      field: "unit",
      headerName: "Unidade",
      flex: 1,
      sortable: false,
      valueGetter: (row) => row.variant.unit.name,
    },
    {
      field: "unitCost",
      headerName: "Custo Compra",
      flex: 1,
      sortable: false,
    },
    {
      field: "itemTotalCost",
      headerName: "Total do Item",
      flex: 1,
      sortable: false,
    },
    {
      headerName: "Remover",
      field: "delete",
      width: 110,
      renderCell: (_value, row) => {
        return (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remover item ${row.title}`}
            onClick={(event) => {
              event.stopPropagation();
              handleDeleteItem(row);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mt-5 min-h-[400px]">
          <CustomDataTable
            data={pagedItems}
            columns={columns}
            totalCount={items.length}
            loading={false}
            page={page}
            pageSize={pageSize}
            pageSizeOptions={[10, 20]}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(0);
            }}
            getRowId={handleGetRowID}
            rowHeight={48}
            maxHeight={600}
            emptyMessage="Nenhum item adicionado"
          />
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        resourceName={`item "${itemToDelete?.title}"`}
      />
    </div>
  );
};

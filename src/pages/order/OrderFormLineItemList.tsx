import { Button, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { DataGrid, GridCellParams, GridColDef, GridDeleteIcon, GridRowIdGetter } from "@mui/x-data-grid"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm"

export const OrderFormLineItemList = () => {
  const formMethods = useFormContext<OrderFormDataInterface>();

  const [pageSize, setPageSize] = useState<number>(10);
  const items = formMethods.watch("items");

  const handleGetRowID: GridRowIdGetter<ItemDataInterface> = (row) => {
    return row.productID;
  }
  const columns: GridColDef[] = [
    {
      field: 'title', headerName: 'Produto', width: 120, sortable: false,
    },
    {
      field: 'balance',
      headerName: 'Saldo Estoque',
      type: 'number',
      width: 120,
      sortable: false,
    },
    {
      field: 'quantity',
      headerName: 'Quantidade',
      type: 'string',
      width: 100,
      sortable: false,
    },
    {
      field: 'unit',
      headerName: 'Unidade',
      type: 'number',
      width: 100,
      valueGetter: (params: GridCellParams<ItemDataInterface>) => {
        return params.row.unit.name
      },
      sortable: false,
    },

    {
      field: 'cost',
      headerName: 'Custo Compra',
      type: 'number',
      sortable: false,
      width: 120,
    },
    {
      field: 'unitPrice',
      headerName: 'Preço Venda',
      sortable: false,
      width: 120,
    },
    {
      field: 'descount',
      headerName: 'Desconto (%)',
      type: 'string',
      width: 120,
      sortable: false,
    },
    {
      field: 'commissionRate',
      headerName: 'Comissão (%)',
      type: 'number',
      width: 140,
      sortable: false,
    },
    {
      field: 'itemTotalCost',
      headerName: 'Total do Produto',
      type: 'number',
      width: 140,
      sortable: false,
    },
    {
      headerName: 'Remover',
      field: 'delete',
      renderCell: (cell: GridCellParams<ItemDataInterface>) => {

        return <Button onClick={() => {
          formMethods.setValue('items', items.filter(i => i.productID !== cell.row.productID))
          const prevTotalCost = formMethods.getValues('totalCost')
          const prevTotalCommission = formMethods.getValues('totalComission')
          formMethods.setValue('totalCost', prevTotalCost - cell.row.itemTotalCost)
          formMethods.setValue('totalComission', prevTotalCommission - (cell.row.commissionRate * cell.row.itemTotalCost) / 100)
        }}> <GridDeleteIcon /> </Button>;

      },
    }
  ];
  return <Box>
    <Grid container spacing={2}>
      <Grid xs={12} item marginTop="20px" style={{ minHeight: 400 }}>
        <DataGrid
          rows={items}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize },
            },
          }}
          pageSizeOptions={[10, 20]}
          getRowId={handleGetRowID}
          pagination
          onPaginationModelChange={v => setPageSize(v.pageSize)}
          hideFooterSelectedRowCount
          paginationMode="client"
          disableColumnMenu
          disableRowSelectionOnClick
        />
      </Grid>
    </Grid>
  </Box>
}

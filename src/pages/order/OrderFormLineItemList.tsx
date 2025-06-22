import { Button, Grid } from "@mui/material"
import { Box } from "@mui/system"
import { DataGrid, GridCellParams, GridColDef, GridDeleteIcon, GridRowIdGetter } from "@mui/x-data-grid"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm"
import { add, divide, integerDivide, multiply, subtract } from "lib/math"
import { Product } from "model/products"

export const OrderFormLineItemList = ({ calculateBaseUnitInventory }: { calculateBaseUnitInventory: (product: Product) => number }) => {
  const formMethods = useFormContext<OrderFormDataInterface>();

  const [pageSize, setPageSize] = useState<number>(10);
  const items = formMethods.watch("items");

  const handleGetRowID: GridRowIdGetter<ItemDataInterface> = (row) => {
    return `${row.productID}-${row.variant.unit.id}`;
  }
  const columns: GridColDef[] = [
    {
      field: 'title', headerName: 'Produto', flex: 1, sortable: false,
    },
    {
      field: 'balance',
      headerName: 'Saldo Estoque',
      type: 'number',
      flex: 1,
      sortable: false,
    },
    {
      field: 'quantity',
      headerName: 'Quantidade',
      type: 'string',
      flex: 1,
      sortable: false,
    },
    {
      field: 'unit',
      headerName: 'Unidade',
      type: 'number',
      flex: 1,
      valueGetter: (params: GridCellParams<ItemDataInterface>) => {
        return params.row.variant.unit.name
      },
      sortable: false,
    },
    {
      field: 'cost',
      headerName: 'Custo Compra',
      type: 'number',
      sortable: false,
      flex: 1,
    },
    {
      field: 'unitPrice',
      headerName: 'Preço Venda',
      sortable: false,
      flex: 1,
    },
    {
      field: 'descount',
      headerName: 'Desconto (%)',
      type: 'string',
      flex: 1,
      sortable: false,
    },
    {
      field: 'commissionRate',
      headerName: 'Comissão (%)',
      type: 'number',
      flex: 1,
      sortable: false,
    },
    {
      field: 'itemTotalCost',
      headerName: 'Total do Produto',
      type: 'number',
      flex: 1,
      sortable: false,
    },
    {
      headerName: 'Remover',
      field: 'delete',
      flex: 1,
      renderCell: (cell: GridCellParams<ItemDataInterface>) => {
        return <Button onClick={() => {
          const filteredItems = items.filter(i => !(i.productID === cell.row.productID && i.variant.unit.id === cell.row.variant.unit.id))
          const balanceToAdd = multiply(cell.row.variant.conversionRate, cell.row.quantity)
          formMethods.setValue('items', filteredItems.map(item => {
            if(item.productID === cell.row.productID) {
            return {
              ...item,
              balance: add(item.balance, integerDivide(balanceToAdd, item.variant.conversionRate))
            }
          }
          return item
          }))
          const prevTotalCost = formMethods.getValues('totalCost')
          const prevTotalCommission = formMethods.getValues('totalComission')
          formMethods.setValue('totalCost', subtract(prevTotalCost, cell.row.itemTotalCost))
          formMethods.setValue('totalComission', subtract(prevTotalCommission, divide(multiply(cell.row.commissionRate, cell.row.itemTotalCost), 100)))
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

import { Grid } from "@mui/material"
import { Box } from "@mui/system"
import { DataGrid, GridCellParams, GridColDef, GridRowIdGetter, GridRowSelectionModel, GridValidRowModel } from "@mui/x-data-grid"
import { Order } from "model/orders"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { ItemDataInterface, OrderFormDataInterface } from "./useOrderForm"


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
  }

];

export const OrderFormLineItemList = () => {

  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowIDs, setSelectedRowIDs] = useState<Array<number>>([]);


  const formMethods = useFormContext<OrderFormDataInterface>();

  const items = formMethods.watch("items");
  // const handleRowSelection = (rowSelection: GridRowSelectionModel) => {
  //
  //     if (rowSelection && rowSelection[0]) {
  //       const id = String(rowSelection[0])
  //       if (id === selectedRowID) {
  //         setSelectedRowID(null);
  //       } else {
  //         setSelectedRowID(id);
  //       }
  //     }
  //   }
  //
  //
  const handleGetRowID: GridRowIdGetter<ItemDataInterface> = (row) => {
    return row.productID;
  }
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
          // onRowSelectionModelChange={handleRowSelection}
          onPaginationModelChange={v => setPageSize(v.pageSize)}
          hideFooterSelectedRowCount
          rowSelectionModel={selectedRowIDs}
          paginationMode="client"
          disableColumnMenu
        // local text is the prop in which defines the text to translate
        // localetext={}
        // checkboxSelection
        />
      </Grid>
    </Grid>
  </Box>
}

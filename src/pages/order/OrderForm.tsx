import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { FormProvider } from "react-hook-form"
import { useParams } from "react-router-dom";
import { OrderFormHeader } from "./OrderFormHeader";
import { OrderFormLineItemForm } from "./OrderFormLineItemForm";
import { OrderFormLineItemList } from "./OrderFormLineItemList";
import { useOrderForm } from "./useOrderForm";

export const OrderForm = () => {
  const { orderID } = useParams();
  const { register, onFormSubmit, onDelete, ...formMethods } = useOrderForm(orderID);

  return (
    <FormProvider register={register} {...formMethods}>
      <OrderFormHeader />
      <Box style={{ marginTop: 40 }}>
        <OrderFormLineItemForm />
      </Box>

      <Box style={{ marginTop: 40 }}>
        <OrderFormLineItemList />
      </Box>
      <Button variant="outlined" onClick={onFormSubmit} style={{ marginTop: 20 }}>Fechar Nota</Button>
    </FormProvider>
  )

}

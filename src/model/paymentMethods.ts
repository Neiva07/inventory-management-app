export interface PaymentMethod {
  id: string;
  label: string;
}

export const paymentMethods = [
  { id: "dinheiro", label: "Dinheiro" },
  { id: "cartao_debito", label: "Cartão de Débito" },
  { id: "cartao_credito", label: "Cartão de Crédito" },
  { id: "pix", label: "Pix" },
  { id: "prazo", label: "Prazo (Fiado/A prazo)" },
  { id: "cheque", label: "Cheque" },
  { id: "boleto", label: "Boleto Bancário" },
  { id: "transferencia", label: "Transferência Bancária" }
] as Array<PaymentMethod>

export const paymentMethodById = new Map([
  ["dinheiro", "Dinheiro"],
  ["cartao_debito", "Cartão de Débito"],
  ["cartao_credito", "Cartão de Crédito"],
  ["pix", "Pix"],
  ["prazo", "Prazo (Fiado/A prazo)"],
  ["cheque", "Cheque"],
  ["boleto", "Boleto Bancário"],
  ["transferencia", "Transferência Bancária"]
]) 
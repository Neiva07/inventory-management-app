export interface CrudRepository<TEntity, TCreate, TUpdate = Partial<TEntity>> {
  list(args?: Record<string, unknown>): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | null>;
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

export interface ProductsRepository extends CrudRepository<unknown, unknown> {
  adjustInventory(productId: string, deltaBaseUnit: number): Promise<void>;
}

export interface OrdersRepository extends CrudRepository<unknown, unknown> {
  getByPublicId(publicId: string): Promise<unknown | null>;
}

export interface InboundOrdersRepository extends CrudRepository<unknown, unknown> {
  getByPublicId(publicId: string): Promise<unknown | null>;
}

export interface SupplierBillsRepository extends CrudRepository<unknown, unknown> {}

export interface InstallmentPaymentsRepository extends CrudRepository<unknown, unknown> {
  markAsPaid(
    id: string,
    args: {
      paidAmountCents: number;
      paidDate: number;
      paymentMethodId?: string;
      paymentMethodLabel?: string;
    }
  ): Promise<void>;
}

export interface ReferenceRepositories {
  units: CrudRepository<unknown, unknown>;
  productCategories: CrudRepository<unknown, unknown>;
  customers: CrudRepository<unknown, unknown>;
  suppliers: CrudRepository<unknown, unknown>;
  products: ProductsRepository;
}

export interface TransactionalRepositories {
  orders: OrdersRepository;
  inboundOrders: InboundOrdersRepository;
  supplierBills: SupplierBillsRepository;
  installmentPayments: InstallmentPaymentsRepository;
}

export interface IdentityRepositories {
  organizations: CrudRepository<unknown, unknown>;
  userMemberships: CrudRepository<unknown, unknown>;
  invitationCodes: CrudRepository<unknown, unknown>;
  joinRequests: CrudRepository<unknown, unknown>;
  onboardingSessions: CrudRepository<unknown, unknown>;
  appSettings: CrudRepository<unknown, unknown>;
}

export interface RepositoryRegistry {
  reference: ReferenceRepositories;
  transactional: TransactionalRepositories;
  identity: IdentityRepositories;
}


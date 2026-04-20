import * as ReactDOM from "react-dom/client";
import {
  Outlet,
  Route,
  Navigate,
  Routes,
  HashRouter as Router,
} from "react-router-dom";
import React from "react";
import { Navbar } from "./pages/routes/navbar";
import { ProductForm } from "./pages/product/productForm";
import { SupplierForm } from "./pages/supplier/supplierForm";
import { ProductCategories } from "./pages/productCategory/productCategory";
import { Units } from "./pages/unit/Unit";
import { ProductList } from "./pages/product/ProductList";
import { SupplierList } from "./pages/supplier/supplierList";
import { CustomerForm } from "./pages/customer/customerForm";
import { CustomerList } from "./pages/customer/customersList";
import { Toaster } from "sonner";
import { AuthContextProvider, useAuth } from "./context/auth";
import { OnboardingProvider } from "./context/onboarding";
import { Login } from "pages/auth/Login";
import { OrderForm } from "pages/order/OrderForm";
import { OrderList } from "pages/order/OrderList";
import { Home } from "home";
import { UpdateNotification } from './components/UpdateNotification';
import { SettingsRouter } from "pages/routes/settings/index";
import { UIContextProvider, useUI } from './context/ui';
import { Sidebar } from './pages/routes/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InboundOrderForm } from "pages/inboundOrder/InboundOrderForm";
import { InboundOrderList } from "pages/inboundOrder/InboundOrderList";
import { SupplierBillList } from "pages/supplierBill/SupplierBillList";
import { SupplierBillDetail } from "pages/supplierBill/SupplierBillDetail";
import { InstallmentPaymentList } from "pages/installmentPayment/InstallmentPaymentList";
import { InstallmentPaymentDetail } from "pages/installmentPayment/InstallmentPaymentDetail";
import { useOverdueCheck } from "./lib/overdueCheck";
import { useGlobalKeyboardShortcuts } from "./hooks/useGlobalKeyboardShortcuts";
import { GlobalKeyboardHelp } from "./components/GlobalKeyboardHelp";
import { OnboardingRouter } from "./pages/onboarding/OnboardingRouter";
import { bootstrapDatabase } from "./db/bootstrap";
import { startSyncRuntime, stopSyncRuntime } from "./db/syncRuntime";
import { ShortcutHintsProvider } from "./context/shortcutHints";

const initialOverdueChecksStarted = new Set<string>();

const App = () => {
  const { user, organization } = useAuth();
  const { layout } = useUI();
  const { checkOverdue } = useOverdueCheck();
  const [showGlobalHelp, setShowGlobalHelp] = React.useState(false);
  const [databaseReady, setDatabaseReady] = React.useState(true);

  React.useEffect(() => {
    startSyncRuntime();
    return () => {
      stopSyncRuntime();
    };
  }, []);
  
  // Check for overdue installments when app loads
  React.useEffect(() => {
    if (!databaseReady || !user?.id) {
      return;
    }

    const scopeKey = `${user.id}:${organization?.id ?? ""}`;
    if (initialOverdueChecksStarted.has(scopeKey)) {
      return;
    }

    initialOverdueChecksStarted.add(scopeKey);
    void checkOverdue();
  }, [checkOverdue, databaseReady, organization?.id, user?.id]);

  // Set up global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onShowGlobalHelp: () => setShowGlobalHelp(true),
  });
  
  return (
    <div className="flex min-h-screen">
      <OfflineIndicator />
      {user && (layout === 'navbar' ? <Navbar /> : <Sidebar />)}
      <main
        className="flex max-w-full flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 sm:py-4"
        style={{ marginTop: user && layout === "navbar" ? 60 : 0, transition: "margin 0.2s" }}
      >
        <Toaster
          position="bottom-right"
          duration={5000}
          richColors
          closeButton
        />
        <UpdateNotification />
        <Outlet />
        
        {/* Global Keyboard Help Modal */}
        <GlobalKeyboardHelp
          open={showGlobalHelp}
          onClose={() => setShowGlobalHelp(false)}
        />
      </main>
    </div>
  );
};

function PrivateRoute() {
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/login" />
  }
  return <Outlet />
}

const AppRouter = () => {
  return <>
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/" element={<App />}
        >
          <Route path="login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Home />} />

            <Route path="products/:productID" element={<ProductForm />} />
            <Route path="orders/create" element={<OrderForm />} />
            <Route path="orders/:orderID" element={<OrderForm />} />
            <Route path="products/create" element={<ProductForm />} />

            <Route path="inbound-orders/:inboundOrderID" element={<InboundOrderForm />} />
            <Route path="inbound-orders/create" element={<InboundOrderForm />} />
            <Route path="inbound-orders" element={<InboundOrderList />} />

            <Route path="supplier-bills/:supplierBillID" element={<SupplierBillDetail />} />
            <Route path="supplier-bills" element={<SupplierBillList />} />

            <Route path="installment-payments/:installmentPaymentID" element={<InstallmentPaymentDetail />} />
            <Route path="installment-payments" element={<InstallmentPaymentList />} />

            <Route path="suppliers/:supplierID" element={<SupplierForm />} />
            <Route path="suppliers/create" element={<SupplierForm />} />

            <Route path="customers/:customerID" element={<CustomerForm />} />
            <Route path="customers/create" element={<CustomerForm />} />


            <Route path="productCategories" element={<ProductCategories />} />
            <Route path="units" element={<Units />} />

            <Route path="products" element={<ProductList />} />
            <Route path="suppliers" element={<SupplierList />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="orders" element={<OrderList />} />

            <Route path="settings" element={<SettingsRouter />} />

            <Route path="*" element={<p>Página não encontrada! 404!</p>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  </>
}

function render() {
  // Create a root container if it doesn't exist
  let rootContainer = document.getElementById('root');
  if (!rootContainer) {
    rootContainer = document.createElement('div');
    rootContainer.id = 'root';
    document.body.appendChild(rootContainer);
  }

  const root = ReactDOM.createRoot(rootContainer);
  root.render(
    <React.StrictMode>
      <AuthContextProvider>
        <UIContextProvider>
          <ShortcutHintsProvider>
            <OnboardingProvider>
              <OnboardingRouter>
                <AppRouter />
              </OnboardingRouter>
            </OnboardingProvider>
          </ShortcutHintsProvider>
        </UIContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  );
}

bootstrapDatabase()
  .then(() => render())
  .catch((error) => {
    console.error("Failed to bootstrap database:", error);
    render();
  });

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  CalendarDays,
  Camera,
  CircleCheck,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Coins,
  Database,
  Eye,
  FileText,
  Gauge,
  HandCoins,
  HelpCircle,
  History,
  Info as InfoLucide,
  LayoutGrid,
  Mail,
  MapPin,
  LogIn,
  LogOut,
  Menu,
  PanelLeftClose,
  Package,
  Pencil,
  Phone as PhoneLucide,
  Receipt as ReceiptLucide,
  Scale,
  Search as SearchLucide,
  Settings as SettingsLucide,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TriangleAlert,
  TrendingUp as TrendingUpLucide,
  Upload as UploadLucide,
  User,
  Users,
  Wallet,
  CreditCard,
  Plus,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import { cn } from "lib/utils";

type IconCompatProps = React.SVGProps<SVGSVGElement> & {
  fontSize?: "small" | "medium" | "large";
  sx?: Record<string, unknown>;
};

function sizeClass(fontSize?: IconCompatProps["fontSize"]) {
  if (fontSize === "small") return "h-4 w-4";
  if (fontSize === "large") return "h-6 w-6";
  return "h-5 w-5";
}

function resolveColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  switch (value) {
    case "primary":
    case "primary.main":
      return "var(--color-primary)";
    case "secondary.main":
      return "hsl(var(--secondary-foreground))";
    case "success.main":
      return "#059669";
    case "warning.main":
      return "#d97706";
    case "error.main":
      return "#dc2626";
    case "info.main":
      return "#2563eb";
    case "text.secondary":
      return "hsl(var(--muted-foreground))";
    default:
      return value;
  }
}

function sxToStyle(sx?: Record<string, unknown>): React.CSSProperties | undefined {
  if (!sx) return undefined;
  const style: React.CSSProperties = {};
  if (typeof sx.fontSize === "number") {
    style.width = sx.fontSize;
    style.height = sx.fontSize;
  } else if (typeof sx.fontSize === "string") {
    style.width = sx.fontSize;
    style.height = sx.fontSize;
  }
  if (sx.color !== undefined) style.color = resolveColor(sx.color);
  if (typeof sx.mt === "number") style.marginTop = `${sx.mt * 8}px`;
  if (typeof sx.mb === "number") style.marginBottom = `${sx.mb * 8}px`;
  if (typeof sx.ml === "number") style.marginLeft = `${sx.ml * 8}px`;
  if (typeof sx.mr === "number") style.marginRight = `${sx.mr * 8}px`;
  if (typeof sx.mx === "number") {
    style.marginInline = `${sx.mx * 8}px`;
  }
  if (typeof sx.my === "number") {
    style.marginBlock = `${sx.my * 8}px`;
  }
  return style;
}

function makeIcon(Icon: LucideIcon) {
  return function CompatIcon({ fontSize, className, sx, style, ...props }: IconCompatProps) {
    return (
      <Icon
        className={cn(sizeClass(fontSize), className)}
        style={{ ...sxToStyle(sx), ...style }}
        {...props}
      />
    );
  };
}

export const AddIcon = makeIcon(Plus);
export const SearchIcon = makeIcon(SearchLucide);
export const HelpIcon = makeIcon(HelpCircle);
export const MenuIcon = makeIcon(Menu);
export const InventoryIcon = makeIcon(LayoutGrid);
export const PeopleIcon = makeIcon(Users);
export const ShoppingCartIcon = makeIcon(ShoppingCart);
export const CategoryIcon = makeIcon(LayoutGrid);
export const ScaleIcon = makeIcon(Scale);
export const LogoutIcon = makeIcon(LogOut);
export const LoginIcon = makeIcon(LogIn);
export const SettingsIcon = makeIcon(SettingsLucide);
export const AccountBalanceIcon = makeIcon(Building2);
export const PaymentIcon = makeIcon(CreditCard);
export const MenuOpenIcon = makeIcon(PanelLeftClose);
export const ExpandLess = makeIcon(ChevronUp);
export const ExpandMore = makeIcon(ChevronDown);
export const AssignmentIcon = makeIcon(FileText);
export const ReceiptIcon = makeIcon(ReceiptLucide);
export const AccountBalanceWalletIcon = makeIcon(Wallet);
export const PaidIcon = makeIcon(HandCoins);
export const MoneyOffIcon = makeIcon(Coins);
export const TrendingUpIcon = makeIcon(TrendingUpLucide);
export const CalendarTodayIcon = makeIcon(CalendarDays);
export const HistoryIcon = makeIcon(History);
export const SwapHorizIcon = makeIcon(ArrowLeftRight);
export const TuneIcon = makeIcon(SlidersHorizontal);
export const BusinessIcon = makeIcon(Building2);
export const PersonIcon = makeIcon(User);
export const PhotoCameraIcon = makeIcon(Camera);
export const SaveIcon = makeIcon(Save);
export const EditIcon = makeIcon(Pencil);
export const OpenInNewIcon = makeIcon(ExternalLink);
export const ContentCopyIcon = makeIcon(ClipboardCopy);
export const CheckIcon = makeIcon(Check);
export const ArrowBack = makeIcon(ArrowLeft);
export const Payment = makeIcon(CreditCard);

// MUI-style named exports to support mechanical import-path swaps.
export const Add = AddIcon;
export const Business = BusinessIcon;
export const Group = makeIcon(Users);
export const People = makeIcon(Users);
export const Person = PersonIcon;
export const Visibility = makeIcon(Eye);
export const Email = makeIcon(Mail);
export const Close = makeIcon(X);
export const CheckCircle = makeIcon(CircleCheck);
export const DataObject = makeIcon(Database);
export const LocationOn = makeIcon(MapPin);
export const Warning = makeIcon(TriangleAlert);
export const Security = makeIcon(ShieldCheck);
export const Speed = makeIcon(Gauge);
export const Inventory = makeIcon(Package);
export const Category = CategoryIcon;
export { SearchIcon as Search };
export { SettingsIcon as Settings };
export { TrendingUpIcon as TrendingUp };
export { ReceiptIcon as Receipt };
export const Phone = makeIcon(PhoneLucide);
export const Info = makeIcon(InfoLucide);
export const Upload = makeIcon(UploadLucide);

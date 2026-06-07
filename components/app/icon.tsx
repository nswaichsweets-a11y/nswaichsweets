import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarCheck,
  ChevronRight,
  ContactRound,
  CreditCard,
  Database,
  Download,
  FileText,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Milk,
  Package,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const icons = {
  dashboard: LayoutDashboard,
  settings: Settings,
  users: Users,
  package: Package,
  receipt: ReceiptText,
  printer: Printer,
  contact: ContactRound,
  book: BookOpenCheck,
  warehouse: Warehouse,
  milk: Milk,
  truck: Truck,
  "id-card": IdCard,
  "calendar-check": CalendarCheck,
  wallet: Wallet,
  "credit-card": CreditCard,
  chart: BarChart3,
  shield: ShieldCheck,
  database: Database,
  search: Search,
  plus: Plus,
  file: FileText,
  download: Download,
  menu: Menu,
  message: MessageCircle,
  logout: LogOut,
  bell: Bell,
  chevron: ChevronRight
};

export type IconName = keyof typeof icons;

export function AppIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as IconName] ?? FileText;
  return <Icon aria-hidden="true" className={cn("h-4 w-4", className)} />;
}

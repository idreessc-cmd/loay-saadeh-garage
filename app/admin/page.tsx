import { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "لوحة تحكم الموقع - مركز لؤي سعادة",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}

// app/page.js
import Header from "@/app/_components/Header";
import Sidebar from "@/app/_components/Sidebar";
import { AppProvider } from "@/app/_components/AppContext";

export default function Home() {
  return (
    <AppProvider>
      <Header />
      <Sidebar />
    </AppProvider>
  );
}
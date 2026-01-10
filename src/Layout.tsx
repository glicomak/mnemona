import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

function Layout() {
  return (
    <div className="w-[60%] m-auto">
      <Navbar />
      <main className="pb-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

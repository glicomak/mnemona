import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="w-full border-b border-neutral-200">
      <div className="py-4 flex items-center justify-between">
        <span className="text-xl font-medium tracking-wider">
          MNEMONA
        </span>

        <nav className="flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-black"
                : "text-neutral-500 hover:text-black transition"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive
                ? "text-black"
                : "text-neutral-500 hover:text-black transition"
            }
          >
            Courses
          </NavLink>

          <NavLink
            to="/generate"
            className={({ isActive }) =>
              isActive
                ? "text-black"
                : "text-neutral-500 hover:text-black transition"
            }
          >
            Generate
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;

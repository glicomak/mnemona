import { Route, Routes } from "react-router-dom";

import Layout from "./layout";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;

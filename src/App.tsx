import { Route, Routes } from "react-router-dom";

import Layout from "./layout";
import Course from "./pages/Course";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<Course />} />
        <Route path="/generate" element={<Generate />} />
      </Route>
    </Routes>
  );
}

export default App;

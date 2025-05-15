import React from "react";
import { HashRouter as Router } from "react-router-dom";
import MainLayout from "./components/MainLayout"; // ✅ Correct import
import "./App.css";

const App = () => {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
};

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Chatbot from "./pages/chatbot";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chatbot />} />
      </Routes>
    </Router>
  );
};

export default App;

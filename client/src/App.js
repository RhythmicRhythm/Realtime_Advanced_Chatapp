import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import SetAvatar from "./components/SetAvatar";

 function App() {
    return (
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Chat />} /> 
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
           <Route path="/setAvatar" element={<SetAvatar />} />
        </Routes>
      </BrowserRouter>
    );
  }

export default App;

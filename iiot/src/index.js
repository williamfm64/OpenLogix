import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './components/settings/auth';
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';


import Home from './components/pages/home.js'
import Create from './components/pages/create.js'
import Topbar from "./components/layout/header";
import Sidebar from "./components/layout/sidebar";
import Login from "./components/pages/login";
import Cadastro from "./components/pages/cadastro";
import Edit from "./components/pages/edit";
import Configs from "./components/pages/configs";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <AuthProvider>
    <Topbar />
    <Sidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:screen" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create/:screen" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/edit/:screen/:id" element={<Edit/>} />
        <Route path="/configs" element={<Configs/>} />
      </Routes>
  </AuthProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

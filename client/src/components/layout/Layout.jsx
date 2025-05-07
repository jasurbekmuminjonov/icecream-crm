import React, { useState } from "react";
import "./Layout.css";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import { Route, Routes } from "react-router-dom";
import Distributors from "../../pages/Distributors";
import ProductTypes from "../../pages/ProductTypes";
import Products from "../../pages/Products";
import Clients from "../../pages/Clients";
import Sale from "../../pages/Sale";
import SaleHistory from "../../pages/SaleHistory";
import Debtors from "../../pages/Debtors";
import DistributorRole from "../../pages/DistributorRole";
import AdminRole from "../../pages/AdminRole";
import { Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

function Layout() {
  const role = localStorage.getItem("role");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="layout">
      {/* Overlay + Sidebar */}
      <div
        className={`mobile-sidebar-overlay ${sidebarVisible ? "show" : ""}`}
        onClick={() => setSidebarVisible(false)}
      />
      <div
        className={`layout_left mobile-sidebar ${sidebarVisible ? "show" : ""}`}
      >
        <Sidebar  />
        <button
          className="close-sidebar"
          onClick={() => setSidebarVisible(false)}
        >
          ✕
        </button>
      </div>

      <div className="layout_right">
        {/* Mobile menu toggle */}
        <div className="mobile-header-toggle">
          <Button
            icon={<MenuOutlined />}
            onClick={() => setSidebarVisible(true)}
          />
        </div>

        <Header />
        <main className="main-content">
          {role === "manager" ? (
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/distributors" element={<Distributors />} />
              <Route path="/product-types" element={<ProductTypes />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/sale" element={<Sale />} />
              <Route path="/sale-history" element={<SaleHistory />} />
              <Route path="/debt" element={<Debtors />} />
            </Routes>
          ) : role === "distributor" ? (
            <Routes>
              <Route path="/" element={<DistributorRole />} />
              <Route path="/order" element={<Sale />} />
              <Route path="/clients" element={<Clients />} />
            </Routes>
          ) : role === "admin" ? (
            <Routes>
              <Route path="/" element={<AdminRole />} />
            </Routes>
          ) : (
            <p>Rol xato</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Layout;

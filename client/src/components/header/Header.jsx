import React from "react";
import "./Header.css";

function Header() {
  const adminFullname = localStorage.getItem("fullname");
  const Role = localStorage.getItem("role");
  const roles = {
    admin: "Admin",
    manager: "Ish boshqaruvchi",
    distributor: "Agent",
  }

  return (
    <header>
      <h4>Ism: {adminFullname} Rol: {roles[Role]}</h4>
    </header>
  );
}

export default Header;

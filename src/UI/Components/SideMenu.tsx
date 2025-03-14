import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
export const SwitchSave = ({ index }) => {
  return (
    <Link
      aria-label={`Switch_Save_${index}`}
      class="block px-4 py-2 text-sm text-gray-700"
      tabindex="-1"
      to="/"
    >
      Switch Save
    </Link>
  );
};

export const SideMenuDropdown = () => {
  return (
    <div id="side-menu-dropdown">
      <div
        class="rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="menu-button"
        tabindex="-1"
      >
        <SwitchSave index={0} />
      </div>
    </div>
  );
};

export const SideMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const handleClick = () => setShowMenu((show) => !show);
  return (
    <div id="side-menu">
      <button aria-label="control-side-menu" onClick={handleClick}>
        Options
      </button>
      {showMenu && <SideMenuDropdown />}
    </div>
  );
};

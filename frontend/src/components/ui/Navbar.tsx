"use client";

import React, { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import {
  FileText,
  Bell,
  Menu as MenuIcon,
  User,
  LogOut,
  HelpCircle,
  Settings,
  Home,
  Mic,
  Users,
} from "lucide-react";

const navItems = [
  { name: "Home", icon: <Home size={18} />, path: "/profile" },
  { name: "Biographies", icon: <FileText size={18} />, path: "/biography" },
  { name: "Recordings", icon: <Mic size={18} />, path: "/recordings" },
  { name: "Document Library", icon: <FileText size={18} />, path: "/library" },
  { name: "Editor Review", icon: <Users size={18} />, path: "/review" },
  { name: "Notifications", icon: <Bell size={18} />, path: "/notifications" },
];

const Navbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Mobile Hamburger Icon */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <MenuIcon size={24} />
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex justify-center gap-4 flex-1">
          {navItems.map((item, idx) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              key={idx}
              onClick={() => router.push(item.path)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 rounded-md transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Profile Dropdown */}
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center items-center w-full rounded-full focus:outline-none">
              <User size={24} className="text-gray-700" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg z-50">
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push("/settings")}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
                    >
                      <Settings size={16} /> Account Settings
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => router.push("/support")}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
                    >
                      <HelpCircle size={16} /> Help & Support
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } group flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600`}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="flex flex-col mt-2 gap-2 md:hidden">
          {navItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                router.push(item.path);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 rounded-md transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Outlet } from 'react-router-dom'; // For rendering the nested route content
import MyNavigationBar from './MyNavigationBar';

const Layout = () => {
  return (
    <div>
      <MyNavigationBar />  {/* Navbar is shown on every page inside this layout */}
      <div>
        <Outlet />  {/* This will render the specific page content */}
      </div>
    </div>
  );
};

export default Layout;

import React from 'react'; 
// Imports React to create a functional component.

import { Outlet } from 'react-router-dom'; 
// Imports 'Outlet' from 'react-router-dom' to render nested routes dynamically.

import MyNavigationBar from './MyNavigationBar'; 
// Imports a custom navigation bar component.

const Layout = () => { 
// Defines the 'Layout' functional component.

  return (
    <div> 
    {/* Main container for the layout structure. */}
      <MyNavigationBar />  
      {/* Renders the 'MyNavigationBar' component, making it persistent across different routes. */}
      <div>
        <Outlet />  
        {/* 'Outlet' is a placeholder for nested routes, allowing different pages to be rendered within the layout. */}
      </div>
    </div>
  );
};

export default Layout; 
// Exports the 'Layout' component for use in routing or other parts of the application.

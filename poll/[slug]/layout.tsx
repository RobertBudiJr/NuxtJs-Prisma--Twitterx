import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const Layout = ({ children }: IProps) => {
  return <main>{children}</main>;
};

export default Layout;

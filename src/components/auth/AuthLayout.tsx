
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center font-roboto"
      style={{
        background: 'linear-gradient(to bottom, #1C2526, #2E3A59)',
      }}
    >
      <div className="w-full max-w-md px-6 py-8 bg-slate-800 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

'use client';

const ProtectedClient = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fade size-full min-w-xs max-w-4xl mx-auto">{children}</div>
  );
};

export default ProtectedClient;

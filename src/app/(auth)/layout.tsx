import { AppIcon } from '@/core/components/icons/AppIcon';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="fade size-full flex trans-c">
      <div className="relative w-full md:w-[400px] flex-center">{children}</div>
      <div className="relative max-md:hidden flex-1 flex-center bg-area select-none">
        <AppIcon className="fade w-64 h-64 text-background" />
      </div>
    </div>
  );
}

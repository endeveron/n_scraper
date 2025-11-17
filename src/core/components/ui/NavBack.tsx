import { NavBackIcon } from '@/core/components/icons/NavBackIcon';
import { cn } from '@/core/utils';
import { useRouter } from 'next/navigation';

interface NavbackProps {
  className?: string;
  route?: string;
}

export const NavBack = ({ className, route }: NavbackProps) => {
  const router = useRouter();

  return (
    <div
      onClick={() => (route ? router.push(route) : router.back())}
      className={cn('w-6 h-6', className)}
    >
      <NavBackIcon className="icon--action" />
    </div>
  );
};

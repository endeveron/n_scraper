import { APP_NAME } from '@/core/constants';

const CardLogo = () => {
  return (
    <div className="relative w-full flex justify-center select-none">
      <div className="absolute -top-12 text-5xl text-accent leading-0 font-black trans-c">
        {APP_NAME}
      </div>
    </div>
  );
};

export default CardLogo;

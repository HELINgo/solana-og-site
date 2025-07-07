import React from 'react';
import FlipNumbers from 'react-flip-numbers';

interface Props {
  number: number;
}

const RollingNumber: React.FC<Props> = ({ number }) => {
  const numStr = number.toString().padStart(6, '0'); // 保证是6位数字

  return (
    <div className="flex justify-center items-center">
      <FlipNumbers
        height={60}
        width={40}
        color="#FFD700" // 金色
        background="transparent"
        numbers={numStr} // ✅ 修正这里
        play
        perspective={100}
        duration={2}
      />
    </div>
  );
};

export default RollingNumber;


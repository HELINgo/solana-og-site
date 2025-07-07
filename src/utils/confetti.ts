import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  const duration = 2 * 1000;
  const animationEnd = Date.now() + duration;

  const colors = ['#bb0000', '#ffffff', '#FFD700', '#00FF00'];

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 100,
      angle: 60,
      spread: 100,
      origin: { x: 0 },
      colors,
    });

    confetti({
      particleCount: 100,
      angle: 120,
      spread: 100,
      origin: { x: 1 },
      colors,
    });
  }, 250);
};

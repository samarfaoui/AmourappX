import { useEffect, useRef, useState } from 'react';
import bird1 from '@/assets/bird_perm_1_RBY.png';
import bird2 from '@/assets/bird_perm_2_RYB.png';
import bird3 from '@/assets/bird_perm_3_BRY.png';
import bird4 from '@/assets/bird_perm_4_BYR.png';
import bird5 from '@/assets/bird_perm_5_YRB.png';
import bird6 from '@/assets/bird_perm_6_YBR.png';

const GROUP_1 = [0, 3, 4];
const GROUP_2 = [1, 2, 5];

type BirdGroup = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  birdIndices: number[];
  id: number;
  displayMode: 'bordered' | 'blinking';
};

type GameState = {
  playerY: number;
  playerVelocity: number;
  playerBirdIndex: number;
  birdGroups: BirdGroup[];
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
  animationId: number | null;
  nextGroupTimer: number;
  groupIdCounter: number;
};

export default function Level6() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [birdImages, setBirdImages] = useState<HTMLCanvasElement[]>([]);
  
  const birdSources = [bird1, bird2, bird3, bird4, bird5, bird6];
  const playerX = 80;
  
  const getRandomDelay = () => {
    return 180;
  };
  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createNewGroup = (id: number): BirdGroup => {
    const showGroup1 = Math.random() > 0.5;
    const groupToShow = shuffleArray(showGroup1 ? [...GROUP_1] : [...GROUP_2]);
    const displayMode = Math.random() > 0.5 ? 'bordered' : 'blinking';
    
    return {
      x: 520,
      y: 150 + Math.random() * 400,
      velocityX: -1.125,
      velocityY: (Math.random() > 0.5 ? 1 : -1) * 0.9,
      birdIndices: groupToShow,
      id,
      displayMode
    };
  };
  
  const createRound = () => {
    const allBirds = [0, 1, 2, 3, 4, 5];
    const playerBirdIndex = allBirds[Math.floor(Math.random() * 6)];
    
    const firstGroup = createNewGroup(1);
    
    return {
      playerBirdIndex,
      birdGroups: [firstGroup],
      nextGroupTimer: getRandomDelay(),
      groupIdCounter: 2
    };
  };
  
  const initialRound = createRound();
  const gameStateRef = useRef<GameState>({
    playerY: 350,
    playerVelocity: 0,
    playerBirdIndex: initialRound.playerBirdIndex,
    birdGroups: initialRound.birdGroups,
    score: 0,
    gameOver: false,
    gameStarted: false,
    animationId: null,
    nextGroupTimer: initialRound.nextGroupTimer,
    groupIdCounter: initialRound.groupIdCounter
  });

  useEffect(() => {
    const loadAndProcessImages = async () => {
      const processedImages = await Promise.all(
        birdSources.map((src) => {
          return new Promise<HTMLCanvasElement>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
              if (!tempCtx) {
                resolve(tempCanvas);
                return;
              }

              tempCanvas.width = img.width;
              tempCanvas.height = img.height;
              tempCtx.drawImage(img, 0, 0);
              
              const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                if (r > 200 && g > 200 && b > 200) {
                  data[i + 3] = 0;
                }
              }
              
              tempCtx.putImageData(imageData, 0, 0);
              resolve(tempCanvas);
            };
            img.src = src;
          });
        })
      );
      setBirdImages(processedImages);
    };
    
    loadAndProcessImages();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (birdImages.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const birdSize = 60;
    const gravity = 0.4;
    const birdSpacing = 70;
    const collisionRadius = 45;

    const drawBirdImage = (x: number, y: number, imageIndex: number, size: number, flipX: boolean = false, highlight: boolean = false) => {
      const img = birdImages[imageIndex];
      if (!img) return;
      
      ctx.save();
      
      if (highlight) {
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 20;
      }
      
      if (flipX) {
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      }
      
      ctx.restore();
    };

    const getBirdPositions = (group: BirdGroup) => {
      return group.birdIndices.map((birdIndex, i) => ({
        x: group.x,
        y: group.y + (i - 1) * birdSpacing,
        birdIndex
      }));
    };

    const checkGroupCollision = (playerY: number, group: BirdGroup): boolean => {
      const positions = getBirdPositions(group);
      for (const pos of positions) {
        const dx = playerX - pos.x;
        const dy = playerY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < collisionRadius) {
          return true;
        }
      }
      return false;
    };

    const gameLoop = () => {
      const state = gameStateRef.current;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (state.gameStarted && !state.gameOver) {
        state.playerVelocity += gravity;
        state.playerY += state.playerVelocity;

        if (state.playerY > canvas.height - 20) {
          state.gameOver = true;
        }
        if (state.playerY < 20) {
          state.playerY = 20;
          state.playerVelocity = 0;
        }

        state.nextGroupTimer--;
        if (state.nextGroupTimer <= 0) {
          const newGroup = createNewGroup(state.groupIdCounter);
          state.birdGroups.push(newGroup);
          state.groupIdCounter++;
          state.nextGroupTimer = getRandomDelay();
        }

        for (const group of state.birdGroups) {
          group.x += group.velocityX;
          group.y += group.velocityY;
          
          const groupHeight = birdSpacing * 2;
          if (group.y - groupHeight / 2 < 60) {
            group.velocityY = Math.abs(group.velocityY);
          }
          if (group.y + groupHeight / 2 > canvas.height - 60) {
            group.velocityY = -Math.abs(group.velocityY);
          }
        }

        for (const group of state.birdGroups) {
          const hitGroup = checkGroupCollision(state.playerY, group);
          if (hitGroup) {
            const mustHit = group.birdIndices.includes(state.playerBirdIndex);
            if (mustHit) {
              state.score += 1;
              state.birdGroups = state.birdGroups.filter(g => g.id !== group.id);
            } else {
              state.gameOver = true;
            }
            break;
          }
        }

        for (const group of state.birdGroups) {
          if (group.x < -50) {
            const isCorrectGroup = group.birdIndices.includes(state.playerBirdIndex);
            if (isCorrectGroup) {
              state.gameOver = true;
              break;
            }
          }
        }
        
        state.birdGroups = state.birdGroups.filter(g => g.x > -100);
      }

      const blinkOn = Math.floor(Date.now() / 200) % 2 === 0;
      
      for (const group of state.birdGroups) {
        const positions = getBirdPositions(group);
        const isCorrectGroup = group.birdIndices.includes(state.playerBirdIndex);
        
        if (group.displayMode === 'bordered') {
          const minY = Math.min(...positions.map(p => p.y)) - birdSize / 2;
          const maxY = Math.max(...positions.map(p => p.y)) + birdSize / 2;
          const groupX = group.x - birdSize / 2;
          const groupWidth = birdSize;
          const groupHeight = maxY - minY;
          
          ctx.strokeStyle = isCorrectGroup ? '#00FF00' : '#FF0000';
          ctx.lineWidth = 1;
          ctx.strokeRect(groupX, minY, groupWidth, groupHeight);
          
          for (const pos of positions) {
            drawBirdImage(pos.x, pos.y, pos.birdIndex, birdSize, false, false);
          }
        } else {
          for (const pos of positions) {
            const isPlayerBird = pos.birdIndex === state.playerBirdIndex;
            const shouldHighlight = isPlayerBird && blinkOn;
            drawBirdImage(pos.x, pos.y, pos.birdIndex, birdSize, false, shouldHighlight);
          }
        }
      }

      drawBirdImage(playerX, state.playerY, state.playerBirdIndex, birdSize, true, false);

      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`❤ ${state.score}`, 20, 45);

      if (!state.gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('AmourBird Infinite', canvas.width / 2, 220);
        
        ctx.font = '20px Arial';
        ctx.fillText('Tap: Fly', canvas.width / 2, 280);
        
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Green: Hit Group', canvas.width / 2, 320);
        
        ctx.fillStyle = '#FFFF00';
        ctx.fillText('Blinking: Hit Group', canvas.width / 2, 360);
        
        ctx.fillStyle = '#FF4444';
        ctx.fillText('Red: No Hit Group', canvas.width / 2, 400);
        
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Tap to Start', canvas.width / 2, 480);
        
        ctx.textAlign = 'left';
      }

      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, 300);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${state.score}`, canvas.width / 2, 350);
        
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('Tap to Restart', canvas.width / 2, 420);
        ctx.textAlign = 'left';
      }

      state.animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [birdImages]);

  const handleTap = () => {
    const state = gameStateRef.current;
    
    if (!state.gameStarted) {
      state.gameStarted = true;
      state.gameOver = false;
      state.score = 0;
      state.playerY = 350;
      state.playerVelocity = 0;
      const round = createRound();
      state.playerBirdIndex = round.playerBirdIndex;
      state.birdGroups = round.birdGroups;
      state.nextGroupTimer = round.nextGroupTimer;
      state.groupIdCounter = round.groupIdCounter;
      return;
    }
    
    if (state.gameOver) {
      state.gameOver = false;
      state.gameStarted = true;
      state.score = 0;
      state.playerY = 350;
      state.playerVelocity = 0;
      const round = createRound();
      state.playerBirdIndex = round.playerBirdIndex;
      state.birdGroups = round.birdGroups;
      state.nextGroupTimer = round.nextGroupTimer;
      state.groupIdCounter = round.groupIdCounter;
      return;
    }
    
    state.playerVelocity = -9;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
      padding: '0',
      margin: '0'
    }}>
      <div style={{
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={700}
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
          style={{
            display: 'block',
            background: '#1a1a2e',
            touchAction: 'manipulation',
            cursor: 'pointer',
            border: '3px solid #4a90d9'
          }}
          data-testid="canvas-game"
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, Suspense } from 'react';
import { gsap } from 'gsap';
import GiftBox3D from './components/GiftBox3D';
import Cake3D from './components/Cake3D';
import './App.css';

type Scene = 1 | 2 | 3 | 4 | 5 | 6;
const unwrapSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';

const birthdaySong = '/Piano.mpeg.mp3';

const cheerSound = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';

function App() {
  const [currentScene, setCurrentScene] = useState<Scene>(1);
  const [cakeSliced, setCakeSliced] = useState(false);
  const [messageDisplayed, setMessageDisplayed] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const giftContainerRef = useRef<HTMLDivElement>(null);
  const elephantRef = useRef<HTMLDivElement>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const cakeContainerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const finaleConfettiRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    backgroundMusicRef.current = new Audio(birthdaySong);
    backgroundMusicRef.current.loop = true;
    backgroundMusicRef.current.volume = 0.5;
  }, []);


  const playSound = (type: 'unwrap' | 'birthday' | 'cheer') => {
    if (!audioEnabled) return;

    const soundMap = {
      unwrap: unwrapSound,
      birthday: birthdaySong,
      cheer: cheerSound
    };

    try {
      const audio = new Audio(soundMap[type]);
      audio.volume = type === 'birthday' ? 0.4 : 0.6;
      audio.play().catch(() => { });
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };


  const toggleMusic = () => {
    if (!backgroundMusicRef.current) return;

    if (isMusicPlaying) {
      backgroundMusicRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      // Resume context if needed (browsers need this sometimes)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      backgroundMusicRef.current.play()
        .then(() => {
          setIsMusicPlaying(true);
          setAudioEnabled(true);
        })
        .catch(e => console.error("Music play failed:", e));
    }
  };


  const openGift = () => {

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setAudioEnabled(true);
    playSound('unwrap');


    setTimeout(() => {
      if (giftContainerRef.current) {
        gsap.to(giftContainerRef.current, {
          opacity: 0,
          scale: 1.5,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => setCurrentScene(2)
        });
      }
    }, 2000);
  };


  useEffect(() => {
    if (currentScene === 2 && elephantRef.current && speechBubbleRef.current) {

      gsap.fromTo(elephantRef.current,
        { x: '100vw', xPercent: -50, scale: 0.8 },
        {
          x: 0,
          xPercent: -50,
          scale: 1,
          duration: 1.5,
          ease: 'power3.out',
          onComplete: () => {
            // Bounce animation
            gsap.to(elephantRef.current, {
              y: -20,
              duration: 0.4,
              ease: 'power1.out',
              yoyo: true,
              repeat: 3,
              onComplete: () => {
                // Show speech bubble
                gsap.to(speechBubbleRef.current, {
                  opacity: 1,
                  scale: 1,
                  xPercent: -50, // Ensure centering is preserved
                  duration: 0.5,
                  ease: 'back.out(1.7)'
                });
              }
            });
          }
        }
      );



      if (audioEnabled && !isMusicPlaying) {

        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.play()
            .then(() => setIsMusicPlaying(true))
            .catch(err => console.log("Auto-play blocked", err));
        }
      }
    }
  }, [currentScene, audioEnabled]);


  const proceedToCake = () => {
    if (elephantRef.current && speechBubbleRef.current) {
      gsap.to(speechBubbleRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.3
      });

      // Elephant walks away and back
      gsap.to(elephantRef.current, {
        x: '-100vw',
        duration: 1,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentScene(3);
        }
      });
    }
  };


  useEffect(() => {
    if (currentScene === 3 && elephantRef.current) {
      // Reset elephant position with cake
      gsap.set(elephantRef.current, { x: '100vw', scale: 1 });

      // Elephant enters with cake
      gsap.to(elephantRef.current, {
        x: 0,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.5,
        onComplete: () => {
          setTimeout(() => {
            setCurrentScene(4);
          }, 2000);
        }
      });
    }
  }, [currentScene]);


  const cutCake = () => {
    if (cakeSliced) return;

    playSound('cheer');
    setCakeSliced(true);


    if (cakeContainerRef.current) {
      createConfetti();
    }

    // Move to final message after delay
    setTimeout(() => {
      setCurrentScene(5);
    }, 4000);
  };

  // Create confetti particles
  const createConfetti = () => {
    if (!cakeContainerRef.current) return;

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        left: 50%;
        top: 50%;
        pointer-events: none;
      `;
      cakeContainerRef.current.appendChild(confetti);

      gsap.to(confetti, {
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        rotation: Math.random() * 720,
        opacity: 0,
        duration: Math.random() * 2 + 1,
        ease: 'power2.out',
        onComplete: () => confetti.remove()
      });
    }
  };


  useEffect(() => {
    if (currentScene === 5 && messageRef.current) {
      // Elephant comes to front
      if (elephantRef.current) {
        gsap.to(elephantRef.current, {
          scale: 1.2,
          y: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      }

      // Show message
      gsap.to(messageRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        onComplete: () => {
          setMessageDisplayed(true);
        }
      });
    }
  }, [currentScene]);


  useEffect(() => {
    if (currentScene === 6 && finaleConfettiRef.current) {
      // Create massive confetti burst
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createFinaleConfetti(), i * 300);
      }

      // Peak music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = 0.6;
      }
    }
  }, [currentScene]);

  const createFinaleConfetti = () => {
    if (!finaleConfettiRef.current) return;

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#A8E6CF', '#FFD93D'];

    for (let i = 0; i < 80; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'finale-confetti';
      confetti.style.cssText = `
        position: absolute;
        width: ${Math.random() * 15 + 8}px;
        height: ${Math.random() * 15 + 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${Math.random() > 0.3 ? '50%' : '0'};
        left: ${Math.random() * 100}vw;
        top: -20px;
        pointer-events: none;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      `;
      finaleConfettiRef.current.appendChild(confetti);

      gsap.to(confetti, {
        y: window.innerHeight + 20,
        x: (Math.random() - 0.5) * 200,
        rotation: Math.random() * 1080,
        opacity: 0.3,
        duration: Math.random() * 3 + 2,
        ease: 'power1.out',
        onComplete: () => confetti.remove()
      });
    }
  };


  const resetExperience = () => {
    setCurrentScene(1);
    setCakeSliced(false);
    setMessageDisplayed(false);



    gsap.set([elephantRef.current], { clearProps: 'all' });
    gsap.set(elephantRef.current, { x: 0, scale: 1 });
    gsap.set([speechBubbleRef.current, messageRef.current], { opacity: 0, scale: 0.5 });
  };

  return (
    <div className="birthday-container">

      <button className="music-toggle-btn" onClick={toggleMusic} aria-label="Toggle Music">
        {isMusicPlaying ? '🔊' : '🔇'}
      </button>


      {currentScene === 1 && (
        <div className="scene scene-1" ref={giftContainerRef}>
          <div className="scene-overlay">
            <h1 className="scene-title">🎁 Surprise 🎁</h1>
            <p className="scene-hint">Tap the gift to open</p>
          </div>
          <p className="made-by-jumbo" style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.8rem',
            width: '100%',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 100
          }}>made by jumbo</p>
          <Suspense fallback={<div className="loading">Loading 3D Gift...</div>}>
            <GiftBox3D onOpen={openGift} />
          </Suspense>
        </div>
      )}


      {currentScene === 2 && (
        <div className="scene scene-2">
          <div ref={elephantRef} className="elephant-container">
            <img src="/elephant-bouquet.png" alt="Jumbo with Bouquet" className="elephant-image" />
          </div>
          <div ref={speechBubbleRef} className="speech-bubble" onClick={proceedToCake}>
            <img src="/cloud-bubble.png" alt="Speech Bubble" className="bubble-bg" />
            <p className="bubble-text">Get your bouquet from Jumbo 💐</p>
          </div>
        </div>
      )}


      {currentScene === 3 && (
        <div className="scene scene-3">
          <div className="elephant-group">
            <img src="/elephant-group.png" alt="Elephant Group" className="elephant-group-image" />
          </div>
          <div ref={elephantRef} className="elephant-with-cake">
            <img src="/elephant-cake.png" alt="Jumbo with Cake" className="elephant-cake-image" />
          </div>
          <div className="birthday-text">
            <h1>Happy Birthday to You 🎉</h1>
          </div>
        </div>
      )}


      {currentScene === 4 && (
        <div className="scene scene-4" ref={cakeContainerRef}>
          <div className="scene-overlay">
            <h1 className="scene-title">🎂 Time to Cut the Cake! 🎂</h1>
            <p className="scene-hint">Tap on the cake to cut slices</p>
          </div>
          <Suspense fallback={<div className="loading">Loading 3D Cake...</div>}>
            <Cake3D onCut={cutCake} />
          </Suspense>
        </div>
      )}


      {currentScene === 5 && (
        <div className="scene scene-5" onClick={() => setCurrentScene(6)}>
          <div ref={elephantRef} className={`elephant-final ${messageDisplayed ? 'message-displayed' : ''}`}>
            <img src="/elephant-bouquet.png" alt="Jumbo" className="elephant-image" />
            <img src="/party-hat.png" alt="Party Hat" className="party-hat" />
          </div>
          <div ref={messageRef} className="final-message">
            <img src="/cloud-bubble.png" alt="Message Bubble" className="message-bubble-bg" />
            <div className="message-content">
              <p>Hi dear,</p>
              <p className="highlight">🎉 Happy Birthday Beaula Jenefa🎂</p>
              <p>May your day arrive wrapped in laughter, sprinkled with small miracles, and leave behind memories that glow longer than the candles on your cake.</p>
              <p>Here's to another year of bold ideas, quiet wins, and moments that make you pause and smile.</p>
              <p>Celebrate loudly or softly, just make it unmistakably yours. 🥳✨</p>
              <p className="signature">Your lovable,<br />Jumbo 🐘</p>
            </div>
          </div>
          {messageDisplayed && (
            <div className="scene-hint" style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(0,0,0,0.5)',
              fontSize: '0.9rem',
              animation: 'pulse 1.5s infinite'
            }}>
              (Tap anywhere to continue)
            </div>
          )}
        </div>
      )}


      {currentScene === 6 && (
        <div className="scene scene-6">
          <div className="finale-content">
            <h1>🎊 HAPPY BIRTHDAY! 🎊</h1>
            <p className="finale-subtitle">Wishing you the most wonderful day!</p>
            <button className="replay-button" onClick={resetExperience}>
              🎁 Remember your beautiful day with jumbo 🐘
            </button>
          </div>
          <div ref={finaleConfettiRef} className="finale-confetti-container"></div>
        </div>
      )}


      {!audioEnabled && currentScene === 1 && (
        <div className="audio-hint">
          <p>Tap anywhere to Open the gift</p>
        </div>
      )}
    </div>
  );
}

export default App;

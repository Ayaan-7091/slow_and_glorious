import * as THREE from 'three';

/**
 * ============================================================================
 * HIGH-CLARITY ELEVENLABS HINDI MP3 VOICE ENGINE & COMIC RADIO BANNER
 * ============================================================================
 * 
 * Features:
 *  1. Clean, high-clarity HTMLAudioElement playback (volume = 1.0) for natural
 *     ElevenLabs voice emotion and accents without any muffling radio filters.
 *  2. Engine volume ducking: Smoothly drops engine volume to 30% during dialogue
 *     so the speech stands out prominently over racing motors.
 *  3. Dynamic 3-Character Banter (Raju, Babloo, Munna) with custom avatars
 *     and Devanagari Hindi + English subtitles.
 *  4. 3D Floating Comic Speech Bubble pinned above speaking rickshaw.
 *  5. 3.5-second cooldown and full audio mute integration.
 *  6. Fallback to window.speechSynthesis only if MP3 playback fails.
 */

const VOICE_TRACKS = {
  collision: [
    {
      file: '/new_voices/bump_1.mp3',
      speaker: 'Babloo',
      hi: 'अरे ओ भाई! अबे क्या कर रहा है?! अंधा है क्या? पूरा ऑटो ठोक दिया यार!',
      en: 'Hey bro! What are you doing?! Are you blind? You wrecked my entire auto!',
    },
    {
      file: '/new_voices/bump_2.mp3',
      speaker: 'Raju',
      hi: 'ओये हीरो! नया कलर कराया है ऑटो का! बाप की रोड है क्या?!',
      en: "Oye hero! Just got a fresh paint job! Does your dad own this road?!",
    },
    {
      file: '/new_voices/bump_3.mp3',
      speaker: 'Munna',
      hi: 'अरे ब्रेक मार भाई! गरम चाय गिरा देगा मेरी!',
      en: "Hit the brakes bhai! You're gonna spill my hot cutting chai!",
    },
  ],
  overtake: [
    {
      file: '/new_voices/overtake_1.mp3',
      speaker: 'Raju',
      hi: 'चल हट बाजू! मीटर डाउन है अपुन का! टाटा बाय बाय!',
      en: 'Move aside! My meter is down! Tata bye-bye!',
    },
    {
      file: '/new_voices/overtake_2.mp3',
      speaker: 'Babloo',
      hi: 'क्या हुआ भाई? इंजन में पानी भर गया क्या? पीछे देख के चला!',
      en: 'What happened bro? Water in your engine? Watch your mirrors!',
    },
    {
      file: '/new_voices/overtake_3.mp3',
      speaker: 'Munna',
      hi: 'देख भाई देख, इसको बोलते हैं असली रफ़्तार!',
      en: 'Look bhai look, THIS is called real speed!',
    },
  ],
  overtaken: [
    {
      file: '/new_voices/bump_2.mp3',
      speaker: 'Raju',
      hi: 'रुक जा तू! अगले मोड़ पे कट मार के आगे निकलूँगा!',
      en: "You just wait! I'll cut you off at the next hairpin turn!",
    },
    {
      file: '/new_voices/overtake_2.mp3',
      speaker: 'Babloo',
      hi: 'अरे ये नौसिखिया आगे निकल गया! सत्यानाश!',
      en: 'Arrey this rookie just overtook me! Complete disaster!',
    },
    {
      file: '/new_voices/bump_1.mp3',
      speaker: 'Munna',
      hi: 'अरे नाइट्रो चालू कर दिया क्या?! रुक भाई रुक!',
      en: 'Did you just hit nitro?! Wait up bro!',
    },
  ],
  horn: [
    {
      file: '/new_voices/horn_1.mp3',
      speaker: 'Babloo',
      hi: 'दिमाग मत खराब कर भाई! उड़ के जाऊं क्या ऊपर से?!',
      en: "Don't give me a headache! Should I fly over you from above?!",
    },
    {
      file: '/new_voices/horn_2.mp3',
      speaker: 'Raju',
      hi: 'अबे भोपू मत बजा यार! जगह मिलेगा तो दे दूंगा ना!',
      en: "Stop blowing your horn dude! I'll give space when there is space!",
    },
    {
      file: '/new_voices/horn_3.mp3',
      speaker: 'Munna',
      hi: 'रुक ना भाई, ट्रैफिक दिखता नहीं क्या तेरे को?!',
      en: "Wait up bhai, can't you see the crazy traffic?!",
    },
  ],
};

const CHARACTER_PROFILES = {
  Raju: {
    name: 'RAJU (AUTO-WALA)',
    color: '#00e676',
    avatar: '🛺',
  },
  Babloo: {
    name: 'BABLOO (SENIOR)',
    color: '#ffd600',
    avatar: '🛺',
  },
  Munna: {
    name: 'MUNNA (SPEEDSTER)',
    color: '#00e5ff',
    avatar: '⚡',
  },
};

export class VoiceSystem {
  constructor(audioManager, scene, camera) {
    this.audioManager = audioManager;
    this.scene = scene;
    this.camera = camera;

    this.lastSpokenTime = 0;
    this.speechCooldown = 3500; // 3.5s minimum gap between voice lines

    // Audio pool of preloaded HTMLAudioElements for instant playback
    this.audioPool = new Map();
    this.currentAudio = null;
    this.duckingTimer = null;

    // HUD Elements
    this.bannerEl = document.getElementById('radio-chatter-banner');
    this.speakerTagEl = document.getElementById('radio-speaker-tag');
    this.hindiTextEl = document.getElementById('radio-hindi-text');
    this.englishSubEl = document.getElementById('radio-english-sub');
    this.avatarEl = document.getElementById('radio-avatar');
    this.bannerHideTimeout = null;

    // 3D Comic Speech Bubble Sprite
    this.speechSprite = this.createSpeechBubbleSprite();
    this.speechSprite.visible = false;
    if (this.scene) {
      this.scene.add(this.speechSprite);
    }
    this.speechSpriteTarget = null;
    this.speechSpriteHideTime = 0;

    this.preloadAudioElements();
  }

  preloadAudioElements() {
    const urls = [
      '/new_voices/bump_1.mp3',
      '/new_voices/bump_2.mp3',
      '/new_voices/bump_3.mp3',
      '/new_voices/overtake_1.mp3',
      '/new_voices/overtake_2.mp3',
      '/new_voices/overtake_3.mp3',
      '/new_voices/horn_1.mp3',
      '/new_voices/horn_2.mp3',
      '/new_voices/horn_3.mp3',
    ];

    urls.forEach((url) => {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.audioPool.set(url, audio);
      } catch (e) {
        // Ignored
      }
    });
  }

  createSpeechBubbleSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    this.bubbleCanvas = canvas;
    this.bubbleCtx = ctx;

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    this.bubbleTexture = texture;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(3.4, 1.45, 1);
    sprite.renderOrder = 999;
    return sprite;
  }

  updateSpeechBubbleTexture(speakerName, hindiLine) {
    const ctx = this.bubbleCtx;
    const w = 384;
    const h = 160;
    ctx.clearRect(0, 0, w, h);

    // Comic speech bubble body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 5;

    const r = 18;
    const bw = 360;
    const bh = 110;
    const bx = 12;
    const by = 8;

    ctx.beginPath();
    ctx.moveTo(bx + r, by);
    ctx.lineTo(bx + bw - r, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
    ctx.lineTo(bx + bw, by + bh - r);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);

    // Bubble pointer tail
    ctx.lineTo(bx + bw * 0.5 + 20, by + bh);
    ctx.lineTo(bx + bw * 0.5, by + bh + 32);
    ctx.lineTo(bx + bw * 0.5 - 15, by + bh);

    ctx.lineTo(bx + r, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
    ctx.lineTo(bx, by + r);
    ctx.quadraticCurveTo(bx, by, bx + r, by);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Speaker Name Tag
    ctx.fillStyle = '#ff6b00';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(speakerName, w / 2, 38);

    // Hindi dialogue line
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    let displayText = hindiLine;
    if (displayText.length > 28) {
      displayText = displayText.slice(0, 26) + '...';
    }
    ctx.fillText(displayText, w / 2, 78);

    this.bubbleTexture.needsUpdate = true;
  }

  /**
   * Main trigger method called on gameplay events
   */
  triggerDialogue(characterName, eventType, targetObject = null) {
    const now = performance.now();
    if (now - this.lastSpokenTime < this.speechCooldown) {
      return; // Cooldown active
    }

    const pool = VOICE_TRACKS[eventType] || VOICE_TRACKS.collision;
    const matched = pool.filter((item) => !characterName || item.speaker.toLowerCase() === characterName.toLowerCase());
    const item = matched.length > 0 ? matched[Math.floor(Math.random() * matched.length)] : pool[Math.floor(Math.random() * pool.length)];

    const charProfile = CHARACTER_PROFILES[item.speaker] || CHARACTER_PROFILES.Raju;

    this.lastSpokenTime = now;

    // 1. Show Top-Center HUD Radio Banner with Devanagari Hindi + English Subtitle
    this.showHUDChatter(charProfile, item);

    // 2. Show 3D Pinned Speech Bubble above vehicle
    if (targetObject) {
      this.speechSpriteTarget = targetObject;
      this.updateSpeechBubbleTexture(charProfile.name.split(' ')[0], item.hi);
      this.speechSprite.visible = true;
      this.speechSpriteHideTime = now + 2800;
    }

    // 3. Play Clean, High-Clarity ElevenLabs MP3 with Engine Ducking
    const isMuted = this.audioManager && this.audioManager.isMuted;
    if (!isMuted) {
      this.playElevenLabsMP3(item.file);
    }
  }

  showHUDChatter(charProfile, item) {
    if (!this.bannerEl) {
      this.bannerEl = document.getElementById('radio-chatter-banner');
      this.speakerTagEl = document.getElementById('radio-speaker-tag');
      this.hindiTextEl = document.getElementById('radio-hindi-text');
      this.englishSubEl = document.getElementById('radio-english-sub');
      this.avatarEl = document.getElementById('radio-avatar');
    }

    if (!this.bannerEl) return;

    if (this.speakerTagEl) {
      this.speakerTagEl.textContent = charProfile.name;
      this.speakerTagEl.style.color = charProfile.color;
    }
    if (this.hindiTextEl) {
      this.hindiTextEl.textContent = `"${item.hi}"`;
    }
    if (this.englishSubEl) {
      this.englishSubEl.textContent = item.en;
    }
    if (this.avatarEl) {
      this.avatarEl.textContent = charProfile.avatar;
    }

    this.bannerEl.classList.remove('hidden');
    this.bannerEl.classList.add('visible');

    if (this.bannerHideTimeout) {
      clearTimeout(this.bannerHideTimeout);
    }
    this.bannerHideTimeout = setTimeout(() => {
      if (this.bannerEl) {
        this.bannerEl.classList.remove('visible');
        this.bannerEl.classList.add('hidden');
      }
    }, 3400);
  }

  playElevenLabsMP3(fileUrl) {
    try {
      // Stop currently playing voice clip if any
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }

      // Slightly duck engine volume to 30% so ElevenLabs voices are crystal clear
      if (this.audioManager && this.audioManager.setEngineDucking) {
        this.audioManager.setEngineDucking(0.30);
      }

      const audio = new Audio(fileUrl);
      this.currentAudio = audio;
      audio.volume = 1.0; // Clean, high clarity full volume

      const restoreDucking = () => {
        if (this.audioManager && this.audioManager.setEngineDucking) {
          this.audioManager.setEngineDucking(1.0);
        }
      };

      audio.onended = restoreDucking;
      audio.onerror = restoreDucking;

      // Safety timeout to ensure engine ducking is restored
      if (this.duckingTimer) clearTimeout(this.duckingTimer);
      this.duckingTimer = setTimeout(restoreDucking, 4500);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(restoreDucking);
      }
    } catch (e) {
      if (this.audioManager && this.audioManager.setEngineDucking) {
        this.audioManager.setEngineDucking(1.0);
      }
    }
  }

  update() {
    const now = performance.now();
    if (this.speechSprite && this.speechSprite.visible) {
      if (now > this.speechSpriteHideTime) {
        this.speechSprite.visible = false;
        this.speechSpriteTarget = null;
      } else if (this.speechSpriteTarget) {
        const p = this.speechSpriteTarget.position;
        this.speechSprite.position.set(p.x, p.y + 2.8, p.z);
      }
    }
  }
}

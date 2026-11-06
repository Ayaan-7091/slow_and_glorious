import * as THREE from 'three';

/**
 * ============================================================================
 * DESI AI DRIVER VOICE BANTER & COMIC SPEECH SYSTEM (Sprint 5)
 * ============================================================================
 * 
 * Features:
 *  1. Web Speech API (window.speechSynthesis) with Hindi (hi-IN) voice selection
 *     and Indian English (en-IN) fallback.
 *  2. 3 Distinct AI Driver Personalities with custom pitch, rate, and attitude:
 *      - Raju (Green Tuk-Tuk): Cocky, aggressive meter-down auto-wala.
 *      - Babloo (Yellow Tuk-Tuk): Grumpy, experienced elder uncle driver.
 *      - Munna (Blue/Pink Tuk-Tuk): Hyperactive, fast-talking youngster.
 *  3. Dynamic Event Triggers:
 *      - Vehicle bump/collision between player and rivals.
 *      - Player overtakes AI.
 *      - AI overtakes player.
 *      - Player honks horn ('H' / button).
 *  4. Top-Center Arcade Radio Chatter HUD Banner (#radio-chatter-banner) with
 *     Devanagari Hindi text and English subtitles.
 *  5. 3D Comic Speech Bubble floating above the speaking rickshaw.
 *  6. 3.5-second global speech cooldown and audio mute integration.
 */

export class VoiceSystem {
  constructor(audioManager, scene, camera) {
    this.audioManager = audioManager;
    this.scene = scene;
    this.camera = camera;

    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.hindiVoice = null;
    this.englishVoice = null;
    this.isVoiceReady = false;

    this.lastSpokenTime = 0;
    this.speechCooldown = 3500; // 3.5s minimum gap between spoken lines

    // HUD banner elements
    this.bannerEl = document.getElementById('radio-chatter-banner');
    this.speakerTagEl = document.getElementById('radio-speaker-tag');
    this.hindiTextEl = document.getElementById('radio-hindi-text');
    this.englishSubEl = document.getElementById('radio-english-sub');
    this.avatarEl = document.getElementById('radio-avatar');

    this.bannerHideTimeout = null;

    // Character profiles
    this.characters = {
      Raju: {
        name: 'RAJU (AUTO-WALA)',
        color: '#00e676',
        avatar: '🛺',
        pitch: 1.25,
        rate: 1.05,
        lines: {
          collision: [
            { hi: 'अरे हट जा भाई, रास्ता तेरे बाप का है क्या?!', en: 'Hey move aside bro! Does your dad own this road?!' },
            { hi: 'अरे देख के चला हीरो! नया पेंट कराया है!', en: "Watch where you're going hero! Just got fresh paint!" },
            { hi: 'मेरी गाड़ी में मत ठोक, मीटर तोड़ दूँगा!', en: "Don't bump my auto, or I'll break your meter!" },
          ],
          overtake: [
            { hi: 'साइड दे! राजू का मीटर चालू है!', en: "Give side! Raju's meter is running!" },
            { hi: 'चल निकल! तू क्या रेस करेगा!', en: 'Move aside! You think you can race with me?!' },
            { hi: 'टाटा बाय-बाय! चाय पीने रुक जा!', en: 'Tata bye-bye! Go stop for a chai!' },
          ],
          overtaken: [
            { hi: 'रुक जा तू! अगले मोड़ पे कट मारूँगा!', en: "You wait! I'll cut you off at the next bend!" },
            { hi: 'धोखा दिया बे! रुक अभी नाइट्रो दबाता हूँ!', en: 'You cheated! Watch me hit nitro now!' },
          ],
          horn: [
            { hi: 'हाँ हाँ बजा ले हॉर्न, कान फोड़ दे मेरे!', en: 'Keep honking, burst my eardrums why dontcha!' },
            { hi: 'हॉर्न बजाने से रास्ता नहीं मिलता भाई!', en: "Honking won't get you past, bhai!" },
          ],
        },
      },
      Babloo: {
        name: 'BABLOO (SENIOR)',
        color: '#ffd600',
        avatar: '🛺',
        pitch: 0.85,
        rate: 0.95,
        lines: {
          collision: [
            { hi: 'अरे ब्रेक लगाओ भाई! पागल हो गया है क्या?!', en: 'Hit the brakes bhai! Have you gone completely mad?!' },
            { hi: 'अरे भगवान! नया ऑटो ठोक दिया इसने!', en: 'Oh Bhagwan! He just dented my brand new auto!' },
            { hi: 'सीधे चल ना भाई! लाइसेंस कहाँ से मिला?!', en: 'Drive straight bhai! Where did you get your license?!' },
          ],
          overtake: [
            { hi: 'सीधे चल ना भाई! रास्ता छोड़!', en: 'Drive straight bhai! Clear the road!' },
            { hi: 'अरे हटो हटो! बुज़ुर्गों को रास्ता दो!', en: 'Move move! Give way to your elders!' },
          ],
          overtaken: [
            { hi: 'अरे ये नौसिखिया आगे निकल गया!', en: 'Arrey this rookie just overtook me!' },
            { hi: 'सत्यानाश! आजकल के लौंडे बहुत तेज भागते हैं!', en: 'Disaster! Kids nowadays drive way too fast!' },
          ],
          horn: [
            { hi: 'दिमाग मत खराब कर भाई! उड़ के जाऊं क्या?!', en: "Don't give me a headache! Should I fly over you?!" },
            { hi: 'हॉर्न की बैटरी खत्म कर ले अपनी!', en: 'Go drain your horn battery!' },
          ],
        },
      },
      Munna: {
        name: 'MUNNA (SPEEDSTER)',
        color: '#00e5ff',
        avatar: '⚡',
        pitch: 1.15,
        rate: 1.25,
        lines: {
          collision: [
            { hi: 'अरे भाई भाई भाई! आराम से!', en: 'Whoa bro bro bro! Take it easy!' },
            { hi: 'अरे ठोक दिया! डेंट पड़ गया यार!', en: "Arrey you hit me! There's a dent now dude!" },
            { hi: 'मुन्ना को टक्कर मारेगा?! हिम्मत तो देख!', en: 'Crashing into Munna?! Look at this guts!' },
          ],
          overtake: [
            { hi: 'धूम मचाले धूम! हवा हवाई!', en: 'Dhoom Machale Dhoom! Fast as the wind!' },
            { hi: 'स्पीड चेक कर मेरी! पकड़ के दिखा!', en: 'Check my top speed! Catch me if you can!' },
            { hi: 'चाय ठंडी हो जाएगी भाई, मैं तो चला!', en: "My cutting chai is getting cold, I'm outta here!" },
          ],
          overtaken: [
            { hi: 'अरे नाइट्रो चालू कर दिया क्या?! चीटर!', en: 'Did you just hit nitro?! Cheater!' },
            { hi: 'रुक भाई रुक! अभी कट मार के आता हूँ!', en: 'Wait up bro! Catching your slipstream!' },
          ],
          horn: [
            { hi: 'पोम्प पोम्प! हट जा रास्ते से तू भी!', en: 'Beep beep! You get out of the way too!' },
            { hi: 'गाना बजा ले हॉर्न पे भाई!', en: 'Play a song on that horn bro!' },
          ],
        },
      },
    };

    // 3D Speech Bubble Sprite
    this.speechSprite = this.createSpeechBubbleSprite();
    this.speechSprite.visible = false;
    if (this.scene) {
      this.scene.add(this.speechSprite);
    }
    this.speechSpriteTarget = null;
    this.speechSpriteHideTime = 0;

    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;

    const findBestVoices = () => {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      // Search for Hindi voice (hi-IN)
      this.hindiVoice = voices.find(
        (v) =>
          (v.lang && (v.lang.includes('hi') || v.lang.includes('HI'))) ||
          (v.name && v.name.toLowerCase().includes('hindi'))
      );

      // Search for Indian English fallback (en-IN)
      this.englishVoice = voices.find(
        (v) =>
          (v.lang && (v.lang.includes('en-IN') || v.lang.includes('en_IN'))) ||
          (v.name && v.name.toLowerCase().includes('india'))
      );

      // Ultimate fallback: any English voice
      if (!this.englishVoice) {
        this.englishVoice = voices.find((v) => v.lang && v.lang.startsWith('en')) || voices[0];
      }

      this.isVoiceReady = true;
    };

    findBestVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = findBestVoices;
    }
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
    sprite.scale.set(3.2, 1.35, 1);
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

    // Rounded rectangle
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

    // Wrap or truncate if too long
    let displayText = hindiLine;
    if (displayText.length > 28) {
      displayText = displayText.slice(0, 26) + '...';
    }
    ctx.fillText(displayText, w / 2, 78);

    this.bubbleTexture.needsUpdate = true;
  }

  /**
   * Main trigger method called when an event happens
   * @param {string} characterName - 'Raju', 'Babloo', or 'Munna'
   * @param {string} eventType - 'collision', 'overtake', 'overtaken', or 'horn'
   * @param {THREE.Object3D} targetObject - Optional 3D vehicle to pin speech bubble to
   */
  triggerDialogue(characterName, eventType, targetObject = null) {
    const now = performance.now();
    if (now - this.lastSpokenTime < this.speechCooldown) {
      return; // Respect cooldown to prevent spamming
    }

    const char = this.characters[characterName] || this.characters.Raju;
    const linePool = char.lines[eventType] || char.lines.collision;
    const dialogue = linePool[Math.floor(Math.random() * linePool.length)];

    this.lastSpokenTime = now;

    // 1. Show Top HUD Radio Chatter Banner
    this.showHUDChater(char, dialogue);

    // 2. Show 3D Floating Speech Bubble
    if (targetObject) {
      this.speechSpriteTarget = targetObject;
      this.updateSpeechBubbleTexture(char.name.split(' ')[0], dialogue.hi);
      this.speechSprite.visible = true;
      this.speechSpriteHideTime = now + 2800;
    }

    // 3. Speak audio via Web Speech API (unless muted)
    const isMuted = this.audioManager && this.audioManager.isMuted;
    if (!isMuted && this.synth) {
      this.speakDialogue(char, dialogue);
    }
  }

  showHUDChater(char, dialogue) {
    if (!this.bannerEl) {
      this.bannerEl = document.getElementById('radio-chatter-banner');
      this.speakerTagEl = document.getElementById('radio-speaker-tag');
      this.hindiTextEl = document.getElementById('radio-hindi-text');
      this.englishSubEl = document.getElementById('radio-english-sub');
      this.avatarEl = document.getElementById('radio-avatar');
    }

    if (!this.bannerEl) return;

    if (this.speakerTagEl) {
      this.speakerTagEl.textContent = char.name;
      this.speakerTagEl.style.color = char.color;
    }
    if (this.hindiTextEl) {
      this.hindiTextEl.textContent = `"${dialogue.hi}"`;
    }
    if (this.englishSubEl) {
      this.englishSubEl.textContent = dialogue.en;
    }
    if (this.avatarEl) {
      this.avatarEl.textContent = char.avatar;
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
    }, 3200);
  }

  speakDialogue(char, dialogue) {
    try {
      this.synth.cancel(); // Stop any pending speech

      // Prefer Hindi text if Hindi voice available; if only English voice available, speak English subtitle
      let textToSpeak = dialogue.hi;
      let voiceToUse = this.hindiVoice;

      if (!voiceToUse) {
        voiceToUse = this.englishVoice;
        textToSpeak = dialogue.en;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      if (voiceToUse) {
        utterance.voice = voiceToUse;
        utterance.lang = voiceToUse.lang;
      }
      utterance.pitch = char.pitch || 1.0;
      utterance.rate = char.rate || 1.1;
      utterance.volume = 0.9;

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  /**
   * Called in animation loop to pin 3D speech bubble over vehicle
   */
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


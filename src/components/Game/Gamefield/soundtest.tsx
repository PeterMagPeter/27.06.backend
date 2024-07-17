import React, { useState } from "react";
import { Howl } from "howler";

export default function TestSound() {
  const [sfxVolume, setSfxVolume] = useState(0.3);
  const hitSound = "/sounds/hitSound.mp3";

  const playSound = (soundUrl: string) => {
    const sound = new Howl({
      src: [soundUrl],
      volume: sfxVolume,
    });
    console.log("sound played", sfxVolume, soundUrl);
    sound.play();
  };

  return (
    <div>
      <h1>Sound Player</h1>
      <button onClick={() => playSound(hitSound)}>Play Hit Sound</button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={sfxVolume}
        onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
      />
    </div>
  );
}

import "./App.css";
import View from "./components/3D/View";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

// Enregistrer le plugin TextPlugin pour les animations de texte
gsap.registerPlugin(TextPlugin);

// Définir les différents contenus pour chaque shader
const SHADER_DATA = {
  turbulence: {
    title: "Turbulence Noise",
    description:
      "Procedural noise technique commonly used in landscape creation and fluid simulation.",
    specs: [
      { label: "Algorithm:", value: "Perlin-based gradient noise" },
      { label: "Complexity:", value: "O(n²)" },
      { label: "Octaves:", value: "4" },
      { label: "Engine:", value: "webgl" },
      { label: "Application:", value: "Terrain, Clouds, Water" },
    ],
  },
  perlin: {
    title: "Perlin Noise",
    description: "Classic gradient noise algorithm developed by Ken Perlin.",
    specs: [
      { label: "Algorithm:", value: "Gradient interpolation" },
      { label: "Complexity:", value: "O(n)" },
      { label: "Octaves:", value: "3" },
      { label: "Engine:", value: "webgl" },
      { label: "Application:", value: "Textures, Fire, Smoke" },
    ],
  },
};

function FuturisticText({ text, delay, className }) {
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Animation d'apparition lettre par lettre
    gsap.to(el, {
      duration: 0.5 + text.length * 0.03, // Durée proportionnelle à la longueur du texte
      text: text,
      ease: "none",
      delay: delay,
      onStart: () => {
        el.style.visibility = "visible";
      },
    });
  }, [text, delay]);

  return (
    <span ref={textRef} className={className} style={{ visibility: "hidden" }}>
      &nbsp;
    </span>
  );
}

function InfoRow({ label, value, delayLabel, delayValue }) {
  return (
    <div className="flex w-full justify-between border-b border-cyan-800/30 py-2">
      <FuturisticText
        text={label}
        delay={delayLabel}
        className="font-light text-cyan-400"
      />
      <FuturisticText
        text={value}
        delay={delayValue}
        className="font-light text-white"
      />
    </div>
  );
}

function App() {
  const dashboardRef = useRef(null);
  const [currentShader, setCurrentShader] = useState("turbulence");
  const timelineRef = useRef(null);
  const masterTimelineRef = useRef(null);

  // Fonction pour changer le shader
  const changeShaderData = (shaderType) => {
    setCurrentShader(shaderType);
  };

  useEffect(() => {
    // Animation du dashboard
    const dashboard = dashboardRef.current;
    if (!dashboard) return;

    // Initialiser le dashboard comme invisible
    gsap.set(dashboard, { opacity: 0, display: "none" });

    // Créer une timeline maître qui contrôle toute la séquence
    masterTimelineRef.current = gsap.timeline({
      repeat: -1, // Répéter indéfiniment
      repeatDelay: 0,
      onRepeat: () => {
        console.log("Master timeline répétée");
      },
    });

    // Timeline pour le premier shader (Turbulence)
    const turbulenceTimeline = gsap.timeline();

    // S'assurer que le bon shader est actif
    turbulenceTimeline.call(() => changeShaderData("turbulence"));

    // Apparition du dashboard avec Turbulence
    turbulenceTimeline.to(dashboard, { display: "block", duration: 0 });
    turbulenceTimeline.to(dashboard, {
      opacity: 1,
      x: 0,
      delay: 2.5,
      duration: 0.8,
      ease: "power3.out",
      startAt: { x: 30 },
    });

    // Maintenir visible pendant 5 secondes
    turbulenceTimeline.to(dashboard, { duration: 4.5 });

    // Pause avant le prochain shader
    // turbulenceTimeline.to({}, { duration: 1 });

    // Timeline pour le deuxième shader (Perlin)
    const perlinTimeline = gsap.timeline();

    // Changer le shader avant l'apparition
    perlinTimeline.call(() => changeShaderData("perlin"));

    // Apparition du dashboard avec Perlin
    // perlinTimeline.set(dashboard, { display: "block", x: 30, opacity: 0 });
    // perlinTimeline.to(dashboard, {
    //   opacity: 1,
    //   x: 0,
    //   duration: 0.8,
    //   ease: "power3.out",
    // });

    // Maintenir visible pendant 5 secondes
    perlinTimeline.to(dashboard, { duration: 6 });

    // Disparition du dashboard
    perlinTimeline.to(dashboard, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: "power3.in",
    });
    perlinTimeline.set(dashboard, { display: "none" });

    // Ajouter les deux timelines à la timeline maître
    masterTimelineRef.current.add(turbulenceTimeline).add(perlinTimeline);

    // Démarrer la timeline
    masterTimelineRef.current.play(0);

    return () => {
      // Nettoyer les animations à la destruction du composant
      if (masterTimelineRef.current) {
        masterTimelineRef.current.kill();
      }
    };
  }, []);

  return (
    <>
      <View />

      <div
        ref={dashboardRef}
        className="absolute right-6 bottom-6 z-10 h-[350px] w-80 rounded-lg border border-cyan-500/30 bg-black/40 p-4 backdrop-blur-md"
      >
        {/* Titre avec effet de scan */}
        <div className="mb-3 border-b border-cyan-500/50 pb-2">
          <h1 className="relative overflow-hidden text-xl font-light text-white">
            <FuturisticText
              text={SHADER_DATA[currentShader].title}
              delay={1}
              className="relative z-10"
            />
          </h1>
        </div>

        {/* Description */}
        <div className="mb-4 text-xs text-gray-300">
          <FuturisticText
            text={SHADER_DATA[currentShader].description}
            delay={1.5}
            className="leading-relaxed"
          />
        </div>

        {/* Informations techniques */}
        <div className="space-y-1 text-xs">
          {SHADER_DATA[currentShader].specs.map((spec, index) => (
            <InfoRow
              key={spec.label}
              label={spec.label}
              value={spec.value}
              delayLabel={2 + index * 0.4}
              delayValue={2.2 + index * 0.4}
            />
          ))}
        </div>

        {/* Indicateur futuriste */}
        <div className="mt-3 flex justify-end">
          <div className="flex items-center space-x-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500"></div>
            <FuturisticText
              text="System active"
              delay={4}
              className="text-xs text-cyan-400"
            />
          </div>

          {/* Bouton pour changer manuellement le shader (pour test) */}
          {/* <button
            onClick={() =>
              changeShaderData(
                currentShader === "turbulence" ? "perlin" : "turbulence",
              )
            }
            className="rounded border border-cyan-500/30 px-2 py-0.5 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/10"
          >
            Switch shader
          </button> */}
        </div>
      </div>
    </>
  );
}

export default App;

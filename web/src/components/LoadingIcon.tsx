import { motion, Variants } from "framer-motion";

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.15;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0, repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
        opacity: { delay, duration: 0.01, repeat: Infinity, repeatType: "loop", repeatDelay: 1 },
      },
    };
  },
};

const shape: React.CSSProperties = {
  strokeWidth: 8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "transparent",
};

export function LoadingIcon() {
  return (
    <motion.svg
      className="loading-icon"
      height="1em"
      width="1em"
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 480 480"
      initial="hidden"
      animate="visible"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
      <g id="SVGRepo_iconCarrier">
        <g transform="translate(0 -1020.36)">
          <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
            <motion.path custom={0} variants={draw} style={shape} stroke="var(--accent)" d="M240,1020.36c-132.454,0-240,107.547-240,240c0,132.455,107.546,240,240,240s240-107.545,240-240 C480,1127.907,372.454,1020.36,240,1020.36z" />
            <motion.path custom={1} variants={draw} style={shape} stroke="var(--text-secondary)" d="M240,1036.36c123.807,0,224,100.193,224,224c0,123.807-100.193,224-224,224s-224-100.193-224-224 C16,1136.553,116.193,1036.36,240,1036.36z" />
          </g>
          <motion.path custom={2} variants={draw} style={shape} stroke="var(--amber)" d="M27.799,1260.374C27.8,1377.569,122.805,1472.573,240,1472.573s212.2-95.004,212.201-212.199 c0-117.195-95.005-212.201-212.201-212.201c0,0,0,0,0,0C122.805,1048.172,27.799,1143.178,27.799,1260.374 C27.799,1260.374,27.799,1260.374,27.799,1260.374L27.799,1260.374z" />
          <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
            <motion.path custom={3} variants={draw} style={shape} stroke="var(--accent)" d="M240,1060.36c-110.362,0-200,89.639-200,200c0,110.363,89.638,200,200,200s200-89.637,200-200 C440,1149.999,350.362,1060.36,240,1060.36z" />
            <motion.path custom={4} variants={draw} style={shape} stroke="var(--text-secondary)" d="M240,1076.36c101.715,0,184,82.285,184,184c0,101.715-82.285,184-184,184s-184-82.285-184-184 C56,1158.645,138.285,1076.36,240,1076.36z" />
          </g>
          <motion.path custom={5} variants={draw} style={shape} stroke="var(--amber)" d="M69,1260.374c0.001,94.439,76.56,170.998,171,170.998s170.999-76.559,171-170.998 c0-94.441-76.559-171-171-171l0,0C145.559,1089.374,69,1165.932,69,1260.374L69,1260.374z" />
          <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
            <motion.path custom={6} variants={draw} style={shape} stroke="var(--accent)" d="M240,1100.36c-88.271,0-160,71.73-160,160c0,88.271,71.729,160,160,160s160-71.729,160-160 C400,1172.09,328.271,1100.36,240,1100.36z" />
            <motion.path custom={7} variants={draw} style={shape} stroke="var(--text-secondary)" d="M240,1116.36c79.624,0,144,64.377,144,144s-64.376,144-144,144s-144-64.377-144-144 C96,1180.737,160.376,1116.36,240,1116.36z" />
          </g>
          <motion.path custom={8} variants={draw} style={shape} stroke="var(--amber)" d="M104.263,1260.374c0,74.965,60.771,135.736,135.737,135.736s135.736-60.771,135.737-135.736 c0.001-74.965-60.77-135.736-135.735-135.738c-0.001,0-0.001,0-0.002,0c-74.965,0-135.737,60.771-135.737,135.736L104.263,1260.374 L104.263,1260.374z" />
          <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
            <motion.path custom={9} variants={draw} style={shape} stroke="var(--accent)" d="M240,1140.36c-66.179,0-120,53.82-120,120c0,66.18,53.821,120,120,120s120-53.82,120-120 S306.179,1140.36,240,1140.36z" />
            <motion.path custom={10} variants={draw} style={shape} stroke="var(--text-secondary)" d="M240,1156.36c57.532,0,104,46.469,104,104c0,57.533-46.468,104-104,104s-104-46.467-104-104 C136,1202.829,182.468,1156.36,240,1156.36z" />
          </g>
          <motion.path custom={11} variants={draw} style={shape} stroke="var(--amber)" d="M145.75,1260.374c0,52.053,42.197,94.25,94.25,94.25s94.25-42.197,94.25-94.25 c0.001-52.053-42.195-94.25-94.248-94.252c-0.001,0-0.001,0-0.002,0c-52.053,0-94.25,42.197-94.25,94.25L145.75,1260.374 L145.75,1260.374z" />
          <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
            <motion.path custom={12} variants={draw} style={shape} stroke="var(--accent)" d="M240,1180.36c-44.088,0-80,35.912-80,80s35.912,80,80,80s80-35.912,80-80 S284.088,1180.36,240,1180.36z" />
            <motion.path custom={13} variants={draw} style={shape} stroke="var(--text-secondary)" d="M240,1196.36c35.441,0,64,28.561,64,64c0,35.441-28.559,64-64,64s-64-28.559-64-64 C176,1224.921,204.559,1196.36,240,1196.36z" />
            <g>
              <motion.path custom={14} variants={draw} style={shape} stroke="var(--accent)" d="M315.313,1260.36L304,1271.672l36.688,36.686L352,1297.046l-36.688-36.688V1260.36z" />
              <motion.path custom={15} variants={draw} style={shape} stroke="var(--accent)" d="M323.313,1332.36L312,1343.674l28.688,28.686L352,1361.047L323.313,1332.36z" />
              <motion.path custom={16} variants={draw} style={shape} stroke="var(--accent)" d="M307.313,1396.36L296,1407.674l28.688,28.686L336,1425.047L307.313,1396.36z" />
              <motion.path custom={17} variants={draw} style={shape} stroke="var(--accent)" d="M291.313,1444.36L280,1455.674l28.688,28.686L320,1473.047L291.313,1444.36z" />
            </g>
          </g>
          <motion.path custom={18} variants={draw} style={shape} stroke="var(--green)" d="M188.506,1260.374c0.001,28.439,23.055,51.492,51.494,51.492s51.493-23.053,51.494-51.492 c0-28.439-23.054-51.494-51.494-51.494c0,0,0,0,0,0C211.561,1208.88,188.506,1231.934,188.506,1260.374L188.506,1260.374 L188.506,1260.374z" />
        </g>
      </g>
    </motion.svg>
  );
}

import { motion } from "framer-motion";
import classNames from "classnames";
import { teamNameToImageSlug } from "../lib/teamImageUtils";

export function SelectedDriverLockup({ driver, index = 0 }) {
  const baseDelay = 0.15 + index * 0.12;

  const fullName = driver.fullName || "";
  const parts = fullName.split(" ");
  const lastName = parts.pop() || "";
  const firstName = parts.join(" ");

  return (
    <motion.div
      className={classNames("flex flex-col items-center mt-2 -mb-9")}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.1 },
        },
      }}
    >
      {/* Driver rises up from the car */}
      <motion.img
        src={driver.headshot_url}
        alt={driver.fullName}
        className="h-24 sm:h-32 -mb-8"
        variants={{
          hidden: { y: 32, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 150,
              damping: 20,
              delay: baseDelay + 0.15,
            },
          },
        }}
      />

      {/* Car slides in from the left */}
      <motion.img
        src={`/cars/2026/cars/${teamNameToImageSlug(driver.team)}.png`}
        alt={driver.team}
        className="h-16 -mb-4 z-10"
        variants={{
          hidden: { x: -80, opacity: 0 },
          visible: {
            x: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 140,
              damping: 18,
              delay: baseDelay,
            },
          },
        }}
      />
      
      {/* Name drops down from the car */}
      <motion.div
        className="flex flex-col items-center mt-2"
        variants={{
          hidden: { y: -20, opacity: 0 },
          visible: {
            y: 0,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 150,
              damping: 18,
              delay: baseDelay + 0.28,
            },
          },
        }}
      >
        <p className="text-sm font-light tracking-[6px] leading-none">{firstName}</p>
        <p className="text-2xl leading-none font-display">{lastName}</p>
      </motion.div>
    </motion.div>
  );
}


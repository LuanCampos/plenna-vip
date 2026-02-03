import { Variants, Transition } from 'framer-motion';

/**
 * Common motion props for components that fade in from bottom
 * Use with: <motion.div {...motionFadeInUp} />
 */
export const motionFadeInUp = {
  initial: 'hidden' as const,
  animate: 'visible' as const,
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  } satisfies Variants,
};

/**
 * Fade in from bottom - for use with variants prop
 */
export const fadeInUp: Variants = motionFadeInUp.variants;

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Scale in - ideal for modals and dialogs
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Container for staggered children animations
 * Use with listItem for child elements
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

/**
 * List item animation - use as child of staggerContainer
 */
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Button press animation for tactile feedback
 * Use with: <motion.button whileTap={buttonTap} />
 */
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

/**
 * Spring configuration for natural-feeling interactions
 * Use with: <motion.div transition={springConfig} />
 */
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

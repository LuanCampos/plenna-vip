import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { motionFadeInUp } from '@/lib/motion';

interface MotionDivProps extends HTMLMotionProps<'div'> {
  /** Delay before animation starts (in seconds) */
  delay?: number;
}

/**
 * Animated div wrapper with fade-in-up animation.
 * Supports all motion.div props and ref forwarding.
 */
export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      {...motionFadeInUp}
      transition={{ delay }}
      {...props}
    />
  )
);

MotionDiv.displayName = 'MotionDiv';

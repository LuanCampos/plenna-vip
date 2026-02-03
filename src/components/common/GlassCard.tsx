import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motionFadeInUp } from '@/lib/motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  /** Enable hover lift effect. Default: true */
  hover?: boolean;
}

/**
 * Card with glassmorphism effect and optional hover animation.
 * Supports all motion.div props and ref forwarding.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = true, children, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'glass rounded-xl p-4',
        hover && 'hover-lift cursor-pointer',
        className
      )}
      {...motionFadeInUp}
      {...props}
    >
      {children}
    </motion.div>
  )
);

GlassCard.displayName = 'GlassCard';

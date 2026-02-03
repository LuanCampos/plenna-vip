import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { staggerContainer, listItem } from '@/lib/motion';

type MotionListProps = HTMLMotionProps<'div'>;

/**
 * Container for staggered list animations.
 * Use with MotionListItem for animated children.
 */
export const MotionList = forwardRef<HTMLDivElement, MotionListProps>(
  (props, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      {...props}
    />
  )
);

MotionList.displayName = 'MotionList';

type MotionListItemProps = HTMLMotionProps<'div'>;

/**
 * Animated list item - use as child of MotionList.
 */
export const MotionListItem = forwardRef<HTMLDivElement, MotionListItemProps>(
  (props, ref) => (
    <motion.div ref={ref} variants={listItem} {...props} />
  )
);

MotionListItem.displayName = 'MotionListItem';

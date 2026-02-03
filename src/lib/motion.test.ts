import { describe, it, expect } from 'vitest';
import {
  motionFadeInUp,
  fadeInUp,
  fadeInLeft,
  scaleIn,
  staggerContainer,
  listItem,
  buttonTap,
  springConfig,
} from './motion';

describe('motion', () => {
  describe('motionFadeInUp', () => {
    it('should have correct initial and animate values', () => {
      expect(motionFadeInUp.initial).toBe('hidden');
      expect(motionFadeInUp.animate).toBe('visible');
    });

    it('should have hidden variant with opacity 0 and y offset', () => {
      expect(motionFadeInUp.variants.hidden).toEqual({ opacity: 0, y: 20 });
    });

    it('should have visible variant with opacity 1 and y 0', () => {
      expect(motionFadeInUp.variants.visible).toMatchObject({ opacity: 1, y: 0 });
    });

    it('should have transition in visible variant', () => {
      expect(motionFadeInUp.variants.visible).toHaveProperty('transition');
    });
  });

  describe('fadeInUp', () => {
    it('should be equal to motionFadeInUp.variants', () => {
      expect(fadeInUp).toBe(motionFadeInUp.variants);
    });
  });

  describe('fadeInLeft', () => {
    it('should have hidden variant with opacity 0 and x offset', () => {
      expect(fadeInLeft.hidden).toEqual({ opacity: 0, x: -20 });
    });

    it('should have visible variant with opacity 1 and x 0', () => {
      expect(fadeInLeft.visible).toMatchObject({ opacity: 1, x: 0 });
    });
  });

  describe('scaleIn', () => {
    it('should have hidden variant with opacity 0 and scale < 1', () => {
      expect(scaleIn.hidden).toEqual({ opacity: 0, scale: 0.95 });
    });

    it('should have visible variant with opacity 1 and scale 1', () => {
      expect(scaleIn.visible).toMatchObject({ opacity: 1, scale: 1 });
    });

    it('should have exit variant for AnimatePresence', () => {
      expect(scaleIn.exit).toEqual({
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.15, ease: 'easeIn' },
      });
    });
  });

  describe('staggerContainer', () => {
    it('should have hidden variant with opacity 0', () => {
      expect(staggerContainer.hidden).toEqual({ opacity: 0 });
    });

    it('should have visible variant with staggerChildren', () => {
      expect(staggerContainer.visible).toMatchObject({ opacity: 1 });
      expect(staggerContainer.visible).toHaveProperty('transition');
      const transition = (staggerContainer.visible as { transition: { staggerChildren: number } }).transition;
      expect(transition.staggerChildren).toBe(0.05);
    });
  });

  describe('listItem', () => {
    it('should have hidden variant with opacity 0 and x offset', () => {
      expect(listItem.hidden).toEqual({ opacity: 0, x: -10 });
    });

    it('should have visible variant with opacity 1 and x 0', () => {
      expect(listItem.visible).toMatchObject({ opacity: 1, x: 0 });
    });
  });

  describe('buttonTap', () => {
    it('should have scale less than 1 for press effect', () => {
      expect(buttonTap.scale).toBe(0.97);
    });

    it('should have transition with duration', () => {
      expect(buttonTap.transition).toEqual({ duration: 0.1 });
    });
  });

  describe('springConfig', () => {
    it('should have type spring', () => {
      expect(springConfig.type).toBe('spring');
    });

    it('should have stiffness and damping', () => {
      expect(springConfig.stiffness).toBe(400);
      expect(springConfig.damping).toBe(25);
    });
  });
});

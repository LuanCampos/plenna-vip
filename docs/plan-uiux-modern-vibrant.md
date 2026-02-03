# 📋 Plano de UI/UX — Modern Vibrant

> **Papel:** [Planejador]  
> **Data:** 02/02/2026  
> **Status:** ✅ APROVADO — Implementar junto ao MVP

---

## 1. Objetivo

Implementar uma UI moderna, vibrante e com micro-interações ricas, seguindo tendências de 2026 (glassmorphism, gradientes, animações fluidas).

---

## 2. Dependências NPM

```bash
npm install framer-motion
npm install @radix-ui/react-slot
```

---

## 3. Paleta de Cores Expandida

### 3.1 Atualizar `src/index.css`

```css
:root {
  /* Core */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Cards com transparência */
  --card: 0 0% 100%;
  --card-glass: 0 0% 100% / 0.8;
  --card-foreground: 222.2 84% 4.9%;
  
  /* Primary com gradiente */
  --primary: 262 83% 58%;
  --primary-hover: 262 83% 52%;
  --primary-foreground: 210 40% 98%;
  --primary-gradient-from: 262 83% 58%;
  --primary-gradient-to: 280 70% 50%;
  
  /* Accent quente (rosa) */
  --accent-warm: 340 82% 52%;
  --accent-warm-foreground: 210 40% 98%;
  
  /* Success/Warning/Info */
  --success: 142 76% 36%;
  --success-foreground: 210 40% 98%;
  --warning: 38 92% 50%;
  --warning-foreground: 222.2 84% 4.9%;
  --info: 199 89% 48%;
  --info-foreground: 210 40% 98%;
  
  /* Existentes (manter) */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 262 83% 58%;
  --radius: 0.75rem; /* Aumentar de 0.5rem */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  
  --card: 222.2 84% 6%;
  --card-glass: 222.2 84% 6% / 0.8;
  --card-foreground: 210 40% 98%;
  
  --primary: 263 70% 55%;
  --primary-hover: 263 70% 60%;
  --primary-gradient-from: 263 70% 55%;
  --primary-gradient-to: 280 60% 60%;
  
  --accent-warm: 340 75% 55%;
  
  --success: 142 70% 45%;
  --warning: 38 90% 55%;
  --info: 199 85% 55%;
  
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --destructive: 0 62.8% 40%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 20%;
  --input: 217.2 32.6% 17.5%;
  --ring: 263 70% 55%;
}
```

### 3.2 Atualizar `tailwind.config.ts`

Adicionar cores:

```typescript
colors: {
  // ... existentes ...
  'accent-warm': {
    DEFAULT: 'hsl(var(--accent-warm))',
    foreground: 'hsl(var(--accent-warm-foreground))',
  },
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))',
  },
  warning: {
    DEFAULT: 'hsl(var(--warning))',
    foreground: 'hsl(var(--warning-foreground))',
  },
  info: {
    DEFAULT: 'hsl(var(--info))',
    foreground: 'hsl(var(--info-foreground))',
  },
},
```

---

## 4. Classes Utilitárias (adicionar ao index.css)

```css
@layer utilities {
  /* Glassmorphism */
  .glass {
    @apply bg-card/80 backdrop-blur-xl border border-border/50;
  }
  
  .glass-strong {
    @apply bg-card/90 backdrop-blur-2xl border border-border/30;
  }
  
  /* Gradientes */
  .gradient-primary {
    background: linear-gradient(
      135deg,
      hsl(var(--primary-gradient-from)),
      hsl(var(--primary-gradient-to))
    );
  }
  
  .gradient-primary-text {
    background: linear-gradient(
      135deg,
      hsl(var(--primary-gradient-from)),
      hsl(var(--primary-gradient-to))
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Sombras coloridas */
  .shadow-primary {
    box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.3);
  }
  
  .shadow-primary-lg {
    box-shadow: 0 12px 32px -8px hsl(var(--primary) / 0.4);
  }
  
  /* Hover elevation */
  .hover-lift {
    @apply transition-all duration-200;
  }
  .hover-lift:hover {
    @apply -translate-y-0.5 shadow-lg;
  }
  
  /* Focus ring moderno */
  .focus-ring {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }
  
  /* Shimmer loading */
  .shimmer {
    background: linear-gradient(
      90deg,
      hsl(var(--muted)) 0%,
      hsl(var(--muted-foreground) / 0.1) 50%,
      hsl(var(--muted)) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
}
```

---

## 5. Componentes de Animação

### 5.1 Criar `src/lib/motion.ts`

```typescript
import { Variants } from 'framer-motion';

// Fade in from bottom
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Scale in (para modais)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.15, ease: 'easeIn' }
  },
};

// Stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  },
};

// List item
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
};

// Button press
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1 }
};

// Spring config para interações
export const springConfig = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};
```

### 5.2 Criar `src/components/common/MotionDiv.tsx`

```tsx
import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { fadeInUp } from '@/lib/motion';

interface MotionDivProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export const MotionDiv = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ delay = 0, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ delay }}
      {...props}
    />
  )
);

MotionDiv.displayName = 'MotionDiv';
```

### 5.3 Criar `src/components/common/MotionList.tsx`

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerContainer, listItem } from '@/lib/motion';

interface MotionListProps {
  children: ReactNode;
  className?: string;
}

export const MotionList = ({ children, className }: MotionListProps) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={staggerContainer}
  >
    {children}
  </motion.div>
);

interface MotionListItemProps {
  children: ReactNode;
  className?: string;
}

export const MotionListItem = ({ children, className }: MotionListItemProps) => (
  <motion.div className={className} variants={listItem}>
    {children}
  </motion.div>
);
```

---

## 6. Componentes UI Atualizados

### 6.1 Atualizar `src/components/ui/button.tsx`

Adicionar variantes e animação:

```tsx
import { motion } from 'framer-motion';
import { buttonTap } from '@/lib/motion';

// Na definição de variants:
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'gradient-primary text-primary-foreground shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glow: 'gradient-primary text-primary-foreground shadow-primary-lg animate-pulse',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
  }
);

// Usar motion.button com whileTap
<motion.button whileTap={buttonTap} ... />
```

### 6.2 Criar `src/components/ui/skeleton.tsx`

```tsx
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('rounded-lg bg-muted shimmer', className)} />
);

export const SkeletonCard = () => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);
```

### 6.3 Criar `src/components/common/EmptyState.tsx`

```tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { fadeInUp } from '@/lib/motion';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => (
  <motion.div
    className="flex flex-col items-center justify-center py-12 px-4 text-center"
    initial="hidden"
    animate="visible"
    variants={fadeInUp}
  >
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </motion.div>
);
```

### 6.4 Criar `src/components/common/GlassCard.tsx`

```tsx
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
}

export const GlassCard = ({ 
  className, 
  hover = true, 
  children,
  ...props 
}: GlassCardProps) => (
  <motion.div
    className={cn(
      'glass rounded-xl p-4',
      hover && 'hover-lift cursor-pointer',
      className
    )}
    initial="hidden"
    animate="visible"
    variants={fadeInUp}
    {...props}
  >
    {children}
  </motion.div>
);
```

---

## 7. Atualização do Dialog

### 7.1 Atualizar padrão de Dialog

```tsx
// Wrapper com AnimatePresence + motion
<Dialog open={open} onOpenChange={onOpenChange}>
  <AnimatePresence>
    {open && (
      <DialogContent asChild>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong rounded-2xl p-0 max-h-[90vh] overflow-hidden"
        >
          {/* conteúdo */}
        </motion.div>
      </DialogContent>
    )}
  </AnimatePresence>
</Dialog>
```

---

## 8. Arquivos a Criar/Alterar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/index.css` | ALTERAR | Novas variáveis CSS + utilitários |
| `tailwind.config.ts` | ALTERAR | Novas cores |
| `src/lib/motion.ts` | **CRIAR** | Variants do Framer Motion |
| `src/components/common/MotionDiv.tsx` | **CRIAR** | Wrapper animado |
| `src/components/common/MotionList.tsx` | **CRIAR** | Lista animada |
| `src/components/common/EmptyState.tsx` | **CRIAR** | Estado vazio ilustrado |
| `src/components/common/GlassCard.tsx` | **CRIAR** | Card glassmorphism |
| `src/components/ui/skeleton.tsx` | **CRIAR** | Loading skeletons |
| `src/components/ui/button.tsx` | ALTERAR | Gradiente + motion |

---

## 9. Padrões de Uso

### Cards de Listagem

```tsx
<MotionList className="space-y-3">
  {items.map((item) => (
    <MotionListItem key={item.id}>
      <GlassCard>
        {/* conteúdo */}
      </GlassCard>
    </MotionListItem>
  ))}
</MotionList>
```

### Loading State

```tsx
{isLoading ? (
  <SkeletonList count={5} />
) : items.length === 0 ? (
  <EmptyState
    icon={Calendar}
    title={t('noAppointments')}
    description={t('noAppointmentsDesc')}
    actionLabel={t('createAppointment')}
    onAction={openCreateDialog}
  />
) : (
  <MotionList>...</MotionList>
)}
```

### Botões Primários

```tsx
<Button size="lg" className="shadow-primary">
  {t('save')}
</Button>
```

---

## 10. Critérios de Conclusão

- [ ] Cores CSS atualizadas
- [ ] Tailwind config atualizado
- [ ] Framer Motion instalado e funcionando
- [ ] Skeleton loading em todas as listas
- [ ] Empty states em todas as páginas
- [ ] Glassmorphism nos cards principais
- [ ] Animações de entrada em listas
- [ ] Botões com gradiente e shadow
- [ ] `npm run build` sem erros

---

## 11. Integração com MVP

Este plano deve ser executado **junto com a Fase 1** do MVP:

1. Infraestrutura básica
2. **UI/UX Modern Vibrant** ← Este plano
3. CRUD Principal (já usando novos componentes)

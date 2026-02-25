/**
 * MD3 primitives — color/elevation based, no outline borders on containers.
 * Borders are reserved only for interactive inputs (text fields, checkboxes).
 */
import React from 'react';

// ─── Icon (Material Symbols) ──────────────────────────────────────────────────
interface IconProps { name: string; size?: number; className?: string; filled?: boolean }
export function Icon({ name, size = 20, className = '', filled = false }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: string;
  children: React.ReactNode;
}

const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-label-lg font-semibold tracking-wide transition-all duration-150 focus-visible:outline-2 focus-visible:outline-primary';

const buttonVariants: Record<ButtonVariant, string> = {
  filled:   'bg-primary text-primary-on disabled:bg-surface-on/12 disabled:text-surface-on/38',
  tonal:    'bg-secondary-container text-secondary-on-container disabled:bg-surface-on/12',
  outlined: 'border border-outline text-primary hover:bg-primary/8 active:bg-primary/12 disabled:border-surface-on/12 disabled:text-surface-on/38',
  text:     'text-primary hover:bg-primary/8 active:bg-primary/12 disabled:text-surface-on/38 px-3',
};

export function Button({ variant = 'filled', icon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`${buttonBase} ${buttonVariants[variant]} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

// ─── IconButton ───────────────────────────────────────────────────────────────
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string; label: string; filled?: boolean;
}
export function IconButton({ icon, label, filled = false, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-surface-on transition-colors hover:bg-surface-on/8 active:bg-surface-on/12 ${className}`}
      {...props}
    >
      <Icon name={icon} size={24} filled={filled} />
    </button>
  );
}

// ─── Card — elevation via surface-container + optional shadow, NO border ──────
type CardVariant = 'elevated' | 'filled' | 'tonal';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> { variant?: CardVariant }

const cardVariants: Record<CardVariant, string> = {
  elevated: 'bg-surface-container-low',
  filled:   'bg-surface-container',
  tonal:    'bg-surface-container-high',
};

export function Card({ variant = 'elevated', className = '', children, ...props }: CardProps) {
  return (
    <div className={`rounded-xl transition-colors duration-200 ${cardVariants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

// ─── FilterChip — selected state uses secondary container ────────────────────
interface FilterChipProps { label: string; selected?: boolean; icon?: string; onClick?: () => void; count?: number }
export function FilterChip({ label, selected = false, icon, onClick, count }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-label-lg transition-colors
        ${selected
          ? 'bg-secondary-container text-secondary-on-container'
          : 'bg-surface-container-high text-surface-on hover:bg-surface-container-highest'
        }
      `}
    >
      {selected && <Icon name="check" size={18} />}
      {!selected && icon && <Icon name={icon} size={18} className="text-surface-on-variant" />}
      {label}
      {count !== undefined && count > 0 && (
        <span className={`text-label-sm ${selected ? 'text-secondary-on-container' : 'text-surface-on-variant'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── LinearProgress ───────────────────────────────────────────────────────────
interface LinearProgressProps { value: number; className?: string }
export function LinearProgress({ value, className = '' }: LinearProgressProps) {
  return (
    <div className={`h-1 w-full overflow-hidden rounded-full bg-secondary-container ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Divider — use sparingly; prefer color differentiation ───────────────────
export function Divider({ className = '' }: { className?: string }) {
  return <div className={`h-px bg-surface-container-highest ${className}`} />;
}

// ─── Status chip ─────────────────────────────────────────────────────────────
interface StatusChipProps { label: string; color: 'green' | 'red' | 'blue' | 'gray' }
export function StatusChip({ label, color }: StatusChipProps) {
  const colors = {
    green: 'bg-green-50 text-green-700',
    red:   'bg-red-50 text-red-700',
    blue:  'bg-primary-container text-primary-on-container',
    gray:  'bg-surface-container-high text-surface-on-variant',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}

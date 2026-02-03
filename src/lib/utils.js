import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}



export const isIframe = typeof window !== 'undefined' && window.self !== window.top;

export const getCulturaIcon = (nome) => {
  if (!nome) return '🌱';
  const n = nome.toLowerCase();
  if (n.includes('milho')) return '🌽';
  if (n.includes('soja')) return '🌱';
  if (n.includes('trigo')) return '🌾';
  if (n.includes('feijão') || n.includes('feijao')) return '🫘';
  if (n.includes('algodão') || n.includes('algodao')) return '☁️';
  if (n.includes('café') || n.includes('cafe')) return '☕';
  if (n.includes('batata')) return '🥔';
  if (n.includes('tomate')) return '🍅';
  if (n.includes('uva')) return '🍇';
  if (n.includes('cana')) return '🎋';
  return '🌱';
};

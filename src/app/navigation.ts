import { Backpack, ChartNoAxesCombined, Home, Map, Tent } from 'lucide-react';

export const navigation = [
  { id: 'adventure', label: 'My adventure', icon: Map },
  { id: 'practice', label: 'Practice camp', icon: Tent },
  { id: 'clubhouse', label: 'My clubhouse', icon: Home },
  { id: 'backpack', label: 'My backpack', icon: Backpack },
  { id: 'progress', label: 'My progress', icon: ChartNoAxesCombined },
] as const;

export type Page = (typeof navigation)[number]['id'];

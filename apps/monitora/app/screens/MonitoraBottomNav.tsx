import { BottomNavBar, type BottomNavItem } from '@camino/ui';
import type { MonitoraNavTab } from '../../src/features/profile/monitora-session';

const MONITORA_NAV_ITEMS: ReadonlyArray<BottomNavItem<MonitoraNavTab>> = [
  { id: 'inicio', label: 'Inicio', icon: 'house' },
  { id: 'ruta', label: 'Ruta', icon: 'route' },
  { id: 'perfil', label: 'Perfil', icon: 'user-round' },
];

export type MonitoraBottomNavProps = {
  activeTab: MonitoraNavTab;
  onSelectTab: (tab: MonitoraNavTab) => void;
};

export function MonitoraBottomNav({
  activeTab,
  onSelectTab,
}: MonitoraBottomNavProps) {
  return (
    <BottomNavBar
      activeId={activeTab}
      items={MONITORA_NAV_ITEMS}
      onSelect={onSelectTab}
      testID="monitora-bottom-nav"
    />
  );
}

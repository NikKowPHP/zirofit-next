"use client";
import { Button } from '@/components/ui/Button';
import { MapIcon, ListBulletIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';

interface ViewToggleButtonProps {
  view: 'list' | 'map';
  setView: (view: 'list' | 'map') => void;
}

export default function ViewToggleButton({ view, setView }: ViewToggleButtonProps) {
  const t = useTranslations('TrainersPage');
  const isListView = view === 'list';
  
  const toggleView = () => {
    setView(isListView ? 'map' : 'list');
  };

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <Button onClick={toggleView} className="shadow-lg" size="md">
        {isListView ? (
          <>
            <MapIcon className="h-5 w-5 mr-2" />
            <span>{t('mapView')}</span>
          </>
        ) : (
          <>
            <ListBulletIcon className="h-5 w-5 mr-2" />
            <span>{t('listView')}</span>
          </>
        )}
      </Button>
    </div>
  );
}
import React from 'react'

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  colors: {
    primary: string;
    on_surface_variant: string;
    outline_variant: string;
  };
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  colors
}) => {
  return (
    <div className="flex border-b mb-20" style={{ borderColor: colors.outline_variant }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === tab.id ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === tab.id ? colors.primary : colors.on_surface_variant,
            borderColor: activeTab === tab.id ? colors.primary : 'transparent'
          }}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs 
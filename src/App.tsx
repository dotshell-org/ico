// import React
import { useState } from 'react';

// import NavBar components
import NavBar from "./components/nav/NavBar";
import { Tabs } from './types/Tabs';

// import accounting pages
import Dashboard from './pages/accounting/Dashboard';
import Entry from './pages/accounting/Entry';
import Outflow from './pages/accounting/Outflow';

function App() {
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.AccountingDashboard);

  const renderContent = () => {
    if (selectedTab == Tabs.AccountingDashboard) {
      return <Dashboard />;
    } else if (selectedTab == Tabs.AccountingEntry) {
      return <Entry />;
    } else if (selectedTab == Tabs.AccountingOutflow) {
      return <Outflow />;
    }
  };

  return (
    <>
      <NavBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <div className="absolute top-16 bottom-0 left-0 right-0 p-10">
        {renderContent()}
      </div>
    </>
  );
}

export default App;
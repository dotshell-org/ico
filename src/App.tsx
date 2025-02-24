import { useMemo, useState } from 'react';
import { useMediaQuery, createTheme, ThemeProvider } from '@mui/material';
import NavBar from "./components/nav/NavBar";
import { Tabs } from './types/Tabs';
import Dashboard from './pages/accounting/Dashboard';
import DebitSummary from './pages/accounting/DebitSummary';
import CreditSummary from './pages/accounting/CreditSummary';
import DetailedCredits from "./pages/accounting/DetailedCredits.tsx";
import Invoices from "./pages/accounting/Invoices.tsx";

function App() {
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.AccountingDashboard);

  // Vérifier si l'utilisateur préfère le mode sombre
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Créer le thème dynamiquement en fonction de la préférence
  const theme = useMemo(() =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          text: {
            primary: prefersDarkMode ? '#ffffff' : '#000000',
          },
        },
      }), [prefersDarkMode]);

  const renderContent = () => {
    switch (selectedTab) {
    case Tabs.AccountingDashboard:
        return <Dashboard />;
    case Tabs.AccountingCredit:
        return <CreditSummary />;
    case Tabs.AccountingDebit:
        return <DebitSummary />;
    case Tabs.AccountingDetailedCredits:
        return <DetailedCredits />;
    case Tabs.AccountingInvoices:
        return <Invoices />;
    default:
        return null;
    }
  };

  return (
      <ThemeProvider theme={theme}>
        <NavBar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <div className="absolute top-16 bottom-0 left-0 right-0 p-10">
          {renderContent()}
        </div>
      </ThemeProvider>
  );
}

export default App;
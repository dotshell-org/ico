import { useMemo, useState } from 'react';
import { useMediaQuery, createTheme, ThemeProvider } from '@mui/material';
import NavBar from "./components/nav/NavBar";
import { Tabs } from './types/nav/Tabs.ts';
import AccountingDashboard from './pages/accounting/AccountingDashboard.tsx';
import DebitSummary from './pages/accounting/DebitSummary';
import CreditSummary from './pages/accounting/CreditSummary';
import DetailedCredits from "./pages/accounting/DetailedCredits.tsx";
import Invoices from "./pages/accounting/Invoices.tsx";
import CreditEditor from "./components/accounting/detailed-credits/CreditEditor.tsx";
import {Credit} from "./types/accounting/detailed-credits/Credit.ts";
import FranceInvoiceEditor from "./components/accounting/invoices/invoice-editors/FranceInvoiceEditor.tsx";
import {Invoice} from "./types/accounting/invoices/Invoice.ts";
import {Country} from "./types/Country.ts";
import DefaultInvoiceEditor from "./components/accounting/invoices/invoice-editors/DefaultInvoiceEditor.tsx";
import {TaxType} from "./types/accounting/invoices/TaxType.ts";
import StockDashboard from "./pages/stock/StockDashboard.tsx";
import StockMovementsSummary from "./pages/stock/StockMovementsSummary.tsx";

function App() {
    const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.AccountingDashboard);
    const [creditInEditor, setCreditInEditor] = useState<Credit>({
        id: 0,
        title: "",
        date: "2000-00-00",
        tableIds: [],
        types: [],
        totalAmount: 0,
        category: ""
    });
    const [invoiceInEditor, setInvoiceInEditor] = useState<Invoice>({
        id: 0,
        title: "",
        issueDate: "2000-00-00",
        saleServiceDate: "2000-00-00",
        totalAmount: 0,
        category: "",
        countryCode: 0,
    });

    // Check if user prefers dark mode
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    // Create theme dynamically based on preference
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
                return <AccountingDashboard/>;
            case Tabs.AccountingCredit:
                return <CreditSummary/>;
            case Tabs.AccountingDebit:
                return <DebitSummary/>;
            case Tabs.AccountingDetailedCredits:
                return <DetailedCredits handleCreditMiniatureRowClicked={(credit: Credit) => {
                    setCreditInEditor(credit);
                    setSelectedTab(Tabs.AccountingCreditEditor);
                }}/>;
            case Tabs.AccountingCreditEditor:
                return <CreditEditor credit={creditInEditor}/>;
            case Tabs.AccountingInvoices:
                return <Invoices handleInvoiceMiniatureRowClicked={(invoice: Invoice) => {
                    setInvoiceInEditor(invoice);
                    setSelectedTab(Tabs.AccountingInvoiceEditor);
                }}/>;
            case Tabs.AccountingInvoiceEditor:
                if (invoiceInEditor.countryCode == Country.None) {
                    return <DefaultInvoiceEditor invoice={invoiceInEditor} taxType={TaxType.None} />;
                } else if (invoiceInEditor.countryCode == Country.France) {
                    return <FranceInvoiceEditor invoice={invoiceInEditor }/>;
                }
                return <h1>{invoiceInEditor.countryCode}</h1>;

            case Tabs.StockDashboard:
                return <StockDashboard />

            case Tabs.StockMovements:
                return <StockMovementsSummary />

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
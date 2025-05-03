import { useEffect, useState } from "react";
import { t } from "i18next";
import { AccountInfo } from "../../backend/account-manager";
import { format } from "date-fns";
import { changeLanguage } from "../../i18n";
import i18n from "i18next";

const Settings: React.FC = () => {
    const [accounts, setAccounts] = useState<AccountInfo[]>([]);
    const [currentAccount, setCurrentAccount] = useState<AccountInfo | null>(null);
    const [newAccountName, setNewAccountName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const accounts = await (window as any).ipcRenderer.invoke("getAccounts");
            const current = await (window as any).ipcRenderer.invoke("getCurrentAccount");
            setAccounts(accounts);
            setCurrentAccount(current);
        } catch (err: any) {
            setError(err.message || "Failed to load accounts");
        }
    };

    const handleCreateAccount = async () => {
        if (!newAccountName.trim()) {
            setError("Account name cannot be empty");
            return;
        }

        try {
            await (window as any).ipcRenderer.invoke("createAccount", newAccountName);
            setNewAccountName("");
            setIsCreating(false);
            await loadAccounts();
        } catch (err: any) {
            setError(err.message || "Failed to create account");
        }
    };

    const handleSwitchAccount = async (id: string) => {
        if (id === currentAccount?.id) {
            return; // Already selected
        }

        try {
            await (window as any).ipcRenderer.invoke("switchAccount", id);
            // The app will relaunch automatically
        } catch (err: any) {
            setError(err.message || "Failed to switch account");
        }
    };

    const handleDeleteAccount = async (id: string) => {
        // Confirm deletion
        if (!window.confirm(t("confirm_delete_account"))) {
            return;
        }

        try {
            await (window as any).ipcRenderer.invoke("deleteAccount", id);
            await loadAccounts();
        } catch (err: any) {
            setError(err.message || "Failed to delete account");
        }
    };

    const handleChangeLanguage = async (language: string) => {
        try {
            const success = await changeLanguage(language);
            if (success) {
                setCurrentLanguage(language);
            }
        } catch (err: any) {
            setError(err.message || "Failed to change language");
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, "PPP");
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className="pb-10">
            <h1 className="text-3xl font-bold mt-2">{"⚙️ " + t("settings")}</h1>
            
            <div className="mt-8">
                <h2 className="text-2xl font-bold">{"💼 " + t("account_management")}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">{t("account_management_description")}</p>
                
                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                        <p>{error}</p>
                        <button 
                            className="text-red-700 dark:text-red-300 font-bold ml-2 underline"
                            onClick={() => setError(null)}
                        >
                            {t("dismiss")}
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4">{t("current_account")}</h3>
                    
                    {currentAccount && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 mb-4">
                            <div className="flex items-center">
                                <div className="text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold">{currentAccount.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {t("last_accessed")}: {formatDate(currentAccount.lastAccessedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <h3 className="text-lg font-semibold mb-4">{t("available_accounts")}</h3>
                    
                    {accounts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">{t("no_accounts")}</p>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <div 
                                    key={account.id}
                                    className={`border rounded-md p-3 flex justify-between items-center transition-colors
                                        ${account.id === currentAccount?.id 
                                            ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                >
                                    <div>
                                        <h4 className="font-medium">
                                            {account.name}
                                            {account.isDefault && (
                                                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded">
                                                    {t("default")}
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {t("created")}: {formatDate(account.createdAt)}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {account.id !== currentAccount?.id && (
                                            <button
                                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                                onClick={() => handleSwitchAccount(account.id)}
                                            >
                                                {t("switch_to")}
                                            </button>
                                        )}
                                        {!account.isDefault && (
                                            <button
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                                onClick={() => handleDeleteAccount(account.id)}
                                            >
                                                {t("delete")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {isCreating ? (
                        <div className="mt-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <h4 className="font-medium mb-2">{t("create_new_account")}</h4>
                            <input
                                type="text"
                                className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:border-gray-600"
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                placeholder={t("account_name_placeholder")}
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <button
                                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                    onClick={handleCreateAccount}
                                >
                                    {t("create")}
                                </button>
                                <button
                                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors"
                                    onClick={() => setIsCreating(false)}
                                >
                                    {t("cancel")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors flex items-center"
                            onClick={() => setIsCreating(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t("new_account")}
                        </button>
                    )}
                </div>

                {/* Language Management Section */}
                <h2 className="text-2xl font-bold mt-10">{"🌐 " + t("language_management")}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">{t("language_management_description")}</p>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">{t("current_language")}</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 mb-4">
                        <div className="flex items-center">
                            <div className="text-blue-500 dark:text-blue-400 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold">
                                    {currentLanguage === 'fr' ? t("french") : t("english")}
                                </h4>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold mb-4">{t("available_languages")}</h3>
                    <div className="space-y-3">
                        {/* English Language Option */}
                        <div 
                            className={`border rounded-md p-3 flex justify-between items-center transition-colors
                                ${currentLanguage === 'en' 
                                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex items-center">
                                <span className="text-xl mr-3">🇬🇧</span>
                                <h4 className="font-medium">
                                    {t("english")}
                                </h4>
                            </div>
                            {currentLanguage !== 'en' && (
                                <button
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                    onClick={() => handleChangeLanguage('en')}
                                >
                                    {t("use_language")}
                                </button>
                            )}
                        </div>

                        {/* French Language Option */}
                        <div 
                            className={`border rounded-md p-3 flex justify-between items-center transition-colors
                                ${currentLanguage === 'fr' 
                                    ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex items-center">
                                <span className="text-xl mr-3">🇫🇷</span>
                                <h4 className="font-medium">
                                    {t("french")}
                                </h4>
                            </div>
                            {currentLanguage !== 'fr' && (
                                <button
                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                                    onClick={() => handleChangeLanguage('fr')}
                                >
                                    {t("use_language")}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
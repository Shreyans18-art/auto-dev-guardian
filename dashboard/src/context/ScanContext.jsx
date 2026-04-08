import { createContext, useContext, useState } from 'react';

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [scanTarget, setScanTarget]   = useState(null);   // { type: 'website'|'pr', url, pr }
  const [botResults, setBotResults]   = useState([]);      // array of bot result objects
  const [scanning, setScanning]       = useState(false);
  const [scanDone, setScanDone]       = useState(false);
  const [sdkConnected, setSdkConnected] = useState(false);
  const [runtimeErrors, setRuntimeErrors] = useState([]);

  return (
    <ScanContext.Provider value={{
      scanTarget, setScanTarget,
      botResults, setBotResults,
      scanning, setScanning,
      scanDone, setScanDone,
      sdkConnected, setSdkConnected,
      runtimeErrors, setRuntimeErrors,
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  return useContext(ScanContext);
}

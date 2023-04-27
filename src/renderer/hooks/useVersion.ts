import { useEffect, useState } from 'react';

const useVersion = () => {
  const [version, setVersion] = useState(null);

  useEffect(() => {
    async function getVersion() {
      const result = await window.electronMain.ipcRenderer.invoke(
        'app-version'
      );

      setVersion(result);
    }

    getVersion();
  });

  return [version];
};

export default useVersion;

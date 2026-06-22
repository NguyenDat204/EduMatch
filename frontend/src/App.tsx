import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { AIStatusProvider } from './hooks/useAIStatus';
import { AppRoutes } from './routes/AppRoutes';
import { publicSettingsService } from './services/api';

function App() {
  useEffect(() => {
    publicSettingsService.getPublicSettings()
      .then((res) => {
        const appTitle = res.data?.appTitle?.trim();
        if (appTitle) {
          document.title = `${appTitle} - Chọn đúng tương lai`;
        }
      })
      .catch(() => {
        document.title = 'EduMatch - Chọn đúng tương lai';
      });
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AIStatusProvider>
          <AppRoutes />
        </AIStatusProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

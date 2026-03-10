import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

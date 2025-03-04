import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAuth();
  
  console.log('ProtectedRoute auth state:', { isAuthenticated, token });

  if (!isAuthenticated || !token) {
    console.log('Not authenticated in ProtectedRoute, redirecting to login');
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {console.log('Rendering protected content')}
      <Outlet />
    </>
  );
};

export default ProtectedRoute;

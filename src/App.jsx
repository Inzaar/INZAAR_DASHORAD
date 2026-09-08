import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          containerStyle={{ zIndex: 999999 }} 
        />
        <AppRouter />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

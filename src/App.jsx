import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <AppRouter />
    </AuthProvider>
  );
}

export default App;

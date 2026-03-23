import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";

import { store } from "./redux/store";
import SocketProvider from "./src/context/SocketProvider";
import { SnackbarProvider } from "./src/context/SnackbarContext";
import { PrinterProvider } from "./src/context/PrinterContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <AuthProvider>
          <SocketProvider>
            <SnackbarProvider>
              <PrinterProvider>
                <AppNavigator />
              </PrinterProvider>
            </SnackbarProvider>
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </Provider>
  );
}
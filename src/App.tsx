import React, { useEffect, useState } from "react";
import "./App.css";
import { RootStore, StoreRootProvider } from "./state/root-store";
import { observer } from "mobx-react-lite";
import { ShoppingList } from "./pages/shopping-list";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./pages/layout";
import { User } from "./pages/user";
import { SharedList } from "./pages/share";

const AppObserver = observer(() => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="list" />} />
            <Route path="list" element={<ShoppingList />}>
              <Route path=":id" element={<ShoppingList />} />
            </Route>
            <Route path="share" element={<SharedList />}>
              <Route path=":id" element={<SharedList />} />
            </Route>
            <Route path="user" element={<User />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
});

function App() {
  const [store, setStore] = useState<RootStore>();

  useEffect(() => {
    const store = new RootStore();
    setStore(store);
  }, []);

  if (store) {
    return (
      <StoreRootProvider value={store}>
        <AppObserver />
      </StoreRootProvider>
    );
  }
  return <></>;
}

export default App;

import { Route, Routes } from "react-router-dom";
import { DemoBanner } from "./components/DemoBanner";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppProvider } from "./context/AppContext";
import { Cart } from "./pages/Cart";
import { Catalog } from "./pages/Catalog";
import { Home } from "./pages/Home";
import { Login, Register } from "./pages/Auth";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Recommender } from "./pages/Recommender";

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <DemoBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/propiedades" element={<Catalog />} />
            <Route path="/propiedades/:id" element={<PropertyDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/recomendador" element={<Recommender />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProvider>
  );
}

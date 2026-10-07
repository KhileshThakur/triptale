import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import MapApp from "./MapApp";
import UserGallery from "./UserGallery";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<MapApp />}
        />

        <Route
          path="/user/:username"
          element={<UserGallery />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import AnalysisPage from "./pages/Analysis";
import Features from "./pages/Features";
import Education from "./pages/Education";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Support from "./pages/Support";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/education" element={<Education />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
      </Route>
      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  );
}

export default App;

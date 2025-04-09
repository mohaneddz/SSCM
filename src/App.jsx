import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// content
import Home from '@/pages/content/Home';
import Monitoring from '@/pages/content/Monitoring';

// auth 
import Login from '@/pages/auth/Login';

function App() {

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col justify-center items-center">

      <Router>
        <Routes>

          <Route path="/" element={<Home />} />
          <Route path="/" element={<Monitoring />} />

          <Route path="/login" element={<Login />} />

          {/* rest of routes */}
          <Route path="*" element={<div>404 Not Found</div>} />

        </Routes>
      </Router>
      
    </div>
  );
}

export default App;

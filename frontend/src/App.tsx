import { BrowserRouter } from 'react-router-dom';
import '@neo4j-ndl/base/lib/neo4j-ds-styles.css';
import ThemeWrapper from './context/ThemeWrapper';
import NevadaTemplate from './templates/products-nevada/Home';



import './ConnectionModal.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeWrapper>
      <NevadaTemplate/>
  
      </ThemeWrapper>
    </BrowserRouter>
  );
}

export default App;

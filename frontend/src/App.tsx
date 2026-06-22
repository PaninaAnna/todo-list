import Board from './components/Board';
import { mockBoard } from './mockData';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Board board={mockBoard} />
    </div>
  );
}

export default App;

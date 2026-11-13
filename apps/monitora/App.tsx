import { ApiExampleScreen } from './src/features/api-example/ApiExampleScreen';
import { ApiProvider } from './src/lib/api/provider';

export default function App() {
  return (
    <ApiProvider>
      <ApiExampleScreen />
    </ApiProvider>
  );
}

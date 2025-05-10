import { useModules } from '../hooks/useModules';

export function HomeScreen() {
  const { modules, loading, error } = useModules();

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  return (
    // seu componente aqui usando os modules
  );
} 
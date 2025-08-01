import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationRouter } from './src/navigation/NavigationRouter';

const queryClient = new QueryClient();
const App = () => {
  return (
    <>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}
      >
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer
              key={'default'}
            >
              <NavigationRouter />
            </NavigationContainer>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>

    </>
  );
};

export default App;
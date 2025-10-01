import {
  AnimationRoutes,
  App,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";

import HomePage from "../pages/index";
import TestComponent from "./TestComponent";

const Layout = () => {
  console.log('Layout component rendering...');
  
  // Simple test first - bypass ZMP UI completely
  const SimpleLayout = () => {
    console.log('SimpleLayout rendering...');
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#007aff',
        color: 'white',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '32px' }}>UnionMart</h1>
        <p style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Simple Layout Working!</p>
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007aff',
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      </div>
    );
  };
  
  // Test if simple layout works first
  const useSimpleLayout = false; // Change to false to test ZMP UI
  
  if (useSimpleLayout) {
    console.log('Using simple layout...');
    return <SimpleLayout />;
  }
  
  try {
    console.log('Using ZMP UI layout...');
    
    // Test step by step
    const testStep = 1; // Change this to test different components
    
    if (testStep === 1) {
      console.log('Testing App component only...');
      return (
        <App>
          <div style={{
            padding: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            ZMP App Component Working! ✓
          </div>
        </App>
      );
    }
    
    if (testStep === 2) {
      console.log('Testing App + SnackbarProvider...');
      return (
        <App>
          <SnackbarProvider>
            <div style={{
              padding: '20px',
              backgroundColor: '#28a745',
              color: 'white',
              textAlign: 'center',
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ZMP App + SnackbarProvider Working! ✓
            </div>
          </SnackbarProvider>
        </App>
      );
    }
    
    if (testStep === 3) {
      console.log('Testing App + SnackbarProvider + ZMPRouter...');
      return (
        <App>
          <SnackbarProvider>
            <ZMPRouter>
              <div style={{
                padding: '20px',
                backgroundColor: '#28a745',
                color: 'white',
                textAlign: 'center',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ZMP Router Working! ✓
              </div>
            </ZMPRouter>
          </SnackbarProvider>
        </App>
      );
    }
    
    // Full layout (testStep === 4)
    console.log('Testing full ZMP layout...');
    return (
      <App>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<TestComponent />}></Route>
              <Route path="/home" element={<HomePage />}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    );
  } catch (error) {
    console.error('Layout render error:', error);
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Layout Error</h1>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
};
export default Layout;

// React core - Build v1.0.2 - useCallback fix
import React from "react";
import { createRoot } from "react-dom/client";

// ZaUI stylesheet
import "zmp-ui/zaui.css";

// Tailwind stylesheet
import "./css/tailwind.scss";

// Your stylesheet
import "./css/app.scss";

// Expose app configuration
import appConfig from "../app-config.json";
if (typeof window !== 'undefined' && !window.APP_CONFIG) {
  window.APP_CONFIG = appConfig;
}

// Mount the app
import Layout from "./components/layout";
import { AppProvider } from "./context/AppContext";

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }, [
        React.createElement('h1', { key: 'title' }, 'Oops! Something went wrong'),
        React.createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error'),
        React.createElement('button', { 
          key: 'reload',
          onClick: () => window.location.reload(),
          style: {
            padding: '10px 20px',
            backgroundColor: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }
        }, 'Reload App')
      ]);
    }

    return this.props.children;
  }
}

// Check if DOM is ready
const appElement = document.getElementById("app");
if (!appElement) {
  console.error('App element not found!');
} else {
  console.log('Mounting app...');
  const root = createRoot(appElement);
  root.render(
    React.createElement(ErrorBoundary, null,
      React.createElement(AppProvider, null, 
        React.createElement(Layout)
      )
    )
  );
  console.log('App mounted successfully');
}

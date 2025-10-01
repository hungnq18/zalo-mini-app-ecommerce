import React from 'react';

const TestComponent = () => {
  console.log('TestComponent rendering...');
  
  return (
    <div style={{
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#007aff', marginBottom: '16px' }}>UnionMart</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Test Component - App is working!</p>
      <div style={{
        width: '100px',
        height: '100px',
        backgroundColor: '#007aff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        ✓
      </div>
    </div>
  );
};

export default TestComponent;

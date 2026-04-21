import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#ffeaea', minHeight: '100vh' }}>
          <h1 style={{ color: '#c00', fontSize: '24px' }}>⚠️ Algo deu errado</h1>
          <p style={{ marginTop: '16px', color: '#333' }}>
            <strong>Erro:</strong> {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <pre style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px', overflow: 'auto', fontSize: '12px', color: '#666' }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ marginTop: '20px', padding: '12px 24px', background: '#c00', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
          >
            Limpar dados e voltar ao Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

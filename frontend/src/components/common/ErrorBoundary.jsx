import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // In production, send to error tracking service
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <Card style={{ maxWidth: '600px', width: '100%' }}>
            <Card.Body className="text-center p-5">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
              <h2 className="mb-3">Oops! Something went wrong</h2>
              <p className="text-muted mb-4">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <Card className="text-start mb-4" bg="light">
                  <Card.Body>
                    <h6 className="text-danger">Error Details (Dev Mode):</h6>
                    <pre style={{ fontSize: '0.85rem', overflow: 'auto' }}>
                      {this.state.error.toString()}
                    </pre>
                  </Card.Body>
                </Card>
              )}
              
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={this.handleReset}>
                  Go to Home
                </Button>
                <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NetworkErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface NetworkErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  isNetworkError: boolean;
  retryCount: number;
}

export class NetworkErrorBoundary extends Component<NetworkErrorBoundaryProps, NetworkErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: NetworkErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      isNetworkError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<NetworkErrorBoundaryState> {
    const isNetworkError = error.message.includes('NetworkError') || 
                          error.message.includes('fetch') ||
                          error.message.includes('Failed to fetch') ||
                          error.name === 'NetworkError';
    
    return { 
      hasError: true, 
      error,
      isNetworkError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Network Error Boundary caught an error:', error, errorInfo);
    
    // Auto-retry for network errors
    if (this.state.isNetworkError && this.state.retryCount < 3) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  scheduleRetry = () => {
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff, max 10s
    
    this.retryTimeout = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }, delay);
  };

  handleManualRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      retryCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isNetworkError, retryCount } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                {isNetworkError ? (
                  <Wifi className="h-6 w-6 text-destructive" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                )}
              </div>
              <CardTitle>
                {isNetworkError ? 'Tilkoblingsproblem' : 'Noe gikk galt'}
              </CardTitle>
              <CardDescription>
                {isNetworkError 
                  ? 'Kunne ikke koble til serveren. Sjekk internettforbindelsen din.'
                  : 'En uventet feil oppstod. Prøv å laste siden på nytt.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              {isNetworkError && retryCount > 0 && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Forsøk {retryCount}/3 feilet. Prøver automatisk om litt...
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleManualRetry} 
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Prøv igjen
                </Button>
                <Button 
                  onClick={this.handleReload} 
                  className="flex-1"
                >
                  Last på nytt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
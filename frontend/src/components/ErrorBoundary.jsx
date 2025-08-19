import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // Optionally log error here
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-3 text-red-600 bg-red-100 rounded">A rendering error occurred. Please refresh.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

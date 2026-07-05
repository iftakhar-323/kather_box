import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Caught UI error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="card card-pad-lg"
          style={{
            maxWidth: 560,
            margin: "64px auto",
            textAlign: "center",
            background: "var(--rose-50, #fff5f5)",
          }}
        >
          <div style={{ fontSize: 56 }}>😵</div>
          <h2>Something went wrong</h2>
          <p className="muted">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

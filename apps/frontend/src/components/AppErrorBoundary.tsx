import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Erreur inconnue" };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App runtime error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full rounded-lg border border-destructive/30 bg-card p-6 space-y-3">
          <h1 className="text-2xl font-semibold text-destructive">
            Erreur d&apos;affichage de l&apos;application
          </h1>
          <p className="text-sm text-muted-foreground">
            Une erreur JavaScript a empêche le rendu de la page.
          </p>
          <pre className="text-xs whitespace-pre-wrap break-words bg-muted/40 rounded p-3">
            {this.state.message}
          </pre>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }
}


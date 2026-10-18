export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="state-card" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-card state-error" role="alert">
      <span className="state-icon" aria-hidden="true">!</span>
      <div className="state-copy">
        <strong>Example error</strong>
        <span>{message}</span>
        {onRetry && <button className="retry-button" type="button" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="state-card state-empty">
      <span className="empty-mark" aria-hidden="true">✳</span>
      <div className="state-copy">
        <strong>{title}</strong>
        <span>{message}</span>
        {action}
      </div>
    </div>
  );
}

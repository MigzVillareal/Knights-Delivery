import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from './components/StatusStates.jsx';

const surveyUrl = 'https://forms.gle/RXYJMXke4toRcbg36';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [retryNote, setRetryNote] = useState('');

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="demo-banner" role="note">
        <span className="demo-dot" aria-hidden="true" />
        <span><strong>Demo only</strong> — no real request will be sent or saved.</span>
      </div>

      <div className="page-shell" id="home">
        <header className="topbar">
          <a className="brand" href="#home" aria-label="Knights Delivery home" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">K</span>
            <span>Knights <strong>Delivery</strong></span>
          </a>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span className="visually-hidden">Menu</span>
          </button>
          <nav id="primary-navigation" className={`navigation ${menuOpen ? 'navigation-open' : ''}`} aria-label="Main navigation">
            <a href="#overview" onClick={closeMenu}>Overview</a>
            <a href="#states" onClick={closeMenu}>Preview states</a>
            <a className="survey-link" href={surveyUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
              Take the survey <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </header>

        <main id="main-content">
          <section className="hero" id="overview" aria-labelledby="hero-title">
            <p className="eyebrow">A LITTLE HELP, RIGHT ON CAMPUS</p>
            <h1 id="hero-title">Make room for<br /><em>what matters.</em></h1>
            <p className="intro">
              Knights Delivery is exploring a simpler way for students to get small campus errands done.
            </p>
            <div className="hero-note">
              <span className="note-icon" aria-hidden="true">✳</span>
              <p>This is an early interface preview. The examples on this page are simulated and do not represent real orders.</p>
            </div>
            <a className="text-link" href={surveyUrl} target="_blank" rel="noreferrer">
              Share what would make this useful <span aria-hidden="true">→</span>
            </a>
          </section>

          <section className="state-section" id="states" aria-labelledby="states-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">INTERFACE PREVIEW</p>
                <h2 id="states-title">Clear at every step.</h2>
              </div>
              <p className="section-caption">Illustrative states only · no live data</p>
            </div>
            <div className="state-grid">
              <LoadingState label="Loading example activity" />
              <ErrorState
                message={retryNote || 'This is an example error state. No request was sent.'}
                onRetry={() => setRetryNote('Example retry selected. No request was sent.')}
              />
              <EmptyState
                title="No sample requests yet"
                message="The request list will be explored in a later prototype step."
              />
            </div>
          </section>
        </main>

        <footer className="footer">
          <span>KNIGHTS DELIVERY SYSTEM</span>
          <span>Built for campus, shaped by students</span>
        </footer>
      </div>
    </>
  );
}

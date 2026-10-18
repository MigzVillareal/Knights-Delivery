import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from './components/StatusStates.jsx';

const surveyUrl = 'https://forms.gle/RXYJMXke4toRcbg36';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState('signin');
  const [notice, setNotice] = useState('');
  const [retryNote, setRetryNote] = useState('');
  const closeMenu = () => setMenuOpen(false);
  function handleDemoSubmit(event) {
    event.preventDefault();
    setNotice('Demo only — your details were not sent or saved.');
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="demo-banner" role="note"><span className="demo-dot" aria-hidden="true" /><span><strong>Demo only</strong> — no real request will be sent or saved.</span></div>
    <div className="page-shell" id="home">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Knights Delivery home" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">K</span><span>Knights <strong>Delivery</strong></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen(open => !open)}><span /><span /><span className="visually-hidden">Menu</span></button>
        <nav id="primary-navigation" className={`navigation ${menuOpen ? 'navigation-open' : ''}`} aria-label="Main navigation">
          <a href="#sign-in" onClick={closeMenu}>Sign in</a><a href="#states" onClick={closeMenu}>Preview states</a><a className="survey-link" href={surveyUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Take the survey <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main id="main-content">
        <section className="auth-section" id="sign-in" aria-labelledby="auth-title">
          <div className="auth-copy"><p className="eyebrow">A LITTLE HELP, RIGHT ON CAMPUS</p><h1 id="auth-title">Campus errands,<br /><em>made simpler.</em></h1><p className="intro">Knights Delivery is exploring a simpler way for students to get small campus errands done.</p><div className="hero-note"><span className="note-icon" aria-hidden="true">✳</span><p>This is a preview. Sign-in details are not sent, stored, or used to create an account.</p></div></div>
          <div className="auth-card">
            <div className="auth-tabs" role="tablist" aria-label="Choose sign-in or sign-up">
              <button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setNotice(''); }}>Sign in</button>
              <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setNotice(''); }}>Sign up</button>
            </div>
            <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="auth-description">{mode === 'signin' ? 'Explore the Knights Delivery demo.' : 'Join the Knights Delivery preview.'}</p>
            <form className="auth-form" onSubmit={handleDemoSubmit}>
              {mode === 'signup' && <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
              <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
              <label>Password<input name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Enter a demo password" minLength="6" required /></label>
              <button className="primary-button" type="submit">{mode === 'signin' ? 'Sign in to demo' : 'Create demo account'}</button>
            </form>
            <p className="form-disclaimer">Demo interaction only. Do not enter a real password.</p>{notice && <p className="form-notice" role="status">{notice}</p>}
          </div>
        </section>
        <section className="survey-strip" aria-label="Give feedback"><p>Helping shape the campus delivery experience?</p><a className="text-link" href={surveyUrl} target="_blank" rel="noreferrer">Share your feedback <span aria-hidden="true">→</span></a></section>
        <section className="state-section" id="states" aria-labelledby="states-title">
          <div className="section-heading"><div><p className="eyebrow">INTERFACE PREVIEW</p><h2 id="states-title">Clear at every step.</h2></div><p className="section-caption">Illustrative states only · no live data</p></div>
          <div className="state-grid"><LoadingState label="Loading example activity" /><ErrorState message={retryNote || 'This is an example error state. No request was sent.'} onRetry={() => setRetryNote('Example retry selected. No request was sent.')} /><EmptyState title="No sample requests yet" message="The request list will be explored in a later prototype step." /></div>
        </section>
      </main>
      <footer className="footer"><span>KNIGHTS DELIVERY SYSTEM</span><span>Built for campus, shaped by students</span></footer>
    </div>
  </>;
}

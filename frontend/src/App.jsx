import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from './components/StatusStates.jsx';

const surveyUrl = 'https://forms.gle/RXYJMXke4toRcbg36';
const categories = [
  { id: 'food', label: 'Food', color: '#F5E08B' },
  { id: 'groceries', label: 'Groceries', color: '#ABBFDA' },
  { id: 'documents', label: 'Documents', color: '#90D9AE' },
  { id: 'other', label: 'Other', color: '#BAB7D3' },
];
const emptyRequest = { category: '', pickup: '', details: '', dropoff: '', handoff: '', estimate: '' };

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [authNotice, setAuthNotice] = useState('');
  const [retryNote, setRetryNote] = useState('');
  const [requestStep, setRequestStep] = useState('closed');
  const [request, setRequest] = useState(emptyRequest);
  const [categoryError, setCategoryError] = useState('');
  const [requestNotice, setRequestNotice] = useState('');
  const closeMenu = () => setMenuOpen(false);

  function handleAuthSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const enteredName = String(formData.get('name') || '').trim();
    const displayName = enteredName || email.split('@')[0] || 'Knight';
    // This is an in-memory prototype sign-in only; no credentials are sent or stored.
    setCurrentUser({ displayName, email });
    setAuthNotice('');
    setRequestStep('closed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function signOut() {
    setCurrentUser(null);
    setRequestStep('closed');
    setRequest(emptyRequest);
    setRequestNotice('');
    setMode('signin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateRequest(event) {
    const { name, value } = event.target;
    setRequest(current => ({ ...current, [name]: value }));
  }

  function handleRequestSubmit(event) {
    event.preventDefault();
    if (!request.category) {
      setCategoryError('Choose a request category to continue.');
      return;
    }
    setCategoryError('');
    setRequestNotice('');
    setRequestStep('review');
    document.getElementById('request-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function startRequest() {
    setRequest(emptyRequest);
    setCategoryError('');
    setRequestNotice('');
    setRequestStep('form');
    document.getElementById('request-flow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function finishDemoReview() {
    setRequestNotice('Demo only — this request was not sent or saved.');
  }

  const selectedCategory = categories.find(category => category.id === request.category);

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="demo-banner" role="note"><span className="demo-dot" aria-hidden="true" /><span><strong>Demo only</strong> — no real request will be sent or saved.</span></div>
    <div className="page-shell" id="home">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Knights Delivery home" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">K</span><span>Knights <strong>Delivery</strong></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen(open => !open)}><span /><span /><span className="visually-hidden">Menu</span></button>
        <nav id="primary-navigation" className={`navigation ${menuOpen ? 'navigation-open' : ''}`} aria-label="Main navigation">
          {currentUser ? <><a href="#request-flow" onClick={closeMenu}>Create a request</a><a href="#states" onClick={closeMenu}>Preview states</a><button className="nav-signout" type="button" onClick={() => { closeMenu(); signOut(); }}>Sign out</button></> : <><a href="#sign-in" onClick={closeMenu}>Sign in</a><a className="survey-link" href={surveyUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Take the survey <span aria-hidden="true">↗</span></a></>}
        </nav>
      </header>
      <main id="main-content">
        {!currentUser ? <>
          <section className="auth-section" id="sign-in" aria-labelledby="auth-title">
            <div className="auth-copy"><p className="eyebrow">A LITTLE HELP, RIGHT ON CAMPUS</p><h1 id="auth-title">Campus errands,<br /><em>made simpler.</em></h1><p className="intro">Knights Delivery is exploring a simpler way for students to get small campus errands done.</p><div className="hero-note"><span className="note-icon" aria-hidden="true">✳</span><p>This is a preview. Sign-in details are not sent, stored, or used to create an account.</p></div></div>
            <div className="auth-card">
              <div className="auth-tabs" role="tablist" aria-label="Choose sign-in or sign-up">
                <button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setAuthNotice(''); }}>Sign in</button>
                <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setAuthNotice(''); }}>Sign up</button>
              </div>
              <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="auth-description">{mode === 'signin' ? 'Sign in to continue to your demo home.' : 'Create a demo profile to continue.'}</p>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {mode === 'signup' && <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label>Password<input name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Enter a demo password" minLength="6" required /></label>
                <button className="primary-button" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
              </form>
              <p className="form-disclaimer">Demo only — do not use a real password. No account or credentials are saved.</p>{authNotice && <p className="form-notice" role="status">{authNotice}</p>}
            </div>
          </section>
          <section className="survey-strip" aria-label="Give feedback"><p>Helping shape the campus delivery experience?</p><a className="text-link" href={surveyUrl} target="_blank" rel="noreferrer">Share your feedback <span aria-hidden="true">→</span></a></section>
        </> : <>
          <section className="customer-home" aria-labelledby="home-title">
            <div><p className="eyebrow">CUSTOMER HOME · DEMO</p><h1 id="home-title">Welcome, {currentUser.displayName}.</h1><p className="intro">Start a sample campus delivery request or explore the prototype. Nothing here is sent or saved.</p></div>
            <button className="primary-button home-request-button" type="button" onClick={startRequest}>Create a request <span aria-hidden="true">→</span></button>
          </section>
          <section className="request-section" id="request-flow" aria-labelledby="request-title">
            <div className="request-section-heading"><div><p className="eyebrow">CUSTOMER REQUEST PREVIEW</p><h2 id="request-title">Create a delivery request</h2><p className="request-intro">Explore the request form. Nothing will be submitted, assigned, or saved.</p></div>{requestStep === 'closed' && <button className="secondary-button" type="button" onClick={startRequest}>Create a request</button>}</div>
            {requestStep === 'closed' && <div className="request-empty"><span className="empty-mark" aria-hidden="true">✳</span><p>You have no sample requests yet.</p><span>Use “Create a request” to preview the form.</span></div>}
            {requestStep === 'form' && <form className="request-card request-form" onSubmit={handleRequestSubmit}>
              <div className="request-card-heading"><div><span className="step-label">STEP 1 OF 2</span><h3>Request details</h3></div><button className="text-button" type="button" onClick={() => setRequestStep('closed')}>Close</button></div>
              <fieldset className="category-fieldset"><legend>What do you need? <span className="required-indicator">Required</span></legend><div className="category-options">{categories.map(category => <button key={category.id} className={`category-chip ${request.category === category.id ? 'selected' : ''}`} style={{ '--category-color': category.color }} type="button" aria-pressed={request.category === category.id} onClick={() => { setRequest(current => ({ ...current, category: category.id })); setCategoryError(''); }}>{category.label}</button>)}</div>{categoryError && <p className="field-error" role="alert">{categoryError}</p>}</fieldset>
              <div className="request-field-grid"><label>Pickup source / location <span className="required-indicator">Required</span><input name="pickup" value={request.pickup} onChange={updateRequest} placeholder="Building, shop, or pickup point" required /></label><label>Precise drop-off location <span className="required-indicator">Required</span><input name="dropoff" value={request.dropoff} onChange={updateRequest} placeholder="Building, room, or meeting point" required /></label></div>
              <label>Item details <span className="required-indicator">Required</span><textarea name="details" value={request.details} onChange={updateRequest} rows="3" placeholder="Describe what should be picked up" required /></label>
              <label>Handoff note <span className="optional-indicator">Optional</span><textarea name="handoff" value={request.handoff} onChange={updateRequest} rows="2" placeholder="Anything helpful for the handoff?" /></label>
              <label>Your estimate <span className="optional-indicator">Optional</span><input name="estimate" value={request.estimate} onChange={updateRequest} inputMode="decimal" placeholder="Enter an estimate if you have one" /><span className="field-help">No fee is set yet. Currency and any service fee are pending approval.</span></label>
              <div className="request-actions"><button className="primary-button" type="submit">Review request <span aria-hidden="true">→</span></button></div>
            </form>}
            {requestStep === 'review' && <div className="request-card review-card" aria-labelledby="review-title">
              <div className="request-card-heading"><div><span className="step-label">STEP 2 OF 2 · DEMO REVIEW</span><h3 id="review-title">Review your request</h3></div><button className="text-button" type="button" onClick={() => { setRequestStep('form'); setRequestNotice(''); }}>Edit details</button></div>
              <dl className="request-summary"><div><dt>Category</dt><dd><span className="review-category" style={{ '--category-color': selectedCategory?.color }}>{selectedCategory?.label}</span></dd></div><div><dt>Pickup source / location</dt><dd>{request.pickup}</dd></div><div><dt>Item details</dt><dd>{request.details}</dd></div><div><dt>Precise drop-off</dt><dd>{request.dropoff}</dd></div><div><dt>Handoff note</dt><dd>{request.handoff || 'None provided'}</dd></div><div><dt>Your estimate</dt><dd>{request.estimate.trim() || 'Not provided'}</dd></div></dl>
              <div className="fee-notice"><strong>Fee information: Pending approval</strong><span>No fee amount has been set. This is a simulated research preview, not a quote.</span></div><p className="review-disclaimer">Review only — this request will not be sent, assigned, or saved.</p>
              <div className="request-actions"><button className="primary-button" type="button" onClick={finishDemoReview}>Finish demo review</button></div>{requestNotice && <p className="form-notice" role="status">{requestNotice}</p>}
            </div>}
          </section>
          <section className="survey-strip" aria-label="Give feedback"><p>Helping shape the campus delivery experience?</p><a className="text-link" href={surveyUrl} target="_blank" rel="noreferrer">Share your feedback <span aria-hidden="true">→</span></a></section>
          <section className="state-section" id="states" aria-labelledby="states-title"><div className="section-heading"><div><p className="eyebrow">INTERFACE PREVIEW</p><h2 id="states-title">Clear at every step.</h2></div><p className="section-caption">Illustrative states only · no live data</p></div><div className="state-grid"><LoadingState label="Loading example activity" /><ErrorState message={retryNote || 'This is an example error state. No request was sent.'} onRetry={() => setRetryNote('Example retry selected. No request was sent.')} /><EmptyState title="No sample requests yet" message="The request list is illustrative; the prototype does not keep request history." /></div></section>
        </>}
      </main>
      <footer className="footer"><span>KNIGHTS DELIVERY SYSTEM · DEMO</span><span>Built for campus, shaped by students</span></footer>
    </div>
  </>;
}

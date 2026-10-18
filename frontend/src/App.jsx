import { useState } from 'react';

const categories = [
  { id: 'food', label: 'Food', color: '#F5E08B' },
  { id: 'groceries', label: 'Groceries', color: '#ABBFDA' },
  { id: 'documents', label: 'Documents', color: '#90D9AE' },
  { id: 'other', label: 'Other', color: '#BAB7D3' },
];
const emptyRequest = { category: '', pickup: '', details: '', dropoff: '', handoff: '', estimate: '' };
const exampleRunnerRequests = [
  { id: 'EX-001', category: 'food', status: 'Available', pickup: 'Campus Café counter', details: 'One sealed lunch order', dropoff: 'North Hall, main entrance', handoff: 'Meet by the front desk', estimate: 'Not provided' },
  { id: 'EX-002', category: 'groceries', status: 'Available', pickup: 'Campus Market service desk', details: 'Small paper bag with pantry items', dropoff: 'Science Building, lobby', handoff: 'Leave with the reception desk', estimate: 'Not provided' },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState('signin');
  const [currentUser, setCurrentUser] = useState(null);
  const [appView, setAppView] = useState('customer');
  const [runnerRequests, setRunnerRequests] = useState(exampleRunnerRequests);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [sessionNotice, setSessionNotice] = useState('');
  const [runnerNotice, setRunnerNotice] = useState('');
  const [issueFormId, setIssueFormId] = useState('');
  const [issueDraft, setIssueDraft] = useState('');
  const [issueError, setIssueError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
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
    setAppView('customer');
    setAuthNotice('');
    setRequestStep('closed');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function signOut() {
    setCurrentUser(null);
    setAppView('customer');
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

  function finishReview() {
    const id = `REQ-${String(sessionRequests.length + 1).padStart(3, '0')}`;
    const submittedRequest = { ...request, id, status: 'Available' };
    setSessionRequests(items => [...items, submittedRequest]);
    setSessionNotice(`${id} was added to this session's Past requests and Runner queue. It was not sent or saved elsewhere.`);
    setRequestNotice('');
    setRequestStep('closed');
    window.setTimeout(() => document.getElementById('customer-home')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }

  const allowedTransitions = {
    Available: ['Accepted', 'Cancelled', 'Issue reported'],
    Accepted: ['In progress', 'Cancelled', 'Issue reported'],
    'In progress': ['Delivered', 'Cancelled', 'Issue reported'],
    Delivered: ['Completed', 'Issue reported'],
    'Issue reported': ['In progress', 'Cancelled'],
    Completed: [],
    Cancelled: [],
  };

  function transitionRunnerRequest(id, nextStatus) {
    const selected = [...runnerRequests, ...sessionRequests].find(item => item.id === id);
    if (!selected || !allowedTransitions[selected.status]?.includes(nextStatus)) {
      setRunnerNotice('That action is not available for the current request status.');
      return;
    }
    const update = items => items.map(item => item.id === id ? { ...item, status: nextStatus } : item);
    if (runnerRequests.some(item => item.id === id)) setRunnerRequests(update);
    else setSessionRequests(update);
    setRunnerNotice(`${id}: status changed to ${nextStatus}. This change is held in memory only.`);
    setIssueFormId('');
    setIssueDraft('');
    setIssueError('');
  }

  function submitIssueReport(event, id) {
    event.preventDefault();
    const report = issueDraft.trim();
    if (report.length < 8) {
      setIssueError('Add at least 8 characters describing the issue.');
      return;
    }
    const selected = [...runnerRequests, ...sessionRequests].find(item => item.id === id);
    if (!selected || !allowedTransitions[selected.status]?.includes('Issue reported')) {
      setRunnerNotice('This request can no longer accept an issue report.');
      return;
    }
    const update = items => items.map(item => item.id === id ? { ...item, status: 'Issue reported', issueReport: report } : item);
    if (runnerRequests.some(item => item.id === id)) setRunnerRequests(update);
    else setSessionRequests(update);
    setRunnerNotice(`${id}: issue reported. The report is held in memory only.`);
    setIssueFormId('');
    setIssueDraft('');
    setIssueError('');
  }

  const selectedCategory = categories.find(category => category.id === request.category);
  const runnerQueue = [...runnerRequests, ...sessionRequests];

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="page-shell" id="home">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Knights Delivery home" onClick={closeMenu}><span className="brand-mark" aria-hidden="true">K</span><span>Knights <strong>Delivery</strong></span></a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setMenuOpen(open => !open)}><span /><span /><span className="visually-hidden">Menu</span></button>
        <nav id="primary-navigation" className={`navigation ${menuOpen ? 'navigation-open' : ''}`} aria-label="Main navigation">
          {currentUser ? <><a href={appView === 'customer' ? '#customer-home' : '#runner-home'} onClick={closeMenu}>Home</a><a href={appView === 'customer' ? '#past-requests' : '#runner-queue'} onClick={closeMenu}>{appView === 'customer' ? 'Past requests' : 'Runner queue'}</a><button className="nav-signout" type="button" onClick={() => { closeMenu(); signOut(); }}>Sign out</button></> : <a href="#sign-in" onClick={closeMenu}>Sign in</a>}
        </nav>
      </header>
      <main id="main-content">
        {!currentUser ? <>
          <section className="auth-section" id="sign-in" aria-labelledby="auth-title">
            <div className="auth-copy"><p className="eyebrow">A LITTLE HELP, RIGHT ON CAMPUS</p><h1 id="auth-title">Campus errands,<br /><em>made simpler.</em></h1><p className="intro">Knights Delivery is exploring a simpler way for students to get small campus errands done.</p><div className="hero-note"><span className="note-icon" aria-hidden="true">✳</span><p>Sign-in is not connected yet. Use placeholder details; they are not sent or saved.</p></div></div>
            <div className="auth-card">
              <div className="auth-tabs" role="tablist" aria-label="Choose sign-in or sign-up">
                <button className={mode === 'signin' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signin'} onClick={() => { setMode('signin'); setAuthNotice(''); }}>Sign in</button>
                <button className={mode === 'signup' ? 'auth-tab active' : 'auth-tab'} type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => { setMode('signup'); setAuthNotice(''); }}>Sign up</button>
              </div>
              <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="auth-description">{mode === 'signin' ? 'Sign in to continue.' : 'Create an account to continue.'}</p>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {mode === 'signup' && <label>Name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
                <label>Email address<input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label>
                <label>Password<input name="password" type="password" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="Enter your password" minLength="6" required /></label>
                <button className="primary-button" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
              </form>
              <p className="form-disclaimer">Sign-in is not connected yet. Do not enter a real password; account details are not saved.</p>{authNotice && <p className="form-notice" role="status">{authNotice}</p>}
            </div>
          </section>
        </> : <>
          <div className="view-switch" role="group" aria-label="Switch between customer and runner views"><span>View as</span><button type="button" className={appView === 'customer' ? 'view-option active' : 'view-option'} aria-pressed={appView === 'customer'} onClick={() => setAppView('customer')}>Customer</button><button type="button" className={appView === 'runner' ? 'view-option active' : 'view-option'} aria-pressed={appView === 'runner'} onClick={() => setAppView('runner')}>Runner</button></div>
          {appView === 'customer' ? <>
          <section className="customer-home" id="customer-home" aria-labelledby="home-title">
            <div><p className="eyebrow">YOUR DELIVERY HOME</p><h1 id="home-title">Welcome, {currentUser.displayName}.</h1><p className="intro">Start a campus delivery request.</p>{sessionNotice && <p className="session-notice" role="status">{sessionNotice}</p>}</div>
            <button className="primary-button home-request-button" type="button" onClick={startRequest}>Create a request <span aria-hidden="true">→</span></button>
          </section>
          {requestStep !== 'closed' && <section className="request-section" id="request-flow" aria-labelledby="request-title">
            <div className="request-section-heading"><div><p className="eyebrow">NEW REQUEST</p><h2 id="request-title">Create a delivery request</h2><p className="request-intro">Add the details below, then review your request.</p></div></div>
            {requestStep === 'form' && <form className="request-card request-form" onSubmit={handleRequestSubmit}>
              <div className="request-card-heading"><div><span className="step-label">STEP 1 OF 2</span><h3>Request details</h3></div><button className="text-button" type="button" onClick={() => setRequestStep('closed')}>Close</button></div>
              <fieldset className="category-fieldset"><legend>What do you need? <span className="required-indicator">Required</span></legend><div className="category-options">{categories.map(category => <button key={category.id} className={`category-chip ${request.category === category.id ? 'selected' : ''}`} style={{ '--category-color': category.color }} type="button" aria-pressed={request.category === category.id} onClick={() => { setRequest(current => ({ ...current, category: category.id })); setCategoryError(''); }}>{category.label}</button>)}</div>{categoryError && <p className="field-error" role="alert">{categoryError}</p>}</fieldset>
              <div className="request-field-grid"><label>Pickup source / location <span className="required-indicator">Required</span><input name="pickup" value={request.pickup} onChange={updateRequest} placeholder="Building, shop, or pickup point" required /></label><label>Precise drop-off location <span className="required-indicator">Required</span><input name="dropoff" value={request.dropoff} onChange={updateRequest} placeholder="Building, room, or meeting point" required /></label></div>
              <label>Item details <span className="required-indicator">Required</span><textarea name="details" value={request.details} onChange={updateRequest} rows="3" placeholder="Describe what should be picked up" required /></label>
              <label>Handoff note <span className="optional-indicator">Optional</span><textarea name="handoff" value={request.handoff} onChange={updateRequest} rows="2" placeholder="Anything helpful for the handoff?" /></label>
              <label>Full errand estimate <span className="optional-indicator">Optional</span><input name="estimate" value={request.estimate} onChange={updateRequest} inputMode="decimal" placeholder="Enter your expected total, if known" /><span className="field-help">Enter the total you expect for this errand, if known. The service fee is separate and pending approval.</span></label><p className="session-privacy-note">This request will be visible in Past requests and Runner view during this session. Use fictional details; refreshing clears session activity.</p>
              <div className="request-actions"><button className="primary-button" type="submit">Review request <span aria-hidden="true">→</span></button></div>
            </form>}
            {requestStep === 'review' && <div className="request-card review-card" aria-labelledby="review-title">
              <div className="request-card-heading"><div><span className="step-label">STEP 2 OF 2 · REVIEW</span><h3 id="review-title">Review your request</h3></div><button className="text-button" type="button" onClick={() => { setRequestStep('form'); setRequestNotice(''); }}>Edit details</button></div>
              <dl className="request-summary"><div><dt>Category</dt><dd><span className="review-category" style={{ '--category-color': selectedCategory?.color }}>{selectedCategory?.label}</span></dd></div><div><dt>Pickup source / location</dt><dd>{request.pickup}</dd></div><div><dt>Item details</dt><dd>{request.details}</dd></div><div><dt>Precise drop-off</dt><dd>{request.dropoff}</dd></div><div><dt>Handoff note</dt><dd>{request.handoff || 'None provided'}</dd></div><div><dt>Full errand estimate</dt><dd>{request.estimate.trim() || 'Not provided'}</dd></div></dl>
              <div className="fee-notice"><strong>Fee information: Pending approval</strong><span>No fee amount has been set; this is not a quote.</span></div><p className="review-disclaimer">This form is not connected. The request will not be sent or saved.</p>
              <div className="request-actions"><button className="primary-button" type="button" onClick={finishReview}>Post request</button></div>{requestNotice && <p className="form-notice" role="status">{requestNotice}</p>}
            </div>}
          </section>}
          <section className="past-requests" id="past-requests" aria-labelledby="past-requests-title"><div className="section-heading"><div><p className="eyebrow">YOUR ACTIVITY</p><h2 id="past-requests-title">Past requests</h2></div></div>{sessionRequests.length === 0 ? <div className="request-empty"><span className="empty-mark" aria-hidden="true">✳</span><p>No past requests yet.</p><span>Requests you complete in this session will appear here.</span></div> : <div className="past-request-list">{sessionRequests.map(savedRequest => { const category = categories.find(item => item.id === savedRequest.category); return <article className="past-request-card" key={savedRequest.id}><header><div><span className="step-label">{savedRequest.id}</span><h3>{category?.label} request</h3></div><span className={`runner-status status-${savedRequest.status.toLowerCase().replaceAll(' ', '-')}`}>{savedRequest.status}</span></header><dl className="request-summary"><div><dt>Pickup</dt><dd>{savedRequest.pickup}</dd></div><div><dt>Item details</dt><dd>{savedRequest.details}</dd></div><div><dt>Drop-off</dt><dd>{savedRequest.dropoff}</dd></div><div><dt>Handoff note</dt><dd>{savedRequest.handoff || 'None provided'}</dd></div><div><dt>Full errand estimate</dt><dd>{savedRequest.estimate.trim() || 'Not provided'}</dd></div></dl></article>; })}</div>}</section>
          </> : <section className="runner-home" id="runner-home" aria-labelledby="runner-title">
            <div className="runner-heading"><div><p className="eyebrow">RUNNER VIEW</p><h1 id="runner-title">Available requests</h1><p className="intro">Review pickup and drop-off details for fictional examples and requests entered in this session.</p></div><span className="fictional-notice">Fictional examples are labeled · session requests are shown separately</span></div>
            {runnerNotice && <p className="runner-feedback" role="status">{runnerNotice}</p>}
            {runnerQueue.length === 0 ? <div className="request-empty"><span className="empty-mark" aria-hidden="true">✳</span><p>No example requests are available.</p><span>Refresh the page to reset the in-memory activity.</span></div> : <div className="runner-request-list" id="runner-queue">{runnerQueue.map(runnerRequest => {
              const category = categories.find(item => item.id === runnerRequest.category);
              const actions = {
                Available: [{ label: 'Accept request', next: 'Accepted', primary: true }, { label: 'Cancel request', next: 'Cancelled' }],
                Accepted: [{ label: 'Start delivery', next: 'In progress', primary: true }, { label: 'Cancel request', next: 'Cancelled' }],
                'In progress': [{ label: 'Mark delivered', next: 'Delivered', primary: true }, { label: 'Cancel request', next: 'Cancelled' }],
                Delivered: [{ label: 'Complete request', next: 'Completed', primary: true }],
                'Issue reported': [{ label: 'Resume delivery', next: 'In progress', primary: true }, { label: 'Cancel request', next: 'Cancelled' }],
                Completed: [],
                Cancelled: [],
              }[runnerRequest.status] || [];
              const canReportIssue = allowedTransitions[runnerRequest.status]?.includes('Issue reported');
              return <article className="runner-request-card" key={runnerRequest.id}>
                <header className="runner-card-header"><div><span className="step-label">{runnerRequest.id.startsWith('EX-') ? 'FICTIONAL EXAMPLE' : 'CURRENT SESSION REQUEST'} · {runnerRequest.id}</span><h2>{category?.label} request</h2></div><span className={`runner-status status-${runnerRequest.status.toLowerCase().replaceAll(' ', '-')}`}>{runnerRequest.status}</span></header>
                <dl className="runner-details"><div><dt>Pickup</dt><dd>{runnerRequest.pickup}</dd></div><div><dt>Item details</dt><dd>{runnerRequest.details}</dd></div><div><dt>Drop-off</dt><dd>{runnerRequest.dropoff}</dd></div><div><dt>Handoff note</dt><dd>{runnerRequest.handoff}</dd></div><div><dt>Customer’s estimated total</dt><dd>{runnerRequest.estimate}</dd></div></dl>
                <p className="runner-fee-note">Service fee: Pending approval</p>
                {runnerRequest.issueReport && <div className="issue-summary"><strong>Reported issue</strong><p>{runnerRequest.issueReport}</p></div>}
                {actions.length > 0 && <div className="runner-actions">{actions.map(action => <button key={action.next} className={action.primary ? 'runner-action primary' : 'runner-action'} type="button" onClick={() => transitionRunnerRequest(runnerRequest.id, action.next)}>{action.label}</button>)}{canReportIssue && <button className="runner-action issue-action" type="button" onClick={() => { setIssueFormId(runnerRequest.id); setIssueDraft(''); setIssueError(''); }}>Report issue</button>}</div>}
                {issueFormId === runnerRequest.id && <form className="issue-form" onSubmit={event => submitIssueReport(event, runnerRequest.id)}><label htmlFor={`issue-${runnerRequest.id}`}>Issue details <span className="optional-indicator">Use fictional details only</span></label><textarea id={`issue-${runnerRequest.id}`} value={issueDraft} onChange={event => { setIssueDraft(event.target.value); setIssueError(''); }} rows="3" placeholder="Describe what happened in this sample delivery" required minLength="8" />{issueError && <p className="field-error" role="alert">{issueError}</p>}<div className="runner-actions"><button className="runner-action primary" type="submit">Submit issue report</button><button className="runner-action" type="button" onClick={() => { setIssueFormId(''); setIssueDraft(''); setIssueError(''); }}>Keep request unchanged</button></div></form>}
              </article>;
            })}</div>}
            <p className="runner-reset-note">Statuses, issue notes, and requests entered in this session exist only while this page is open. Refresh to clear them.</p>
          </section>}
        </>}
      </main>
      <footer className="footer"><span>KNIGHTS DELIVERY SYSTEM</span><span>Built for campus, shaped by students</span></footer>
    </div>
  </>;
}


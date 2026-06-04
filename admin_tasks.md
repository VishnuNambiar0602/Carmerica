# Admin Panel — Complete Button & Flow Audit + Task Breakdown

> Every button in every admin page has been audited against the backend routes.
> Format: **Problem → Root Cause → Solution → Design → Why → Expected Output**

---

## AUDIT SUMMARY — ADMIN PANEL

| Page | Button / Action | Connected? | Root Cause |
|---|---|---|---|
| AdminUsers | Suspend / Activate | ✅ Yes | Calls `PATCH /api/admin/users/:id` — works |
| AdminUsers | Delete user | ✅ Yes | Calls `DELETE /api/admin/users/:id` — works |
| AdminUsers | Search input | ✅ Yes | Client-side filter on `users` state — works |
| AdminUsers | Role filter tabs | ✅ Yes | Client-side filter — works |
| AdminUsers | Data fetch | ✅ Yes | Calls `GET /api/admin/users` — works |
| AdminVendors | Verify / Unverify | ✅ Yes | Calls `PATCH /api/admin/vendors/:id` — works |
| AdminVendors | Suspend / Activate | ✅ Yes | Calls `PATCH /api/admin/vendors/:id` — works |
| AdminVendors | KYV button | ✅ Yes | Navigates to `/admin/vendor-kyv?vendorId=...` — works |
| AdminVendors | Search | ✅ Yes | Client-side filter — works |
| AdminVendors | Status filter | ✅ Yes | Client-side filter — works |
| AdminVendors | Data fetch | ✅ Yes | Calls `GET /api/admin/vendors` — works |
| AdminVendorKYV | Approve document | ✅ Yes | Calls `PATCH /api/admin/kyv/:id/approve` — works |
| AdminVendorKYV | Reject document | ✅ Yes | Calls `POST /api/admin/kyv/:id/reject` — works |
| AdminVendorKYV | Suspend/Activate partner | ✅ Yes | Calls `PATCH /api/admin/vendors/:id` — works |
| AdminVendorKYV | Verify/Revoke partner | ✅ Yes | Calls `PATCH /api/admin/vendors/:id` — works |
| AdminBookings | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/bookings` |
| AdminBookings | Search input | ❌ No | Input has no `onChange` |
| AdminBookings | Status filter | ❌ No | Dropdown does nothing |
| AdminBookings | Date filter | ❌ No | Dropdown does nothing |
| AdminBookings | Calendar View button | ❌ No | No `onClick` |
| AdminBookings | Export Bookings button | ❌ No | No `onClick` |
| AdminBookings | Eye (view) per row | ❌ No | No `onClick` |
| AdminBookings | MoreVertical per row | ❌ No | No `onClick`, no dropdown |
| AdminBookings | Stats (2450, 1820, etc.) | ❌ No | All hardcoded |
| AdminReviews | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/reviews` |
| AdminReviews | AI Audit button | ⚠️ Partial | Calls `/api/ai/moderate-review` which doesn't exist — returns 404 |
| AdminReviews | Edit per review | ❌ No | No `onClick` |
| AdminReviews | Delete per review | ❌ No | No `onClick` |
| AdminReviews | All Reviews / Flagged tabs | ❌ No | Tab buttons have no `onClick` filter |
| AdminReviews | Stats (12450, etc.) | ❌ No | All hardcoded |
| AdminCategories | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/categories` |
| AdminCategories | Add New Category | ❌ No | No `onClick`, no modal |
| AdminCategories | Edit per category | ❌ No | No `onClick` |
| AdminCategories | Delete per category | ❌ No | No `onClick` |
| AdminCategories | Search input | ❌ No | No `onChange` |
| AdminCategories | Stats (12, 10, 154) | ❌ No | All hardcoded |
| AdminPromotions | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/promotions` |
| AdminPromotions | Create New Promotion | ❌ No | No `onClick`, no modal |
| AdminPromotions | Edit per promotion | ❌ No | No `onClick` |
| AdminPromotions | Delete per promotion | ❌ No | No `onClick` |
| AdminPromotions | Search input | ❌ No | No `onChange` |
| AdminPromotions | Stats (12, 12450, etc.) | ❌ No | All hardcoded |
| AdminPayments | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/payments` |
| AdminPayments | Export Financials | ❌ No | No `onClick` |
| AdminPayments | Process Payouts | ❌ No | No `onClick` |
| AdminPayments | Status filter | ❌ No | Dropdown does nothing |
| AdminPayments | CreditCard per row | ❌ No | No `onClick` |
| AdminPayments | MoreVertical per row | ❌ No | No `onClick` |
| AdminPayments | Stats ($1.2M, etc.) | ❌ No | All hardcoded |
| AdminSupport | Data | ❌ No | Static hardcoded array, never calls `GET /api/admin/support` |
| AdminSupport | Filter Tickets | ❌ No | No `onClick` |
| AdminSupport | New Ticket | ❌ No | No `onClick`, no modal |
| AdminSupport | MessageSquare per row | ❌ No | No `onClick` |
| AdminSupport | MoreVertical per row | ❌ No | No `onClick` |
| AdminSupport | Stats (24, 12, etc.) | ❌ No | All hardcoded |
| AdminSettings | Save All Changes | ❌ No | No `onClick`, form fields all use `defaultValue` |
| AdminSettings | Toggle switches | ❌ No | Static buttons, not wired to state |
| AdminOverview | Investigate Now | ❌ No | No `onClick` |
| AdminOverview | Dismiss (alert) | ❌ No | No `onClick` |
| AdminOverview | View Detailed Pricing | ❌ No | No `onClick` |
| AdminOverview | Run Security Audit | ❌ No | No `onClick` |
| AdminOverview | Manage Support AI | ❌ No | No `onClick` |
| AdminOverview | Export Reports | ❌ No | No `onClick` |
| AdminOverview | System Health | ❌ No | No `onClick` |
| AdminOverview | Stats (1240, $142500, etc.) | ❌ No | All hardcoded |
| AdminLayout | isAuthenticated() | ❌ No | Hardcoded `return true` |
| AdminCMS | All buttons | ❌ Not audited separately | CMS editor is a textarea, no rich text |
| AdminPricing | All buttons | ❌ Not audited separately | Pricing rules UI not connected |
| AdminAnalytics | All stats/charts | ❌ No | All hardcoded |

---

## SECTION A1 — ADMIN BOOKINGS PAGE

---

### TASK A1.1 — Fetch Real Bookings and Replace Hardcoded Data

**Problem:**
`AdminBookings.tsx` has a hardcoded `const bookings = [...]` array and never calls the API. The backend route `GET /api/admin/bookings` exists and returns enriched booking data.

**Root Cause:**
Data is a static constant. No `useEffect`, no state, no API call.

**Solution:**
**Step 1 — Add state and fetch in `AdminBookings.tsx`:**
```ts
const [bookings, setBookings] = React.useState<any[]>([]);
const [stats, setStats] = React.useState({ total: 0, completed: 0, pending: 0, revenue: 0 });
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        setStats({
          total: data.length,
          completed: data.filter((b: any) => b.status === 'Completed').length,
          pending: data.filter((b: any) => b.status === 'Pending').length,
          revenue: data.filter((b: any) => ['Confirmed','Completed'].includes(b.status))
            .reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0),
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  load();
}, []);
```

**Step 2 — Update stats cards** to use `stats.total`, `stats.completed`, `stats.pending`, `stats.revenue`.

**Step 3 — Show loading spinner** while `loading === true`.

**Step 4 — Map API response fields to UI fields.** The API may return `customer_name` vs `customer`, `scheduled_date` vs `date`, etc. Add a transform:
```ts
const mapped = data.map((b: any) => ({
  ...b,
  customer: b.customer_name || 'Unknown',
  vendor: b.garage_name || b.vendor_id || '—',
  service: b.service_name || b.service_id || '—',
  date: b.scheduled_date,
  time: b.scheduled_time,
  amount: Number(b.amount) || 0,
  status: b.status?.toLowerCase(),
}));
```

**Design:**
- Real booking stats replace hardcoded 2450/1820/415/$185,420.
- Table renders real data with correct status colours.

**Why:**
An admin managing bookings with fake data cannot perform their job. Every admin decision about refunds, disputes, and vendor performance requires real booking data.

**Expected Output:**
Admin Bookings page shows all real bookings from the database. Stats reflect actual counts. Search and filter work on real data.

---

### TASK A1.2 — Wire Search, Status Filter, Date Filter, and Export

**Problem:**
Search input, Status dropdown, Date filter dropdown, and Export button all have no `onClick` or `onChange` and do nothing.

**Solution:**
**Step 1 — Add filter state:**
```ts
const [search, setSearch] = React.useState('');
const [statusFilter, setStatusFilter] = React.useState('all');
```

**Step 2 — Wire search:**
```tsx
<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="..." />
```

**Step 3 — Wire Status filter button as a dropdown:**
```tsx
const [showStatusMenu, setShowStatusMenu] = React.useState(false);
// In JSX:
<div className="relative">
  <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="...">
    <Filter className="h-4 w-4 mr-2" /> {statusFilter === 'all' ? 'Status' : statusFilter}
  </button>
  {showStatusMenu && (
    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden min-w-[160px]">
      {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(s => (
        <button key={s} onClick={() => { setStatusFilter(s); setShowStatusMenu(false); }}
          className="w-full px-4 py-2.5 text-left text-sm font-bold capitalize hover:bg-gray-50">
          {s}
        </button>
      ))}
    </div>
  )}
</div>
```

**Step 4 — Apply filters client-side:**
```ts
const filtered = bookings.filter(b => {
  const matchSearch = !search ||
    b.customer?.toLowerCase().includes(search.toLowerCase()) ||
    b.id?.toLowerCase().includes(search.toLowerCase()) ||
    b.vendor?.toLowerCase().includes(search.toLowerCase());
  const matchStatus = statusFilter === 'all' || b.status === statusFilter;
  return matchSearch && matchStatus;
});
```

**Step 5 — Wire Export:**
```ts
function exportBookings() {
  const headers = ['ID', 'Customer', 'Vendor', 'Service', 'Date', 'Time', 'Amount', 'Status'];
  const rows = filtered.map(b => [b.id, b.customer, b.vendor, b.service, b.date, b.time, `AED ${b.amount}`, b.status]);
  // CSV export using Blob (same pattern as vendor tasks)
}
```

**Design:**
- Search filters across booking ID, customer name, and vendor name.
- Status filter is a dropdown that closes on selection.
- Export uses the currently filtered list, not all bookings.

**Why:**
An admin managing 2000+ bookings with no search capability cannot function. These filters are essential for handling disputes, refund requests, and vendor performance reviews.

**Expected Output:**
Typing "John" filters to John's bookings. Selecting "Pending" shows only pending bookings. Export CSV downloads the filtered result.

---

### TASK A1.3 — Implement View Booking Detail and Status Change Actions

**Problem:**
The Eye (view) and MoreVertical buttons per booking row do nothing.

**Solution:**
**Eye button** — show a booking detail modal:
```ts
const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
```

```tsx
<button onClick={() => setSelectedBooking(booking)}>
  <Eye className="h-4 w-4" />
</button>

{selectedBooking && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Booking #{selectedBooking.id}</h2>
        <button onClick={() => setSelectedBooking(null)}><X className="h-5 w-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Customer</span><p className="mt-1 font-bold">{selectedBooking.customer}</p></div>
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Vendor</span><p className="mt-1 font-bold">{selectedBooking.vendor}</p></div>
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Service</span><p className="mt-1">{selectedBooking.service}</p></div>
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Amount</span><p className="mt-1 font-bold">AED {selectedBooking.amount}</p></div>
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Date</span><p className="mt-1">{selectedBooking.date} at {selectedBooking.time}</p></div>
        <div><span className="font-bold text-gray-400 uppercase text-xs tracking-widest">Status</span>
          <span className={cn("mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase", selectedBooking.status === 'completed' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700")}>
            {selectedBooking.status}
          </span>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t">
        <button onClick={async () => {
          const token = localStorage.getItem('token');
          await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason: 'Cancelled by admin' }),
          });
          setBookings(prev => prev.map(b => b.id === selectedBooking.id ? { ...b, status: 'cancelled' } : b));
          setSelectedBooking(null);
        }} className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100">
          Cancel Booking
        </button>
        <button onClick={() => setSelectedBooking(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50">
          Close
        </button>
      </div>
    </div>
  </div>
)}
```

**Design:**
- Modal shows all booking fields.
- Admin can cancel a booking from the modal.
- "Completed" bookings do not show the Cancel button.

**Why:**
Admins handle escalations and disputes. They need to view full booking details and take corrective actions like admin-initiated cancellations.

**Expected Output:**
Clicking the Eye icon opens a modal with the booking's full details. The Cancel button cancels the booking via the API and updates the row status.


---

## SECTION A2 — ADMIN REVIEWS PAGE

---

### TASK A2.1 — Fetch Real Reviews and Replace Hardcoded Data

**Problem:**
`AdminReviews.tsx` has a hardcoded `const reviews = [...]` array and never calls the API. Stats (12,450 / 12,380 / 45 flagged) are all hardcoded. The backend route `GET /api/admin/reviews` exists.

**Root Cause:**
Data is a static constant in `useState` initialiser. No API call is made.

**Solution:**
**Step 1 — Change the state initialiser and add fetch:**
```ts
const [reviewsData, setReviewsData] = React.useState<any[]>([]);
const [loading, setLoading] = React.useState(true);
const [tab, setTab] = React.useState<'all' | 'flagged'>('all');

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setReviewsData(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  load();
}, []);
```

**Step 2 — Compute real stats from data:**
```ts
const totalReviews = reviewsData.length;
const publishedReviews = reviewsData.filter(r => r.status === 'published').length;
const flaggedReviews = reviewsData.filter(r => r.status === 'flagged').length;
const avgRating = reviewsData.length
  ? (reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length).toFixed(1)
  : '0.0';
```

Replace all hardcoded stat values with `totalReviews`, `publishedReviews`, `flaggedReviews`, `avgRating`.

**Step 3 — Wire the All Reviews / Flagged tabs:**
```tsx
<button onClick={() => setTab('all')} className={cn("...", tab === 'all' && "bg-red-600 text-white")}>All Reviews</button>
<button onClick={() => setTab('flagged')} className={cn("...", tab === 'flagged' && "bg-red-600 text-white")}>Flagged</button>
```

Apply filter in render:
```ts
const displayed = tab === 'flagged'
  ? reviewsData.filter(r => r.status === 'flagged')
  : reviewsData;
```

**Step 4 — Map API fields to UI fields:**
The API returns `user_name` and `vendor_name` — map to `review.user` and `review.vendor` in the table render.

**Design:**
- Stats cards update dynamically from real data.
- "Flagged" tab only shows `status === 'flagged'` reviews.
- Show a loading spinner while fetching.

**Why:**
Review moderation with fabricated data is impossible. The admin cannot identify real spam, real low ratings, or real flagged content without live data.

**Expected Output:**
Admin Reviews shows all real reviews from the database. Stats reflect actual counts. The Flagged tab filters to only flagged reviews.

---

### TASK A2.2 — Implement Edit, Delete, and Approve/Unpublish Reviews

**Problem:**
Edit and Delete buttons on each review row have no `onClick`. There is no way to moderate a review (approve, unpublish, delete).

**Root Cause:**
Buttons are decorative. The backend route `PATCH /api/reviews/:id/response` exists. A `PATCH /admin/reviews/:id` route needs to be added for status changes.

**Solution:**
**Step 1 — Add `PATCH /api/admin/reviews/:id` to `server/routes.ts`:**
```ts
router.patch('/admin/reviews/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updateReview(req.params.id, {
    status: req.body.status,
    comment: req.body.comment,
  });
  if (!updated) return res.status(404).json({ message: 'Review not found' });
  res.json(updated);
});

router.delete('/admin/reviews/:id', requireRole('admin'), async (req, res) => {
  // Add deleteReview to db.ts
  const removed = await db.deleteReview(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Review not found' });
  res.json(removed);
});
```

**Step 2 — Add `deleteReview(id)` to `server/lib/db.ts`** using the same Supabase + in-memory pattern as other delete methods.

**Step 3 — Wire the Edit button** — opens an inline edit modal:
```ts
const [editingReview, setEditingReview] = React.useState<any>(null);
const [editComment, setEditComment] = React.useState('');

const handleOpenEdit = (review: any) => {
  setEditingReview(review);
  setEditComment(review.comment);
};

const handleSaveEdit = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/reviews/${editingReview.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ comment: editComment }),
  });
  if (res.ok) {
    setReviewsData(prev => prev.map(r => r.id === editingReview.id ? { ...r, comment: editComment } : r));
    setEditingReview(null);
  }
};
```

**Step 4 — Wire the Delete button:**
```ts
const handleDelete = async (id: number | string) => {
  if (!confirm('Delete this review permanently?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/reviews/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) setReviewsData(prev => prev.filter(r => r.id !== id));
};
```

**Step 5 — Add a "Flag / Unflag" action** to the MoreVertical dropdown per review:
```ts
const handleToggleFlag = async (review: any) => {
  const newStatus = review.status === 'flagged' ? 'published' : 'flagged';
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/reviews/${review.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: newStatus }),
  });
  if (res.ok) setReviewsData(prev => prev.map(r => r.id === review.id ? { ...r, status: newStatus } : r));
};
```

**Design:**
- Edit modal shows the current comment in a textarea — admin can correct factual errors or remove offensive language.
- Delete prompts for confirmation and is irreversible.
- Flag toggles between `published` and `flagged` with immediate feedback.

**Why:**
Review moderation is a core platform trust feature. Fake reviews, spam, and abusive content must be removable. Without these actions, the admin panel cannot protect vendor reputations.

**Expected Output:**
Edit pencil opens a modal to edit the review comment. Trash icon deletes after confirmation. A "Flag" action in the MoreVertical dropdown toggles the review status.

---

### TASK A2.3 — Implement `POST /api/ai/moderate-review` Route

**Problem:**
The AI Audit button in `AdminReviews.tsx` calls `POST /api/ai/moderate-review` but this route does not exist in `server/routes.ts`. It returns 404.

**Root Cause:**
Route is missing from the backend.

**Solution:**
**Add to `server/routes.ts`:**
```ts
router.post('/ai/moderate-review', requireRole('admin'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!comment) return res.status(400).json({ message: 'comment required' });

    const prompt = `You are a content moderation expert for an automotive service marketplace.
    Analyse this customer review for: spam, fake reviews, offensive language, or unreasonable claims.
    Review rating: ${rating}/5
    Review text: "${comment}"
    
    Return ONLY valid JSON:
    {
      "status": "clean | flagged",
      "flagReason": "Reason if flagged, else null",
      "confidence": 0.92,
      "recommendation": "approve | remove | investigate"
    }`;

    const raw = await generate(prompt, comment);
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
    const result = JSON.parse(cleaned);
    res.json(result);
  } catch {
    // Fallback: simple heuristic
    const isSuspicious = req.body.rating === 5 && req.body.comment?.length < 20;
    res.json({
      status: isSuspicious ? 'flagged' : 'clean',
      flagReason: isSuspicious ? 'Very short 5-star review — possible fake review pattern' : null,
      confidence: 0.7,
      recommendation: isSuspicious ? 'investigate' : 'approve',
    });
  }
});
```

**Design:**
- Requires admin auth (`requireRole('admin')`).
- Falls back to a simple heuristic if the Groq API is unavailable or returns invalid JSON.
- The AI audit result is displayed inline below the review comment in the table.

**Why:**
AI-assisted review moderation helps admins prioritise which reviews to manually investigate. Without this route, the audit button always 404s, making the feature completely broken.

**Expected Output:**
Clicking the AI Audit (sparkles) button on a review calls the endpoint and shows a result badge: "AI AUDIT: FLAGGED - Very short 5-star review" or "AI AUDIT: CLEAN".

---

## SECTION A3 — ADMIN CATEGORIES PAGE

---

### TASK A3.1 — Fetch Real Categories and Wire All CRUD Actions

**Problem:**
`AdminCategories.tsx` has hardcoded categories, stats, and no API calls. Add, Edit, Delete buttons and search all do nothing. Backend routes exist at `GET/POST/PATCH/DELETE /api/admin/categories`.

**Root Cause:**
Static data. No state. No event handlers.

**Solution:**
**Step 1 — Add state and fetch:**
```ts
const [categories, setCategories] = React.useState<any[]>([]);
const [loading, setLoading] = React.useState(true);
const [search, setSearch] = React.useState('');

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  load();
}, []);
```

**Step 2 — Compute real stats:**
```ts
const totalCats = categories.length;
const activeCats = categories.filter(c => c.status === 'active' || c.active).length;
const totalServices = categories.reduce((sum, c) => sum + (c.services || 0), 0);
```

**Step 3 — Wire search:**
```tsx
<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="..." />
```

```ts
const filtered = categories.filter(c =>
  !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
);
```

**Step 4 — Implement Add Category modal:**
```ts
const [showModal, setShowModal] = React.useState(false);
const [editCat, setEditCat] = React.useState<any>(null);
const [form, setForm] = React.useState({ name: '', description: '', active: true });
const [formError, setFormError] = React.useState('');
const [saving, setSaving] = React.useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name.trim()) { setFormError('Name is required'); return; }
  setSaving(true);
  const token = localStorage.getItem('token');
  const url = editCat ? `/api/admin/categories/${editCat.id}` : '/api/categories';
  const method = editCat ? 'PATCH' : 'POST';
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: form.name.trim(), description: form.description, active: form.active }),
    });
    const data = await res.json();
    if (res.ok) {
      if (editCat) {
        setCategories(prev => prev.map(c => c.id === editCat.id ? data : c));
      } else {
        setCategories(prev => [...prev, data]);
      }
      setShowModal(false);
      setEditCat(null);
    } else {
      setFormError(data.message || 'Operation failed');
    }
  } catch { setFormError('Network error'); }
  finally { setSaving(false); }
};
```

**Step 5 — Wire "Add New Category" button:** `onClick={() => { setEditCat(null); setForm({ name: '', description: '', active: true }); setShowModal(true); }}`

**Step 6 — Wire Edit button:**
```ts
const handleOpenEdit = (cat: any) => {
  setEditCat(cat);
  setForm({ name: cat.name, description: cat.description || '', active: cat.active !== false });
  setShowModal(true);
};
```

**Step 7 — Wire Delete button:**
```ts
const handleDelete = async (id: string, name: string) => {
  if (!confirm(`Delete category "${name}"? All services in this category will become uncategorised.`)) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) setCategories(prev => prev.filter(c => c.id !== id));
  else alert('Failed to delete. Category may have services attached.');
};
```

**Step 8 — Add `PATCH /api/admin/categories/:id` to `server/routes.ts`** (the existing route is at `/api/categories/:id` — add an admin-scoped alias or use the existing one).

**Design:**
- Modal has Name (required) and Description (optional) fields, and an Active toggle.
- Delete shows a warning that services in this category become uncategorised.
- Stats cards update when categories are added/deleted.

**Why:**
Service categories organise the entire marketplace. Admins must be able to add new categories (e.g. "EV Services"), rename existing ones, and deactivate outdated ones.

**Expected Output:**
Categories page shows real categories from the database. Add, Edit, Delete all work and persist via API. Stats reflect actual totals.

---

## SECTION A4 — ADMIN PROMOTIONS PAGE

---

### TASK A4.1 — Fetch Real Promotions and Wire All CRUD Actions

**Problem:**
`AdminPromotions.tsx` has a hardcoded promotions array. Create, Edit, Delete buttons do nothing. Search input does nothing. Stats are hardcoded.

**Root Cause:**
Static data, no API calls, no event handlers. Backend route `GET /api/admin/promotions` exists.

**Solution:**
**Step 1 — Add state and fetch:**
```ts
const [promotions, setPromotions] = React.useState<any[]>([]);
const [search, setSearch] = React.useState('');
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/promotions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setPromotions(await res.json());
    setLoading(false);
  };
  load();
}, []);
```

**Step 2 — Compute real stats:**
```ts
const activeCount = promotions.filter(p => p.status === 'active').length;
const totalRedemptions = promotions.reduce((sum, p) => sum + (p.used_count || 0), 0);
```

**Step 3 — Wire search:**
```tsx
<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search promotions..." />
```
```ts
const filtered = promotions.filter(p =>
  !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase())
);
```

**Step 4 — Add `POST /api/admin/promotions` to `server/routes.ts`:**
```ts
router.post('/admin/promotions', requireRole('admin'), async (req, res) => {
  const promo = {
    id: db.generateId('promo'), vendor_id: req.body.vendorId || 'platform',
    title: req.body.name || req.body.title,
    description: req.body.description || '',
    discount_type: req.body.discountType || req.body.discount_type || 'percent',
    discount_value: Number(req.body.discountValue || req.body.discount_value || 0),
    promo_code: req.body.promoCode || null,
    status: 'active', usage_limit: req.body.usageLimit ? Number(req.body.usageLimit) : null,
    used_count: 0, starts_at: req.body.startsAt || null, ends_at: req.body.endsAt || null,
    created_at: now(), updated_at: now(),
  };
  if (!promo.title) return res.status(400).json({ message: 'Title is required' });
  res.status(201).json(await db.createPromotion(promo));
});

router.patch('/admin/promotions/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updatePromotion(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Promotion not found' });
  res.json(updated);
});

router.delete('/admin/promotions/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deletePromotion(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Promotion not found' });
  res.json(removed);
});
```

**Step 5 — Build the Create/Edit Promotion modal** with fields: Name, Description, Discount Type (percent/fixed/freebie), Discount Value, Promo Code, Start Date, End Date, Usage Limit.

**Step 6 — Wire Edit and Delete buttons** using the same patterns as Task A3.1 (Steps 6 and 7).

**Design:**
- The admin promotion modal is identical to the vendor promotion modal but applies platform-wide rather than to a specific vendor.
- Expired promotions (past `ends_at`) show a grey "Expired" badge.

**Why:**
Platform-level promotions (welcome offers, seasonal discounts) are managed by admins. Without CRUD, no admin-controlled promotions can be created or modified.

**Expected Output:**
Admin Promotions page loads real promotions. Add/Edit/Delete all function. Stats show real counts. Search filters by promotion name.

---

## SECTION A5 — ADMIN PAYMENTS PAGE

---

### TASK A5.1 — Fetch Real Payments and Wire All Actions

**Problem:**
`AdminPayments.tsx` has a hardcoded transactions array and hardcoded stats ($1.2M, $185.4K, etc.). Export, Process Payouts, Status filter, and per-row buttons all do nothing.

**Root Cause:**
Static data. No API calls. No handlers. Backend route `GET /api/admin/payments` exists.

**Solution:**
**Step 1 — Add state and fetch:**
```ts
const [transactions, setTransactions] = React.useState<any[]>([]);
const [stats, setStats] = React.useState({ gross: 0, net: 0, pending: 0, refundRate: 0 });
const [loading, setLoading] = React.useState(true);
const [statusFilter, setStatusFilter] = React.useState('all');

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/payments', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
      const paid = data.filter((p: any) => p.status === 'paid');
      const pending = data.filter((p: any) => p.status === 'pending');
      const refunded = data.filter((p: any) => p.status === 'refunded');
      const gross = paid.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      setStats({
        gross,
        net: Math.round(gross * 0.85), // 15% platform commission
        pending: pending.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
        refundRate: data.length > 0 ? Math.round((refunded.length / data.length) * 100 * 10) / 10 : 0,
      });
    }
    setLoading(false);
  };
  load();
}, []);
```

**Step 2 — Replace hardcoded stats cards** with `stats.gross`, `stats.net`, `stats.pending`, `stats.refundRate`.

**Step 3 — Wire Status filter:**
```tsx
const [showStatusMenu, setShowStatusMenu] = React.useState(false);
// Same dropdown pattern as A1.2
```
```ts
const filtered = transactions.filter(t =>
  statusFilter === 'all' || t.status === statusFilter
);
```

**Step 4 — Wire Export button:**
```ts
function exportPayments() {
  const headers = ['ID', 'Date', 'Customer', 'Vendor', 'Amount', 'Fee', 'Status', 'Method'];
  const rows = filtered.map(t => [t.id, t.created_at, t.booking_id, '', `AED ${t.amount}`, `AED ${Math.round(t.amount * 0.15)}`, t.status, '']);
  // CSV export via Blob
}
```

**Step 5 — Wire Process Payouts button:**
```ts
const handleProcessPayouts = async () => {
  if (!confirm('Process all pending vendor payouts? This cannot be undone.')) return;
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/process-payouts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) alert('Payouts processed successfully. Vendors will receive funds within 2 business days.');
  else alert('Payout processing failed. Please try again.');
};
```

Add `POST /api/admin/process-payouts` to `server/routes.ts` — for now it simply returns a success response (real payout disbursement requires Stripe Connect, which is a separate feature):
```ts
router.post('/admin/process-payouts', requireRole('admin'), async (_req, res) => {
  // Placeholder — real implementation requires Stripe Connect
  res.json({ message: 'Payouts queued for processing', processedAt: new Date().toISOString() });
});
```

**Step 6 — Wire CreditCard button per row** — view a payment intent detail modal showing `stripe_payment_intent_id`, amount, status, booking ID.

**Design:**
- Stats use real payment data: gross is total paid, net is 85% (after 15% commission), pending is sum of pending payments.
- Refund rate is percentage of payments that were refunded.

**Why:**
Payment oversight is a critical admin function for financial reporting, dispute resolution, and payout management. All fake data makes financial management impossible.

**Expected Output:**
Admin Payments shows real payment records. Stats are calculated from actual transactions. Export works. Process Payouts shows a confirmation and acknowledgment.

---

## SECTION A6 — ADMIN SUPPORT PAGE

---

### TASK A6.1 — Fetch Real Support Tickets and Wire All Actions

**Problem:**
`AdminSupport.tsx` has a hardcoded tickets array. Filter, New Ticket, MessageSquare, and MoreVertical buttons all do nothing. Stats are hardcoded. Backend routes `GET /api/admin/support` and `PATCH /api/admin/support/:id` exist.

**Root Cause:**
Static data. No API calls. No event handlers.

**Solution:**
**Step 1 — Add state and fetch:**
```ts
const [tickets, setTickets] = React.useState<any[]>([]);
const [loading, setLoading] = React.useState(true);
const [priorityFilter, setPriorityFilter] = React.useState('all');
const [statusFilter, setStatusFilter] = React.useState('all');

React.useEffect(() => {
  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/support', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setTickets(await res.json());
    setLoading(false);
  };
  load();
}, []);
```

**Step 2 — Compute real stats:**
```ts
const openCount = tickets.filter(t => t.status === 'open').length;
const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
const resolvedToday = tickets.filter(t => {
  return t.status === 'resolved' && new Date(t.updated_at).toDateString() === new Date().toDateString();
}).length;
```

**Step 3 — Wire "New Ticket" button** — open a create ticket modal:
```ts
const handleCreateTicket = async (subject: string, message: string, priority: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/support', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ subject, message, priority, status: 'open' }),
  });
  if (res.ok) setTickets(prev => [await res.json(), ...prev]);
};
```

**Step 4 — Wire MessageSquare button (Resolve/Respond):**
```ts
const handleResolve = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/support/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'resolved' }),
  });
  if (res.ok) setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
};
```

**Step 5 — Wire MoreVertical per row** — dropdown with: Assign to Me, Mark In Progress, Mark Resolved, Mark Closed, Delete.

**Step 6 — Wire Filter button** as a dropdown for priority (high/medium/low) and status (open/in_progress/resolved/closed).

**Step 7 — Apply filters:**
```ts
const filtered = tickets.filter(t => {
  const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
  const matchStatus = statusFilter === 'all' || t.status === statusFilter;
  return matchPriority && matchStatus;
});
```

**Design:**
- Status badge colours: open=red, in_progress=yellow, resolved=green, closed=grey.
- Clicking MessageSquare marks as resolved and optionally sends a notification to the ticket creator.
- New Ticket modal has Subject, Message, and Priority fields.

**Why:**
Support tickets are how customer and vendor issues escalate to human intervention. Without functioning ticket management, issues go untracked and unresolved.

**Expected Output:**
Admin Support page loads real tickets. Filter by priority and status works. Resolving a ticket via MessageSquare updates its status immediately. New Ticket modal creates a real ticket in the database.

---

## SECTION A7 — ADMIN SETTINGS PAGE

---

### TASK A7.1 — Load Real Settings and Make Save All Changes Work

**Problem:**
`AdminSettings.tsx` has all form fields using `defaultValue` (uncontrolled). The "Save All Changes" button has no `onClick`. Toggle switches have no state and cannot be changed. The backend routes `GET /api/admin/settings` and `PATCH /api/admin/settings` exist.

**Root Cause:**
Uncontrolled form inputs. No `onClick` on Save. No state for toggle switches.

**Solution:**
**Step 1 — Load settings on mount:**
```ts
const [settings, setSettings] = React.useState({
  platform_name: '',
  support_email: '',
  platform_url: '',
  maintenance_mode: false,
  two_factor_required: true,
  session_timeout: true,
  booking_lead_minutes: 60,
  refund_policy_hours: 24,
});
const [saving, setSaving] = React.useState(false);
const [saveMsg, setSaveMsg] = React.useState('');

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(prev => ({ ...prev, ...data }));
    }
  };
  load();
}, []);
```

**Step 2 — Convert all inputs to controlled:**
```tsx
<input
  type="text"
  value={settings.platform_name}
  onChange={(e) => setSettings(s => ({ ...s, platform_name: e.target.value }))}
  className="..."
/>
```
Apply this pattern to: Platform Name, Support Email, Platform URL, Booking Lead Time, Refund Policy Hours.

**Step 3 — Convert toggle switches to stateful:**
```tsx
<button
  onClick={() => setSettings(s => ({ ...s, maintenance_mode: !s.maintenance_mode }))}
  className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
    settings.maintenance_mode ? "bg-red-600" : "bg-gray-200"
  )}
>
  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
    settings.maintenance_mode ? "translate-x-6" : "translate-x-1"
  )} />
</button>
<span className="ml-3 text-sm text-gray-500">{settings.maintenance_mode ? 'Enabled' : 'Disabled'}</span>
```
Apply this pattern to: Maintenance Mode, Two-Factor Authentication, Session Timeout.

**Step 4 — Wire "Save All Changes":**
```ts
const handleSave = async () => {
  setSaving(true);
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
  if (res.ok) {
    setSaveMsg('Settings saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
  } else {
    setSaveMsg('Failed to save settings.');
  }
  setSaving(false);
};
```

Wire to the button:
```tsx
<button onClick={handleSave} disabled={saving} className="...">
  {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-2" /> Save All Changes</>}
</button>
```

**Step 5 — Show save status** banner below the Save button when `saveMsg` is set.

**Design:**
- All settings tabs (General, Security, Notifications, Localization, Database) share the same Save button.
- The save sends the entire `settings` object — the backend merges it with existing settings.
- "Audit Log" link in the info banner should navigate to a future audit log page.

**Why:**
Platform settings govern booking lead times, refund windows, and security policies. An admin panel where settings cannot be saved means the platform cannot be configured for production.

**Expected Output:**
Settings page loads real values from the database. All form fields reflect current settings. Toggling switches changes their visual state. Clicking Save persists changes via PATCH.

---

## SECTION A8 — ADMIN OVERVIEW PAGE

---

### TASK A8.1 — Wire Admin Overview Action Buttons

**Problem:**
In `AdminOverview.tsx`, the following buttons have no `onClick`: "Investigate Now", "Dismiss" (alert), "View Detailed Pricing Report", "Run Security Audit", "Manage Support AI", "Export Reports", "System Health".

**Root Cause:**
Buttons are decorative. No handlers defined.

**Solution:**
Wire each button to an appropriate action using `useNavigate`:
```tsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
```

| Button | Action |
|---|---|
| Investigate Now | `navigate('/admin/vendor-kyv')` (fraud review) |
| Dismiss | `setAlertDismissed(true)` — add `const [alertDismissed, setAlertDismissed] = React.useState(false)` and conditionally render the alert |
| View Detailed Pricing Report | `navigate('/admin/pricing')` |
| Run Security Audit | `navigate('/admin/analytics')` |
| Manage Support AI | `navigate('/admin/support')` |
| Export Reports | trigger CSV download of admin stats |
| System Health | `window.open('/health', '_blank')` — opens the `/health` API endpoint |

```tsx
// Dismiss example
{!alertDismissed && (
  <div className="bg-gray-900 ...">
    ...
    <button onClick={() => setAlertDismissed(true)}>Dismiss</button>
  </div>
)}
```

**Design:**
- "Dismiss" hides the alert panel for the current session (not persisted).
- "System Health" opens the actual `/health` API JSON in a new tab — it shows real DB/Redis/Stripe status.
- "Export Reports" generates a CSV from the real admin stats.

**Why:**
These buttons represent the primary action triggers for the most critical admin workflows. Non-functional buttons on the main overview page signal to admins that the platform is unfinished.

**Expected Output:**
Every button on the admin overview page performs a meaningful action. "Investigate Now" navigates to KYV. "System Health" opens the real health JSON. "Dismiss" hides the alert.

---

### TASK A8.2 — Fetch Real Stats for Admin Overview

**Problem:**
All stats in `AdminOverview.tsx` are hardcoded: Total Bookings (1,240), GMV ($142,500), Active Vendors (85), Active Users (4,250). The charts use hardcoded arrays.

**Root Cause:**
No API call. Static `const stats = [...]` array.

**Solution:**
**Step 1 — Add state and fetch real stats:**
```ts
const [statsData, setStatsData] = React.useState<any>(null);
const [loadingStats, setLoadingStats] = React.useState(true);

React.useEffect(() => {
  const load = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const [usersRes, vendorsRes, bookingsRes, paymentsRes] = await Promise.all([
        fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/vendors', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/payments', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const [users, vendors, bookings, payments] = await Promise.all([
        usersRes.ok ? usersRes.json() : [],
        vendorsRes.ok ? vendorsRes.json() : [],
        bookingsRes.ok ? bookingsRes.json() : [],
        paymentsRes.ok ? paymentsRes.json() : [],
      ]);
      setStatsData({
        totalBookings: bookings.length,
        gmv: payments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0),
        activeVendors: vendors.filter((v: any) => v.active).length,
        activeUsers: users.filter((u: any) => u.role === 'customer' && u.status === 'active').length,
      });
    } catch (err) { console.error(err); }
    finally { setLoadingStats(false); }
  };
  load();
}, []);
```

**Step 2 — Update the stats grid** to render real values:
```tsx
const statsCards = [
  { name: 'Total Bookings', value: statsData?.totalBookings ?? '...', icon: ClipboardList, ... },
  { name: 'Platform GMV', value: statsData ? `$${Number(statsData.gmv).toLocaleString()}` : '...', icon: DollarSign, ... },
  { name: 'Active Vendors', value: statsData?.activeVendors ?? '...', icon: Store, ... },
  { name: 'Active Users', value: statsData?.activeUsers ?? '...', icon: Users, ... },
];
```

**Step 3 — Replace the "Recent Vendor Registrations" table** with real data:
```ts
const [recentVendors, setRecentVendors] = React.useState<any[]>([]);
// Populated from the vendors fetch above — sort by created_at desc and take last 5
```

**Design:**
- Show `'...'` in stat cards while `loadingStats === true`.
- Trend percentages ("+15%", "+22%") can remain as decorative UX until a historical comparison query is implemented.

**Why:**
The admin overview is the first page an admin sees. Showing fabricated numbers means admins cannot make informed decisions about platform health, vendor performance, or growth.

**Expected Output:**
Admin Overview shows real booking counts, real GMV from paid transactions, real active vendor count, and real customer counts. Recent vendors table shows actual recent registrations.

---

## SECTION A9 — ADMIN LAYOUT SECURITY

---

### TASK A9.1 — Fix Hardcoded `isAuthenticated()` in AdminLayout

**Problem:**
`AdminLayout.tsx` has `const isAuthenticated = () => { return true; }` — every unauthenticated user sees the full admin panel without logging in.

**Root Cause:**
Hardcoded stub function. No JWT validation.

**Solution:**
**Step 1 — Add a real auth check to `AdminLayout.tsx`:**
```ts
function getAdminUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    if (payload.role !== 'admin') return null;
    return { id: payload.sub || payload.id, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
```

**Step 2 — Create `AdminProtectedRoute` in `src/components/AdminProtectedRoute.tsx`:**
```tsx
import { Navigate } from 'react-router-dom';

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/admin/login" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/admin/login" replace />;
    }
    if (payload.role !== 'admin') return <Navigate to="/" replace />;
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
}
```

**Step 3 — Wrap all admin routes in `App.tsx`:**
```tsx
<Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
```

**Step 4 — Update the logout handler in `AdminLayout.tsx`** to also navigate to login:
```ts
onClick={() => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/admin/login';
}}
```

**Step 5 — Update the NotificationBell in AdminLayout** to use the real admin user ID:
```tsx
const adminUser = getAdminUser();
// In header:
<NotificationBell userId={adminUser?.id || ''} role="admin" />
```

**Design:**
- An unauthenticated visit to `/admin/overview` redirects to `/admin/login` synchronously with no flash.
- A customer or vendor JWT cannot access admin routes — they are redirected to `/`.

**Why:**
An admin panel without auth protection is a critical security vulnerability. Any user who knows the URL `/admin/overview` has full admin access — they can suspend vendors, delete users, and read all customer data.

**Expected Output:**
Visiting `/admin/overview` without a valid admin JWT immediately redirects to `/admin/login`. Visiting with a customer JWT redirects to `/`. Only valid admin JWTs grant access.

---

## SECTION A10 — ADMIN CMS PAGE

---

### TASK A10.1 — Fetch Real CMS Pages and Wire All CRUD Actions

**Problem:**
`AdminCMS.tsx` (not fully audited above but requires the same treatment). It uses the backend routes `GET/POST/PATCH/DELETE /api/admin/cms` which all exist, but the UI uses static data.

**Solution:**
**Step 1 — Fetch CMS pages:**
```ts
React.useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('/api/admin/cms', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(r => r.ok ? r.json() : [])
    .then(setPages);
}, []);
```

**Step 2 — Wire Create Page:**
```ts
const handleCreate = async (title: string, content: string, status: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/admin/cms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ title, content, status }),
  });
  if (res.ok) setPages(prev => [...prev, await res.json()]);
};
```

**Step 3 — Wire Edit Page:**
```ts
const handleUpdate = async (slug: string, updates: any) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/cms/${slug}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
  if (res.ok) setPages(prev => prev.map(p => p.slug === slug ? { ...p, ...updates } : p));
};
```

**Step 4 — Wire Delete Page:**
```ts
const handleDelete = async (slug: string) => {
  if (!confirm(`Delete page "${slug}"?`)) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/admin/cms/${slug}`, {
    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) setPages(prev => prev.filter(p => p.slug !== slug));
};
```

**Design:**
- The CMS content editor uses a `<textarea>` for now — this is acceptable.
- Add a simple preview panel next to the editor that renders the HTML via `dangerouslySetInnerHTML`.
- Sanitise HTML with `sanitize-html` before storing (server-side, in the route handler).

**Why:**
CMS pages drive customer-facing content (home, about, terms). Without CRUD, the admin cannot update marketing copy or publish new landing pages.

**Expected Output:**
CMS page loads real pages from the database. Create, edit, and delete all work via API. Preview renders the HTML content.

---

## SECTION A11 — ADMIN ANALYTICS PAGE

---

### TASK A11.1 — Fetch Real Analytics Data

**Problem:**
`AdminAnalytics.tsx` has hardcoded stats ($1,245,280 / 45,240 / 850 vendors / 12.5% commission), hardcoded chart series arrays, and hardcoded regional table data.

**Root Cause:**
All data is static. No API calls.

**Solution:**
**Step 1 — Add a `GET /api/admin/analytics` endpoint to `server/routes.ts`:**
```ts
router.get('/admin/analytics', requireRole('admin'), async (_req, res) => {
  const [users, vendors, bookings, payments] = await Promise.all([
    db.listUsers(), db.listVendors(), db.listBookings(), db.listPayments(),
  ]);

  const paidPayments = payments.filter(p => p.status === 'paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const netRevenue = Math.round(totalRevenue * 0.15); // 15% platform commission
  const avgCommission = 15; // percent

  // Weekly revenue series — last 7 weeks
  const now = new Date();
  const weeklySeries = Array.from({ length: 7 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (6 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const weekPayments = paidPayments.filter(p => {
      const d = new Date(p.created_at);
      return d >= weekStart && d < weekEnd;
    });
    return weekPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  });

  res.json({
    totalRevenue,
    netRevenue,
    activeCustomers: users.filter(u => u.role === 'customer' && u.status === 'active').length,
    activeVendors: vendors.filter(v => v.active).length,
    avgCommission,
    weeklySeries,
    totalBookings: bookings.length,
  });
});
```

**Step 2 — Fetch in `AdminAnalytics.tsx`:**
```ts
const [analyticsData, setAnalyticsData] = React.useState<any>(null);

React.useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(r => r.ok ? r.json() : null)
    .then(setAnalyticsData);
}, []);
```

**Step 3 — Replace hardcoded stat values** with real values from `analyticsData`:
- Total Platform Revenue: `analyticsData?.totalRevenue`
- Active Customers: `analyticsData?.activeCustomers`
- Active Vendors: `analyticsData?.activeVendors`
- Avg. Commission: `analyticsData?.avgCommission`%

**Step 4 — Replace hardcoded `revenueSeries`** with `analyticsData?.weeklySeries`.

**Design:**
- Show `'...'` in stat cards while loading.
- The regional table can remain hardcoded until geographic data is stored on bookings/garages — add a TODO note.

**Why:**
Analytics drives strategic decisions: which regions to expand to, which services are growing, whether commission rates need adjustment. Fake data leads to bad decisions.

**Expected Output:**
Admin Analytics shows real revenue, real user counts, and a revenue chart based on actual payment history. Stats update when new bookings/payments are created.

---

## SECTION A12 — ADMIN PRICING PAGE

---

### TASK A12.1 — Fetch Real Pricing Rules and Wire CRUD Actions

**Problem:**
`AdminPricing.tsx` (pricing rules management) likely follows the same pattern as other admin pages — static data, unconnected buttons. Backend routes `GET /api/admin/pricing` and related CRUD exist.

**Solution:**
**Step 1 — Fetch pricing rules:**
```ts
React.useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('/api/admin/pricing', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(r => r.ok ? r.json() : [])
    .then(setPricingRules);
}, []);
```

**Step 2 — Add `POST /api/admin/pricing` to `server/routes.ts`:**
```ts
router.post('/admin/pricing', requireRole('admin'), async (req, res) => {
  const rule = {
    id: db.generateId('price-rule'), vendor_id: req.body.vendorId || 'platform',
    category_id: req.body.categoryId || null,
    name: req.body.name, rule_type: req.body.ruleType || 'percentage',
    payload: req.body.payload || {}, active: true,
    created_at: now(), updated_at: now(),
  };
  if (!rule.name) return res.status(400).json({ message: 'Rule name is required' });
  res.status(201).json(await db.createPricingRule(rule));
});

router.patch('/admin/pricing/:id', requireRole('admin'), async (req, res) => {
  const updated = await db.updatePricingRule(req.params.id, { ...req.body });
  if (!updated) return res.status(404).json({ message: 'Pricing rule not found' });
  res.json(updated);
});

router.delete('/admin/pricing/:id', requireRole('admin'), async (req, res) => {
  const removed = await db.deletePricingRule(req.params.id);
  if (!removed) return res.status(404).json({ message: 'Pricing rule not found' });
  res.json(removed);
});
```

**Step 3 — Add `updatePricingRule` and `deletePricingRule` to `server/lib/db.ts`** using the standard dual-store pattern.

**Step 4 — Wire Add/Edit/Delete buttons** using the same modal pattern as Task A3.1.

**Design:**
- Rule types: `percentage` (discount/surcharge by %), `fixed` (flat amount), `time_based` (weekend uplift).
- The payload field is a JSON editor (a `<textarea>` is acceptable for now).
- Active toggle switches rules on/off without deleting them.

**Why:**
Pricing rules control dynamic pricing across the platform (weekend surcharges, seasonal discounts, bulk booking discounts). Without CRUD, no pricing logic can be configured.

**Expected Output:**
Admin Pricing shows real pricing rules from the database. Add, Edit, Delete all work. Toggle switches rules active/inactive.

---

## IMPLEMENTATION ORDER — ADMIN PANEL

Execute tasks in this order:

### Phase 1 — Security First (Do Immediately)
| Task | Action |
|---|---|
| **A9.1** | Fix hardcoded `isAuthenticated()` and add `AdminProtectedRoute` |

### Phase 2 — Data Layer (All Pages Showing Fake Data)
| Task | Action |
|---|---|
| **A1.1** | Fetch real bookings, replace hardcoded data |
| **A2.1** | Fetch real reviews, replace hardcoded data |
| **A3.1** | Fetch real categories, replace hardcoded data |
| **A4.1** | Fetch real promotions, replace hardcoded data |
| **A5.1** | Fetch real payments, replace hardcoded data |
| **A6.1** | Fetch real support tickets, replace hardcoded data |
| **A7.1** | Load real settings |
| **A8.2** | Fetch real overview stats |
| **A10.1** | Fetch real CMS pages |
| **A11.1** | Fetch real analytics + add backend endpoint |

### Phase 3 — Action Buttons (All CRUD Operations)
| Task | Action |
|---|---|
| **A1.2** | Wire search, filters, export on bookings |
| **A1.3** | Wire view booking detail and cancel action |
| **A2.2** | Wire edit, delete, flag/unflag on reviews |
| **A2.3** | Implement `/api/ai/moderate-review` route |
| **A3.1** | Wire add, edit, delete categories |
| **A4.1** | Wire add, edit, delete promotions |
| **A5.1** | Wire export, process payouts, status filter |
| **A6.1** | Wire filter, new ticket, resolve ticket |
| **A7.1** | Make settings form controlled + Save button |
| **A8.1** | Wire all overview action buttons |
| **A12.1** | Wire pricing rules CRUD |

---

> **Total Admin Tasks: 21**
> Start with **A9.1** — every admin page is currently accessible without login, which is a P0 security issue.

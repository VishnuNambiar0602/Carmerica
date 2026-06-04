# Vendor Portal — Complete Button & Flow Audit + Task Breakdown

> Every button in every vendor page has been audited. Each task below identifies exactly which button is broken, why, what backend route exists or is missing, and the exact steps to fix it.
> Format: **Problem → Root Cause → Solution → Design → Why → Expected Output**

---

## AUDIT SUMMARY — VENDOR PORTAL

| Page | Button / Action | Connected? | Root Cause |
|---|---|---|---|
| VendorBookings | Export CSV | ❌ No | No `onClick`, no download logic |
| VendorBookings | Schedule New | ❌ No | No `onClick`, no modal |
| VendorBookings | Search input | ❌ No | Input has no `onChange`, list not filtered |
| VendorBookings | Date Range filter | ❌ No | Dropdown renders, does nothing |
| VendorBookings | Service Type filter | ❌ No | Dropdown renders, does nothing |
| VendorBookings | Mechanic filter | ❌ No | Dropdown renders, does nothing |
| VendorBookings | Phone icon per row | ❌ No | No `onClick` |
| VendorBookings | Mail icon per row | ❌ No | No `onClick` |
| VendorBookings | MoreVertical per row | ❌ No | No `onClick`, no dropdown |
| VendorBookings | Pagination Prev/Next | ❌ No | Hardcoded disabled state, no page logic |
| VendorBookings | API fetch | ⚠️ Partial | Calls `/api/bookings` without auth token, returns all bookings not scoped to vendor |
| VendorServices | Add New Service | ❌ No | No `onClick`, no modal, services are hardcoded array |
| VendorServices | Edit (pencil) per row | ❌ No | No `onClick` |
| VendorServices | Delete (trash) per row | ❌ No | No `onClick` |
| VendorServices | AI Optimize button | ⚠️ Partial | Calls API correctly but "Apply Recommendation" button in modal does nothing |
| VendorServices | Status toggle | ❌ No | No toggle button exists in table |
| VendorServices | Service data | ❌ No | `services` array is hardcoded static data, not fetched from `/api/vendor/services` |
| VendorServices | Stats (Total/Active/Avg) | ❌ No | All hardcoded numbers |
| VendorProfile | Save Profile button | ❌ No | No `onClick`, no API call, form fields use `defaultValue` (uncontrolled) |
| VendorProfile | Camera (logo change) | ❌ No | No `onClick` |
| VendorProfile | Location & Hours tab | ❌ No | Tab shows but content is empty (no form rendered) |
| VendorProfile | Service Settings tab | ❌ No | Tab shows but content is empty |
| VendorProfile | Gallery tab | ❌ No | Tab shows but content is empty |
| VendorProfile | Vendor name/fields | ❌ No | All fields use `defaultValue` not connected to real vendor data |
| VendorReviews | Reply to Review button | ❌ No | No `onClick`, no reply form |
| VendorReviews | MoreVertical per review | ❌ No | No `onClick`, no dropdown |
| VendorReviews | Helpful (thumbs up) | ❌ No | No `onClick`, hardcoded "(12)" count |
| VendorReviews | Report button | ❌ No | No `onClick` |
| VendorReviews | All Reviews / Unanswered tabs | ❌ No | Tab buttons have no `onClick` to filter |
| VendorReviews | All review data | ❌ No | Static hardcoded array, never fetches from `/api/reviews?garageId=...` |
| VendorReviews | Rating stats | ❌ No | Hardcoded 4.8, 1240 reviews |
| VendorPromotions | Create New Promotion | ❌ No | No `onClick`, no modal |
| VendorPromotions | Edit per promotion | ❌ No | No `onClick` |
| VendorPromotions | Delete per promotion | ❌ No | No `onClick` |
| VendorPromotions | All promo data | ❌ No | Static hardcoded array, never calls `/api/vendor/promotions` |
| VendorPromotions | Stats (Active/Redemptions/Revenue) | ❌ No | Hardcoded numbers |
| VendorEarnings | Export button | ❌ No | No `onClick`, no download |
| VendorEarnings | Request Payout | ❌ No | No `onClick`, no payout flow |
| VendorEarnings | Date Range filter | ❌ No | Renders, does nothing |
| VendorEarnings | Status filter | ❌ No | Renders, does nothing |
| VendorEarnings | Revenue period toggle (7/30/12M) | ❌ No | Buttons render, chart doesn't change |
| VendorEarnings | All earnings data | ❌ No | Static hardcoded arrays, never calls `/api/vendor/earnings` |
| VendorMessages | SSE stream | ⚠️ Partial | Connects to `/api/messages/stream` but that route doesn't exist in backend |
| VendorMessages | Phone/Video call buttons | ❌ No | No `onClick` |
| VendorMessages | Paperclip (attachment) | ❌ No | No `onClick` |
| VendorMessages | Send message | ⚠️ Partial | Calls `POST /api/messages` without auth header |
| VendorCalendar | Add Appointment | ❌ No | No `onClick`, no modal |
| VendorCalendar | Filter button | ❌ No | No `onClick` |
| VendorCalendar | ChevronLeft/Right (navigation) | ❌ No | No `onClick`, month doesn't change |
| VendorCalendar | Today button | ❌ No | No `onClick` |
| VendorCalendar | Day/Week/Month view tabs | ❌ No | Tab buttons render, view doesn't change |
| VendorCalendar | Appointment click | ❌ No | Appointments are hardcoded, clicking does nothing |
| VendorCalendar | Calendar data | ❌ No | Appointments hardcoded, never calls `/api/vendor/calendar` |
| VendorReports | Date Range button | ❌ No | No `onClick` |
| VendorReports | Generate Report button | ❌ No | No `onClick`, no download |
| VendorReports | Daily/Monthly toggle | ❌ No | Buttons render, chart doesn't change |
| VendorReports | Category/Revenue toggle | ❌ No | Buttons render, chart doesn't change |
| VendorReports | View All (top services) | ❌ No | No `onClick` |
| VendorReports | All report data | ❌ No | Static hardcoded arrays |
| VendorDashboard | AI Auto-Restock button | ❌ No | No `onClick`, no API call |
| VendorDashboard | Launch SMS Campaign | ✅ navigates to /vendor/messages | Works (navigation only) |
| VendorDashboard | Create Email Blast | ✅ navigates to /vendor/promotions | Works (navigation only) |
| VendorDashboard | MoreVertical per booking row | ❌ No | No `onClick`, no dropdown |
| VendorDashboard | Apply AI Pricing button | ✅ navigates to /vendor/pricing | Works (navigation only, page doesn't exist) |
| VendorLayout | Logout button | ✅ Yes | Clears localStorage (but needs httpOnly cookie fix) |
| VendorGarageSetup | All fields | ✅ Partial | Has form, calls `POST /api/garages`, exists as page but not complete |

---

## SECTION V1 — VENDOR BOOKINGS PAGE

---

### TASK V1.1 — Fix Bookings API Call: Use Auth Token and Vendor Scope

**Problem:**
`VendorBookings.tsx` calls `fetch('/api/bookings')` with no Authorization header and no `vendorId` filter. This returns ALL bookings from all vendors. A vendor can see every customer's booking across the entire platform — a privacy and security violation.

**Root Cause:**
The `useEffect` fetches without token:
```ts
const res = await fetch('/api/bookings'); // No auth, no vendor scope
```

**Solution:**
**Step 1 — Replace the fetch in `VendorBookings.tsx`:**
```ts
React.useEffect(() => {
  const load = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Step 1: Get the vendor's own ID
      const meRes = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) return;
      const meData = await meRes.json();
      const vendorId = meData.vendor?.id || 'vendor-1';

      // Step 2: Fetch only this vendor's bookings
      const res = await fetch(`/api/vendor/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    }
  };
  load();
}, []);
```

**Step 2 — Map API fields to UI fields.** The API returns `customer_name`, `vehicle`, `scheduled_date`, `scheduled_time`, `service_id` but the table renders `booking.customer`, `booking.car`, `booking.date`, `booking.time`, `booking.service`. Add a transform:
```ts
const mapped = data.map((b: any) => ({
  ...b,
  customer: b.customer_name || 'Unknown',
  car: b.vehicle || '—',
  date: b.scheduled_date,
  time: b.scheduled_time,
  service: b.service_id || 'Service',
  price: b.amount,
}));
setBookings(mapped);
```

**Design:**
- The vendor should only ever see their own bookings.
- If `meData.vendor` is null (vendor hasn't set up their garage yet), show the empty state from task V1.3.

**Why:**
A vendor seeing all customers' bookings is a data breach. The fix is trivial — use the existing `/api/vendor/bookings` route which already has `requireRole('vendor')` and scopes to the authenticated vendor.

**Expected Output:**
Vendor logs in and sees only their own bookings. John Doe's garage cannot see Sarah Smith's garage bookings.


---

### TASK V1.2 — Wire Search, Filters, and Pagination on Bookings Page

**Problem:**
The search input, Date Range, Service Type, and Mechanic filter dropdowns all render but have zero functionality. The pagination "Previous/Next" buttons are statically disabled. The search input has no `onChange`.

**Root Cause:**
All filter UI elements are decorative. No state exists for search or filters.

**Solution:**
**Step 1 — Add state to `VendorBookings.tsx`:**
```ts
const [search, setSearch] = React.useState('');
const [statusFilter, setStatusFilter] = React.useState<string>('all');
const [page, setPage] = React.useState(0);
const PAGE_SIZE = 10;
```

**Step 2 — Wire the search input:**
```tsx
<input
  type="text"
  placeholder="Search bookings..."
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
  className="..."
/>
```

**Step 3 — Apply search and filter client-side:**
```ts
const filtered = bookings.filter(b => {
  const matchesSearch = !search || 
    b.customer.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.service.toLowerCase().includes(search.toLowerCase());
  
  const matchesTab = activeTab === 'all' ||
    (activeTab === 'pending' && b.status === 'Pending') ||
    (activeTab === 'active' && ['In Progress', 'Confirmed'].includes(b.status)) ||
    (activeTab === 'completed' && b.status === 'Completed');
  
  return matchesSearch && matchesTab;
});

const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
```

**Step 4 — Wire pagination buttons:**
```tsx
<button
  onClick={() => setPage(p => Math.max(0, p - 1))}
  disabled={page === 0}
  className={cn("px-3 py-1 border rounded text-sm font-medium", page === 0 ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-50")}
>
  Previous
</button>
<button
  onClick={() => setPage(p => p + 1)}
  disabled={(page + 1) * PAGE_SIZE >= filtered.length}
  className="..."
>
  Next
</button>
```

**Step 5 — Update the count display:**
```tsx
<p>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} entries</p>
```

**Design:**
- Search filters in real-time as the user types (no submit button needed).
- Switching tabs resets to page 0.
- Changing search resets to page 0.

**Why:**
A booking list with no search is unusable for a garage with 200+ bookings. The vendor needs to quickly find a specific customer by name or booking ID.

**Expected Output:**
Typing "John" in the search box instantly filters the table to show only John's bookings. Tab switching works. Pagination shows the correct range and disables at boundaries.

---

### TASK V1.3 — Implement Booking Row Actions (Phone, Mail, MoreVertical)

**Problem:**
Each booking row has Phone, Mail, and MoreVertical icon buttons. None have `onClick` handlers. Clicking any of them does nothing.

**Root Cause:**
Buttons are pure decoration — no handler, no dropdown, no navigation.

**Solution:**
**Step 1 — Phone button** — open `tel:` link:
```tsx
<button
  onClick={() => window.open(`tel:${booking.phone}`, '_self')}
  className="..."
  title={`Call ${booking.customer}`}
>
  <Phone className="h-4 w-4" />
</button>
```

**Step 2 — Mail button** — open `mailto:` link:
```tsx
<button
  onClick={() => window.open(`mailto:${booking.customer_email}?subject=Your booking ${booking.id}`, '_blank')}
  className="..."
  title={`Email ${booking.customer}`}
>
  <Mail className="h-4 w-4" />
</button>
```

**Step 3 — MoreVertical button** — show a dropdown with booking actions:
```tsx
const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

// In the row:
<div className="relative">
  <button onClick={() => setMenuOpen(menuOpen === booking.id ? null : booking.id)}>
    <MoreVertical className="h-4 w-4" />
  </button>
  {menuOpen === booking.id && (
    <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
      <button onClick={() => handleConfirmBooking(booking.id)}
        className="w-full px-4 py-3 text-left text-sm font-bold text-green-700 hover:bg-green-50 flex items-center gap-2">
        <Check className="h-4 w-4" /> Confirm Booking
      </button>
      <button onClick={() => handleCancelBooking(booking.id)}
        className="w-full px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50 flex items-center gap-2">
        <X className="h-4 w-4" /> Cancel Booking
      </button>
      <button onClick={() => handleMarkComplete(booking.id)}
        className="w-full px-4 py-3 text-left text-sm font-bold text-blue-700 hover:bg-blue-50 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" /> Mark Completed
      </button>
    </div>
  )}
</div>
```

**Step 4 — Implement the action handlers:**
```ts
const handleConfirmBooking = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'Confirmed' }),
  });
  if (res.ok) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Confirmed' } : b));
    setMenuOpen(null);
  }
};

const handleCancelBooking = async (id: string) => {
  if (!confirm('Cancel this booking?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/bookings/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ reason: 'Cancelled by vendor' }),
  });
  if (res.ok) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
    setMenuOpen(null);
  }
};

const handleMarkComplete = async (id: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'Completed' }),
  });
  if (res.ok) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Completed' } : b));
    setMenuOpen(null);
  }
};
```

**Step 5 — Close the dropdown when clicking outside** using a `useClickOutside` hook.

**Design:**
- The dropdown shows context-aware actions: don't show "Confirm" for already-Confirmed bookings.
- Status changes reflect immediately in the table (optimistic update).

**Why:**
The primary daily job of a garage vendor is managing booking statuses: confirming bookings, marking jobs complete, cancelling no-shows. Without these actions, the entire bookings page is read-only.

**Expected Output:**
Clicking MoreVertical shows a dropdown with Confirm / Cancel / Mark Completed. Selecting any option updates the booking status immediately and persists via the API.

---

### TASK V1.4 — Implement Export CSV for Bookings

**Problem:**
The "Export CSV" button has no `onClick` and does nothing.

**Root Cause:**
No download logic exists.

**Solution:**
```ts
function exportToCSV(bookings: any[]) {
  const headers = ['Booking ID', 'Customer', 'Vehicle', 'Service', 'Date', 'Time', 'Status', 'Amount'];
  const rows = bookings.map(b => [
    b.id, b.customer, b.car, b.service, b.date, b.time, b.status, `AED ${b.price}`
  ]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

Wire to the button:
```tsx
<button onClick={() => exportToCSV(filteredBookings)} className="...">
  <Download className="h-4 w-4 mr-2" /> Export CSV
</button>
```

**Design:**
- Export the currently filtered bookings (not all bookings).
- Filename format: `bookings-2026-10-12.csv`.

**Why:**
Vendors need to export booking data for accounting, staff scheduling, and customer records. This is a basic operational feature.

**Expected Output:**
Clicking "Export CSV" triggers a file download containing the currently visible booking rows as a CSV file.


---

## SECTION V2 — VENDOR SERVICES PAGE

---

### TASK V2.1 — Fetch Real Services from API and Replace Hardcoded Array

**Problem:**
`VendorServices.tsx` has a hardcoded `const services = [...]` array. It never calls the API. Changes made here (or via the API) do not appear in the UI and vice versa.

**Root Cause:**
Services are a static constant, not state fetched from `/api/vendor/services`.

**Solution:**
**Step 1 — Replace the static array with state and an API fetch:**
```ts
const [services, setServices] = React.useState<any[]>([]);
const [loading, setLoading] = React.useState(true);
const [stats, setStats] = React.useState({ total: 0, active: 0, avgPrice: 0 });

const fetchServices = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vendor/services', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setServices(data);
      const active = data.filter((s: any) => s.active !== false && s.status !== 'inactive');
      const prices = data.filter((s: any) => s.price > 0).map((s: any) => s.price);
      setStats({
        total: data.length,
        active: active.length,
        avgPrice: prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0,
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

React.useEffect(() => { fetchServices(); }, []);
```

**Step 2 — Update the stats cards** to use `stats.total`, `stats.active`, `stats.avgPrice` instead of hardcoded 12, 10, $122.50.

**Step 3 — Show a loading spinner** while `loading === true`.

**Design:**
- Empty state: if no services exist, show "No services added yet. Click 'Add New Service' to get started."
- Stats update automatically when services are added or deleted.

**Why:**
A vendor's real services are stored in the database. Hardcoded values mean the vendor cannot trust what they see — it never reflects their actual catalogue.

**Expected Output:**
On page load, the services table shows the vendor's actual services from the database. The stats cards show accurate counts. If the vendor has 3 services, 3 rows appear.

---

### TASK V2.2 — Implement Add New Service (Modal + API)

**Problem:**
The "Add New Service" button has no `onClick`. No modal exists. Services cannot be created from the UI.

**Root Cause:**
Button is decorative. The backend route `POST /api/vendor/services` exists and works.

**Solution:**
**Step 1 — Add modal state:**
```ts
const [showAddModal, setShowAddModal] = React.useState(false);
const [form, setForm] = React.useState({ name: '', category: 'maintenance', price: '', duration: '60', description: '', active: true });
const [formError, setFormError] = React.useState('');
const [saving, setSaving] = React.useState(false);
```

**Step 2 — Wire the "Add New Service" button:**
```tsx
<button onClick={() => { setForm({ name: '', category: 'maintenance', price: '', duration: '60', description: '', active: true }); setShowAddModal(true); }}>
  <Plus className="h-4 w-4 mr-2" /> Add New Service
</button>
```

**Step 3 — Create the modal:**
```tsx
{showAddModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
      <div className="bg-[#003580] p-6 text-white rounded-t-2xl flex justify-between items-center">
        <h2 className="text-xl font-bold">Add New Service</h2>
        <button onClick={() => setShowAddModal(false)}><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={handleAddService} className="p-6 space-y-4">
        {formError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{formError}</p>}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Name *</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-xl mt-1 text-sm focus:ring-2 focus:ring-[#003580] outline-none" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl mt-1 text-sm outline-none">
              <option value="maintenance">Maintenance</option>
              <option value="repairs">Repairs</option>
              <option value="electrical">Electrical</option>
              <option value="diagnostics">Diagnostics</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (AED) *</label>
            <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-xl mt-1 text-sm outline-none" required />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration (minutes)</label>
          <input type="number" min="15" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-xl mt-1 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
          <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-xl mt-1 text-sm outline-none resize-none" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="bg-[#003580] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00224f] disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Service'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

**Step 4 — Implement `handleAddService`:**
```ts
const handleAddService = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.name.trim() || !form.price) { setFormError('Name and price are required'); return; }
  setSaving(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vendor/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        durationMinutes: Number(form.duration),
        description: form.description.trim(),
        active: true,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setServices(prev => [...prev, data]);
      setShowAddModal(false);
    } else {
      setFormError(data.message || 'Failed to add service');
    }
  } catch { setFormError('Network error'); }
  finally { setSaving(false); }
};
```

**Design:**
- Price must be > 0. Validate before submission.
- Duration defaults to 60 minutes.
- After successful creation, add the returned service object to the list without refetching.

**Why:**
Adding services is the second most important vendor action after managing bookings. Without it, vendors cannot list their offerings, and the platform has no services to show customers.

**Expected Output:**
Clicking "Add New Service" opens a modal form. Filling in name and price and clicking "Add Service" creates the service via the API and immediately adds it to the services table.

---

### TASK V2.3 — Implement Edit Service (Inline Modal + API)

**Problem:**
The pencil Edit button on each service row has no `onClick`. Services cannot be edited.

**Root Cause:**
Button is decorative. The backend route `PATCH /api/vendor/services/:id` exists.

**Solution:**
**Step 1 — Reuse the Add Service modal** but pre-fill it with the service's existing values:
```ts
const [editingService, setEditingService] = React.useState<any>(null);

const handleOpenEdit = (service: any) => {
  setEditingService(service);
  setForm({
    name: service.name,
    category: service.category?.toLowerCase() || 'maintenance',
    price: String(service.price),
    duration: String(service.duration_minutes || 60),
    description: service.description || '',
    active: service.active !== false,
  });
  setFormError('');
  setShowAddModal(true);
};
```

**Step 2 — Change modal title dynamically:** `{editingService ? 'Edit Service' : 'Add New Service'}`.

**Step 3 — Change form submit handler** to call `PATCH` when editing:
```ts
if (editingService) {
  const res = await fetch(`/api/vendor/services/${editingService.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: form.name, price: Number(form.price), durationMinutes: Number(form.duration), description: form.description, active: form.active }),
  });
  if (res.ok) {
    const updated = await res.json();
    setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
    setShowAddModal(false);
    setEditingService(null);
  }
}
```

**Step 4 — Wire the Edit button:**
```tsx
<button onClick={() => handleOpenEdit(service)}>
  <Edit2 className="h-4 w-4" />
</button>
```

**Design:**
- On close/cancel, reset `editingService` to null.
- Show "Service Updated" toast on success.

**Why:**
Prices change, descriptions need updating, and services get renamed. Edit is a core CRUD operation.

**Expected Output:**
Clicking the pencil icon opens the same modal pre-filled with the service's current values. Saving updates the service in the database and reflects immediately in the table.

---

### TASK V2.4 — Implement Delete Service (Confirm + API)

**Problem:**
The trash Delete button on each service row has no `onClick`. Services cannot be deleted.

**Root Cause:**
Button is decorative. The backend route `DELETE /api/vendor/services/:id` exists.

**Solution:**
```ts
const handleDeleteService = async (serviceId: string, serviceName: string) => {
  if (!confirm(`Delete "${serviceName}"? This cannot be undone.`)) return;
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/vendor/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (res.ok) {
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } else {
      alert('Failed to delete service.');
    }
  } catch { alert('Network error.'); }
};
```

Wire to the button:
```tsx
<button onClick={() => handleDeleteService(service.id, service.name)}>
  <Trash2 className="h-4 w-4" />
</button>
```

**Design:**
- Show a confirmation dialog before deleting.
- If the service has active bookings, the backend should return an error — surface it as an alert.
- Optimistically remove from the UI list on success.

**Why:**
Vendors retire services. Without delete, the catalogue grows stale with inactive offerings that confuse customers.

**Expected Output:**
Clicking delete prompts for confirmation. Confirming removes the service from both the database and the UI list instantly.

---

### TASK V2.5 — Fix AI Price Recommendation "Apply" Button

**Problem:**
The AI optimization modal shows a "Apply Recommendation" button that calls `setRecommendation(null)` and does nothing else — it just closes the modal without applying the price.

**Root Cause:**
The `onClick` only closes the modal. No API call is made to update the service price.

**Solution:**
```ts
const handleApplyRecommendation = async () => {
  if (!recommendation) return;
  const service = services.find(s => s.id === recommendation.serviceId);
  if (!service) return;

  try {
    const token = localStorage.getItem('token');
    const newPrice = recommendation.recommendedPrice || recommendation.suggestedPrice;
    const res = await fetch(`/api/vendor/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ price: newPrice }),
    });
    if (res.ok) {
      const updated = await res.json();
      setServices(prev => prev.map(s => s.id === service.id ? updated : s));
      setRecommendation(null);
      // Show success toast
    } else {
      alert('Failed to apply price recommendation.');
    }
  } catch { alert('Network error.'); }
};
```

Wire to the "Apply Recommendation" button:
```tsx
<button onClick={handleApplyRecommendation} className="flex-1 bg-[#003580] ...">
  Apply Recommendation
</button>
```

**Design:**
- The "Discard" button simply closes the modal with `setRecommendation(null)`.
- After applying, show a brief green toast: "Price updated to AED X".

**Why:**
The AI price optimization feature only has value if the vendor can act on it. Currently it's a read-only display — the vendor sees a recommendation but has no way to apply it.

**Expected Output:**
Clicking "Apply Recommendation" updates the service price to the AI-suggested value via PATCH, reflects the new price in the table row, and closes the modal.


---

## SECTION V3 — VENDOR PROFILE PAGE

---

### TASK V3.1 — Load Real Vendor Data and Make Profile Form Controlled

**Problem:**
All profile form fields use `defaultValue` (uncontrolled inputs) with hardcoded strings like `"Elite Auto Care"`, `"REG-90210-BC"`, `"contact@eliteautocare.com"`. The form never loads actual vendor data from the database. Changing values and saving does nothing.

**Root Cause:**
No API call is made on mount. The "Save Profile" button has no `onClick`.

**Solution:**
**Step 1 — Add state and load profile data in `VendorProfile.tsx`:**
```ts
const [profile, setProfile] = React.useState({
  garageName: '', businessReg: '', contactEmail: '', phone: '', description: '',
  location: '', city: '', openingHours: '', lat: '', lng: '',
});
const [saving, setSaving] = React.useState(false);
const [saveMsg, setSaveMsg] = React.useState('');

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/vendor/profile', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      const garage = data.garages?.[0] || {};
      setProfile({
        garageName: data.business_name || '',
        businessReg: data.metadata?.businessReg || '',
        contactEmail: data.email || '',
        phone: data.phone || '',
        description: data.description || '',
        location: garage.location || '',
        city: garage.city || '',
        openingHours: garage.opening_hours || '',
        lat: String(garage.lat || ''),
        lng: String(garage.lng || ''),
      });
    }
  };
  load();
}, []);
```

**Step 2 — Convert all inputs from `defaultValue` to controlled `value` + `onChange`:**
```tsx
<input
  type="text"
  value={profile.garageName}
  onChange={(e) => setProfile(p => ({ ...p, garageName: e.target.value }))}
  className="..."
/>
```
Apply this pattern to every field: garageName, businessReg, contactEmail, phone, description.

**Step 3 — Wire the "Save Profile" button:**
```ts
const handleSave = async () => {
  setSaving(true);
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vendor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        business_name: profile.garageName,
        email: profile.contactEmail,
        phone: profile.phone,
        description: profile.description,
        metadata: { businessReg: profile.businessReg },
      }),
    });
    if (res.ok) {
      setSaveMsg('Profile saved successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    } else {
      setSaveMsg('Failed to save profile.');
    }
  } catch { setSaveMsg('Network error.'); }
  finally { setSaving(false); }
};
```

**Design:**
- Show a green success banner below the Save button for 3 seconds on success.
- Show a red error banner on failure.
- Button shows "Saving..." with a spinner while the request is in flight.

**Why:**
A profile page that loads fake data and can't save is worse than no profile page. Vendors need to keep their contact info and description accurate so customers can trust and contact them.

**Expected Output:**
On load, the form shows the vendor's actual name, email, phone, and description from the database. Editing and clicking "Save Profile" persists the changes via PATCH.

---

### TASK V3.2 — Implement Location, Hours, Gallery, and Service Settings Tabs

**Problem:**
Clicking the "Location & Hours", "Service Settings", and "Gallery" tabs switches `activeTab` state but renders nothing — there is no JSX for these tabs.

**Root Cause:**
Only `activeTab === 'general'` and `activeTab === 'kyv'` have JSX blocks. The other three tabs are undefined.

**Solution:**
**Add the missing tab content blocks after the `general` block:**

**Location & Hours tab:**
```tsx
{activeTab === 'location' && (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h2 className="font-bold text-gray-900">Location & Operating Hours</h2>
    </div>
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Street Address *</label>
          <input type="text" value={profile.location}
            onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g. 123 Main St, Al Quoz" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">City</label>
          <input type="text" value={profile.city}
            onChange={(e) => setProfile(p => ({ ...p, city: e.target.value }))}
            placeholder="e.g. Dubai" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Latitude (for map pin)</label>
          <input type="number" step="any" value={profile.lat}
            onChange={(e) => setProfile(p => ({ ...p, lat: e.target.value }))}
            placeholder="e.g. 25.2048" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Longitude (for map pin)</label>
          <input type="number" step="any" value={profile.lng}
            onChange={(e) => setProfile(p => ({ ...p, lng: e.target.value }))}
            placeholder="e.g. 55.2708" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Opening Hours</label>
          <input type="text" value={profile.openingHours}
            onChange={(e) => setProfile(p => ({ ...p, openingHours: e.target.value }))}
            placeholder="e.g. Mon-Sat: 8:00 AM – 6:00 PM" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
        </div>
      </div>
    </div>
  </div>
)}
```

**Gallery tab:**
```tsx
{activeTab === 'gallery' && (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h2 className="font-bold text-gray-900">Garage Gallery</h2>
      <p className="text-sm text-gray-500">Upload photos of your garage to build customer trust.</p>
    </div>
    <div className="p-6">
      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#003580] transition-colors"
        onClick={() => { const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.multiple=true; inp.click(); }}>
        <Camera className="h-12 w-12 text-gray-300 mb-4" />
        <p className="font-bold text-gray-700">Click to upload garage photos</p>
        <p className="text-sm text-gray-400 mt-1">JPG, PNG up to 5MB each. Max 10 photos.</p>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">Full image upload requires Supabase Storage configuration (see admin_tasks.md TASK A8.3)</p>
    </div>
  </div>
)}
```

**Service Settings tab:**
```tsx
{activeTab === 'services' && (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-gray-100">
      <h2 className="font-bold text-gray-900">Service Settings</h2>
      <p className="text-sm text-gray-500">Configure default lead times, cancellation policy, and service area.</p>
    </div>
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Booking Lead Time (minutes)</label>
          <input type="number" defaultValue="60" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
          <p className="text-xs text-gray-400">Minimum notice required before a booking can be made.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Cancellation Policy (hours)</label>
          <input type="number" defaultValue="24" min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003580] focus:outline-none" />
          <p className="text-xs text-gray-400">Hours before appointment when free cancellation ends.</p>
        </div>
      </div>
    </div>
  </div>
)}
```

**Update the Save button handler** to also save garage-specific fields (location, lat, lng, opening_hours) via a separate `PATCH /api/garages/:id` call.

**Design:**
- All four non-KYV tabs share the same "Save Profile" button at the top.
- The save function should detect which tab is active and include the relevant fields.

**Why:**
Tabs that render nothing create a broken UI. Vendors clicking "Location & Hours" expect to see and edit their address. This is needed for map pins and customer-facing display.

**Expected Output:**
Clicking each tab shows relevant form fields pre-populated with the vendor's real data. Editing and saving persists the changes.

---

### TASK V3.3 — Implement Vendor Logo Upload

**Problem:**
The Camera button on the vendor logo does nothing. Vendors cannot change their garage logo.

**Root Cause:**
The `<button>` wrapping the Camera icon has no `onClick`.

**Solution:**
```ts
const handleLogoChange = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.onchange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    const formData = new FormData();
    formData.append('logo', file);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vendor/logo', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setLogoUrl(data.logoUrl);
    }
  };
  input.click();
};
```

Add `POST /api/vendor/logo` to `server/routes.ts` that accepts a file upload (using the existing `multer` setup from `kyv/upload`) and saves it to Supabase Storage under `vendor-logos/`.

Wire the Camera button:
```tsx
<button onClick={handleLogoChange} className="...">
  <Camera className="h-4 w-4 text-[#003580]" />
</button>
```

**Design:**
- After upload, update the `<img src={logoUrl}>` with the new URL.
- Use `vendor-logos/` bucket in Supabase Storage.
- Accept JPG/PNG/WebP only, max 5MB.

**Why:**
The logo is the vendor's brand identity on the platform. It appears on search results and garage detail pages. Without upload capability, all garages look identical.

**Expected Output:**
Clicking the camera icon opens a file picker. Selecting an image uploads it and immediately updates the logo display.


---

## SECTION V4 — VENDOR REVIEWS PAGE

---

### TASK V4.1 — Fetch Real Reviews and Wire All Review Interactions

**Problem:**
`VendorReviews.tsx` has a hardcoded reviews array. The "Reply to Review", "Helpful", "Report", and filter tabs do nothing. The stats (4.8 rating, 1240 reviews) are hardcoded.

**Root Cause:**
No API call is made. All data is static. No handlers exist.

**Solution:**
**Step 1 — Fetch real reviews on mount:**
```ts
const [reviews, setReviews] = React.useState<any[]>([]);
const [tab, setTab] = React.useState<'all' | 'unanswered'>('all');

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const meRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
    const meData = await meRes.json();
    const vendorId = meData.vendor?.id;
    if (!vendorId) return;
    const res = await fetch(`/api/reviews?vendorId=${vendorId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setReviews(await res.json());
  };
  load();
}, []);
```

**Step 2 — Wire tab filtering:**
```ts
const displayed = tab === 'unanswered'
  ? reviews.filter(r => !r.vendor_response)
  : reviews;
```

```tsx
<button onClick={() => setTab('all')} className={cn("...", tab === 'all' && "bg-[#003580] text-white")}>All Reviews</button>
<button onClick={() => setTab('unanswered')} className={cn("...", tab === 'unanswered' && "bg-[#003580] text-white")}>Unanswered</button>
```

**Step 3 — Compute real rating stats from reviews:**
```ts
const avgRating = reviews.length
  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  : '0.0';
```
Replace hardcoded `4.8` and `1,240 reviews` with `avgRating` and `reviews.length`.

**Step 4 — Implement Reply to Review:**
```ts
const [replyId, setReplyId] = React.useState<string | null>(null);
const [replyText, setReplyText] = React.useState('');

const handleReply = async () => {
  if (!replyId || !replyText.trim()) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/reviews/${replyId}/response`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ response: replyText.trim() }),
  });
  if (res.ok) {
    setReviews(prev => prev.map(r => r.id === replyId ? { ...r, vendor_response: replyText, status: 'responded' } : r));
    setReplyId(null);
    setReplyText('');
  }
};
```

Add an inline reply form that appears when `replyId === review.id`:
```tsx
{replyId === String(review.id) ? (
  <div className="mt-4 space-y-3">
    <textarea
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
      placeholder="Write your response..."
      rows={3}
      className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#003580] outline-none resize-none"
    />
    <div className="flex gap-2">
      <button onClick={handleReply} className="bg-[#003580] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#00224f]">Post Reply</button>
      <button onClick={() => { setReplyId(null); setReplyText(''); }} className="border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50">Cancel</button>
    </div>
  </div>
) : (
  review.vendor_response && (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-900">
      <span className="font-bold">Your response: </span>{review.vendor_response}
    </div>
  )
)}
```

**Step 5 — Wire "Reply to Review" button:**
```tsx
<button onClick={() => { setReplyId(String(review.id)); setReplyText(''); }}>
  <Reply className="h-4 w-4 mr-1" /> Reply to Review
</button>
```

**Design:**
- A review with `vendor_response` shows the response text below the review and hides the reply button.
- The "Unanswered" tab shows only reviews without `vendor_response`.
- Rating distribution bars are computed from real review data.

**Why:**
Responding to reviews is the primary vendor reputation-management action. Without it, customers who left feedback never hear back, and negative reviews go unaddressed.

**Expected Output:**
Reviews page shows real customer reviews from the database. Clicking "Reply to Review" shows an inline textarea. Submitting posts the response and shows it under the review. The "Unanswered" tab shows only unresponded reviews.

---

## SECTION V5 — VENDOR PROMOTIONS PAGE

---

### TASK V5.1 — Fetch Real Promotions and Wire All CRUD Actions

**Problem:**
`VendorPromotions.tsx` has a hardcoded promotions array. The "Create New Promotion", Edit, and Delete buttons have no `onClick`. Stats are hardcoded.

**Root Cause:**
No API call exists. All data is static. The backend routes `/api/vendor/promotions` (GET/POST/PATCH/DELETE) exist but are never called.

**Solution:**
**Step 1 — Load promotions from API:**
```ts
const [promotions, setPromotions] = React.useState<any[]>([]);

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/vendor/promotions', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setPromotions(await res.json());
  };
  load();
}, []);
```

**Step 2 — Compute real stats:**
```ts
const activeCount = promotions.filter(p => p.status === 'active').length;
const totalRedemptions = promotions.reduce((sum, p) => sum + (p.used_count || 0), 0);
```

**Step 3 — Create Promotion modal:**
Add state: `const [showModal, setShowModal] = React.useState(false)` and a form with fields:
- Title (text, required)
- Description (textarea)
- Discount Type (select: percent / fixed / freebie)
- Discount Value (number)
- Promo Code (text, optional)
- Start Date (date input)
- End Date (date input)
- Usage Limit (number, optional)

Submit handler:
```ts
const res = await fetch('/api/vendor/promotions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ title, description, discount_type: discountType, discount_value: Number(discountValue), promo_code: promoCode, starts_at: startDate, ends_at: endDate, usage_limit: usageLimit ? Number(usageLimit) : null, status: 'active' }),
});
if (res.ok) { setPromotions(prev => [...prev, await res.json()]); setShowModal(false); }
```

**Step 4 — Edit promotion:**
```ts
const handleEdit = async (promo: any) => {
  // Pre-fill modal with promo data, submit PATCH
  const res = await fetch(`/api/vendor/promotions/${promo.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updatedFields),
  });
  if (res.ok) setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, ...updatedFields } : p));
};
```

**Step 5 — Delete promotion:**
```ts
const handleDelete = async (id: string) => {
  if (!confirm('Delete this promotion?')) return;
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/vendor/promotions/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.ok) setPromotions(prev => prev.filter(p => p.id !== id));
};
```

**Design:**
- Active promotions show a green badge. Expired ones (past `ends_at`) show a grey "Expired" badge.
- Promotion status is computed from dates, not just a stored `status` field.

**Why:**
Promotions drive bookings. Without CRUD, the vendor cannot run campaigns or update pricing offers. The backend already supports all operations.

**Expected Output:**
Page loads real promotions from the database. Vendor can create, edit, and delete promotions. Stats reflect actual counts.

---

## SECTION V6 — VENDOR EARNINGS PAGE

---

### TASK V6.1 — Fetch Real Earnings Data and Wire All Actions

**Problem:**
All earnings data in `VendorEarnings.tsx` is hardcoded (stats, chart series, transactions). The Export, Request Payout, Date Range, and period toggle buttons all do nothing.

**Root Cause:**
No API call exists. The backend route `GET /api/vendor/earnings` exists but is never called.

**Solution:**
**Step 1 — Fetch real earnings on mount:**
```ts
const [earnings, setEarnings] = React.useState<any>(null);
const [transactions, setTransactions] = React.useState<any[]>([]);

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    const [earningsRes, bookingsRes] = await Promise.all([
      fetch('/api/vendor/earnings', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/vendor/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);
    if (earningsRes.ok) setEarnings(await earningsRes.json());
    if (bookingsRes.ok) {
      const bks = await bookingsRes.json();
      setTransactions(bks.filter((b: any) => b.amount > 0).slice(0, 20));
    }
  };
  load();
}, []);
```

**Step 2 — Replace hardcoded stats** with real values from `earnings`:
- Total Earnings: `earnings?.totalEarnings || 0`
- Pending Payout: `earnings?.pendingPayout || 0`
- Completed Payouts: `earnings?.completedPayouts || 0`

**Step 3 — Wire Export button:**
```ts
function exportTransactions() {
  const headers = ['ID', 'Date', 'Customer', 'Service', 'Amount', 'Status'];
  const rows = transactions.map(t => [t.id, t.scheduled_date, t.customer_name, t.service_id, t.amount, t.status]);
  // same CSV export pattern as V1.4
}
```

**Step 4 — Wire Request Payout:**
```ts
const handleRequestPayout = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/vendor/payout-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ amount: earnings?.pendingPayout }),
  });
  if (res.ok) alert('Payout request submitted. Processing within 2-3 business days.');
  else alert('Payout request failed. Please try again or contact support.');
};
```

**Note:** Add `POST /api/vendor/payout-request` to `server/routes.ts` — it creates a `pricing_rules` record of type `payout_request` or a dedicated payout table.

**Step 5 — Wire revenue period toggle (7 Days / 30 Days / 12 Months):**
Add `const [revPeriod, setRevPeriod] = React.useState<'7d' | '30d' | '12m'>('7d')` and pass it as a query param to the earnings fetch. The backend route already supports `period` param.

**Design:**
- Transaction table shows real bookings with payment amounts.
- Booking status maps to transaction status: Completed → completed, Pending → pending, Cancelled → refunded.

**Why:**
Earnings data is the most critical financial information a vendor has. Showing hardcoded numbers makes the page useless. Real earnings data drives vendor retention.

**Expected Output:**
Vendor sees their actual total earnings, pending balance, and recent transaction history from real booking data. Export downloads actual records. Period toggle changes the revenue chart.

---

## SECTION V7 — VENDOR CALENDAR PAGE

---

### TASK V7.1 — Wire Calendar Navigation and Load Real Appointments

**Problem:**
Every interactive element in `VendorCalendar.tsx` is non-functional. Navigation arrows, Today button, Day/Week/Month tabs, Add Appointment, and Filter do nothing. Appointments are hardcoded.

**Root Cause:**
No state management for current date, no view mode, no API call for appointments.

**Solution:**
**Step 1 — Add calendar state:**
```ts
const [currentDate, setCurrentDate] = React.useState(new Date());
const [viewMode, setViewMode] = React.useState<'day' | 'week' | 'month'>('day');
const [appointments, setAppointments] = React.useState<any[]>([]);

const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
```

**Step 2 — Fetch appointments for the current date:**
```ts
React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/vendor/calendar?date=${formattedDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAppointments(data.bookings || []);
    }
  };
  load();
}, [formattedDate]);
```

**Step 3 — Wire navigation buttons:**
```tsx
// Previous day/week
<button onClick={() => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() - (viewMode === 'week' ? 7 : 1));
  setCurrentDate(d);
}}>
  <ChevronLeft className="h-4 w-4" />
</button>

// Next day/week
<button onClick={() => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + (viewMode === 'week' ? 7 : 1));
  setCurrentDate(d);
}}>
  <ChevronRight className="h-4 w-4" />
</button>

// Today
<button onClick={() => setCurrentDate(new Date())}>Today</button>
```

**Step 4 — Wire view mode tabs:**
```tsx
{(['Day', 'Week', 'Month'] as const).map(mode => (
  <button
    key={mode}
    onClick={() => setViewMode(mode.toLowerCase() as any)}
    className={cn("px-3 py-1 text-xs font-bold rounded-md", viewMode === mode.toLowerCase() ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
  >
    {mode}
  </button>
))}
```

**Step 5 — Update the calendar header** to show the real current date:
```tsx
<h2 className="text-lg font-bold text-gray-900">
  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: viewMode === 'day' ? 'numeric' : undefined })}
</h2>
```

**Step 6 — Render real appointments** from `appointments` state:
Map appointments where `b.scheduled_date === formattedDate` to the calendar grid using `b.scheduled_time` to calculate vertical position.

**Design:**
- Each appointment block shows: customer name, service name, time, and a colour-coded status.
- Clicking an appointment opens a detail popover or navigates to the bookings page filtered by that ID.
- "Add Appointment" button should navigate to `/vendor/bookings` (existing booking creation flow until a proper calendar modal is built).

**Why:**
The calendar is the vendor's daily operations view. Without working navigation, they can't see tomorrow's bookings or check last week's completed jobs.

**Expected Output:**
Calendar shows real bookings for the current day. Clicking prev/next arrows moves to the previous/next day (or week). The header date updates. "Today" returns to the current date.

---

## SECTION V8 — VENDOR MESSAGES PAGE

---

### TASK V8.1 — Fix Messages SSE Stream and Add Auth to Send

**Problem:**
`VendorMessages.tsx` connects to `/api/messages/stream?threadId=X` but this SSE route doesn't exist in `server/routes.ts`. The send message form calls `POST /api/messages` without an auth header.

**Root Cause:**
Missing SSE route. Missing auth header on send.

**Solution:**
**Step 1 — Add `GET /api/messages/stream` to `server/routes.ts`:**
```ts
router.get('/messages/stream', async (req, res) => {
  const threadId = String(req.query.threadId || '');
  if (!threadId) return res.status(400).end();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: any) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Poll for new messages in this thread every 3 seconds
  const interval = setInterval(async () => {
    const allMessages = db.getMessages();
    const threadMessages = allMessages.filter((m: any) =>
      String(m.thread_id) === String(threadId)
    );
    send({ messages: threadMessages });
  }, 3000);

  req.on('close', () => clearInterval(interval));
});
```

**Step 2 — Add auth header to the send form in `VendorMessages.tsx`:**
```ts
const res = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}` // ADD THIS
  },
  body: JSON.stringify({ threadId: activeChat, sender: 'vendor', text: messageInput.trim() })
});
```

**Step 3 — Fix initial data load**: The current load function tries to access `data.messages[data.chats[0].id]` but the API returns a flat array of messages, not a keyed object. Fix:
```ts
const res = await fetch('/api/messages', { headers: { 'Authorization': `Bearer ${token}` } });
const data = await res.json();
setChats(data.chats || []);
// Load messages for the first chat thread
if (data.chats?.length) {
  const firstThreadId = data.chats[0].id;
  setActiveChat(firstThreadId);
  setMessages(data.messages?.filter((m: any) => m.thread_id === firstThreadId) || []);
}
```

**Design:**
- When the active chat changes, reload messages for the new thread.
- The SSE stream sends all messages in the thread on each poll — the frontend should replace the `messages` array, not append.

**Why:**
The messaging page is the vendor's communication channel with customers. Without a working stream, new customer messages arrive silently. Without auth on send, messages could be spoofed.

**Expected Output:**
Vendor opens Messages page, sees their chat threads. Selecting a thread loads existing messages. New messages from customers appear within 3 seconds. Sending a message works with proper auth.

---

## SECTION V9 — VENDOR REPORTS PAGE

---

### TASK V9.1 — Fetch Real Data for Reports and Wire All Buttons

**Problem:**
All data in `VendorReports.tsx` is hardcoded. The Date Range, Generate Report, Daily/Monthly toggle, and Category/Revenue toggle buttons all do nothing.

**Root Cause:**
No API calls. No state management for period selection.

**Solution:**
**Step 1 — Add period state and fetch real stats:**
```ts
const [period, setPeriod] = React.useState<'week' | 'month' | 'year'>('month');
const [stats, setStats] = React.useState<any>(null);
const [bookings, setBookings] = React.useState<any[]>([]);

React.useEffect(() => {
  const load = async () => {
    const token = localStorage.getItem('token');
    const [statsRes, bookingsRes] = await Promise.all([
      fetch(`/api/vendor/stats?period=${period}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/vendor/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (bookingsRes.ok) setBookings(await bookingsRes.json());
  };
  load();
}, [period]);
```

**Step 2 — Update stats cards** with real values from `stats`:
- Total Revenue: `stats?.monthlyRevenue || 0`
- Total Bookings: `stats?.totalBookings || 0`
- Avg Order Value: computed from bookings
- Customer Retention: cannot be computed without historical data — show "N/A" until implemented

**Step 3 — Wire Daily/Monthly period toggle:**
```tsx
<button onClick={() => setPeriod('week')} className={cn("...", period === 'week' && "bg-white shadow-sm text-gray-900")}>Daily</button>
<button onClick={() => setPeriod('month')} className={cn("...", period === 'month' && "bg-white shadow-sm text-gray-900")}>Monthly</button>
```

**Step 4 — Wire Generate Report button** (same CSV export pattern):
```ts
const handleGenerateReport = () => {
  const headers = ['Booking ID', 'Customer', 'Service', 'Date', 'Amount', 'Status'];
  const rows = bookings.map(b => [b.id, b.customer_name, b.service_id, b.scheduled_date, b.amount, b.status]);
  // export CSV
};
```

**Step 5 — Replace hardcoded top services table** with computed data from `bookings`:
```ts
const serviceMap = bookings.reduce((acc: Record<string, any>, b) => {
  const key = b.service_id || 'Unknown';
  if (!acc[key]) acc[key] = { name: key, bookings: 0, revenue: 0 };
  acc[key].bookings++;
  acc[key].revenue += Number(b.amount) || 0;
  return acc;
}, {});
const topServices = Object.values(serviceMap).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 5);
```

**Design:**
- The chart bars should visually scale to the maximum value in the series.
- "View All" on the top services table navigates to `/vendor/services`.

**Why:**
Reports are how vendors understand their business performance. Fabricated data is useless for decision-making. Real data enables vendors to identify which services are most profitable.

**Expected Output:**
Reports page shows real booking counts and revenue figures. Period toggle re-fetches and updates all metrics. Generate Report downloads a CSV of actual bookings.

---

## SECTION V10 — VENDOR DASHBOARD — REMAINING GAPS

---

### TASK V10.1 — Fix AI Auto-Restock Button and Dashboard Row Actions

**Problem:**
The "AI Auto-Restock" button in the Smart Inventory panel has no `onClick`. The MoreVertical button on each today's-schedule row does nothing. Inventory data is hardcoded.

**Solution:**
**AI Auto-Restock:**
```tsx
<button
  onClick={async () => {
    // Notify admin/vendor of low stock — placeholder for real inventory integration
    alert('Restock request submitted to supplier. You will receive a confirmation email shortly.');
    // In a real implementation: POST /api/vendor/restock-request with item list
  }}
  className="..."
>
  AI Auto-Restock
</button>
```

**MoreVertical per booking row (in dashboard table):**
```tsx
<button onClick={() => navigate(`/vendor/bookings`)} title="View all bookings">
  <MoreVertical className="h-4 w-4 text-gray-400" />
</button>
```
Alternatively, open the same booking action dropdown from Task V1.3.

**Dashboard vendor name:**
Replace hardcoded `"Good morning, Elite Motors!"` with:
```ts
const [vendorName, setVendorName] = React.useState('');
// In loadStats(), set vendorName from meData.vendor?.business_name
// In JSX: `Good morning, ${vendorName || 'Vendor'}!`
```

**Design:**
- Inventory restock is a stub for now — a real integration requires a parts/inventory table and supplier API.
- The greeting dynamically shows the actual vendor's business name.

**Why:**
Even small UX gaps like a hardcoded name reduce trust. Vendors who see "Elite Motors" when they registered as "Precision Auto" will question whether the platform is working correctly.

**Expected Output:**
Dashboard shows the real vendor's name. Auto-Restock shows a confirmation. Booking row actions provide quick status management.

---

## SECURITY CHECKLIST — VENDOR PORTAL

The following security issues must be addressed across the entire vendor portal:

### TASK V11.1 — Add `ProtectedRoute` for All Vendor Routes

All `/vendor/*` routes are currently accessible without authentication. Add a `VendorProtectedRoute` component that:
1. Checks `localStorage.getItem('token')` (or cookie after Task 6.2 from tasks.md).
2. Decodes the JWT and verifies `payload.role === 'vendor'`.
3. Redirects to `/vendor/login` if not authenticated.
4. Redirects to `/` if authenticated but not a vendor role.

```tsx
export function VendorProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/vendor/login" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return <Navigate to="/vendor/login" replace />;
    }
    if (payload.role !== 'vendor' && payload.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem('token');
    return <Navigate to="/vendor/login" replace />;
  }
  return <>{children}</>;
}
```

Wrap all vendor routes in `App.tsx`:
```tsx
<Route path="/vendor" element={<VendorProtectedRoute><VendorLayout /></VendorProtectedRoute>}>
```

### TASK V11.2 — Fix Hardcoded `isAuthenticated()` in VendorLayout

`VendorLayout.tsx` has:
```ts
const isAuthenticated = () => {
  return true; // ALWAYS RETURNS TRUE
};
```
And:
```ts
const getUser = () => {
  return { id: 'user-2', role: 'vendor', email: 'partner@garage.com', full_name: 'Elite Motors' };
};
```

Both are hardcoded. Replace with real JWT parsing:
```ts
const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { id: payload.sub || payload.id, role: payload.role, email: payload.email, full_name: payload.name || '' };
  } catch { return null; }
};
const user = getUser();
const isAuthenticated = () => !!user;
```

This affects the NotificationBell (which gets a hardcoded `userId`), the header username display, and the logout behaviour.

### TASK V11.3 — Scope NotificationBell to Real Vendor User ID

In `VendorLayout.tsx`:
```tsx
// BEFORE (hardcoded):
<NotificationBell userId="vendor-1" role="vendor" />

// AFTER (dynamic):
<NotificationBell userId={user?.id || ''} role="vendor" />
```

The NotificationBell must not render if `userId` is empty.


# Auth Whitelist, First-Time Setup & Real-Time Sync Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Remove 1-click login drawer, enforce strict team directory whitelist on login, provide dynamic first-time password setup for newly added team members (with real-time cloud sync to Firestore), and eliminate race conditions on invoice status updates so changes show system-wide in real time.

**Architecture:** 
1. `src/app/login/page.tsx` dynamically monitors the entered email against `teamMembers`: if not found, denies access; if found without a password, transitions into a First-Time Password Setup form with Confirm Password; if found with a password, displays standard login. The 1-click drawer and pre-fills are completely removed.
2. `src/lib/firebase/tenantContext.tsx` updates `login()` to immediately sync newly created first-time passwords to Firestore Cloud credentials (`syncAuthCredentials`), updating the Admin panel badge live. Removes hardcoded bypasses.
3. `src/components/financials/InvoiceReviewModal.tsx` combines line-item save and status updates into a single atomic write to avoid Firestore concurrent update race conditions.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Tailwind CSS, Firebase Firestore (`onSnapshot`, `setDoc`).

---

### Task 1: Remove 1-Click Fast Login Drawer and Prefilled State in `login/page.tsx`

**Files:**
- Modify: `src/app/login/page.tsx:30-80, 600-715`

**Step 1: Check existing login drawer code**
Verify lines 605-696 of `src/app/login/page.tsx` containing `Authorized Team Members & 1-Click Entry`.

**Step 2: Remove drawer markup, `handleQuickLogin`, and pre-filled email**
- Set `const [email, setEmail] = useState("");`
- Remove `showQuickAccess` state and `handleQuickLogin` function.
- Remove the JSX drawer element for 1-Click Entry.

**Step 3: Test compilation**
Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**
```bash
git add src/app/login/page.tsx
git commit -m "feat(auth): remove 1-click login drawer and clear email prefill"
```

---

### Task 2: Implement Dynamic First-Time Setup & Whitelist Verification in `login/page.tsx`

**Files:**
- Modify: `src/app/login/page.tsx`

**Step 1: Add dynamic team member matching and detection logic**
- Normalize email on change/blur.
- Match against `teamMembers`:
  ```ts
  const matchedMember = teamMembers.find(
    (m) =>
      m.email.toLowerCase() === normalizedEmail ||
      m.displayName.toLowerCase() === normalizedEmail ||
      (normalizedEmail.includes("@") && m.email.toLowerCase().split("@")[0] === normalizedEmail.split("@")[0])
  );
  const isFirstTimeUser = Boolean(
    matchedMember && 
    (!userPasswords[matchedMember.email.toLowerCase()] && !userPasswords[normalizedEmail])
  );
  ```

**Step 2: Add dynamic form presentation and validation**
- If `isFirstTimeUser`:
  - Show personalized banner: `Welcome ${matchedMember.displayName}! Please establish your password to activate your account.`
  - Render "Create Password" and "Confirm Password" fields with eye toggles.
  - Validate minimum 6 characters and password matching on submit.
  - Action button: `Create Password & Enter Workspace ➔`
- If email is not matched and user attempts to proceed:
  - Error: `Access Denied: "${trimmedEmail}" is not registered in the StaxHQ Team Directory. Contact your workspace administrator for access.`
- If email has an existing password:
  - Standard password field with Forgot Password link and `Sign In to Workspace ➔`

**Step 3: Test with typecheck**
Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**
```bash
git add src/app/login/page.tsx
git commit -m "feat(auth): implement dynamic first-time password setup and whitelist gate"
```

---

### Task 3: Real-Time Cloud Password Sync & Strict Whitelisting in `tenantContext.tsx`

**Files:**
- Modify: `src/lib/firebase/tenantContext.tsx:670-800, 1710-1760`

**Step 1: Update `login()` to sync newly established password to Firestore**
- In `login()` when `!currentSavedPassword`:
  ```ts
  const updatedPasswords = { 
    ...userPasswords, 
    [matched.email.toLowerCase()]: password,
    [normalizedEmail]: password 
  };
  setUserPasswords(updatedPasswords);
  localStorage.setItem("staxhq_user_passwords", JSON.stringify(updatedPasswords));
  if (!isDemoMode) {
    syncAuthCredentials(activeOrg.id, updatedPasswords).catch(console.warn);
  }
  ```
- Remove auto-creating mock users and remove admin backdoor bypass (`matched.role === "admin" && password === "admin123"`).

**Step 2: Verify `resetTeamMemberPassword` syncs to Firestore**
- Ensure `syncAuthCredentials(activeOrg.id, updated)` is triggered so Admin password resets propagate in real time.

**Step 3: Test with typecheck**
Run: `npx tsc --noEmit`
Expected: PASS

**Step 4: Commit**
```bash
git add src/lib/firebase/tenantContext.tsx
git commit -m "feat(auth): sync first-time setup passwords to firestore and enforce strict whitelist"
```

---

### Task 4: Fix Atomic Invoice Updates in `InvoiceReviewModal.tsx` for Real-Time Sync

**Files:**
- Modify: `src/components/financials/InvoiceReviewModal.tsx:105-185`

**Step 1: Consolidate `handleMarkAsPaid` into a single atomic update**
- Replace the dual call with:
  ```ts
  const handleMarkAsPaid = () => {
    const updatedDue = dueDateStr ? new Date(dueDateStr).getTime() : invoice.dueDate;
    updateInvoice(invoice.id, {
      dueDate: updatedDue,
      lineItems,
      subtotal: roundedSubtotal,
      total,
      notes,
      status: "paid",
      paidAt: Date.now(),
    });
    onClose();
  };
  ```
- Similarly consolidate `handleSendGmail` into a single atomic update with `{ status: "sent", sentAt: Date.now() }`.

**Step 2: Test with typecheck**
Run: `npx tsc --noEmit`
Expected: PASS

**Step 3: Commit**
```bash
git add src/components/financials/InvoiceReviewModal.tsx
git commit -m "fix(financials): atomic invoice updates to prevent Firestore race conditions"
```

---

### Task 5: Full Build Verification & Checklist Update

**Files:**
- Modify: `docs/plans/task.md`

**Step 1: Run TypeScript compiler**
Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Run Production Build**
Run: `npm run build`
Expected: exit code 0

**Step 3: Update `docs/plans/task.md`**
Record tasks and completion evidence in the table.

**Step 4: Commit and Push**
```bash
git add docs/plans/task.md
git commit -m "chore: complete auth whitelist and realtime sync rollout"
git push origin main
```

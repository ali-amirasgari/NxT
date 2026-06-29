# NxT — Development Roadmap

A sequenced plan for taking NxT from its current state (auth + users + follow graph) to a
complete product. Phases are ordered by dependency: each one unlocks the next. "Must do now"
items are the critical path; everything else can be parallelized once the foundation is solid.

---

## Where we are today

- **Backend (Django/DRF)**: `users` app only — custom `User`, JWT auth (register/login/refresh/logout/me),
  profile fields (incl. instagram/telegram), and a full follow/following graph. MySQL-only. Package-structured.
- **Frontend (Next.js)**: routes scaffolded for landing, auth, home, goals, posts, explore,
  notifications, profile, chats — but most read from local mock/`localStorage`, not the API.
  *(Leaderboard is out of scope — not part of this project.)*
- **chat-service (Node/Mongo)**: conversations, messages, chat-notifications, sockets. Auth via `/users/me`.
- **ai-service (FastAPI)**: present, integration not wired.

---

## Phase 0 — Make the foundation runnable  *(MUST DO NOW)*

The backend can't start until the schema exists.

1. In the Python 3.12 / MySQL env: `pip install -r requirements.txt`, then `python manage.py makemigrations users`.
2. Stand up MySQL (compose `db` service) and `python manage.py migrate` on a fresh DB.
3. Create a superuser; smoke-test auth + follow endpoints and `/admin/`.
4. Confirm `.env` is complete (MYSQL_*, JWT cookie, CORS/CSRF origins).

**Exit criteria:** backend boots, all 6 users tests pass on MySQL, admin login works.

---

## Phase 1 — Close the users vertical end-to-end  *(next)*

Backend is ready; the frontend still uses `localStorage` for profile and mock data for users.

1. Add a Next.js BFF proxy for backend user routes (mirror the `/api/auth/*` pattern) so the browser
   reaches Django with the httpOnly token — `/api/users/*`.
2. Build the frontend data layer: `UsersService` (extends `BaseService`) + query keys + React Query hooks
   for `me`, `updateProfile`, `follow/unfollow`, `followers/following`, `search`, `detail`.
3. Replace `profile-storage.ts` (localStorage) and `users-data` (mock) with real API-backed state.
4. Wire profile edit, settings toggles, public profile, and follow buttons to the new hooks.

**Exit criteria:** a user can register → edit profile → follow/unfollow → see counts, all persisted server-side.

---

## Phase 2 — Core domain backend (the actual product)

Build the domain apps the frontend already has pages for. Each follows the same app anatomy
(`models/ serializers/ views/ services/ admin/ urls/`) used by `users`.

1. **`posts` app** — Post + media, likes, comments. Feed/detail/CRUD endpoints.
2. **`goals` app** — Goal, milestones/check-ins, progress, streak tracking. The accountability core.
3. **streaks/points (internal only)** — streak + progress accrual rules surfaced on profile/goal views.
   No leaderboard.
4. **`notifications` app** — activity notifications (follow, like, comment, goal events). *(Decide:
   unify with the chat-service notifications or keep separate — recommend one notifications source.)*

**Exit criteria:** goals, posts, and notification pages render from the API, not mocks.

---

## Phase 3 — Feeds, discovery & engagement

1. Home feed (following + recommended), explore/search backed by real data.
2. Likes/comments wired through the UI with optimistic updates.
3. Pagination everywhere (adopt the envelope paginator) + filtering (django-filter).

---

## Phase 4 — Chat integration polish

1. Extend chat-service identity (`displayName`, `avatarUrl`) and snapshot them onto Mongo
   messages/conversation members so avatars/names render historically.
2. Surface those in the frontend chat types + UI.
3. Direct-message entry points from profiles/follow lists.

---

## Phase 5 — AI service integration

1. Define what ai-service does for NxT (e.g. goal suggestions, coaching, summaries).
2. Backend → ai-service calls (server-to-server, async via Celery where slow).
3. Frontend surfaces for AI features.

---

## Phase 6 — Platform hardening (cross-cutting, start early where cheap)

1. **Async**: Celery + Redis broker for streak rollovers, notification fan-out, AI jobs; Celery Beat for cron.
2. **Caching**: Redis cache + versioned-namespace invalidation for public reads (feeds, profiles).
3. **API docs**: drf-spectacular (Swagger/Redoc).
4. **Security**: production settings (SSL redirect, secure cookies, HSTS, nosniff), rate limiting on
   auth/sensitive endpoints, uniform error envelope.
5. **Private accounts**: follow-request/approval flow (the `is_private` flag exists but isn't enforced yet).

---

## Phase 7 — Quality, CI/CD & launch

1. Test coverage per app (unit + API), frontend component/e2e tests.
2. CI pipeline (lint, type-check, test, build) + migration checks.
3. Observability (logging, error tracking, health checks already in compose).
4. Production deployment hardening (Gunicorn, WhiteNoise/static, env separation, DB backups).

---

## Critical path (the order that matters)

**Phase 0 → Phase 1 → Phase 2 (goals + posts first) → Phase 3 → 4/5 in parallel → 6/7 ongoing.**

Recommended immediate sequence: finish Phase 0, then Phase 1 so the users feature is genuinely
complete end-to-end, then start the `goals` app (the product's reason to exist) in Phase 2.

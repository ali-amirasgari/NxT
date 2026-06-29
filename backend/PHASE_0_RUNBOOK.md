# Phase 0 — Runbook (run on your machine)

Goal: get the backend booting on MySQL with the schema applied, an admin user, and the
auth + follow endpoints smoke-tested.

> Note: `conf/settings.py` reads `os.getenv` directly — there is **no `.env` loader**. The root
> `.env` is consumed by **docker-compose only**. If you run `manage.py` directly (Path B), export
> the `MYSQL_*` (and other) vars in your shell first, or they fall back to the in-code defaults
> (`MYSQL_HOST=db`, which only resolves inside docker).

The migration `users/migrations/0001_initial.py` is already generated and validated. First thing,
confirm it matches your Django 6.0 env (should print "No changes detected").

---

## Path A — Docker Compose (recommended)

```bash
cd <repo-root>
docker compose up -d db                 # start MySQL, wait for healthcheck
docker compose build backend
docker compose run --rm backend python manage.py makemigrations users --check --dry-run
docker compose run --rm backend python manage.py migrate
docker compose run --rm -it backend python manage.py createsuperuser
docker compose up -d backend            # serves on http://localhost:8000
```

---

## Path B — Local (your Python 3.12 venv + MySQL on localhost)

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt          # needs libmysqlclient + pkg-config installed (brew install mysql-client pkg-config)

# export env for a local run (MySQL reachable on 127.0.0.1)
export MYSQL_DATABASE=nxt MYSQL_USER=nxt MYSQL_PASSWORD=nxt MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306
export DJANGO_SECRET_KEY=dev-secret DJANGO_DEBUG=True

python manage.py makemigrations users --check --dry-run   # expect: No changes detected
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

(Create the DB/user first if needed:
`CREATE DATABASE nxt CHARACTER SET utf8mb4; CREATE USER 'nxt'@'%' IDENTIFIED BY 'nxt'; GRANT ALL ON nxt.* TO 'nxt'@'%';`)

---

## Smoke tests (header/JWT path — no CSRF needed)

```bash
BASE=http://localhost:8000

# register -> returns access_token
ACCESS=$(curl -s -X POST $BASE/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@example.com","password":"StrongPass2026!","confirmPassword":"StrongPass2026!"}' \
  | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')

# session / profile
curl -s $BASE/users/me -H "Authorization: Bearer $ACCESS"

# edit profile (incl. social URLs)
curl -s -X PATCH $BASE/users/me -H "Authorization: Bearer $ACCESS" \
  -H 'Content-Type: application/json' \
  -d '{"display_name":"A","instagram_url":"https://instagram.com/a","bio":"hi"}'

# follow another user (create a 2nd user first, then use their id)
curl -s -X POST $BASE/users/2/follow -H "Authorization: Bearer $ACCESS"
curl -s $BASE/users/2/followers     -H "Authorization: Bearer $ACCESS"
curl -s -X DELETE $BASE/users/2/follow -H "Authorization: Bearer $ACCESS"
```

Also visit `/admin/` and confirm login + the User profile fieldset.

---

## Exit criteria

- `makemigrations --check` → No changes detected
- `migrate` applies cleanly on MySQL
- superuser can log into `/admin/`
- register → me → profile edit → follow/unfollow all return 2xx with `followers_count` / `is_following` in the payload

## Done in the sandbox already (so you don't have to wonder)

- Migration generated from the final models and applied cleanly (on sqlite, DB-agnostic schema).
- Full users test suite: **6/6 passing**. System check: 0 issues.

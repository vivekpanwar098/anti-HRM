# Employee Zone

Owned by the **Employee-side developer**. Everything a logged-in employee sees
lives here — do not put admin-facing screens in this folder.

```
client/src/features/employee/
├── components/    # employee-only UI
├── hooks/         # employee-only hooks
└── services/      # API calls for employee endpoints (/api/v1/*)

client/src/app/employee/   # thin route files that compose features/employee
```

Shared code (`components/ui`, `components/layout`, `lib`, `services/axios`,
`context/AuthContext`) is common ground — coordinate before changing it so you
don't conflict with the admin-zone dev.

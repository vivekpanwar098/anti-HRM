# Admin Zone

Owned by the **Admin-side developer**. Everything an HR admin needs lives here —
do not put employee-facing screens in this folder.

```
client/src/features/admin/
├── components/    # admin-only UI (tables, forms, charts)
├── hooks/         # admin-only hooks
└── services/      # API calls for admin endpoints (/api/v1/*)

client/src/app/admin/      # thin route files that compose features/admin
```

Shared code (`components/ui`, `components/layout`, `lib`, `services/axios`,
`context/AuthContext`) is common ground — coordinate before changing it so you
don't conflict with the employee-zone dev.

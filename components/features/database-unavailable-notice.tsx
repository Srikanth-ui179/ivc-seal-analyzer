export function DatabaseUnavailableNotice() {
  return <div className="mt-10 max-w-2xl border-l-2 border-clay bg-sandstone/20 p-6"><p className="font-display text-2xl">Database connection unavailable</p><p className="mt-3 text-sm leading-6 text-ink/70">Configure the server-only <code>DATABASE_URL</code>, start PostgreSQL, and apply the Phase 1 migrations. No mock archaeological records are substituted when the database is unavailable.</p></div>;
}

export function Footer() {
  return (
    <footer className="border-t border-border py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-gold text-sm tracking-[0.3em]">
          ━━━ ✦ ━━━
        </div>
        <p className="text-text-muted text-sm">
          &copy; {new Date().getFullYear()} FengShui Master. Ancient wisdom, modern insight.
        </p>
      </div>
    </footer>
  );
}

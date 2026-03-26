export function Footer() {
  return (
    <footer className="bg-charcoal text-cream border-t border-border">
      <div className="container py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-cream/50">
          <span>Ce Soir Naples · Staff Training Portal</span>
          <span>492 Bayfront Pl, Naples FL 34102</span>
          <span>
            Need help?{" "}
            <a
              href="mailto:training@cesoirnaples.com"
              className="hover:text-cream hover:underline transition-colors"
            >
              training@cesoirnaples.com
            </a>
          </span>
        </div>
        <p className="text-center text-xs text-cream/50 mt-3">
          © 2026 Ce Soir Naples · Part of the Aidan Hospitality family
        </p>
      </div>
    </footer>
  );
}

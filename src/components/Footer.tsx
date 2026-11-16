import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-margin py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-outline-variant/20">
          <div className="space-y-3">
            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
              Office
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Thamel Marg
              <br />
              Kathmandu, Nepal
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
              Contact
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              <a
                className="hover:text-primary transition-colors"
                href="tel:+97714700000"
              >
                +977 1 4700000
              </a>
              <br />
              <a
                className="hover:text-primary transition-colors"
                href="https://wa.me/97714700000"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>{" "}
              ·{" "}
              <Link className="hover:text-primary transition-colors" href="/contact">
                Email
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
              Hours
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Sun to Fri · 9:00 AM to 6:00 PM NPT
              <br />
              <span className="text-tertiary font-medium">Closed Saturday</span>
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-label-md text-label-md uppercase tracking-widest text-primary font-semibold">
              Legal
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 font-body-md text-body-md text-on-surface-variant">
              <Link className="hover:text-primary transition-colors" href="/archive">
                Terms
              </Link>
              <span>·</span>
              <Link className="hover:text-primary transition-colors" href="/archive">
                Privacy
              </Link>
              <span>·</span>
              <Link className="hover:text-primary transition-colors" href="/archive">
                Cancellation
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Kharka"
              className="h-7 w-auto object-contain rounded opacity-90"
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 Kharka Expeditions. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant/70 font-label-sm text-label-sm uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>High
            Altitude Logistics &amp; Field Research
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { Link } from "react-router-dom";

// Social Icons
const InstagramIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle
      cx="17.5"
      cy="6.5"
      r="0.5"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Footer = () => {
  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #030c10 0%, #041820 25%, #062a3a 45%, #0a4a5e 55%, #062a3a 70%, #041820 85%, #030c10 100%)",
      }}
      data-testid="footer"
    >
      {/* Cyan glow blob - upper center */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "55%",
          background:
            "radial-gradient(ellipse at center, rgba(0,180,220,0.28) 0%, rgba(0,120,160,0.12) 45%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Left dark vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "30%",
          height: "100%",
          background: "linear-gradient(to right, rgba(2,8,12,0.85), transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Right dark vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "30%",
          height: "100%",
          background: "linear-gradient(to left, rgba(2,8,12,0.85), transparent)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-0">
        {/* Nav Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8 mb-16">
          {/* Explore */}
          <div>
            <h3
              style={{
                fontFamily: "system-ui",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.45)",
                fontWeight: 600,
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                {
                  label: "Calculator",
                  to: "/tools/100cr-calculator",
                },
                {
                  label: "Benchmarks",
                  to: "/tools/100cr-calculator#benchmarks",
                },
                { label: "Pricing", to: "/pricing" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        "rgba(255,255,255,0.6)";
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3
              style={{
                fontFamily: "system-ui",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.45)",
                fontWeight: 600,
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Connect
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Instagram", href: "#" },
                { label: "Twitter / X", href: "#" },
                { label: "LinkedIn", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.6)",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color =
                        "rgba(255,255,255,0.6)";
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3
              style={{
                fontFamily: "system-ui",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.45)",
                fontWeight: 600,
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Get In Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      "rgba(255,255,255,0.6)";
                  }}
                >
                  Start a Project
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@100crengine.com"
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color =
                      "rgba(255,255,255,0.6)";
                  }}
                >
                  hello@100crengine.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3
              style={{
                fontFamily: "system-ui",
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.45)",
                fontWeight: 600,
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                "Privacy Policy",
                "Terms of Service",
                "Blog (soon)",
                "Guides (soon)",
              ].map((label) => (
                <li key={label}>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.3)",
                      cursor: "not-allowed",
                    }}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright + Social Icons */}
        <div className="flex flex-col items-center gap-5 mb-10">
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.04em",
            }}
          >
            © 2026 100Cr Engine. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: InstagramIcon, href: "#", label: "Instagram" },
              { Icon: XIcon, href: "#", label: "X" },
              { Icon: LinkedInIcon, href: "#", label: "LinkedIn" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  textDecoration: "none",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Big brand name */}
        <div
          style={{
            overflow: "hidden",
            marginLeft: "-24px",
            marginRight: "-24px",
            lineHeight: 0.85,
          }}
        >
          <p
            style={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              fontSize: "clamp(80px, 18vw, 220px)",
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              textAlign: "center",
              letterSpacing: "-0.02em",
              userSelect: "none",
              lineHeight: 0.88,
              paddingBottom: "0.02em",
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            }}
          >
            100Cr Engine
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

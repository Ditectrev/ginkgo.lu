import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found - GinkGo",
};

export default function NotFound() {
  return (
    <section className="wrap not-found">
      <h1>Ooops... Error 404</h1>
      <h2>We are sorry, but the page you are looking for does not exist.</h2>
      <p>
        <span>Please check entered address and try again or </span>
        <Link className="btn" href="/">
          go to homepage
        </Link>
      </p>
    </section>
  );
}

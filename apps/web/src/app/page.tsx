import { Links } from '@web/components/Links';
import { Logo } from '@web/components/Logo';
import { MiddleContent } from '@web/components/MiddleContent';
import { NextSteps } from '@web/components/NextSteps';
import { Footer } from '@web/components/Footer';
import Test from '@web/components/test';
import { DefaultNullContent } from '@web/components/DefaultNullContent';

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div>
      <div id="hero" className="rounded">
        <div className="text-container">
          <h2>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <span>You&apos;re up and running</span>
          </h2>

          <Test />
          <Links />
        </div>
        <Logo />
      </div>

      <DefaultNullContent />

      <MiddleContent />

      <NextSteps />

      <Footer />
    </div>
  );
}

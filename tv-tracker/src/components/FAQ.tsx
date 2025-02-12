import tmdbLogo from '@/assets/tmdb-short-blue.svg';

export default function FAQ() {
  return (
    <div className='w-full h-screen bg-linear-to-t from-sky-500 to-indigo-500'>
    <div className="flex flex-col items-center gap-4 p-4 max-w-[800px] mx-auto">
      <h1>FAQs</h1>
      <div className="collapse bg-base-100 border border-base-300">
        <input type="radio" name="my-accordion-1" defaultChecked />
        <div className="collapse-title font-semibold">How do I create an account?</div>
        <div className="collapse-content text-sm">
          Click "Log in", then on the log in page, click the "Sign Up" button below the username and password fields.
          Once you create an account you will need to allow access to the TV Tracker API (that is where we keep your watchlist data!). 
          Once you accept, you will then need to verify your email, and you are all set!
        </div>
      </div>
      <div className="collapse bg-base-100 border border-base-300">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title font-semibold">I forgot my password. What should I do?</div>
        <div className="collapse-content text-sm">Click on "Forgot Password" on the login page and follow the instructions sent to your email.</div>
      </div>
      <div className="collapse bg-base-100 border border-base-300">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title font-semibold">How do I update my profile information?</div>
        <div className="collapse-content text-sm">This feature is not available yet, but will be soon!</div>
      </div>
      <div className="collapse bg-base-100 border border-base-300">
        <input type="radio" name="my-accordion-1" />
        <div className="collapse-title font-semibold">Where do you get your TV show/season/episode data?</div>
        <div className="collapse-content text-sm">
          The TMDB API is the source of all TV show data. This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>


      <h1>Credits</h1>
      <div className="flex items-center bg-base-100 border border-base-300 rounded-xl p-4">
        <img src={tmdbLogo} className="logo" alt="tmdb logo" />
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
    </div>
    </div>
  )
}
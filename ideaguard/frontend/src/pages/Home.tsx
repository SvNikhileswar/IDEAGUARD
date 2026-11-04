import { Link } from "@/lib/router";
import { Brand } from "@/components/AppShell";
import { LazyMurmuration } from "@/components/Lazy";
import { SiteFooter } from "@/components/SiteFooter";
import TextPressure from "@/components/original/TextPressure";
import { Icon } from "@/components/icons";

const FEATURES = [
  { icon: "scan" as const, title: "Find similar projects", text: "Your idea is embedded and compared against a reference dataset to surface the closest existing projects." },
  { icon: "chart" as const, title: "Measure originality", text: "A transparent score from how close the nearest matches are — with the overlapping and unique features spelled out." },
  { icon: "bulb" as const, title: "Uncover opportunities", text: "Gemini suggests gaps nobody covers, ways to enhance your idea, and pivots that make it distinctive." },
  { icon: "layers" as const, title: "See the landscape", text: "An interactive map shows where your idea sits among every project in the dataset." },
];

export default function Home() {
  const mobile = typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;
  return (
    <div className="home">
      <LazyMurmuration
        word="ideaguard" preset="night" birds={mobile ? 2200 : 4200} flyFor={7} holdFor={3.2} reeds={false} interactive height="100svh"
        palette={{ skyTop: "#080611", skyLow: "#151121", sun: "#4a3a78", ink: "#dcd3ff" }}
        fontFamily='"Inter Tight", "Inter", Arial, sans-serif'
      >
        <div className="hero">
          <nav className="hero__nav" aria-label="Primary">
            <Brand />
            <div>
              <Link to="/dashboard" className="hero__link">Dashboard</Link>
              <Link to="/history" className="hero__link">History</Link>
              <Link to="/new" className="btn btn--ghost btn--sm">Start</Link>
            </div>
          </nav>
          <div className="hero__body">
            <div className="hero__title">
              <TextPressure text="IDEAGUARD" fontFamily="Roboto Flex" textColor="#FFFFFF" pressureColor="#A78BFA" idle="wave" clickRipple minFontSize={36} />
            </div>
            <p className="hero__lead">Discover how original your idea is. Explore existing projects, uncover opportunities and build something different.</p>
            <div className="hero__cta">
              <Link to="/new" className="btn btn--primary btn--lg">Analyse Your Idea<Icon name="arrow" size={18} /></Link>
              <Link to="/dashboard" className="btn btn--ghost btn--lg">Explore Dashboard</Link>
            </div>
          </div>
          <a className="hero__scroll" href="#features" onClick={e => { e.preventDefault(); document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }}>How it works ↓</a>
        </div>
      </LazyMurmuration>

      <section id="features" className="section" aria-labelledby="feat-h">
        <p className="eyebrow">What IdeaGuard does</p>
        <h2 id="feat-h">Know where your idea stands before you build it.</h2>
        <div className="feature-grid">
          {FEATURES.map(f => (
            <article key={f.title} className="card feature">
              <span className="feature__icon"><Icon name={f.icon} size={20} /></span>
              <h3>{f.title}</h3><p>{f.text}</p>
            </article>
          ))}
        </div>
        <div className="section__cta"><Link to="/new" className="btn btn--primary btn--lg">Analyse Your Idea<Icon name="arrow" size={18} /></Link></div>
      </section>
      <SiteFooter />
    </div>
  );
}

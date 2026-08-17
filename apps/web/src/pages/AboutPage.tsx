import { api } from "../services/api";
import { useAsync } from "../hooks/useAsync";
import { ErrorState, LoadingState } from "../components/States";

export function AboutPage() {
  const about = useAsync(api.aboutMe, []);
  if (about.loading) return <LoadingState />;
  if (about.error || !about.data) return <ErrorState message={about.error} />;
  return (
    <section className="section page about-page">
      <div className="page-heading">
        <span>💜 ✏️</span>
        <h1>Sobre mí</h1>
      </div>
      <div className="about-card">
        {about.data.imageUrl ? (
          <img
            className="avatar big"
            src={about.data.imageUrl}
            alt="Retrato de Naty"
          />
        ) : (
          <div className="avatar big" aria-hidden="true">
            N
          </div>
        )}
        <div>
          <h2>{about.data.fullTitle}</h2>
          {about.data.subtitle && (
            <p className="about-subtitle">{about.data.subtitle}</p>
          )}
          <div className="about-content">{about.data.content}</div>
        </div>
      </div>
    </section>
  );
}

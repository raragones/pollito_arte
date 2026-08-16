export const LoadingState = () => (
  <div className="state">
    <span className="spinner" /> Preparando los colores…
  </div>
);
export const ErrorState = ({ message }: { message: string }) => (
  <div className="state error">☁️ {message}</div>
);
export const EmptyState = ({
  message = "Todavía no hay dibujos por aquí.",
}: {
  message?: string;
}) => <div className="state empty">✨ {message}</div>;

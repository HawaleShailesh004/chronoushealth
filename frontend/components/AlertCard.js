export default function AlertCard({ title, message }) {
  return (
    <article>
      <h2>{title ?? "Drift alert"}</h2>
      {message && <p>{message}</p>}
    </article>
  );
}

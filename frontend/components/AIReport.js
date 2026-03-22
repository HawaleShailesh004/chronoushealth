export default function AIReport({ content }) {
  return (
    <section aria-label="AI reasoning">
      <h2>AI report</h2>
      {content && <pre>{content}</pre>}
    </section>
  );
}

import '../styles/SkeletonCard.css';

export default function SkeletonCard({ variant = 'default' }) {
  const shop = variant === 'shop';
  return (
    <div
      className={`skeleton-card${shop ? ' skeleton-card--shop' : ''}`}
      aria-hidden="true"
    >
      <div className="skeleton-card__shine skeleton-card__image" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__shine skeleton-card__line skeleton-card__line--short" />
        <div className="skeleton-card__shine skeleton-card__line" />
        <div className="skeleton-card__shine skeleton-card__line skeleton-card__line--price" />
      </div>
    </div>
  );
}

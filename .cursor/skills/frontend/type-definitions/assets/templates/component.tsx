import type { FC } from 'react';

interface EntitySummaryProps {
  id: string;
  title: string;
  subtitle?: string;
  onSelect?: (id: string) => void;
}

export const EntitySummary: FC<EntitySummaryProps> = ({
  id,
  title,
  subtitle,
  onSelect,
}) => {
  return (
    <article aria-label={`entity-${id}`}>
      <h3>{title}</h3>
      {subtitle ? <p>{subtitle}</p> : null}
      {onSelect ? (
        <button type="button" onClick={() => onSelect(id)}>
          Select
        </button>
      ) : null}
    </article>
  );
};

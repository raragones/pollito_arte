import type { Collection } from "@natyarte/shared";
import { Link } from "react-router-dom";
const colors = ["mint", "pink", "yellow", "lilac"];
export function CollectionCard({
  collection,
  index,
}: {
  collection: Collection;
  index: number;
}) {
  return (
    <Link
      to={`/dibujos?coleccion=${collection.slug}`}
      className={`collection-card ${colors[index % colors.length]}`}
    >
      <div className="collection-cover">
        {collection.coverImageUrl ? (
          <img src={collection.coverImageUrl} alt="" />
        ) : (
          <span>🎨</span>
        )}
      </div>
      <strong>{collection.name}</strong>
      <small>{collection.drawingCount ?? 0} dibujos</small>
    </Link>
  );
}

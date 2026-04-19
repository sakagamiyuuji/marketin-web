import { Link } from 'react-router-dom';
import { productCategorySlug } from '../utils/categories';
import {
  formatRupiah,
  productId,
  productImage,
  productTitle,
} from '../utils/format';
import '../styles/ProductCard.css';

function labelForSlug(slug) {
  const map = {
    elektronik: 'Elektronik',
    fashion: 'Fashion',
    makanan: 'Makanan',
    lainnya: 'Lainnya',
  };
  return map[slug] ?? slug;
}

export default function ProductCard({ product }) {
  const id = productId(product);
  const title = productTitle(product);
  const image = productImage(product);
  const price = product?.price;
  const slug = productCategorySlug(product?.category);

  return (
    <article className="product-card">
      <Link to={`/products/${id}`} className="product-card__link">
        <div className="product-card__image-wrap">
          {image ? (
            <img
              src={image}
              alt=""
              className="product-card__image"
              loading="lazy"
            />
          ) : (
            <div className="product-card__image product-card__image--placeholder" />
          )}
        </div>
        <div className="product-card__body">
          <span className="product-card__badge">{labelForSlug(slug)}</span>
          <h3 className="product-card__title">{title}</h3>
          <p className="product-card__price">{formatRupiah(price)}</p>
        </div>
      </Link>
    </article>
  );
}

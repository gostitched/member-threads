import PriceEstimator from './PriceEstimator';
import SizeChart from './SizeChart';
import type { CatalogProduct, PublicPriceBreak } from '@/lib/catalog/types';
import './panels.css';

/** The product page under the stage: the details, the price ladder and the size chart. */
export default function ProductPanels({
  product,
  specs,
  breaks,
}: {
  product: Pick<CatalogProduct, 'minimumOrderQuantity' | 'sizeChart' | 'sizeChartUnit'>;
  specs: Array<[string, string]>;
  breaks: PublicPriceBreak[];
}) {
  const hasChart = Object.keys(product.sizeChart).length > 0;
  if (!specs.length && !breaks.length && !hasChart) return null;
  return (
    <div className="pdp">
      {(specs.length > 0 || breaks.length > 0) && (
        <section className={`shell grid gap-4 pb-16 [&>*]:min-w-0 ${specs.length && breaks.length ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]' : ''}`}>
          {specs.length > 0 && (
            <div className="pdp-card">
              <h2 className="pdp-h t-h3">
                The <em>details.</em>
              </h2>
              <dl className="mt-5">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 border-t border-rule py-3.5">
                    <dt className="t-spec shrink-0 text-muted">{k}</dt>
                    <dd className="text-right font-sans text-[0.9375rem]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {breaks.length > 0 && (
            <div className="pdp-card">
              <h2 className="pdp-h t-h3">
                Order more, <em>pay less.</em>
              </h2>
              <div className="mt-5">
                <PriceEstimator breaks={breaks} minimum={product.minimumOrderQuantity} />
              </div>
            </div>
          )}
        </section>
      )}

      {hasChart && (
        <section className="shell pb-16">
          <details className="pdp-card">
            <summary className="pdp-summary">
              <span className="pdp-h t-h3">
                Size <em>chart.</em>
              </span>
              <svg aria-hidden viewBox="0 0 14 14" className="pdp-plus" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1v12M1 7h12" />
              </svg>
            </summary>
            <div className="mt-6">
              <SizeChart chart={product.sizeChart} unit={product.sizeChartUnit} />
            </div>
          </details>
        </section>
      )}
    </div>
  );
}

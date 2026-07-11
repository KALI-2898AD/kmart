import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export const metadata = {
  title: 'Explore | Kmart',
  description: 'Browse our full collection of advanced technology.',
};

async function getProducts(search, page) {
  try {
    await dbConnect();
    const limit = 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { $text: { $search: search } };
    }

    const totalCount = await Product.countDocuments(query);
    const productsQuery = Product.find(query);
    
    if (search) {
      productsQuery.sort({ score: { $meta: "textScore" } });
    }

    const products = await productsQuery.skip(skip).limit(limit).lean();

    return { 
      data: JSON.parse(JSON.stringify(products)), 
      totalPages: Math.ceil(totalCount / limit), 
      page 
    };
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return { data: [], totalPages: 1, page: 1 };
  }
}

export default async function ExplorePage({ searchParams }) {
  const search = searchParams?.search || '';
  const page = parseInt(searchParams?.page || '1');
  
  const productsResult = await getProducts(search, page);
  const products = productsResult.data || [];
  const totalPages = productsResult.totalPages || 1;
  const currentPage = productsResult.page || 1;

  const createPageUrl = (pageNum) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", pageNum);
    return `/explore?${params.toString()}`;
  };

  return (
    <div className="container" style={{ padding: "8rem 2rem 5rem" }}>
      <h1 className="section-title title-gradient" style={{ textAlign: "left", marginBottom: "1rem" }}>
        {search ? `Search Results: "${search}"` : "All Products"}
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "3rem" }}>Browse our entire catalog of next-generation items.</p>
      
      {products.length > 0 ? (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id || product.name} product={product} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
              {currentPage > 1 && (
                <Link href={createPageUrl(currentPage - 1)}>
                  <button className="btn-outline">Previous</button>
                </Link>
              )}
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link href={createPageUrl(currentPage + 1)}>
                  <button className="btn-outline">Next</button>
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="error-state">
          <p>No products found.</p>
          {search ? (
            <Link href="/explore">
              <button className="btn-outline" style={{ marginTop: '1rem' }}>Clear Search</button>
            </Link>
          ) : (
            <p style={{ marginTop: '1rem' }}>Database is empty. Please run the seed command.</p>
          )}
        </div>
      )}
    </div>
  );
}

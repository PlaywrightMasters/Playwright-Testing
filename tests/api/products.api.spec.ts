import { expect, test } from '../../src/fixtures/test';
import searchTerms from '../../test-data/search-terms.json';

const METHOD_NOT_SUPPORTED = { responseCode: 405, message: 'This request method is not supported.' };

test.describe('Products API', () => {
  test('GET /api/productsList returns a well-formed catalogue @smoke', async ({ storeApi }) => {
    const response = await storeApi.getAllProducts();

    expect(response.responseCode).toBe(200);
    const products = response.products ?? [];
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        brand: expect.any(String),
        price: expect.stringMatching(/^Rs\. \d+$/),
        category: { category: expect.any(String), usertype: { usertype: expect.any(String) } },
      });
    }
    const ids = products.map((product) => product.id);
    expect(new Set(ids).size, 'product ids are unique').toBe(ids.length);
  });

  test('POST /api/productsList is rejected as unsupported', async ({ storeApi }) => {
    expect(await storeApi.send('POST', '/api/productsList')).toEqual(METHOD_NOT_SUPPORTED);
  });

  test('GET /api/brandsList returns brands that the catalogue uses', async ({ storeApi }) => {
    const response = await storeApi.getAllBrands();

    expect(response.responseCode).toBe(200);
    const brands = new Set((response.brands ?? []).map((brand) => brand.brand));
    expect(brands.size).toBeGreaterThan(0);

    const productBrands = (await storeApi.listProducts()).map((product) => product.brand);
    const unknownBrands = productBrands.filter((brand) => !brands.has(brand));
    expect(unknownBrands, 'every product brand is listed').toEqual([]);
  });

  test('PUT /api/brandsList is rejected as unsupported', async ({ storeApi }) => {
    expect(await storeApi.send('PUT', '/api/brandsList')).toEqual(METHOD_NOT_SUPPORTED);
  });

  for (const term of searchTerms) {
    test(`POST /api/searchProduct "${term}" only returns matching products`, async ({ storeApi }) => {
      const response = await storeApi.searchProducts(term);

      expect(response.responseCode).toBe(200);
      const products = response.products ?? [];
      expect(products.length).toBeGreaterThan(0);

      // The store matches the search term against the product name or its category.
      const needle = term.toLowerCase();
      const unrelated = products
        .filter((p) => !`${p.name} ${p.category.category}`.toLowerCase().includes(needle))
        .map((p) => p.name);
      expect(unrelated).toEqual([]);
    });
  }

  test('POST /api/searchProduct without a search term is a bad request', async ({ storeApi }) => {
    expect(await storeApi.searchProducts()).toEqual({
      responseCode: 400,
      message: 'Bad request, search_product parameter is missing in POST request.',
    });
  });
});

import { expect, test } from '../../src/fixtures/test';
import searchTerms from '../../test-data/search-terms.json';

test.describe('Product catalogue', () => {
  test('lists every catalogue product on the All Products page', async ({ productsPage, storeApi }) => {
    const catalogue = await storeApi.listProducts();

    await productsPage.open();
    await expect(productsPage.grid.title).toHaveText('All Products', { ignoreCase: true });
    await expect(productsPage.grid.cards).toHaveCount(catalogue.length);

    const shownIds = (await productsPage.grid.productIds()).toSorted((a, b) => a - b);
    expect(shownIds).toEqual(catalogue.map((product) => product.id).toSorted((a, b) => a - b));
  });

  test('shows product details that match the catalogue API @smoke', async ({ page, productsPage, productDetailsPage, storeApi }) => {
    const product = await storeApi.findProduct(1);

    await productsPage.open();
    await productsPage.grid.viewProduct(product.id);

    await expect(page).toHaveURL(`/product_details/${product.id}`);
    await expect(productDetailsPage.name).toHaveText(product.name);
    await expect(productDetailsPage.category).toHaveText(
      `Category: ${product.category.usertype.usertype} > ${product.category.category}`,
    );
    await expect(productDetailsPage.price).toHaveText(product.price);
    await expect(productDetailsPage.brand).toHaveText(`Brand: ${product.brand}`);
    await expect(productDetailsPage.availability).toContainText('Availability:');
    await expect(productDetailsPage.condition).toContainText('Condition:');
  });

  for (const term of searchTerms) {
    test(`search for "${term}" shows the same products as the search API`, async ({ productsPage, storeApi }) => {
      const expectedIds = (await storeApi.findProducts(term)).map((product) => product.id).toSorted((a, b) => a - b);

      await productsPage.open();
      await productsPage.search(term);

      await expect(productsPage.grid.title).toHaveText('Searched Products', { ignoreCase: true });
      await expect(productsPage.grid.cards).toHaveCount(expectedIds.length);
      expect((await productsPage.grid.productIds()).toSorted((a, b) => a - b)).toEqual(expectedIds);
    });
  }
});

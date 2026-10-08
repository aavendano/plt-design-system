1. **Audit Creative Tim components**
   - Completed the audit and documented findings in `docs/creative-tim-porting.md`.

2. **Implement ProductGallery**
   - Create Vanilla JS web component `<plt-product-gallery>` in `packages/design-system/src/commerce/gallery.js` (or inline script in renderers for now, will keep it simple and framework-agnostic).
   - Adapt `packages/design-system/renderers/astro/product/ProductDetail.astro` and `packages/design-system/renderers/liquid/product-detail.liquid` to use the new gallery behavior.
   - The behavior should switch the main image source when a thumbnail is clicked. Optional zoom. Ensure focus behavior and keyboard accessibility are handled.

3. **Implement ProductQuickView**
   - Implement `ProductQuickView.astro` and `product-quick-view.liquid`.
   - Re-use `ProductDetail` and `OptionPicker` and other related existing components.
   - Use HTML `<dialog>` element for the modal to ensure accessibility, focus management, and escape key handling without external dependencies.
   - Include JS to handle opening/closing of the dialog.

4. **Implement ReviewRating, ReviewSummary, ReviewCard, IncentiveBar**
   - Create Astro and Liquid renderers for:
     - `ReviewRating` (displays stars based on a rating value).
     - `ReviewSummary` (summary of reviews, distribution bars).
     - `ReviewCard` (individual review).
     - `IncentiveBar` (feature promos/incentive columns).
   - Normalize props: `rating`, `maxRating`, `count`, `distribution`, etc. Handle zero states.

5. **Export map updates**
   - Ensure all new components are exported in `contracts/components.md` if applicable, and their renderers exist in both Astro and Liquid.
   - Update CSS in `packages/design-system/src/patterns.css` for new classes.

6. **Preview/Demo examples and tests**
   - Add examples of these new components to `demo/demo.html` or equivalent.
   - Run `npm run check` in `packages/design-system`.
   - Update `vitest` tests if any exist, or ensure the check scripts pass.

7. **Pre-commit and Push**
   - Complete pre-commit steps.
   - Commit the changes and report PR details.

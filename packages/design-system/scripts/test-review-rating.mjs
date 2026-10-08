import { Liquid } from 'liquidjs';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { join } from 'path';

const root = fileURLToPath(new URL("..", import.meta.url));

async function runTests() {
  const engine = new Liquid();
  const templateStr = await readFile(join(root, 'renderers/liquid/commerce/review-rating.liquid'), 'utf8');

  console.log("Testing valid input (rating: 3, max_rating: 5, count: 12)...");
  let output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 5, count: 12 });
  if (!output.includes('Note:')) {
    if (!output.includes('Rating: 3 out of 5')) throw new Error('Missing proper rating aria label');
    if (!output.includes('(12)')) throw new Error('Missing correct count');
    const starMatches = output.match(/<span class="d-mask d-mask-star-2/g);
    if (!starMatches || starMatches.length !== 5) throw new Error('Should render 5 stars total');
  }

  console.log("Testing invalid negative rating (rating: -1)...");
  output = await engine.parseAndRender(templateStr, { rating: -1, max_rating: 5, count: 1 });
  if (!output.includes('Rating: 0 out of 5')) throw new Error('Failed to clamp negative rating to 0');

  console.log("Testing invalid NaN rating (rating: 'foo')...");
  output = await engine.parseAndRender(templateStr, { rating: 'foo', max_rating: 5, count: 1 });
  if (!output.includes('Rating: 0 out of 5')) throw new Error('Failed to clamp NaN rating to 0');

  console.log("Testing excessive max_rating (max_rating: 50)...");
  output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 50, count: 1 });
  if (!output.includes('Rating: 3 out of 10')) throw new Error('Failed to cap excessive max_rating at 10');
  const excessiveMatches = output.match(/<span class="d-mask d-mask-star-2/g);
  if (!excessiveMatches || excessiveMatches.length !== 10) throw new Error('Failed to render capped 10 stars');

  console.log("Testing negative count (count: -5)...");
  output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 5, count: -5 });
  if (output.includes('(-5)')) throw new Error('Should not render negative count');

  console.log("Testing zero count for no-reviews label...");
  output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 5, count: 0 });
  if (!output.includes('No reviews')) throw new Error('Failed to render No reviews label');

  console.log("Testing fr-CA locale...");
  output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 5, count: 2, locale: 'fr-CA' });
  if (!output.includes('Note: 3 sur 5')) throw new Error('Failed to render french CA translation');

  console.log("Testing unknown locale fallback to en-US...");
  output = await engine.parseAndRender(templateStr, { rating: 3, max_rating: 5, count: 2, locale: 'jp-JP' });
  if (!output.includes('Rating: 3 out of 5')) throw new Error('Failed to fallback unkown locale');

  console.log("ReviewRating tests passed.");
}

runTests().catch(err => {
  console.error("Test failed: ", err.message);
  process.exit(1);
});

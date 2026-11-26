# Coding Activity panel update

## Changes
- Remove the GitHub statistics panel from the opening section so it appears only under **Coding Activity**.
- Expand Coding Activity to show five live public GitHub metrics: followers, public repositories, commits, estimated lines of code, and stars earned.
- Keep the contribution heatmap and its Less/More legend beneath the metrics.
- Add the portfolio mark as the browser-tab icon and verify it loads correctly.

## Data handling
- Extend the existing server-side GitHub request and retain its one-hour cache.
- Use public profile and repository data for followers, repository count, and stars.
- Derive commit totals from public GitHub commit search.
- Clearly label lines of code as an estimate because GitHub does not provide an exact lifetime line count through its public API.
- Show a neutral unavailable state when GitHub cannot provide a metric rather than inventing a number.

## Verification
- Check the home page at desktop and mobile sizes.
- Confirm only one GitHub panel appears, the five metrics fit cleanly, the heatmap remains usable, and the browser-tab icon is present.
- Confirm the project finishes without errors.

# Historical and evidence methods

## Preserve the source of a claim

Use these evidence classes, adapting labels to the report:

| Class | What it means |
| --- | --- |
| Direct observation | A page, record, interface or behavior inspected in this run. Page content remains an attributed claim unless the observation itself proves it. |
| Official record | A registry, filing or other authoritative record for a specific legal fact. Its scope and jurisdiction matter. |
| Company or founder claim | First-party statements, marketing, hiring copy, demonstrations and recollections. |
| Interested corroboration | Investor, supplier or vendor-published customer testimony. |
| Customer-owned account | Material published by the customer; stronger relationship evidence, but assess what it actually confirms. |
| Independent reporting | Reporting whose sourcing and independence can be assessed. |
| Inference | The researcher's interpretation, with its evidentiary basis stated. |
| Unresolved | Missing or contradictory evidence; not a claim of nonexistence. |

Maintain a source register with stable IDs. Useful fields are `source_id`, `url`,
`title`, `publisher`, `source_type`, `published_at`, `event_date`, `captured_at`,
`retrieved_at`, `access_status`, `supports`, and `limits`. Leave unknown dates
blank rather than guessing. Record the original source behind syndication.

For important contested claims, a compact claim table helps: `claim_id`,
`claim`, `source_ids`, `evidence_class`, `assessment`, `contradiction`, and
`needed_to_resolve`. A separate spreadsheet is optional; the distinctions are not.

Separate observations such as “the homepage displays a customer logo” from
claims such as “that customer runs the current product in production.” Mark
search-snippet-only evidence as discovery until the source can be inspected.

## Dates and archived pages

Use official registries to distinguish incorporation from foreign registration,
renaming, dissolution or reinstatement. A registry filing date is not necessarily
the operational founding date. A launch announcement may follow years of work.

For a narrative timeline, seek archived home, product, pricing and about pages
from meaningfully different periods. The Internet Archive's CDX index can locate
captures for a verified domain, for example `https://web.archive.org/cdx/search/cdx`
with `url`, `output=json`, `filter=statuscode:200`, `filter=mimetype:text/html`,
`fl=timestamp,original,statuscode,digest`, a bounded `limit`, and a suitable
`collapse`. Fetch selected snapshots, not every capture. Inspect the contents;
an HTTP 200 can still contain an empty page, parking page or unrelated business.

Keep these fields distinct:

| Date | Interpretation |
| --- | --- |
| Event date | When a source says the underlying event happened. |
| Publication date | When the account was published, if reliably available. |
| Archive capture | When the historical page was preserved. |
| Retrieval date | When this investigation accessed the source. |

A current page carrying an old date can have been rewritten. A removed job's
timestamp does not freeze its current description. A search engine's crawl date
does not date the event. Relative social timestamps can change across cached
views; use a reliable absolute date or leave publication date unresolved.

If a February snapshot shows infrastructure and a March snapshot shows a
procurement offer, report the visible change between those observations. Do not
date a pivot to March or infer what paying customers were using in February.
Missing captures do not prove that an earlier product or company did not exist.

## Founders and first customers

Check identity across official biographies, public professional histories,
investor material and dated talks. Resolve name or role conflicts explicitly.
Relevant background includes prior collaboration, exposure to the problem,
previous products and demonstrated expertise. Exclude private contact details,
residential addresses and unrelated family information.

Search with the legal name, product name, earlier names, domain and founders:

- “first customer”, “first paying customer”, “early customers”.
- “design partner”, “pilot”, “co-developed”, “built with”.
- “how we started”, “first deployment”, “customer zero”.

Then follow named customer leads into the customer's own publications, hiring,
conference presentations, procurement notices and case studies. Search snippets
are leads, not a substitute for a source. Use professional public information;
do not reach out unless the user authorizes it.

For each early relationship, record the company, relationship type, earliest
supported date, initial use case, commercial status, source and uncertainty.
Explicitly distinguish these conclusions:

| Evidence | Supported conclusion | Unsupported upgrade |
| --- | --- | --- |
| A founder names an initial paid contract | First paying customer according to that founder | Independently audited customer chronology |
| Customer says it helped shape the product | Co-development described by the customer | First customer, unpaid pilot, or formal design-partner agreement |
| Earliest archived customer logo | Named relationship visible by that capture | Earliest actual relationship |
| Founder describes unnamed deployment feedback | Customer-driven product change claimed | Identity inferred from another case with similar metrics |
| No early name found | Identity unresolved after the stated search | There were no customers or design partners |

If the original customer remains unknown, retain the discovery result rather
than inventing a likely name. Useful founder questions are: Who first agreed to
use it? Was the engagement paid? Which problem did that account reveal? What
changed in the product? When did the pilot become repeatable production work?

## Assess changes and contradictions

Compare dates, audiences and scopes before calling something inconsistent.
An undated Type I compliance story can predate a current Type II claim. Neither
verifies the auditor's coverage without the report. A statement about constructing
context in hours can coexist with weeks to production, if those are distinct
milestones. Preserve unresolved ambiguity when the source does not define them.

Funding totals are not round sizes; announced funding need not close on the
announcement date. Pipeline, bookings, ARR and recognized revenue differ.
Percentage growth without a baseline cannot establish revenue. An open role is
not headcount, and an engineering hiring objective is not a shipped capability.

For outcome metrics retain the population, period, workflow, denominator,
measurement owner and remaining human effort when available. A named case is
more specific evidence than an anonymous aggregate, not automatically independent
verification. Identify the smallest additional record that would change the
assessment instead of ending with a generic diligence checklist.

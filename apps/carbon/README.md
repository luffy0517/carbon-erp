# Carbon

ERP Application built with:

- [Remix](https://remix.run)
- [Chakra UI](https://chakra-ui.com/)
- [Supabase](https://supabase.com/)
- [Postgres](https://postgresql.org/)
- [Redis](https://redis.io)
- [BullMQ](https://docs.bullmq.io)

## Code Organization

### `app/components`

Reusable react components that are specific to this project (and remix). Shared components should live in `packages/react` if they don't rely on some application-specific library. For example, the `Table` relies on some remix internals, so it lives in `app/components`, but the `Date` component is framework agnostic, so it lives in `packages/react`.

### `app/interfaces`

Where screens, modals and drawers live. Divided by module.

### `app/services`

Where backend services that talk to the database/cache live.

### `app/routes`

File-based route definitions using `remix`. This is where the services and interfaces meet. Each route is loaded in parallel for performance, so each route is responsible for defining it's own authorization and data needs. Each route has three parts (none are required):

1. `export async function loader`: The data that the route returns, which can be accessed via `GET` or `useLoaderData` in the component (3)
2. `export async function action`: The actions (`POST` or `DELETE`) for the route, which can be accessed via http methods or through the `ValidatedForm` component.
3. `export default function`: The nested react component for the route. This renders inside the `<Outlet/>` component of the parent route.

### `app/queues`

Where async tasks are defined. For example, scheduling calculations or bulk updates to user permissions that could take a long time to run are put into a job queue to run when the resources become available. Under the hood this relies on `@carbon/redis` (to store the jobs) and `~/lib/bullmq` to manage execution.

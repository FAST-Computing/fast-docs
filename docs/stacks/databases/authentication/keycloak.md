---
outline: deep
---

# <img src="/logos/keycloaklogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Keycloak

Keycloak is the company-standard identity and access management (IAM) platform for applications that need
centralized login, user management, roles, single sign-on (SSO), and password flows. It implements the OpenID
Connect (OIDC) and OAuth 2.0 protocols and can also federate users from external identity providers and directories.

This document is the baseline procedure for creating a Keycloak configuration for a new project. It also documents
the delegated `admin-manager` pattern used when an application must let a customer administrator manage users without
granting access to the whole realm.

> [!WARNING]
> The exact Admin Console labels, REST fields, and fine-grained permission endpoints can change between Keycloak
> versions. Record the Keycloak version for every environment and verify version-specific API documentation before
> automating a production deployment.

## Contents

- [Keycloak concepts](#keycloak-concepts)
- [Application architecture](#application-architecture)
- [Standard setup for a new project](#standard-setup-for-a-new-project)
- [FastAPI integration](#fastapi-integration)
- [User and password flows](#user-and-password-flows)
- [Delegated user administration](#delegated-user-administration)
- [CLI and Docker operations](#cli-and-docker-operations)
- [Production checklist](#production-checklist)
- [Troubleshooting](#troubleshooting)

## Keycloak Concepts

### Realm

A realm is an isolated security domain containing users, groups, roles, clients, identity providers, login settings,
and sessions. Create one realm per application or per security boundary. Do not use the `master` realm for normal
application users; it is reserved for administering the Keycloak installation.

Example realm names are `test-app`, `inewsense-dev`, and `inewsense-prod`. Keep development, staging, and production
realms separate so that users, credentials, redirect URLs, and permissions cannot cross environments accidentally.

### Client

A client represents an application or service that uses Keycloak. For an OIDC application, configure:

- `Client ID`: stable identifier used in authorization requests and tokens.
- `Client authentication`: enabled for confidential server-side applications; disabled for public browser-only apps.
- `Valid redirect URIs`: exact callback URLs permitted after login. Use the narrowest patterns possible.
- `Web origins`: approved browser origins for CORS-related OIDC requests.
- `Client secret`: only for confidential clients; store it in a secret manager, never in frontend code.

The client is not the same thing as a user. Users authenticate; clients request tokens on behalf of users or services.

### Tokens and claims

Keycloak issues signed JWT access tokens. Common claims include:

| Claim | Meaning |
| --- | --- |
| `iss` | Issuer URL for the realm. |
| `sub` | Immutable subject identifier for the user. |
| `aud` | Intended audience, usually one or more clients. |
| `exp` | Expiration timestamp. |
| `preferred_username` | Display/login username. |
| `realm_access.roles` | Realm roles assigned to the user. |
| `resource_access` | Client-specific roles assigned to the user. |

Applications must use `sub` as the stable user identifier. Usernames and email addresses may change.

### Roles and permissions

Realm roles apply across the realm. Client roles belong to one client and are normally used for application
authorization. A role in `realm-management`, such as `view-users` or `manage-users`, is an administrative permission
for Keycloak itself and must not be confused with an application role such as `operator` or `viewer`.

Use the least powerful role that satisfies the use case. Prefer application roles for application authorization and
Fine-Grained Admin Permissions (FGAP) for scoped administration of Keycloak resources.

## Application Architecture

Keep identity data and application data conceptually separate:

- Keycloak stores identity, authentication credentials, email verification, groups, and protocol roles.
- The application database stores domain data such as organization, customer, ASL, subscription, and business role.
- The application links the two systems using the Keycloak user `sub` value.

The request flow for a protected API is:

1. The user authenticates through the OIDC client.
2. Keycloak returns an access token to the application.
3. The application sends the token as `Authorization: Bearer <token>`.
4. The API validates the JWT signature using the realm JWKS endpoint.
5. The API validates issuer, audience, expiration, and any required roles.
6. The route uses the verified claims and the `sub` value for application lookups.

Never trust decoded claims before signature and standard-claim validation. Never accept a user ID from the request body
as the authenticated identity for self-service operations; derive it from `sub`.

## Standard Setup For A New Project

### Prerequisites

- A supported Keycloak instance and its exact version recorded.
- Administrator access to the `master` realm, or a deployment service account with the required permissions.
- An application domain for each environment.
- A secure location for client secrets and SMTP credentials.
- `kcadm.sh` access, or access to the Admin REST API.

### 1. Create the realm

In the Admin Console:

1. Open the realm selector and choose **Create realm**.
2. Set the realm name, for example `test-app`.
3. Enable the realm and save it.

CLI equivalent:

```bash
kcadm.sh create realms \
  -s realm=test-app \
  -s enabled=true \
  -s displayName="Test App"
```

### 2. Create the application client

In **Realm > Clients > Create client**:

1. Choose **OpenID Connect**.
2. Set the client ID, for example `test-app-client`.
3. Enable client authentication when the application can securely store a secret.
4. Add only the redirect URIs and web origins required by the environment.
5. Copy the generated secret into the application secret store when applicable.

Example:

```bash
kcadm.sh create clients -r test-app \
  -s clientId=test-app-client \
  -s enabled=true \
  -s publicClient=false \
  -s 'redirectUris=["https://app.example.com/*"]' \
  -s 'webOrigins=["https://app.example.com"]'
```

For a public SPA, use `publicClient=true`, do not create a secret, and use Authorization Code Flow with PKCE. Do not
use the deprecated implicit flow.

### 3. Configure login settings

Review **Realm settings > Login** and configure the policies required by the project:

- user registration, only if the application requires it;
- email verification, if email ownership is part of the trust model;
- password policy and password history;
- `Forgot password`, if users must recover access without an administrator;
- session and token lifetimes appropriate to the risk of the application.

Do not enable self-registration by default. If it is enabled, define email verification and an approval or onboarding
process before granting application roles.

### 4. Configure SMTP

Configure **Realm settings > Email** with an approved SMTP provider. Test both connectivity and a real password-reset
message. For Gmail, a two-factor-protected account requires a dedicated App Password, not the normal account password.

Use one consistent transport mode:

- port `587`: STARTTLS enabled, implicit SSL disabled;
- port `465`: implicit SSL enabled, STARTTLS disabled.

The `from` address must be the authenticated mailbox or a verified alias.

Example CLI configuration:

```bash
kcadm.sh update realms/test-app \
  -s 'smtpServer.host=smtp.example.com' \
  -s 'smtpServer.port=587' \
  -s 'smtpServer.from=no-reply@example.com' \
  -s 'smtpServer.auth=true' \
  -s 'smtpServer.starttls=true' \
  -s 'smtpServer.ssl=false' \
  -s 'smtpServer.user=<smtp-user>' \
  -s 'smtpServer.password=<smtp-secret>'
```

### 5. Create application roles

Create only the roles used by the application, for example `admin`, `operator`, and `viewer`. Keep them simple and
document their meaning. Do not assign `realm-admin` or broad `realm-management` roles to normal users.

Assign roles through groups when possible. Group-based assignment makes onboarding, offboarding, and audits easier.

### 6. Configure application environment variables

For the FastAPI backend template, create `.env` from `.env.example` and set:

```dotenv
KEYCLOAK_URL=https://keycloak.example.com
REALM=test-app
CLIENT_ID=test-app-client
```

`KEYCLOAK_URL` is the Keycloak base URL, `REALM` is the target realm, and `CLIENT_ID` is the API audience/client
identifier expected by the backend. Never commit `.env` or client secrets.

## FastAPI Integration

The backend template validates Keycloak access tokens with RS256 and the realm's JWKS endpoint. Authentication code is
kept under `core/auth/`; route handlers only need the `verify_token` dependency:

```python
from fastapi import Depends

from core.auth import verify_token


@router.get("/protected")
def protected_route(user=Depends(verify_token)):
    return {"user": user["preferred_username"]}
```

The dependency must validate:

- the JWT signature against the current JWKS keys;
- `iss` against the configured realm issuer;
- `aud` against the configured client/audience;
- `exp` and token validity;
- required roles for routes that need authorization.

Key rotation is normal. The verifier should refresh JWKS keys when a previously unknown `kid` is encountered rather than
requiring a deployment. Use the optional `core/auth/schemas.py` `TokenPayload` model when typed claim access is useful.

### Configure the API audience

The FastAPI verifier validates the JWT `aud` claim against the backend `CLIENT_ID`. Keycloak must therefore add that
client ID as an audience to access tokens issued for the application. Configure this once as a realm client scope.

#### Create the audience client scope

In the Keycloak Admin Console:

1. Open **Client scopes > Create client scope**.
2. Set the name to `api-audience` (or the project-approved equivalent).
3. Set **Protocol** to **OpenID Connect**.
4. Save the scope.

#### Add the Audience mapper

Open the new scope, select **Mappers > Configure a new mapper**, and choose **Audience**. Configure:

- **Included Client Audience**: the exact value of the FastAPI backend `CLIENT_ID`;
- **Add to access token**: enabled;
- **Add to token introspection**: enabled.

The included client audience must match the value configured in the backend. For example, if the API environment has:

```dotenv
CLIENT_ID=test-app-api
```

the mapper must use `test-app-api` as its included client audience. Do not use the frontend client ID unless the
frontend is also the protected API audience.

#### Make the scope a realm default

In **Client scopes**, set the `api-audience` assigned type to **Default**, or add it through **Realm default client
scopes**. New clients created in the realm will then inherit the mapper automatically.

This default does not update clients that already exist. For each existing client:

1. Open **Clients** and select the client.
2. Open the **Client scopes** tab.
3. Select **Add client scope**.
4. Choose `api-audience`.
5. Set **Assigned type** to **Default** and save.

Verify the result by obtaining an access token for the client and checking that its `aud` claim contains the FastAPI
`CLIENT_ID`. A token can be correctly signed and still be rejected with `401` if its audience is missing or points to a
different client.

> [!NOTE]
> Use a dedicated client scope for the API audience rather than adding unrelated claims to the default scope. This
> keeps token contents predictable and makes the configuration reusable across projects and environments.

### Admin REST API from an application

Use the Admin REST API only for explicit administrative use cases such as creating, updating, or deleting another user.
An application token needs both an appropriate `realm-management` permission and an audience that includes
`realm-management`. Configure that audience with a dedicated client scope and Audience Mapper, or use a controlled
token-exchange flow.

Do not give every logged-in user `view-users` and `manage-users`. These roles are realm-wide and allow access to users
other than the caller. Use a confidential backend service account or FGAP when the operation is administrative.

## User And Password Flows

### Administrative user operations

Creating, editing, and deleting another user uses the Admin REST API. The caller must be authorized for the specific
operation. If a new user has application access level `admin`, the application may assign `view-users` and
`manage-users` automatically as part of its controlled provisioning flow, provided that the calling administrative
principal is allowed to assign those roles.

### Self-edit profile

For a user changing their own first name or last name, use the Account REST API under:

```text
/realms/{realm}/account
```

The account API is self-scoped by the token subject, so it does not require `realm-management` roles. This is preferable
to granting global `view-users` and `manage-users` to `operator` or `viewer` users.

### Change password while logged in

Use an OIDC Application Initiated Action instead of attempting to modify credentials from the application. Redirect the
authenticated browser to the authorization endpoint with:

```text
kc_action=UPDATE_PASSWORD
```

Reuse the already approved OIDC callback URI. With an active SSO session, the user is taken to Keycloak's password form
and then returned to the application. This flow needs no `realm-management` role.

The direct Account API password endpoint is not available in every Keycloak version. If the installed version returns
`404` or `405`, use `UPDATE_PASSWORD` and verify it again after major Keycloak upgrades.

### Forgot password

For a user who is not logged in, enable **Realm settings > Login > Forgot password** and configure SMTP. The reset email
flow is distinct from the logged-in `UPDATE_PASSWORD` action. A redirect URI that is not whitelisted causes an
`Invalid redirect uri` error.

## Delegated User Administration

Use this pattern when a customer or tenant administrator must manage users but must not manage realms, clients, or
powerful administrative roles. The example creates a realm role `admin-manager` that can:

- create, view, edit, and delete users within the allowed scope;
- assign `admin-manager` to other users;
- not assign `realm-admin`, `manage-realm`, client administration, or unrelated roles.

### Enable fine-grained admin permissions

In **Realm settings**, enable **Admin Permissions** and save. The **Permissions** menu then becomes available.

CLI field names vary by release; where supported:

```bash
kcadm.sh update realms/test-app -s adminPermissionsEnabled=true
```

If this has no effect, inspect `kcadm.sh get realms/test-app` and use the Admin Console for this one-time operation.

### Create the delegated role

Create a simple realm role. Do not make it a composite role containing `realm-management` roles.

```bash
kcadm.sh create roles -r test-app \
  -s name=admin-manager \
  -s 'description=Scoped user administration and delegation of admin-manager'
```

### Create the role policy

In **Permissions > Policies > Create policy**:

1. Select policy type **Role**.
2. Set the name to `policy-admin-manager`.
3. Select the realm role `admin-manager`.

FGAP policy and permission REST endpoints are release-sensitive. Prefer the Admin Console or a tested Terraform
provider for the installed version. If REST automation is required, the authorization resources are exposed through
the `realm-management` client under the target realm, for example:

```text
/admin/realms/{realm}/clients/{realm-management-client-id}/authz/resource-server/
```

### Grant user permissions

In **Permissions > Users**, create a permission with:

- resource: **All users**, or a group/tenant-specific resource;
- scopes: `view` and `manage`;
- policy: `policy-admin-manager`;
- decision strategy: `AFFIRMATIVE`.

This permits CRUD operations only for the resource selected. Prefer a group-specific resource when one realm contains
users from multiple customers.

### Restrict role assignment

This is the most important security step. In **Permissions > Roles**, create a permission with:

- resource: only the `admin-manager` role;
- scope: `map-role`;
- policy: `policy-admin-manager`;
- no generic permission over all roles.

A broad user-management permission without this restriction can permit privilege escalation by assigning a more powerful
role to a newly created user. Review **Roles > admin-manager > Permissions** after saving and ensure no broader inherited
permission exists.

### Create the first delegated administrator

In **Users > Create new user**, create the user, set a temporary password, and assign the `admin-manager` realm role.

```bash
kcadm.sh create users -r test-app \
  -s username=customer-admin \
  -s enabled=true \
  -s email=customer-admin@example.com

kcadm.sh set-password -r test-app \
  --username customer-admin \
  --new-password '<initial-password>' \
  --temporary

kcadm.sh add-roles -r test-app \
  --uusername customer-admin \
  --rolename admin-manager
```

### Verify the delegation

Test with a real token for `customer-admin`:

1. Create a user.
2. View, edit, and delete a permitted user.
3. Assign `admin-manager` to a new user.
4. Attempt to assign `realm-admin` or another administrative role and confirm HTTP `403`.
5. Attempt to access clients, realm settings, and unrelated permissions and confirm denial.
6. Confirm audit logs record who created users and who delegated `admin-manager`.

Do not grant raw `manage-users` as a substitute for this design. Review FGAP permissions after every realm change.

## CLI And Docker Operations

`kcadm.sh` is included in the official Keycloak image at `/opt/keycloak/bin/kcadm.sh`. It is not a separate tool.
When Keycloak runs in Docker on an EC2 host:

```bash
ssh <user>@<ec2-host>
docker exec -it <keycloak-container> /bin/bash
```

Inside the container, use the internal Keycloak address, usually `http://localhost:8080`, rather than the public host
and mapped port:

```bash
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user <admin-user> \
  --password '<admin-password>'
```

On ECS or Kubernetes, the access method changes to ECS Exec or `kubectl exec`; the `kcadm.sh` commands remain the same.
The credentials cache is stored in `~/.keycloak/kcadm.config`; protect it and repeat login when the token expires.

Useful commands:

```bash
# Inspect the realm configuration.
kcadm.sh get realms/test-app

# Inspect an existing client before changing redirect URIs.
kcadm.sh get clients -r test-app -q clientId=test-app-client \
  --fields id,redirectUris,webOrigins

# Locate a user ID.
kcadm.sh get users -r test-app -q username=<username> --fields id

# Assign management roles only to a controlled administrator.
kcadm.sh add-roles -r test-app \
  --uusername <admin-username> \
  --cclientid realm-management \
  --rolename view-users --rolename manage-users

# Remove roles from a test operator/viewer.
kcadm.sh remove-roles -r test-app \
  --uusername <username> \
  --cclientid realm-management \
  --rolename view-users --rolename manage-users
```

When updating array fields such as `redirectUris`, `-s` replaces the entire array. Read the current value first and
write back the complete desired list, including every environment that must remain valid.

## Production Checklist

- Pin and record the Keycloak version for each environment.
- Use separate realms, clients, secrets, and SMTP credentials for development, staging, and production.
- Use HTTPS for public Keycloak and application URLs.
- Register exact production redirect URIs and web origins; avoid broad wildcards.
- Use Authorization Code Flow with PKCE for browser applications.
- Store client secrets and SMTP passwords in a secret manager.
- Keep the `master` realm restricted to platform administrators.
- Grant only the minimum client roles and application roles required.
- Do not grant `view-users` or `manage-users` for self-edit or logged-in password change.
- Test JWT issuer, audience, signature, expiration, and key rotation in every environment.
- Configure and test SMTP with a real reset email.
- Enable email verification and forgot-password only when the product requires them.
- Test disabled users, expired tokens, revoked sessions, and unauthorized role changes.
- Enable and retain Keycloak audit events according to company retention requirements.
- Review FGAP permissions after every change and after every Keycloak upgrade.
- Back up realm configuration and maintain an infrastructure-as-code representation where practical.

## Troubleshooting

### `401 Unauthorized`

Usually means the token is absent, malformed, expired, signed with an unknown key, or issued by another realm. Check
the `Authorization` header, token `exp`, `iss`, JWKS URL, and Keycloak clock synchronization.

### `403 Forbidden`

The token is valid but the caller lacks the required role or FGAP permission. Inspect realm roles, client roles under
`resource_access`, the target resource/scope, and the permission decision strategy.

### `Invalid redirect uri`

The callback URL in the request does not match the client's **Valid redirect URIs**. Compare scheme, host, port, path,
and trailing slash exactly. Add every environment explicitly.

### Password email does not arrive

Verify SMTP host, credentials, sender address, port, and TLS mode. For Gmail, use an App Password. Test with a real
reset flow rather than relying only on the Admin Console connection button.

### Role assignment fails despite `manage-users`

Assigning client roles can require additional permissions in the installed Keycloak version. Test the exact operation
with the actual administrative principal, and do not solve the problem by granting `realm-admin` broadly.

### Password endpoint returns `404` or `405`

The direct Account API password endpoint is not universally supported. Use the OIDC Application Initiated Action with
`kc_action=UPDATE_PASSWORD`, then repeat the flow after major Keycloak upgrades.

## References

- [Keycloak documentation](https://www.keycloak.org/documentation)
- [Keycloak securing applications and services](https://www.keycloak.org/docs/latest/securing_apps/)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [OpenID Connect specification](https://openid.net/specs/openid-connect-core-1_0.html)

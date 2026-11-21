# RagabVerse Private Daily Tracker

Run this folder on an approved private Python host or on your own workstation. It is excluded from the public GitHub Pages build. Keep the workspace's files, SharePoint links, and settings on your workstation or approved host.

## Set up and run from Windows

From the root of the checkout, use one of the following startup commands. Both work in Command Prompt and PowerShell.

```bat
.\private-tracker\tracker.cmd -Setup
.\private-tracker\tracker.cmd -RegisterApp
```

- Use `-Setup` with an approved Entra app registration. Have the tenant ID, client ID, client secret value, and allowed user object ID ready.
- Use `-RegisterApp` if your organization lets you create app registrations with Azure CLI. Install the CLI with `winget install --exact --id Microsoft.AzureCLI` and reopen the terminal first. The script signs in to the tenant you enter, uses the signed-in account as the allowed user, and creates the app, delegated permission requests, and a client secret. Complete consent through Microsoft when prompted. If the tenant requires admin consent, send the printed app ID to your Microsoft 365 administrator. [Azure CLI sign-in](https://learn.microsoft.com/en-us/cli/azure/authenticate-azure-cli-interactively) · [Microsoft Graph permissions in Azure CLI](https://learn.microsoft.com/en-us/cli/azure/ad/app/permission)

Both commands prompt for the workbook links and tracker password, save an encrypted profile under `%LOCALAPPDATA%\RagabVerse\PrivateTracker`, and launch the server. Windows ties the encrypted settings to your user and computer. From then on run `.\private-tracker\tracker.cmd`. Open [the local tracker](http://localhost:8768), enter the tracker password, and sign in with the allowed Microsoft work account. Keep the terminal open while using the tracker. Run `-Setup` again to replace the settings or rotate the client secret.

Use desktop Excel on an approved Windows computer to prepare a local OneDrive-synced copy of the **daily** workbook. Start with a test copy and close it in Excel before running the command. Use the production file only with the owner's edit authorization.

```bat
powershell.exe -NoProfile -File .\private-tracker\prepare-workbook.ps1 -WorkbookPath "C:\path\to\the\daily workbook.xlsx"
```

The command adds the table on a new sheet and checks an existing table before deciding whether to make changes. For test setup, supply the SharePoint link for the synced test workbook to the launcher. The command requires Office on Windows. [Excel table API](https://learn.microsoft.com/en-us/office/vba/api/excel.listobjects.add)

## Workbook roles

- The equipment library reads the visible master-equipment worksheet through a read-only file download. It ignores macros, hidden sheets, and embedded files. Search matches on tag, description, family, type, and location. The server caches the library for ten minutes.
- The activity log reads up to 100 recent rows from the selected A01, A02A, or A02B report sheet and 150 recent entries from the tracker table. It accounts for the permit column in A02B. The dashboard totals use tracker entries for today's Cairo date.
- New entries append to one Excel table in the **same daily activities workbook**. The three original unit sheets, their layout, and attached report material remain in place. No workbook is mirrored to the website or included in this repository.

## Prepare the daily workbook

Ask the workbook owner to add a worksheet **Daily Progress** in the daily activities workbook. Insert an Excel table named **RagabVerseDaily** with the columns below in this exact order. You can paste the tab-separated line into A1 before creating the table. Mark the first six columns and Activity, Status, and Remarks as **Text**. Keep Progress and Hours numeric. If the table option needs a data row, leave that starter row blank.

~~~text
Entry ID	Date	Unit	Equipment tag	Work order	EPTW	Activity	Status	Progress	Hours	Remarks
~~~

The app checks these headers before writing. It keeps an entry ID when a save is retried and checks the table for that ID before appending again. Run one server process per configured workbook to preserve this coordination.

## Configure Microsoft access

1. Ask your organization's Microsoft 365 administrator to approve a **single-tenant web app registration**. Use Microsoft Graph **delegated** permissions **User.Read** and **Files.ReadWrite**. The configured user also needs read permission on the master workbook and edit permission on the daily workbook. [OAuth configuration](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) · [Excel delegated permissions](https://learn.microsoft.com/en-us/graph/api/tablerowcollection-add?view=graph-rest-1.0)
2. Register the exact Web redirect URI **TRACKER_ORIGIN + /oauth/callback**. For local setup, use **http://localhost:8768/oauth/callback**. For an approved private deployment, use your real HTTPS origin and forward it to the loopback listener. [Redirect URI requirements](https://learn.microsoft.com/en-us/entra/identity-platform/reply-url)
3. From the tracker directory, run **python server.py password** and copy the generated hash into the host environment. Keep the password itself out of source control.
4. Set the variables below in your host environment or approved secret store and run **python server.py** from this directory.

| Variable | Value |
|---|---|
| TRACKER_ORIGIN | Approved HTTPS origin or http://localhost:8768 |
| TRACKER_PORT | Loopback port, defaults to 8768 |
| TRACKER_TENANT_ID | Microsoft Entra tenant GUID |
| TRACKER_CLIENT_ID | Registered web app client GUID |
| TRACKER_CLIENT_SECRET | Client secret from the app registration |
| TRACKER_USER_ID | Object ID of the allowed Microsoft work account |
| TRACKER_PASSWORD_HASH | Output of the password command |
| TRACKER_MASTER_SHARE_URL | Your original company link for the equipment workbook |
| TRACKER_DAILY_SHARE_URL | Your original company link for the daily workbook |

Open the configured origin, enter the tracker password, and complete Microsoft sign-in. The app uses server-side sessions and requires both steps before serving tracker data. On an HTTPS origin the session cookie is Secure and HttpOnly. Sign-in expires when the delegated token expires, or after one hour at most.

Before entering real activity, use a copy of the daily workbook that your organization permits for testing. Sign in with the intended account, confirm that the three unit reports and the equipment library load, then save a test activity and verify exactly one new table row. The supplied workbook has existing report content, so the live check also confirms that Microsoft's Excel service supports it. [Excel workbook compatibility errors](https://learn.microsoft.com/en-us/graph/workbook-error-handling)

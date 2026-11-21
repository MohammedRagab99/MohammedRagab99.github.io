[CmdletBinding(DefaultParameterSetName = 'Launch')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Existing')]
    [switch]$Setup,

    [Parameter(Mandatory, ParameterSetName = 'Register')]
    [switch]$RegisterApp
)

$ErrorActionPreference = 'Stop'
$origin = 'http://localhost:8768'
$profilePath = Join-Path $env:LOCALAPPDATA 'RagabVerse\PrivateTracker\profile.dpapi'
$serverPath = Join-Path $PSScriptRoot 'server.py'
$python = Get-Command python.exe -ErrorAction Stop

function Read-TrackerGuid([string]$Prompt) {
    $value = [guid]::Empty
    if (-not [guid]::TryParse((Read-Host $Prompt).Trim(), [ref]$value) -or $value -eq [guid]::Empty) {
        throw "$Prompt must be a Microsoft GUID."
    }
    $value.ToString()
}

function Reveal-TrackerValue([securestring]$Value) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    try {
        [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Read-TrackerLink([string]$Prompt) {
    $url = (Reveal-TrackerValue (Read-Host $Prompt -AsSecureString)).Trim()
    $uri = $null
    if (-not [uri]::TryCreate($url, [UriKind]::Absolute, [ref]$uri) -or
        $uri.Scheme -ne 'https' -or $uri.Host -notlike '*.sharepoint.com' -or $uri.UserInfo) {
        throw 'Enter the original HTTPS SharePoint workbook link.'
    }
    $url
}

function Invoke-TrackerAzure {
    $result = & $azure.Source @args --only-show-errors
    if ($LASTEXITCODE -ne 0) {
        throw 'Azure CLI failed. Review the Microsoft error above and contact your tenant administrator if access was denied.'
    }
    $result
}

if ($Setup -or $RegisterApp) {
    if ($RegisterApp -and (Test-Path -LiteralPath $profilePath)) {
        throw 'A tracker profile already exists. Run tracker.cmd to launch it, or tracker.cmd -Setup to update its details.'
    }

    $settings = @{
        TRACKER_TENANT_ID = Read-TrackerGuid 'Microsoft work tenant ID'
        TRACKER_MASTER_SHARE_URL = Read-TrackerLink 'Equipment master SharePoint link (hidden)'
        TRACKER_DAILY_SHARE_URL = Read-TrackerLink 'Daily activities SharePoint link (hidden)'
    }
    $settings.TRACKER_PASSWORD_HASH = & $python.Source $serverPath password
    if ($LASTEXITCODE -ne 0 -or $settings.TRACKER_PASSWORD_HASH -notmatch '^[a-f0-9]{32}:[a-f0-9]{128}$') {
        throw 'Password setup did not complete.'
    }

    if ($RegisterApp) {
        $azure = Get-Command az -ErrorAction SilentlyContinue
        if (-not $azure) {
            throw 'Install Azure CLI with winget install --exact --id Microsoft.AzureCLI, then reopen the terminal.'
        }
        Invoke-TrackerAzure login --tenant $settings.TRACKER_TENANT_ID --allow-no-subscriptions --output none
        $settings.TRACKER_USER_ID = Invoke-TrackerAzure ad signed-in-user show --query id --output tsv
        $graph = '00000003-0000-0000-c000-000000000000'
        $scopeIds = foreach ($scopeName in @('User.Read', 'Files.ReadWrite')) {
            $scopeId = Invoke-TrackerAzure ad sp show --id $graph --query "oauth2PermissionScopes[?value=='$scopeName'].id | [0]" --output tsv
            if (-not $scopeId) {
                throw "Microsoft Graph did not return scope $scopeName."
            }
            "$scopeId=Scope"
        }
        $settings.TRACKER_CLIENT_ID = Invoke-TrackerAzure ad app create --display-name 'RagabVerse Private Daily Tracker' --sign-in-audience AzureADMyOrg --web-redirect-uris "$origin/oauth/callback" --query appId --output tsv
        Write-Host "Created Microsoft app $($settings.TRACKER_CLIENT_ID)."
        Invoke-TrackerAzure ad app permission add --id $settings.TRACKER_CLIENT_ID --api $graph --api-permissions @scopeIds --output none
        $settings.TRACKER_CLIENT_SECRET = Invoke-TrackerAzure ad app credential reset --id $settings.TRACKER_CLIENT_ID --append --display-name 'Windows tracker' --query password --output tsv
    } else {
        $settings.TRACKER_CLIENT_ID = Read-TrackerGuid 'Approved Entra application client ID'
        $settings.TRACKER_USER_ID = Read-TrackerGuid 'Allowed Microsoft user object ID'
        $settings.TRACKER_CLIENT_SECRET = Reveal-TrackerValue (Read-Host 'Entra client secret value (hidden)' -AsSecureString)
    }

    if ([string]::IsNullOrWhiteSpace($settings.TRACKER_CLIENT_SECRET)) {
        throw 'The Entra client secret value is required.'
    }
    $json = ConvertTo-Json -InputObject $settings -Compress
    $encrypted = ConvertFrom-SecureString (ConvertTo-SecureString $json -AsPlainText -Force)
    New-Item -ItemType Directory -Path (Split-Path -Parent $profilePath) -Force | Out-Null
    Set-Content -LiteralPath $profilePath -Value $encrypted -Encoding Ascii
    Write-Host 'Encrypted configuration saved for this Windows user.'
}

if (-not (Test-Path -LiteralPath $profilePath)) {
    throw 'No tracker profile. Run tracker.cmd -Setup for an existing approved app, or tracker.cmd -RegisterApp if your organization allows you to register an app.'
}

$settings = Reveal-TrackerValue (ConvertTo-SecureString (Get-Content -LiteralPath $profilePath -Raw).Trim()) | ConvertFrom-Json
$settings = @{
    TRACKER_TENANT_ID = $settings.TRACKER_TENANT_ID
    TRACKER_USER_ID = $settings.TRACKER_USER_ID
    TRACKER_CLIENT_ID = $settings.TRACKER_CLIENT_ID
    TRACKER_CLIENT_SECRET = $settings.TRACKER_CLIENT_SECRET
    TRACKER_PASSWORD_HASH = $settings.TRACKER_PASSWORD_HASH
    TRACKER_MASTER_SHARE_URL = $settings.TRACKER_MASTER_SHARE_URL
    TRACKER_DAILY_SHARE_URL = $settings.TRACKER_DAILY_SHARE_URL
    TRACKER_ORIGIN = $origin
    TRACKER_PORT = '8768'
}
$previousSettings = @{}
try {
    foreach ($name in $settings.Keys) {
        $previousSettings[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, $settings[$name], 'Process')
    }
    Write-Host "Open $origin in your browser when the server starts. Press Ctrl+C to stop."
    & $python.Source $serverPath
    if ($LASTEXITCODE -ne 0) {
        throw 'The tracker server exited with an error.'
    }
} finally {
    foreach ($name in $previousSettings.Keys) {
        [Environment]::SetEnvironmentVariable($name, $previousSettings[$name], 'Process')
    }
}

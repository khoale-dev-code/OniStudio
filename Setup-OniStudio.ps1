# Oni Studio local setup. Windows PowerShell 5.1 compatible. ASCII only.
[CmdletBinding()]
param(
    [string]$TargetPath = '',
    [switch]$StartDev
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($TargetPath)) {
    if ($PSScriptRoot) { $TargetPath = $PSScriptRoot }
    elseif ($PSCommandPath) { $TargetPath = Split-Path -Parent $PSCommandPath }
    else { $TargetPath = (Get-Location).Path }
}
if (-not (Test-Path -LiteralPath $TargetPath -PathType Container)) {
    throw 'Target directory does not exist. Extract the complete OniStudio folder first.'
}
$ProjectPath = (Resolve-Path -LiteralPath $TargetPath).Path
$ProjectInfo = Get-Item -LiteralPath $ProjectPath
if (($ProjectInfo.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw 'Target cannot be a junction or symbolic link.'
}
$PackagePath = Join-Path $ProjectPath 'package.json'
$LayoutPath = Join-Path $ProjectPath 'src\app\layout.tsx'
$LockPath = Join-Path $ProjectPath 'package-lock.json'
$ExamplePath = Join-Path $ProjectPath '.env.example'
foreach ($RequiredPath in @($PackagePath, $LayoutPath, $LockPath, $ExamplePath)) {
    if (-not (Test-Path -LiteralPath $RequiredPath -PathType Leaf)) {
        throw ('Missing required project file: ' + $RequiredPath)
    }
}
$PackageInfo = Get-Content -LiteralPath $PackagePath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($PackageInfo.name -ne 'oni-studio') { throw 'Target is not the Oni Studio project. No files changed.' }
foreach ($ToolName in @('node.exe', 'npm.cmd', 'robocopy.exe')) {
    if (-not (Get-Command $ToolName -ErrorAction SilentlyContinue)) { throw ('Required tool missing: ' + $ToolName) }
}
$NodeVersion = (& node.exe --version).Trim()
if ($LASTEXITCODE -ne 0 -or [int]($NodeVersion.TrimStart('v').Split('.')[0]) -lt 22) {
    throw 'Install Node.js 22 or newer, then open a new PowerShell window.'
}
$ParentPath = Split-Path -Parent $ProjectPath
if (-not $ParentPath -or $ParentPath -eq $ProjectPath) { throw 'Do not use a drive root as the target.' }
$BackupRoot = Join-Path $ParentPath 'OniStudio-backups'
$BackupPath = Join-Path $BackupRoot ((Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
if ($BackupPath.StartsWith($ProjectPath.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Backup path must be outside the project.'
}
# Backup is completed before any project write or dependency change.
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
& robocopy.exe $ProjectPath $BackupPath /E /XJ /R:1 /W:1 /XD node_modules .next .git /XF '*.tsbuildinfo' /NFL /NDL /NJH /NJS /NP | Out-Null
$BackupExit = $LASTEXITCODE
if ($BackupExit -ge 8) { throw ('Backup failed. Robocopy exit code: ' + $BackupExit) }
Write-Host ('Backup saved: ' + $BackupPath)
$EnvPath = Join-Path $ProjectPath '.env.local'
if (-not (Test-Path -LiteralPath $EnvPath)) {
    $EnvBase64 = 'IyBQdWJsaWMgc2l0ZSBVUkw7IHVzZSB5b3VyIHJlYWwgSFRUUFMgZG9tYWluIGJlZm9yZSBwcm9kdWN0aW9uLgpORVhUX1BVQkxJQ19TSVRFX1VSTD1odHRwOi8vbG9jYWxob3N0OjMwMDAKIyBMZWF2ZSBib3RoIGJsYW5rIHRvIHJ1biB0aGUgcmVhZC1vbmx5IGxvY2FsIGNhdGFsb2d1ZS4KTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMPQpORVhUX1BVQkxJQ19TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVk9CiMgQ2xvdWRpbmFyeSBBUEkgc2VjcmV0IGFuZCBBUEkga2V5IGFyZSBzZXJ2ZXItb25seS4gTmV2ZXIgcHJlZml4IHRoZW0gTkVYVF9QVUJMSUNfLgpORVhUX1BVQkxJQ19DTE9VRElOQVJZX0NMT1VEX05BTUU9CkNMT1VESU5BUllfQVBJX0tFWT0KQ0xPVURJTkFSWV9BUElfU0VDUkVUPQojIE9wdGlvbmFsIHZlcmlmaWVkIGxpbmtzLiBaYWxvLCBJbnN0YWdyYW0gYW5kIFRpa1RvayBhcmUgaGlkZGVuIHVudGlsIGNvbmZpZ3VyZWQuCk5FWFRfUFVCTElDX1pBTE9fVVJMPQpORVhUX1BVQkxJQ19JTlNUQUdSQU1fVVJMPQpORVhUX1BVQkxJQ19USUtUT0tfVVJMPQo='
    $EnvText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($EnvBase64))
    $Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($EnvPath, $EnvText, $Utf8NoBom)
    Write-Host 'Created .env.local. The public catalogue works without API keys.'
}
Push-Location -LiteralPath $ProjectPath
try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
    foreach ($Check in @('typecheck', 'lint', 'build')) {
        Write-Host ('Running npm run ' + $Check)
        & npm.cmd run $Check
        if ($LASTEXITCODE -ne 0) { throw ('Quality check failed: ' + $Check) }
    }
    Write-Host 'All checks passed. Website: http://localhost:3000'
    Write-Host 'Read README.md for Supabase, Cloudinary and admin setup.'
    if ($StartDev) {
        & npm.cmd run dev
        if ($LASTEXITCODE -ne 0) { throw 'Development server exited with an error.' }
    }
} finally {
    Pop-Location
}

<#
.GOVERNANCE
# ============================================================================
# IDENTITY
# ============================================================================
name: get-file-structure
path: products\pattern-in-motion-overlay\utils\get-file-structure.ps1
project: Hopper

# ============================================================================
# CLASSIFICATION
# ============================================================================
doctype: Query-Script
artifact: script
structural_role: singleton
level: Operational
scope: local
layer: M0

# ============================================================================
# VERSIONING
# ============================================================================
version: "1.2.0"
created_by: SamRHarkreader
created_with: Claude Opus 4.6
created_at: 2026-03-23T10:00:00-06:00
updated_by: SamRHarkreader
updated_with: Claude Opus 4.8
updated_at: 2026-06-13T15:19:00-06:00

# ============================================================================
# PURPOSE
# ============================================================================
purpose: Generates a flat, sorted list of all file and directory paths in the pattern-in-motion-overlay repo, relative to its root. Designed for AI consumption — no tree characters, no icons, one path per line. Use on-demand when AI needs file-level visibility into the overlay.

# ============================================================================
# RELATIONSHIPS
# ============================================================================
# Companion to get-folder-structure.ps1 (directories only)
# Use this when file-level detail is needed; use get-folder-structure.ps1 for session start

# ============================================================================
# GOVERNANCE
# ============================================================================
governance_spec_version: "1.0"
classification_status: pending
#>

# Flat File Structure Generator (AI-Optimized) — Overlay-scoped
# Produces one relative path per line for every file and directory in the
# pattern-in-motion-overlay repo — no tree, no icons, no noise.
# Author: Sam R. Harkreader / Paradigm Pilot, Inc.

# USAGE:
#   .\utils\get-file-structure.ps1 -ExcludeFolders 'node_modules','dist','.git' -ExcludeBackups -OutputMarkdown 'overlay-structure-flat.md'
#   .\utils\get-file-structure.ps1 -OpenAfterCreate
#   Powershell -ExecutionPolicy Bypass -File C:\DevTools\hopper\products\pattern-in-motion-overlay\utils\get-file-structure.ps1 -ExcludeFolders 'node_modules','dist','.git' -ExcludeBackups -OutputMarkdown 'overlay-structure-flat.md'

[CmdletBinding()]
param(
    [Parameter(Position = 0, HelpMessage = "Path to the root directory (defaults to the overlay repo root)")]
    [ValidateScript({
            if (Test-Path $_ -PathType Container) { $true }
            else { throw "Path '$_' does not exist or is not a directory" }
        })]
    [string]$Path = "C:\DevTools\hopper\products\pattern-in-motion-overlay\",

    [Parameter(HelpMessage = "List of folder names to exclude")]
    [ValidateNotNull()]
    [string[]]$ExcludeFolders = @('node_modules', 'dist', '.git'),

    [Parameter(HelpMessage = "Exclude .bak files")]
    [switch]$ExcludeBackups,

    [Parameter(HelpMessage = "Output file path (.md default)")]
    [string]$OutputMarkdown = "overlay-structure-flat.md",

    [Parameter(HelpMessage = "Open the file after creation")]
    [switch]$OpenAfterCreate = $false
)

# Normalize root path for consistent replacement
$normalizedRoot = (Resolve-Path $Path).Path.TrimEnd('\')

# Build exclusion set from folder list (handles both array and comma-delimited string input)
$excludeSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($folder in $ExcludeFolders) {
    # Handle case where -File mode passes 'a','b','c' as a single comma-delimited string
    foreach ($name in ($folder -split ',')) {
        $trimmed = $name.Trim().Trim("'`"")
        if ($trimmed) { [void]$excludeSet.Add($trimmed) }
    }
}

# Recursive walker — skips excluded directories entirely (never enters them)
function Get-FilteredItems {
    param(
        [string]$Dir,
        [System.Collections.Generic.HashSet[string]]$Skip,
        [switch]$ExcludeBackups
    )
    foreach ($item in Get-ChildItem -Path $Dir -Force -ErrorAction SilentlyContinue) {
        # Skip excluded folder trees at the directory level — don't recurse into them
        if ($item.PSIsContainer -and $Skip.Contains($item.Name)) { continue }

        # Skip .bak files
        if ($ExcludeBackups -and -not $item.PSIsContainer -and $item.Extension -eq '.bak') { continue }

        # Emit this item
        $item

        # Recurse into non-excluded directories
        if ($item.PSIsContainer) {
            Get-FilteredItems -Dir $item.FullName -Skip $Skip -ExcludeBackups:$ExcludeBackups
        }
    }
}

# Walk the tree, format relative paths, sort
$results = Get-FilteredItems -Dir $normalizedRoot -Skip $excludeSet -ExcludeBackups:$ExcludeBackups |
ForEach-Object { $_.FullName.Replace("$normalizedRoot\", '') -replace '\\', '/' } |
Sort-Object

# Write output
$results | Set-Content -Path $OutputMarkdown -Encoding UTF8

# Report
$fileCount = ($results | Where-Object { $_ -notmatch '/$' }).Count
$dirCount = ($results | Where-Object { $_ -match '/$' }).Count
$totalCount = ($results | Measure-Object).Count
Write-Host "get-file-structure: $totalCount paths written to $OutputMarkdown" -ForegroundColor Green

if ($OpenAfterCreate) {
    Start-Process $OutputMarkdown
}
